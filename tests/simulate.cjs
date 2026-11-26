'use strict';
require('../data.js');
require('../economy.js');
require('../field-data.js');
require('../operations.js');

const C=Catalog,E=Economy,O=Operations;
const profiles=[
  {name:'Diversified',first:0,job:'lemonade',cashReserve:.12},
  {name:'Fast expansion',first:2,job:'delivery',cashReserve:.015},
  {name:'Conservative',first:4,job:'wash',cashReserve:.34},
  {name:'Hospitality',sector:0,job:'lemonade',cashReserve:.15,challenge:5},
  {name:'Retail',sector:1,job:'delivery',cashReserve:.15,challenge:1},
  {name:'Logistics',sector:2,job:'delivery',cashReserve:.15,challenge:1},
  {name:'Technology',sector:3,job:'wash',cashReserve:.15,challenge:4},
  {name:'Manufacturing',sector:5,job:'delivery',cashReserve:.15,challenge:6},
  {name:'Small town',first:1,job:'lemonade',cashReserve:.15,challenge:2}
];

function walk(s,key,seconds,stop=()=>false){
  for(let i=0;i<Math.round(seconds/O.STEP)&&!stop();i++){
    if(i%6===0&&!s.player.path?.length){
      const target=O.suggest(s,key);
      if(target)O.aim(s,target);
    }
    O.step(s);
  }
}

function balance(seed,profile,limitHours=40){
  const g=E.newGame(seed,'Standard',profile.challenge??-1);
  const s=O.create(g);
  const first=(profile.sector??profile.first)*4;
  const start=E.quote(g,first,0)+Math.round(C.businesses[first].cost*.27);
  const milestones=C.milestones.slice(1,9);
  const hits=Array(milestones.length).fill(null);
  function measure(){
    const n=E.worth(g);
    milestones.forEach((value,i)=>{if(n>=value&&hits[i]===null)hits[i]=s.elapsed;});
    return n;
  }
  walk(s,profile.job,2400,()=>{measure();return g.cash>=start;});
  const store=O.acquire(s,first);
  if(!store)return {wins:false,seconds:s.elapsed,hits,net:E.worth(g),sites:0,orders:s.served,losses:g.recovery};
  O.advancePortfolio(s,6);
  O.changeScene(s,0,store.id);
  E.improve(g,store,'hire',0);
  walk(s,'',60);
  O.changeScene(s,0);
  const firstShopAt=s.elapsed;
  while(s.elapsed<limitHours*3600&&!g.won){
    const worth=measure(), held=profile.cashReserve*g.cash;
    const maxTier=Math.max(...g.businesses.map(b=>C.businesses[b.type].tier));
    const cash=g.cash-held;
    if(g.round%2===0){
      const next=C.regions.find(r=>!g.regions.includes(r.id)&&E.worth(g)>=r.gate&&cash>r.cost*1.5);
      if(next)E.unlock(g,next.id);
    }
    const affordable=[];
    for(const r of g.regions){
      for(const d of C.businesses){
        const same=profile.sector===undefined||d.sector===profile.sector;
        if(!same||!E.canBuy(g,d.id,r,worth))continue;
        const cost=E.quote(g,d.id,r);
        const headroom=cost+C.businesses[d.id].cost*.22;
        const maxSites=[4,7,12,21][d.tier];
        const tierSites=g.businesses.filter(b=>C.businesses[b.type].tier===d.tier).length;
        if(cash>=headroom&&tierSites<maxSites&&(d.tier>=maxTier||g.cash>=3*cost)){
          const score=(d.tier+1)*20+ (C.regions[r].strength.includes(d.sector)?2:0)+C.regions[r].demand-(d.cost/Math.max(1,d.base))*.001;
          affordable.push({r,d,score});
        }
      }
    }
    affordable.sort((a,b)=>b.score-a.score);
    const chosen=affordable[0];
    if(chosen){
      if(s.region!==chosen.r)O.changeScene(s,chosen.r);
      const b=O.acquire(s,chosen.d.id);
      if(b){E.improve(g,b,'hire',0);E.improve(g,b,'hire',0);}
    }
    const candidates=g.businesses.slice().sort((a,b)=>b.type%4-a.type%4);
    for(const b of candidates.slice(0,6)){
      const d=C.businesses[b.type];
      if(g.cash<d.cost*.075+held)continue;
      const r=O.rate(s,b), up=b.up;
      if(b.staff<3&&r.service<r.arrivals*.83)E.improve(g,b,'hire',0);
      else if(up[0]<2&&g.cash>=E.upgradeCost(b,0,g)+held)E.improve(g,b,'upgrade',0);
      else if(up[7]<1&&b.staff&&g.cash>=E.upgradeCost(b,7,g)+held)E.improve(g,b,'upgrade',7);
      else if(up[1]<2&&g.cash>=E.upgradeCost(b,1,g)+held)E.improve(g,b,'upgrade',1);
      else if(b.channels<5&&g.cash>=E.channelCost(b)+held)E.improve(g,b,'channel',0);
      else if(up[2]<2&&g.cash>=E.upgradeCost(b,2,g)+held)E.improve(g,b,'upgrade',2);
      else if(b.wear>=38)E.improve(g,b,'repair',0);
      if(g.round>10)b.price=2;
    }
    if(g.round%4===0){
      const tech=C.research.find(t=>worth>=t.gate&&g.points>=t.points&&g.cash>t.cost*5&&!g.tech.includes(t.id)&&(!t.level||g.tech.includes(t.id-1)));
      if(tech)E.study(g,tech.id);
      if(g.field===undefined||g.last.profit>0)E.claim(g);
    }
    O.advancePortfolio(s,O.SHIFT);
  }
  measure();
  const orders=Object.values(s.sites).reduce((sum,x)=>sum+x.done,0)+g.worked;
  return {wins:g.won,seconds:s.elapsed,hits,net:E.worth(g),sites:g.businesses.length,orders,losses:g.recovery,firstShopAt};
}

function report(profile,samples,hours){
  const runs=Array.from({length:samples},(_,i)=>balance(Math.imul(i+1,2654435761)>>>0,profile,hours));
  const median=values=>{
    const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);
    return sorted[Math.floor(sorted.length/2)]??null;
  };
  return {
    profile:profile.name,samples,wins:runs.filter(r=>r.wins).length,
    hours:median(runs.filter(r=>r.wins).map(r=>Math.round(r.seconds/36)/100)),
    milestoneHours:C.milestones.slice(1,9).map((_,i)=>median(runs.map(r=>r.hits[i]===null?null:Math.round(r.hits[i]/36)/100))),
    firstShopMinutes:median(runs.map(r=>r.firstShopAt?Math.round(r.firstShopAt/6)/10:null)),
    net:median(runs.map(r=>r.net)),sites:median(runs.map(r=>r.sites)),orders:median(runs.map(r=>r.orders)),losses:runs.filter(r=>r.losses).length
  };
}

if(require.main===module){
  const samples=Math.max(1,Number(process.argv[2])||4);
  const hours=Math.max(1,Number(process.argv[3])||40);
  const names=process.argv.slice(4);
  for(const profile of profiles.filter(p=>!names.length||names.includes(p.name)))console.log(JSON.stringify(report(profile,samples,hours)));
}
module.exports={walk,balance,report,profiles};
