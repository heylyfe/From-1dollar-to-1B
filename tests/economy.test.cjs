'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
require('../data.js');
require('../economy.js');
require('../save.js');
const E=Economy,C=Catalog,S=Saves;
function funded(seed=42){
  const g=E.newGame(seed);
  g.cash=900000;
  return {g,b:E.buy(g,0,0)};
}
test('starts with exactly one dollar and shifts unlock in order',()=>{
  const g=E.newGame(91);
  assert.equal(g.cash,100);
  assert.equal(E.worth(g),100);
  assert.equal(g.businesses.length,0);
  assert.equal(E.job(g,1,0),false);
  assert.equal(E.job(g,0,3),false);
  const payout=E.job(g,0,1);
  assert.equal(g.cash,100+payout);
  assert.equal(g.totalRevenue-g.totalCosts,payout);
  E.job(g,0,1);E.job(g,0,1);
  assert.ok(E.job(g,1,0)>0);
  assert.equal(S.decode(S.encode(g)).cash,g.cash);
});
test('funding, hiring and upgrades preserve account balances',()=>{
  const {g,b}=funded();
  assert.ok(b);
  assert.equal(E.buy(g,0,0),false);
  assert.equal(E.improve(g,b,'upgrade',7),false);
  assert.ok(E.improve(g,b,'hire',0));
  assert.ok(E.improve(g,b,'upgrade',7));
  assert.ok(E.improve(g,b,'upgrade',1));
  assert.ok(E.improve(g,b,'channel',0));
  const before=g.cash;
  const t=E.close(g,1);
  assert.equal(t.profit,t.revenue-t.costs);
  assert.equal(g.cash,before+t.profit);
  assert.equal(g.history.at(-1),g.cash);
  assert.equal(S.decode(S.encode(g)).businesses[0].channels,1);
});
test('buy and sell, property churn and repeated loans cannot generate free net worth',()=>{
  const {g,b}=funded();
  const start=E.worth(g);
  assert.ok(E.sell(g,b));
  assert.ok(E.buy(g,0,0));
  assert.ok(E.worth(g)<start);
  assert.equal(E.sell(g,b),false);
  let net=E.worth(g);
  assert.ok(E.finance(g,'loan',E.credit(g)));
  assert.equal(E.worth(g),net);
  assert.equal(E.finance(g,'loan',1),false);
  assert.equal(E.finance(g,'property',10000),false);
  g.points=1;
  assert.ok(E.study(g,35));
  net=E.worth(g);
  assert.ok(E.finance(g,'property',10000));
  assert.ok(E.finance(g,'liquidate',g.property));
  assert.ok(E.worth(g)<net);
});
test('offline earnings are available only when automated, capped and clock safe',()=>{
  const {g,b}=funded();
  assert.equal(E.offline(g,3600000),null);
  E.improve(g,b,'hire',0);E.improve(g,b,'upgrade',7);
  assert.equal(E.offline(g,-10000),null);
  assert.equal(E.offline(g,299999),null);
  const before=g.cash;
  const t=E.offline(g,86400000);
  assert.equal(t.turns,24);
  assert.equal(t.minutes,480);
  assert.equal(g.cash-before,t.profit);
  assert.equal(g.round,0);
});
test('markets are reproducible and expenses are nonnegative',()=>{
  const a=funded(),b=funded();
  for(let i=0;i<30;i++){
    const x=E.close(a.g,i%3),y=E.close(b.g,i%3);
    assert.deepEqual(x,y);
    assert.ok(x.costs>=0);
  }
  assert.deepEqual(a.g.rivals,b.g.rivals);
  const t=E.getTerms(a.g,a.b);
  assert.equal(t.costs,t.materials+t.wages+t.overhead);
});
test('research prerequisites and challenge constraints are enforced',()=>{
  const g=E.newGame(9,'Expert',4);
  g.cash=99999999;g.points=34;
  assert.equal(E.buy(g,0,0),false);
  assert.ok(E.buy(g,12,0));
  assert.equal(E.study(g,1),false);
  assert.ok(E.study(g,0));
  assert.ok(E.study(g,1));
  const regional=E.newGame(99,'Standard',2);
  regional.cash=99999999;
  assert.equal(E.unlock(regional,1),false);
  const loanFree=E.newGame(99,'Standard',0);
  loanFree.cash=990000;
  E.buy(loanFree,0,0);
  assert.equal(E.finance(loanFree,'loan',1),false);
});
test('sustainable win uses net worth, liabilities, and positive trading profit',()=>{
  const {g}=funded();
  g.totalRevenue=2e11;
  assert.equal(E.qualified(g),false);
  g.cash=1e11;
  assert.equal(E.qualified(g),false);
  assert.ok(E.buy(g,4,0));
  g.cash=1.01e11;g.debt=2e10;
  assert.equal(E.qualified(g),false);
  g.debt=0;
  assert.ok(E.qualified(g));
  E.update(g);
  assert.equal(g.won,true);
});
test('save corruption rejects the primary copy and retains the backup',()=>{
  const raw=new Map();
  global.localStorage={getItem:k=>raw.get(k)??null,setItem:(k,v)=>raw.set(k,v),removeItem:k=>raw.delete(k)};
  const g=E.newGame(42);
  assert.equal(S.store(0,g),true);
  E.job(g,0,0);
  S.store(0,g);
  assert.equal(S.getSlot(0).worked,1);
  assert.equal(S.getSlot(1),null);
  raw.set('one-billion.campaign.0','damaged');
  assert.equal(S.getSlot(0).worked,0);
  assert.equal(S.decode(S.encode({...g,cash:-1})),null);
  const old=JSON.parse(S.encode(g));old.version=1;
  assert.ok(S.decode(JSON.stringify(old)));
  S.erase(0);
  assert.equal(S.getSlot(0),null);
});
test('catalog meets content minimums and strategies can complete using the shared engine',()=>{
  assert.equal(C.businesses.length,32);
  assert.equal(C.research.length,56);
  assert.equal(C.challenges.length,10);
  assert.ok(E.achievements.length>=75);
  const {campaign,profiles}=require('./simulate.cjs');
  for(const name of ['Optimised','Hospitality','Technology','Manufacturing','Retail','Diversified']){
    const result=campaign(42,profiles.find(p=>p[0]===name));
    assert.ok(result.won,name+' reached '+result.worth);
  }
});
