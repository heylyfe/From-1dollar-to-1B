'use strict';
require('../data.js');
require('../economy.js');
const C=Catalog,E=Economy;
const profiles=[
  ['Casual',null,-1,.58],['Aggressive',null,-1,.1],['Conservative',null,-1,.76],['Optimised',null,-1,.18],
  ['Hospitality',0,5,.22],['Technology',3,4,.22],['Manufacturing',5,6,.22],['Retail',1,1,.22],
  ['Diversified',null,-1,.31],['Offline reliant',null,-1,.76],['Poor decisions',null,-1,.68],['Resale loop',null,-1,.2]
];
function campaign(seed,[name,sector,challenge,reserve],limit=5500){
  const g=E.newGame(seed,'Standard',challenge);
  const milestones=[...C.milestones.slice(1,9)];
  const reached=Array(milestones.length).fill(0);
  const first=sector??(seed%8);
  const target=C.businesses[first*4].cost;
  while(g.cash<target){
    const job=g.worked>=8?2:g.worked>=3?1:0;
    const choice=name==='Poor decisions'?2:(g.worked+(g.seed%5)+g.event)%3;
    if(E.job(g,job,choice)===false)E.job(g,0,0);
  }
  E.buy(g,first*4,0);
  let upgrades=0, lossRounds=0, resaleNet=0;
  const cycleCap=['Poor decisions','Resale loop'].includes(name)?Math.min(limit,3500):limit;
  for(let cycle=0;cycle<cycleCap&&!g.won;cycle++){
    if(cycle%4===0){
      const local=g.businesses.slice().sort((a,b)=>b.type%4-a.type%4);
      const focus=local[0], home=C.businesses[focus.type];
      const net=E.worth(g);
      const cashFloor=g.cash*reserve;
      const permit=C.regions.find(r=>!g.regions.includes(r.id)&&net>=r.gate&&g.cash-r.cost>=cashFloor);
      if(permit)E.unlock(g,permit.id);
      const all=[];
      for(const r of g.regions){
        for(const d of C.businesses){
          if((sector!==null&&sector!==d.sector)||d.gate>net||!E.canBuy(g,d.id,r,net))continue;
          const cost=E.quote(g,d.id,r);
          if(g.cash-cost<cashFloor)continue;
          const score=(d.base/cost)*C.regions[r].demand*(d.tier+1)**2*(d.sector===first?1.05:1);
          all.push([d.id,r,score]);
        }
      }
      all.sort((a,b)=>b[0]%4-a[0]%4||b[2]-a[2]);
      if(all.length&&(all[0][0]%4>home.tier||local.length<Math.max(4,3+home.tier*4))&&
        (all[0][0]%4>home.tier||g.cash>home.cost*2))E.buy(g,all[0][0],all[0][1]);
      else if(g.cash>=home.cost*.16){
        const options=local.slice(0,3).flatMap(b=>{
          const list=[];
          for(const i of (name==='Poor decisions'?[3,4,2]:[0,1,2,3,5,6,7])){
            const cost=E.upgradeCost(b,i,g);
            if(b.up[i]>=E.upgrades[i][3]||g.cash-cost<cashFloor||(i===7&&(!b.staff||net<4000)))continue;
            const preview={...b,up:[...b.up]};preview.up[i]++;
            list.push([b,'upgrade',i,cost,E.getTerms(g,preview).profit-E.getTerms(g,b).profit]);
          }
          if(b.staff<(name==='Poor decisions'?8:3)){
            const cost=E.hireCost(b); if(g.cash-cost>=cashFloor)list.push([b,'hire',0,cost,E.getTerms(g,{...b,staff:b.staff+1}).profit-E.getTerms(g,b).profit]);
          }
          const cost=E.channelCost(b);if(b.channels<12&&b.up[1]&&g.cash-cost>=cashFloor)list.push([b,'channel',0,cost,E.getTerms(g,{...b,channels:b.channels+1}).profit-E.getTerms(g,b).profit]);
          return list;
        });
        options.sort((a,b)=>b[4]/b[3]-a[4]/a[3]);
        const opt=options[0];
        if(opt&&(opt[4]>0||name==='Poor decisions')&&E.improve(g,opt[0],opt[1],opt[2]))upgrades++;
      }
      if(name==='Resale loop'&&g.cash>target*3){
        const before=E.worth(g);
        const last=g.businesses.at(-1);
        if(g.businesses.length>1&&E.sell(g,last)&&E.canBuy(g,last.type,last.region))E.buy(g,last.type,last.region);
        resaleNet+=E.worth(g)-before;
      }
      if(cycle%12===0){
        const tech=C.research.find(t=>t.branch===(cycle/12+seed)%8&&g.cash>t.cost*3&&g.points>=t.points&&net>=t.gate&&!g.tech.includes(t.id)&&(!t.level||g.tech.includes(t.id-1)));
        if(tech)E.study(g,tech.id);
      }
    }
    const choices=E.rules.map((_,i)=>[i,E.aggregate(g,i).profit]).sort((a,b)=>b[1]-a[1]);
    const policy=name==='Poor decisions'?2:cycle%4===0?1:choices[0][0];
    const period=E.close(g,policy);
    if(period&&period.profit<0)lossRounds++;
    if(name==='Offline reliant'&&cycle%27===0)E.offline(g,8*3600000);
    if(cycle%4===0)E.claim(g);
    milestones.forEach((target,i)=>{if(!reached[i]&&E.worth(g)>=target)reached[i]=g.round;});
  }
  return {won:g.won, rounds:g.round, active:g.active, worth:E.worth(g), revenue:g.totalRevenue, profit:g.totalRevenue-g.totalCosts,
    recovery:g.recovery,lossRounds,upgrades,resaleNet,reached};
}
const median=list=>list.length?list.sort((a,b)=>a-b)[Math.floor(list.length/2)]:null;
if(require.main===module){
  const samples=Number(process.argv[2])||1000;
  const subset=process.argv.slice(3);
  for(const profile of profiles.filter(p=>!subset.length||subset.includes(p[0]))){
    const runs=Array.from({length:samples},(_,i)=>campaign(Math.imul(i+1,2654435761)>>>0,profile));
    const winners=runs.filter(r=>r.won);
    const result={profile:profile[0],samples,wins:winners.length,rounds:median(winners.map(r=>r.rounds)),estHours:median(winners.map(r=>Number((r.active/3600).toFixed(2)))),
      milestones:C.milestones.slice(1,9).map((_,i)=>median(runs.map(r=>r.reached[i]).filter(Boolean))),
      revenue:median(runs.map(r=>r.revenue)),profit:median(runs.map(r=>r.profit)),
      upgrades:median(runs.map(r=>r.upgrades)),operatingLossRounds:median(runs.map(r=>r.lossRounds)),recoveries:runs.filter(r=>r.recovery).length,
      endingNetWorth:median(runs.map(r=>r.worth)),resaleLoss:median(runs.map(r=>r.resaleNet))};
    console.log(JSON.stringify(result));
  }
}
module.exports={campaign,profiles};
