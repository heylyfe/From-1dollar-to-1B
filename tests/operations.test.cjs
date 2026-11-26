'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../data.js');
require('../economy.js');
require('../save.js');
require('../field-data.js');
require('../operations.js');
const {walk}=require('./simulate.cjs');

const C=Catalog,E=Economy,O=Operations,S=Saves;
const run=(s,seconds,input={})=>{
  for(let i=0;i<Math.round(seconds/O.STEP);i++)O.step(s,input);
};
const financed=(type,seed=23)=>{
  const g=E.newGame(seed);g.cash=2e7;
  const b=E.buy(g,type,0);
  assert.ok(b);
  const s=O.create(g);
  return {g,b,s};
};

test('fresh campaign has $1, fixed-step directional movement and solid scenery',()=>{
  const g=E.newGame(23),s=O.create(g);
  assert.equal(g.cash,100);
  const start=s.player.x;
  run(s,.4,{x:-1});
  assert.ok(s.player.x<start);
  assert.equal(s.player.dir,3);
  run(s,8,{x:-1});
  assert.ok(s.player.x>=38);
  assert.ok(O.clear(s.map,s.player.x,s.player.y));
  const lot=s.map.stations.find(st=>st.id==='lot-0');
  assert.ok(O.aim(s,lot));
  run(s,12);
  assert.ok(Math.hypot(s.player.x-lot.x,s.player.y-lot.y)<43);
  assert.equal(g.cash,100);
});

test('workers and customers cannot pay out an empty station, each starter job earns with physical work',()=>{
  const idle=O.create(E.newGame(45));
  run(idle,50);
  assert.equal(idle.g.cash,100);
  assert.ok(idle.missed>0);
  for(const job of ['lemonade','wash','delivery']){
    const g=E.newGame(23),s=O.create(g);
    const sold=[];
    s.emit=(event,detail)=>{if(event==='sale')sold.push(detail);};
    walk(s,job,45);
    assert.ok(g.cash>100,job);
    assert.ok(g.worked>0,job);
    assert.ok(sold.length>0,job);
    assert.equal(g.cash,100+g.totalRevenue-g.totalCosts);
  }
});

test('lemonade stock and inventory handle capacity and survive migration to save version 3',()=>{
  const g=E.newGame(69),s=O.create(g);
  const source=s.map.stations.find(st=>st.id==='lemons');
  assert.ok(O.aim(s,source));run(s,2);
  assert.equal(s.player.item,'lemon');
  assert.equal(s.player.count,3);
  run(s,7);assert.equal(s.player.count,3);
  const mix=s.map.stations.find(st=>st.id==='mix');
  assert.ok(O.aim(s,mix));run(s,1.3);
  g.field=O.snapshot(s);
  assert.equal(JSON.parse(S.encode(g)).version,3);
  const restored=O.create(S.decode(S.encode(g)));
  assert.equal(restored.region,s.region);
  assert.deepEqual(restored.stock.mix,s.stock.mix);
  assert.equal(restored.player.count,s.player.count);
  const legacy=JSON.parse(S.encode(E.newGame(69)));legacy.version=2;
  const migrated=O.create(S.decode(JSON.stringify(legacy)));
  assert.equal(migrated.g.cash,100);
  assert.ok(migrated.map.starters);
});

test('a construction lot transitions to an explorable business and an annex adds production space',()=>{
  const g=E.newGame(41);g.cash=1e7;
  const s=O.create(g),b=O.acquire(s,0);
  assert.ok(b);assert.equal(O.acquire(s,0),false);
  assert.ok(O.record(s,b).eta>0);
  assert.equal(O.changeScene(s,0,b.id),false);
  run(s,5.2);
  assert.ok(O.changeScene(s,0,b.id));
  assert.equal(s.mode,'restaurant');
  assert.ok(O.clear(s.map,s.player.x,s.player.y));
  assert.ok(E.improve(g,b,'upgrade',1));
  O.startFitout(s,b);
  assert.equal(s.map.ext,0);
  run(s,4);
  assert.equal(s.map.ext,1);
  assert.ok(s.map.stations.some(st=>st.id==='extension'));
  const before=s.map.stations[0].x;
  assert.ok(O.blueprintLayout(s,1));
  assert.equal(s.map.stations[0].x,O.W-before);
  assert.ok(O.changeScene(s,0));
  assert.ok(s.map.starters);
});

test('manual business cycles and employee pathfinding work across the industry layouts',()=>{
  for(const type of [0,1,4,8,12,16,20,24,28]){
    const {g,b,s}=financed(type);
    assert.ok(O.changeScene(s,0,b.id));
    walk(s,'',90);
    const initial=O.record(s,b).done;
    assert.ok(initial>0,C.businesses[type].name+' manual');
    assert.ok(E.improve(g,b,'hire',0));
    assert.ok(E.improve(g,b,'hire',0));
    run(s,115);
    assert.equal(s.workers.length,2);
    assert.ok(O.record(s,b).done>initial,C.businesses[type].name+' crew');
  }
});

test('a hotel charges when a booked guest completes their stay',()=>{
  const {b,s}=financed(1);
  O.changeScene(s,0,b.id);
  let occupancy=false,paid=false;
  for(let i=0;i<1800;i++){
    if(i%6===0&&!s.player.path?.length){
      const target=O.suggest(s);
      if(target)O.aim(s,target);
    }
    O.step(s);
    if(s.npcs.some(n=>n.phase==='stay')){
      if(!occupancy)assert.equal(O.record(s,b).done,0);
      occupancy=true;
    }
    if(O.record(s,b).done){paid=true;break;}
  }
  assert.ok(occupancy&&paid);
});

test('a staffed site away from the player earns on actual clock ticks and obeys the queue',()=>{
  const {g,b,s}=financed(4,44);
  const initial=g.cash;
  O.advancePortfolio(s,50);
  assert.equal(g.cash,initial);
  assert.equal(O.record(s,b).done,0);
  assert.ok(E.improve(g,b,'hire',0));
  assert.ok(E.improve(g,b,'hire',0));
  const afterHire=g.cash;
  O.advancePortfolio(s,88);
  assert.ok(g.cash>afterHire);
  assert.ok(O.record(s,b).done>0);
  assert.ok(g.last.revenue>g.last.costs);
  assert.ok(O.record(s,b).backlog<=3);
  assert.equal(O.fieldOffline(g,-30000),null);
  assert.equal(O.fieldOffline(g,600000),null);
  assert.ok(E.improve(g,b,'upgrade',7));
  const offline=O.fieldOffline(g,300000000);
  assert.ok(offline.profit>=0);
  assert.equal(offline.minutes,120);
});

test('live field and headless portfolio clocks match the shift and transaction ledger',()=>{
  const a=financed(4,44),b=financed(4,44);
  for(const x of [a,b])E.improve(x.g,x.b,'hire',0);
  run(a.s,88);
  assert.ok(O.advancePortfolio(b.s,88));
  assert.equal(a.g.round,b.g.round);
  assert.equal(a.g.cash,b.g.cash);
  assert.equal(O.record(a.s,a.b).done,O.record(b.s,b.b).done);
});

test('travel needs a permit and a legacy Cedar start has walkable jobs',()=>{
  const g=E.newGame(9,'Standard',-1,1,1);
  const s=O.create(g);
  assert.equal(g.cash,100);
  assert.equal(s.region,1);
  assert.equal(s.map.theme.label,'Cedar Junction');
  assert.ok(s.map.starters);
  assert.equal(O.changeScene(s,3),false);
  assert.ok(O.changeScene(s,0));
  assert.equal(s.map.theme.label,'Maplebrook');
});

test('building on a selected plot retains that location across save and load',()=>{
  const g=E.newGame(92);g.cash=1e7;
  const s=O.create(g),b=O.acquire(s,0,3);
  assert.ok(b);
  assert.equal(s.map.lots[3].site.id,b.id);
  assert.equal(O.acquire(s,4,3),false);
  g.field=O.snapshot(s);
  const next=O.create(S.decode(S.encode(g)));
  assert.equal(next.map.lots[3].site.id,b.id);
  assert.ok(next.map.stations.find(st=>st.id==='lot-3').building);
});

test('an occupied hotel room settles after saving and reopening outside the hotel',()=>{
  const {g,b,s}=financed(1);
  O.changeScene(s,0,b.id);
  walk(s,'',80,()=>O.record(s,b).stays.length>0);
  assert.equal(O.record(s,b).stays.length,1);
  assert.equal(O.record(s,b).done,0);
  g.field=O.snapshot(s);
  const restored=O.create(S.decode(S.encode(g)));
  O.changeScene(restored,0);
  O.advancePortfolio(restored,24);
  assert.equal(O.record(restored,restored.g.businesses[0]).done,1);
  assert.equal(O.record(restored,restored.g.businesses[0]).stays.length,0);
});
