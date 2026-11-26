"use strict";
globalThis.Economy = (() => {
  const C = Catalog;
  const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
  const round = n=>Math.round(clamp(n,-8e14,8e14));
  const levels=g=>Array.from({length:8},(_,i)=>level(g,i));
  const rules = [
    {name:'Protect margins', detail:'Demand −5%, input costs −14%.',demand:.95,input:.86,wear:1},
    {name:'Build loyalty', detail:'Demand +10%, input costs +5%, better reputation.',demand:1.1,input:1.05,wear:1},
    {name:'Run at capacity', detail:'Demand +18%, input costs +11%, faster equipment wear.',demand:1.18,input:1.11,wear:1.5}
  ];
  const upgrades=[
    ['Equipment','Increase capacity and reduce waste',.24,5],
    ['Facility','Open new floor space and increase capacity',.46,6],
    ['Training','Increase crew productivity and satisfaction',.14,5],
    ['Marketing','Attract customers with higher running costs',.17,5],
    ['Experience','Improve service and resistance to rivals',.18,5],
    ['Maintenance','Lower wear and running costs',.14,5],
    ['Efficiency','Reduce input costs and equipment wear',.19,5],
    ['Automation','Earn more offline and improve output',.30,3]
  ];
  const difficulty = {Casual:[1.09,.93,.68],Standard:[1,1,1],Expert:[.94,1.05,1.38]};
  function newGame(seed=Date.now(),mode='Standard',challenge=-1,legacy=0,start=0){
    const region=legacy&&start===1&&challenge!==2?1:0;
    return {cash:100, seed:(Number(seed)>>>0)||1, mode:difficulty[mode]?mode:'Standard',challenge,legacy,
      round:0,active:0,played:0,industry:-1,job:0,tools:[0,0,0],worked:0, staffHired:0,sold:0,
      businesses:[],nextId:1,regions:region?[0,1]:[0],home:region, tech:[],points:0,
      totalRevenue:0,totalCosts:0,peak:100,debt:0,property:0, contracts:0,projects:[],rivals:C.regions.map(()=>[800,800,800]),
      history:[],deals:0,last:{revenue:0,costs:0,profit:0},event:7,policy:0,won:false,completedAt:0, recovery:0, achievements:[],skipTutorial:false,stamp:Date.now()};
  }
  function random(g){
    let x=g.seed;
    x^=x<<13;x^=x>>>17;x^=x<<5;
    g.seed=x>>>0;
    return g.seed/4294967296;
  }
  function level(g,i){
    const first=i*7;
    let result=0;
    while(g.tech.includes(first+result)&&result<7)result++;
    return result;
  }
  const worth = g=>round(g.cash+g.property+g.businesses.reduce((sum,b)=>sum+value(b,g),0)-g.debt);
  const value = (b,g)=>round(b.spent*(.76+Math.min(.15,b.rep*.001)+(g.tech.includes(40)?.04:0)));
  function getTerms(g,b,policy=g.policy,depth=null){
    const d=C.businesses[b.type], s=C.sectors[d.sector], r=C.regions[b.region];
    const [equipment,facility,training,marketing,experience,maintenance,efficiency,automation]=b.up;
    const l=depth||levels(g);
    const e=C.events[g.event], eventOn=e[2].includes(d.sector);
    const [dem,expense,rivalStress]=difficulty[g.mode];
    const edition=rules[policy];
    const rival=Math.max(...g.rivals[b.region]);
    const pressure=clamp(rival/350000*rivalStress-.012*l[1]-.024*experience,.015,.35);
    const price=[.85,1,1.18][b.price];
    const crew=(1+Math.sqrt(b.staff)*(.37+.04*training+.013*l[3]))*(1+.05*training);
    const wear=clamp(1-b.wear/195+.026*maintenance+.016*l[0],.72,1.12);
    const capacity=(1+.28*equipment+.29*facility+.072*equipment*facility+.09*automation+.021*l[0])*crew*wear;
    const sectorFit=r.strength.includes(d.sector)?1.17:1;
    const channel=b.special?1.13:1;
    const agreement=(b.dealUntil||0)>g.round?b.deal:0;
    const speciality=[.18,.14,.18,.30,.19,.16,.15,.26][d.sector];
    const portLoad=g.businesses.filter(other=>other.region===b.region&&C.businesses[other.type].sector===d.sector).length;
    const reputation=.79+b.rep*.005;
    const demand=(agreement===2?1.12:1)*(1.44+marketing*.31+.14*experience+.041*l[1]+.028*l[6]+b.channels*.88)
      *r.demand*sectorFit*reputation*dem*(1-pressure)*(eventOn?e[3]:1)*edition.demand
      *Math.pow(price,-d.elasticity)/(1+Math.max(0,portLoad-2)*.075);
    const entries=Math.min(capacity,demand);
    const link=g.businesses.some(other=>C.businesses[other.type].sector===s.supplier);
    const clean=g.businesses.some(other=>C.businesses[other.type].sector===6);
    const product=1+(channel-1)*speciality*5+(d.sector===3||d.sector===7?.033*l[7]:0);
    const base = d.base*(1+.87*b.channels);
    const revenue=round(base*entries*price*product);
    const materials=round((agreement===1?.79:1)*base*entries*d.materials*(eventOn?e[4]:1)*edition.input
      *(link?.87-.01*l[2]:1)*Math.pow(.936,efficiency+l[2]*.23+l[0]*.10)*(b.special&&[2,5,6].includes(d.sector)?.86:1));
    const wages=round(d.base*d.staff*b.staff*r.wages*(1-.018*l[3])*(1+.03*training));
    const overhead=round((agreement===3?.83:1)*base*(.10+.035*marketing+.035*automation+.033*facility+.04*Number(b.manager>0))*r.rent*expense
      *(clean?.92:1)*(1-.026*l[4]-.012*l[5]-.014*maintenance-(b.manager===3?.08:0)));
    const costs=materials+wages+overhead;
    return {revenue,costs,profit:revenue-costs,materials,wages,overhead,capacity:Math.round(capacity*d.capacity),
      demand:Math.round(demand*d.capacity),sales:Math.round(entries*d.capacity),pressure,wear,link};
  }
  function quote(g,type,region){return round(C.businesses[type].cost*C.regions[region].rent);}
  function canBuy(g,type,region,net=worth(g)){
    const d=C.businesses[type];
    if(!d||!g.regions.includes(region)||g.businesses.some(b=>b.type===type&&b.region===region))return false;
    const industry=g.industry??(g.businesses.length?C.businesses[g.businesses[0].type].sector:-1);
    if(g.challenge===1&&industry>=0&&industry!==d.sector)return false;
    if(({4:3,5:0,6:5})[g.challenge]!==undefined&&({4:3,5:0,6:5})[g.challenge]!==d.sector)return false;
    return net>=d.gate;
  }
  function pay(g,cost){if(!Number.isSafeInteger(cost)||cost<0||g.cash<cost)return false;g.cash-=cost;return true;}
  function buy(g,type,region) {
    if(!canBuy(g,type,region)||!pay(g,quote(g,type,region)))return false;
    const b={id:g.nextId++,type,region,spent:quote(g,type,region),staff:0,up:[0,0,0,0,0,0,0,0],rep:55,wear:0,price:1,manager:0,special:0,channels:0};
    if(g.industry===undefined||g.industry<0)g.industry=C.businesses[type].sector;
    g.businesses.push(b);update(g);return b;
  }
  function job(g,index,option) {
    const j=C.jobs[index];
    if(!j||!Number.isInteger(option)||option<0||option>2||g.worked<[0,3,8][index]||!pay(g,j.cost[option]))return false;
    const signal=(g.worked+g.event+(g.seed%5))%3;
    const alignment=option===signal?1.35:option===2&&signal===0?.68:1;
    const payout=round(j.payouts[option]*alignment*(1+g.tools[index]*.29));
    g.cash+=payout;g.totalRevenue+=payout;g.totalCosts+=j.cost[option];g.worked++;g.job=index;g.active+=4;
    if(g.worked%5===0)g.points++;
    update(g);return payout-j.cost[option];
  }
  const toolCost=(g,i)=>round((i+1)*150*Math.pow(2.4,g.tools[i]));
  function tool(g,i){if(!C.jobs[i]||g.tools[i]>=4||!pay(g,toolCost(g,i)))return false;g.tools[i]++;return true;}
  function upgradeCost(b,i,g){
    return round(C.businesses[b.type].cost*upgrades[i][2]*Math.pow(1.62,b.up[i])*(g.businesses.some(o=>C.businesses[o.type].sector===4)&&i===1?.86:1));
  }
  function hireCost(b){return round(C.businesses[b.type].cost*.1*Math.pow(1.38,b.staff));}
  function channelCost(b){
    const d=C.businesses[b.type];
    return round(d.cost*(.95+.42*b.channels)*Math.pow(1.13,b.channels)*C.regions[b.region].rent);
  }
  function improve(g,b,what,i){
    if(!g.businesses.includes(b))return false;
    let cost=0;
    if(what==='upgrade'){
      if(!upgrades[i]||b.up[i]>=upgrades[i][3]||(i===7&&(b.staff===0||worth(g)<4000)))return false;
      cost=upgradeCost(b,i,g);
    } else if(what==='hire'){
      if(b.staff>=(g.challenge===8?2:8))return false;
      cost=hireCost(b);
    } else if(what==='manager'){
      if(i<1||i>3||b.staff<2||b.manager===i)return false;
      cost=round(C.businesses[b.type].cost*.25);
    } else if(what==='special'){
      if(b.special)return false;
      cost=round(C.businesses[b.type].cost*.35);
    } else if(what==='channel'){
      if(b.channels>=12||b.up[1]<1)return false;
      cost=channelCost(b);
    } else if(what==='repair'){
      if(b.wear<5)return false;
      cost=round(C.businesses[b.type].cost*.02*b.wear/45);
    } else return false;
    if(!pay(g,cost))return false;
    if(what==='upgrade')b.up[i]++;
    if(what==='hire'){b.staff++;g.staffHired++;}
    if(what==='manager')b.manager=i;
    if(what==='special')b.special=1;
    if(what==='channel')b.channels++;
    if(what==='repair')b.wear=0;
    b.spent+=what==='repair'?0:cost;
    update(g);return true;
  }
  function aggregate(g,policy=g.policy) {
    const depth=levels(g);
    let revenue=Math.round(g.property*.006), costs=0;
    for(const b of g.businesses){const t=getTerms(g,b,policy,depth);revenue+=t.revenue;costs+=t.costs;}
    costs+=round(g.debt*(.011-.00065*depth[5]));
    return {revenue:round(revenue),costs:round(costs),profit:round(revenue-costs)};
  }
  function close(g,policy=g.policy){
    if(!rules[policy]||(!g.businesses.length&&!g.property))return false;
    g.policy=policy;
    const total=aggregate(g,policy);
    settle(g,total);
    g.round++;g.active+=60;g.points+=1+Math.floor(g.businesses.length/3);
    const depth=levels(g);
    for(const b of g.businesses){
      const t=getTerms(g,b,policy,depth);
      const stretch=t.demand>t.capacity*1.25?1:0;
      b.rep=clamp(b.rep+(policy===1?3:1)+b.up[4]+(b.manager===2?1:0)-stretch*2-(b.price===2?1:0),22,100);
      b.wear=clamp(b.wear+Math.max(.3,3*rules[policy].wear-b.up[5]*.66-b.up[6]*.2-(b.manager===1?1.7:0)-depth[4]*.23),0,70);
    }
    if(g.round%4===0){
      g.event=g.challenge===3&&g.round<50?2:Math.floor(random(g)*C.events.length);
      const market=Math.floor(random(g)*C.regions.length), rival=Math.floor(random(g)*3);
      const occupancy=g.businesses.filter(b=>b.region===market).length;
      g.rivals[market][rival]=clamp(g.rivals[market][rival]+Math.round((100+occupancy*135)*(g.event===2?.5:1)*(rival===0?1.4:1)),800,120000);
    }
    g.history.push(g.cash);
    if(g.history.length>36)g.history.shift();
    update(g);return total;
  }
  const deals=[
    ['Supplier agreement','Reduce material costs by 21% for 16 periods.',1],
    ['Franchise partnership','Increase demand by 12% for 16 periods.',2],
    ['Shared services deal','Reduce overhead by 17% for 16 periods.',3]
  ];
  function dealQuote(g,b,i){
    const d=C.businesses[b.type];
    return round(d.base*[0,1.35,1.2,.65][i]*(1+.8*b.channels)*(.98-.03*level(g,6)));
  }
  function sign(g,b,i){
    if(!g.businesses.includes(b)||!deals[i-1]||b.rep<65||(b.dealUntil||0)>g.round||
      (i===2&&!g.tech.includes(43))||(i===3&&!g.tech.includes(39))||
      !pay(g,dealQuote(g,b,i)))return false;
    b.deal=i;b.dealUntil=g.round+16;g.deals++;
    return true;
  }
  function mergerQuote(g,region,index){
    const stake=g.rivals[region]?.[index]??0;
    return round(stake*11*C.regions[region].rent);
  }
  function acquireRival(g,region,index){
    const stake=g.rivals[region]?.[index]??0;
    if(stake<2200||!g.regions.includes(region)||!g.tech.includes(46)||
      !g.businesses.some(b=>b.region===region)||!pay(g,mergerQuote(g,region,index)))return false;
    g.rivals[region][index]=round(Math.max(800,stake*.48));
    for(const b of g.businesses.filter(b=>b.region===region))b.rep=Math.min(100,b.rep+7);
    g.deals++;update(g);return true;
  }
  function consolidate(g,region,what){
    const sites=g.businesses.filter(b=>b.region===region);
    if(!sites.length)return 0;
    let changed=0;
    for(const b of sites){
      if(what==='standard'&&b.price!==1){b.price=1;changed++;}
      if(what==='service'&&improve(g,b,'repair',0))changed++;
    }
    return changed;
  }
  function settle(g,total){
    g.cash=round(g.cash+total.profit);
    if(g.cash<0){g.debt=round(g.debt-g.cash);g.cash=0;g.recovery++;}
    g.totalRevenue=round(g.totalRevenue+total.revenue);
    g.totalCosts=round(g.totalCosts+total.costs);
    g.last=total;
  }
  function offline(g,elapsed){
    const minutes=Math.floor(clamp(elapsed,0,8*3600000)/60000);
    if(!minutes||!g.businesses.some(b=>b.up[7]))return null;
    const turns=Math.min(24,Math.floor(minutes/5));
    if(!turns)return null;
    const total={minutes,turns,revenue:0,costs:0,profit:0};
    for(const b of g.businesses){
      if(!b.up[7])continue;
      const terms=getTerms(g,b);
      total.revenue+=round(terms.revenue*turns*(.16+.075*b.up[7]));
      total.costs+=round(terms.costs*turns*(.16+.075*b.up[7]));
    }
    total.profit=total.revenue-total.costs;
    settle(g,total);update(g);return total;
  }
  function unlock(g,region){
    const r=C.regions[region];
    if(!r||g.challenge===2||g.regions.includes(region)||worth(g)<r.gate||!pay(g,round(r.cost*(1-.045*level(g,6)))))return false;
    g.regions.push(region);update(g);return true;
  }
  function study(g,id){
    const t=C.research[id];
    if(!t||g.tech.includes(id)||(t.level&&!g.tech.includes(id-1))||worth(g)<t.gate||g.points<t.points||!pay(g,t.cost))return false;
    g.tech.push(id);g.points-=t.points;update(g);return true;
  }
  function sell(g,b){
    const index=g.businesses.indexOf(b);
    if(index<0)return false;
    g.cash+=round(value(b,g)*.87);
    g.businesses.splice(index,1);g.sold++;update(g);return true;
  }
  function finance(g,action,amount){
    if(!Number.isSafeInteger(amount)||amount<=0)return false;
    if(action==='loan'&&g.challenge!==0&&g.businesses.length&&amount<=credit(g)){g.cash+=amount;g.debt+=amount;}
    else if(action==='repay'&&amount<=g.debt&&pay(g,amount))g.debt-=amount;
    else if(action==='property'&&g.tech.includes(35)&&pay(g,amount))g.property+=round(amount*.97);
    else if(action==='liquidate'&&amount<=g.property){g.property-=amount;g.cash+=round(amount*.9);}
    else return false;
    update(g);return true;
  }
  const credit=g=>Math.max(0,round(worth(g)*(.22+.035*level(g,5))-g.debt));
  const contractConfig=[
    ['Neighbourhood commission',0,1,50,0],
    ['Regional delivery award',1,1,62,1],
    ['Provincial growth contract',1,2,73,2],
    ['National infrastructure bid',2,2,82,3],
    ['International operating charter',3,2,89,4]
  ];
  function contract(g){
    const c=contractConfig[g.contracts%contractConfig.length];
    const eligible=g.businesses.filter(b=>C.businesses[b.type].tier>=c[1]&&b.rep>=c[3]);
    const needed=g.challenge===2?1:c[2];
    const profit=eligible.reduce((sum,b)=>sum+getTerms(g,b).profit,0);
    return {name:c[0],tier:c[1],need:needed,rep:c[3],regions:g.challenge===2?1:Math.max(1,c[4]),eligible:eligible.length,
      reward:round(Math.max(0,profit)*(5+.55*level(g,1)+.45*level(g,6))),ready:eligible.length>=needed&&g.regions.length>=(g.challenge===2?1:Math.max(1,c[4]))&&g.round>=(g.contracts+1)*8};
  }
  function claim(g){
    const c=contract(g);
    if(!c.ready||c.reward<=0)return false;
    g.cash+=c.reward;g.totalRevenue+=c.reward;g.points+=3;g.contracts++;update(g);return true;
  }
  const projects=[
    ['Integrated distribution',20,25000000,25,2,3],['Shared services centre',27,32000000,25,2,3],['Clean infrastructure',34,55000000,30,2,3],
    ['Corporate treasury',41,70000000,35,2,3],['Global headquarters',48,1100000000,40,3,5],['Frontier research park',55,1600000000,45,3,5]
  ];
  function project(g,i){
    const p=projects[i];
    if(!p||g.projects.includes(i)||!g.tech.includes(p[1])||g.points<p[3]||g.businesses.filter(b=>C.businesses[b.type].tier>=p[4]).length<p[5]||!pay(g,p[2]))return false;
    g.projects.push(i);g.points-=p[3];g.property+=round(p[2]*.89);update(g);return true;
  }
  function qualified(g,net=worth(g)){
    if(net<100000000000||g.businesses.length<2||g.debt>net*.20||aggregate(g).profit<=0)return false;
    if(g.challenge===7&&(!g.businesses.some(b=>C.businesses[b.type].sector===6)||!g.businesses.every(b=>b.up[6]>=2)))return false;
    return g.challenge!==9||new Set(g.businesses.map(b=>b.region)).size>=6;
  }
  function update(g){
    const net=worth(g);
    g.peak=Math.max(g.peak,net);
    if(!g.won&&qualified(g,net)){g.won=true;g.completedAt=g.played||0;}
  }
  const achievements = [
    ...C.milestones.slice(1).map((n,i)=>['Fortune '+['I','II','III','IV','V','VI','VII','VIII','IX','X'][i],n,g=>g.peak>=n]),
    ...C.businesses.map(d=>[d.name+' founder',0,g=>g.businesses.some(b=>b.type===d.id)]),
    ...C.regions.slice(1).map(r=>[r.name+' investor',0,g=>g.regions.includes(r.id)]),
    ...C.sectors.map((s,i)=>[s.name+' mastery',0,g=>g.businesses.some(b=>C.businesses[b.type].sector===i&&C.businesses[b.type].tier>=2&&b.rep>=95&&b.up[7]>0)]),
    ...C.tracks.map((s,i)=>[s[0]+' expert',0,g=>level(g,i)===7]),
    ...C.challenges.map(([name],i)=>[name+' completed',0,g=>g.challenge===i&&g.won]),
    ['First shift',0,g=>g.worked>0],['First toolkit',0,g=>g.tools.some(Boolean)],['First hire',0,g=>g.staffHired>0],
    ['Automated',0,g=>g.businesses.some(b=>b.up[7])],['Clean books',0,g=>g.won&&!g.debt],['Contractor',0,g=>g.contracts>=3],
    ['Strong comeback',0,g=>g.recovery>0&&g.debt===0&&g.peak>=100000],
    ['Highly rated',0,g=>g.businesses.some(b=>b.rep===100)],['Corporate architect',0,g=>g.projects.length>=3]
  ];
  return {rules,upgrades,projects,achievements,newGame,worth,value,getTerms,quote,canBuy,buy,job,toolCost,tool,upgradeCost,hireCost,channelCost,improve,close,aggregate,offline,unlock,study,sell,finance,credit,contract,claim,project,level,qualified,update,consolidate,deals,dealQuote,sign,mergerQuote,acquireRival};
})();
