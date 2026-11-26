"use strict";
globalThis.Operations = (() => {
  const C=Catalog,E=Economy,F=FieldData;
  const W=960,H=640,STEP=.05,SHIFT=44,MONEY_MAX=8e14;
  const ENTRY={lemonade:[510,442],wash:[916,393],delivery:[425,526]};
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const pos=([x,y])=>({x,y});
  const limit=(n,lo,hi,otherwise=lo)=>Number.isFinite(n)?clamp(n,lo,hi):otherwise;
  const point=(x,y)=>({x,y});
  const fresh=()=>({input:0,output:0,time:0});
  const catalog=(g,id)=>g.businesses.find(b=>b.id===id);
  const sector=b=>C.businesses[b.type].sector;
  const recipeFor=b=>F.blueprint(C.businesses[b.type]);
  const palette=['#b35b55','#51858a','#a576a5','#6e9266','#d49c51','#626c9c'];
  const contractMultiplier=[2.95,3.24,6.7,28];
  const sectorPricing=[1.02,1,1,.94,1.02,1.14,1.04,1];
  function safeStore(raw) {
    const out={};
    if(!raw||typeof raw!=='object')return out;
    for(const [key,val] of Object.entries(raw).slice(0,256)){
      if(!/^[1-9][0-9]{0,6}$/.test(key)||!val||typeof val!=='object')continue;
      out[key]={
        done:Math.floor(limit(val.done,0,1e8)), lost:Math.floor(limit(val.lost,0,1e8)), moment:limit(val.moment,0,SHIFT),
        transit:limit(val.transit,0,120), backlog:Math.floor(limit(val.backlog,0,20)), sold:Math.floor(limit(val.sold,0,5000)),
        fit:limit(val.fit,0,12), fitout:limit(val.fitout,0,8), eta:limit(val.eta,0,180), layout:val.layout===1?1:0, lot:Math.floor(limit(val.lot,-1,255)), bins:{},
        stays:Array.isArray(val.stays)?val.stays.slice(0,5).filter(r=>r&&Number.isSafeInteger(r.id)).map(r=>({id:r.id,time:limit(r.time,0,25),wait:limit(r.wait,0,60),worker:Boolean(r.worker)})):[]
      };
      for(const [k,n] of Object.entries(val.bins||{}).slice(0,30)){
        if(!/^[a-z-]{1,25}$/.test(k)||!n||typeof n!=='object')continue;
        out[key].bins[k]={input:Math.floor(limit(n.input,0,64)),output:Math.floor(limit(n.output,0,64)),time:limit(n.time,0,10)};
      }
    }
    return out;
  }

  function create(g,emit=()=>{},raw=g.field){
    raw=raw&&typeof raw==='object'?raw:{};
    const region=g.regions.includes(raw.region)?raw.region:g.home;
    const id=catalog(g,raw.site)?.region===region?raw.site:0;
    const seed=Number.isInteger(raw.seed)?raw.seed>>>0:g.seed;
    const layoutSeed=Number.isInteger(raw.layoutSeed)?raw.layoutSeed>>>0:g.seed;
    const data=safeStore(raw.sites);
    const carry=Object.hasOwn(F.item,raw.carry)?raw.carry:'';
    const player={x:limit(raw.x,38,W-38,338),y:limit(raw.y,150,H-36,377),item:carry,
      count:carry?Math.floor(limit(raw.count,0,16)):0,dir:2,moving:false,anim:0,hold:0,target:null,cooldown:0};
    const townBins=safeStore({1:{bins:raw.townBins}})[1].bins;
    const state={g,emit,seed,layoutSeed,region,site:id,player,sites:data,mode:'',map:null,time:0,shift:limit(raw.shift,0,SHIFT),
      elapsed:limit(raw.elapsed,0,1e9),served:Math.floor(limit(raw.served,0,1e8)),missed:Math.floor(limit(raw.missed,0,1e8)),
      report:{revenue:0,costs:0},ledger:{revenue:Math.floor(limit(raw.revenue,0,8e14)),costs:Math.floor(limit(raw.costs,0,8e14))},
      townSpent:Math.floor(limit(raw.townSpent,0,800)),expanded:Math.floor(limit(raw.expanded,0,3)),rank:0,
      npcs:[],workers:[],clocks:{},focus:null,visitClock:0,serial:Math.max(0,Math.floor(limit(raw.serial,0,1e8))),lotPage:Math.floor(limit(raw.lotPage,0,42)),stock:townBins,townBins,popups:[],wash:0,remoteClock:0,cache:new Map};
    if(!player.count)player.item='';
    if(state.site&&state.sites[state.site]?.eta>0)state.site=0;
    g.realTime=true;
    rebuild(state);
    seedLocalTraffic(state);
    if(!clear(state.map,player.x,player.y,8)){
      Object.assign(player,state.site?pos(F.foyer):point(338,377));
    }
    return state;
  }

  function snapshot(s){
    return {
      seed:s.seed,serial:s.serial,lotPage:s.lotPage,layoutSeed:s.layoutSeed,townBins:s.townBins,region:s.region,site:s.site,x:Math.round(s.player.x),y:Math.round(s.player.y),
      carry:s.player.item,count:s.player.count,sites:s.sites,elapsed:s.elapsed,shift:s.shift,
      served:s.served,missed:s.missed,expanded:s.expanded,townSpent:s.townSpent,
      revenue:s.ledger.revenue,costs:s.ledger.costs
    };
  }

  function record(s,b){
    return s.sites[b.id]??= {done:0,lost:0,moment:0,transit:0,backlog:0,sold:0,fit:0,fitout:0,eta:0,layout:0,lot:-1,bins:{},stays:[]};
  }
  function locateLots(s,region){
    const owned=s.g.businesses.filter(b=>b.region===region);
    const built=new Map(), unassigned=[];
    for(const b of owned){
      const rec=record(s,b);
      if(rec.lot>=0&&!built.has(rec.lot))built.set(rec.lot,b);
      else unassigned.push(b);
    }
    let next=0;
    for(const b of unassigned){
      while(built.has(next))next++;
      record(s,b).lot=next;
      built.set(next,b);
    }
    return built;
  }
  function blockCount(s){
    const lots=locateLots(s,s.region);
    const last=Math.max(-1,...lots.keys());
    const buildingCount=lots.size;
    return Math.min(43,Math.max(1,Math.floor(last/6)+1,Math.floor(buildingCount/6)+1));
  }
  function random(s){
    let x=s.seed||1;
    x^=x<<13;x^=x>>>17;x^=x<<5;s.seed=x>>>0;
    return s.seed/4294967296;
  }
  function posCache(s,key){return s.stock[key]??=fresh();}
  function capacity(s,recipe){
    const b=catalog(s.g,s.site);
    if(b)return Math.min(14,3+b.up[0]+b.up[1]+b.up[7]+Math.floor(b.channels/3));
    return 3+s.expanded+(recipe?.starter===undefined?0:s.g.tools[recipe.starter]);
  }
  function speed(s){
    const b=catalog(s.g,s.site), levels=b?b.up[0]:Math.max(...s.g.tools);
    return (152+levels*7+(b?.up[7]||0)*6)*(s.player.count>5?.88:1);
  }
  function zone(id,kind,title,art,x,y,more={}){return {...more,id,kind,title,art,x,y};}
  function rebuild(s){
    const b=catalog(s.g,s.site), recipe=b?F.recipes[recipeFor(b)]:null;
    const theme=F.themes[s.region];
    const starters=!b&&(s.region===0||s.region===s.g.home&&Boolean(s.g.legacy));
    const mirrored=!starters&&Boolean((s.layoutSeed>>>s.region)&1);
    const mirrorX=x=>mirrored?W-x:x;
    let stations=[],obstacles=[],trees=[],lots=[], ext=0;
    const block=F.block;
    if(b){
      s.mode=recipeFor(b);
      const rec=record(s,b);
      const swap=rec.layout===1;
      ext=Math.min(3,Math.max(0,b.up[1]-Number(rec.fitout>0)));
      const flip=x=>swap?W-x:x;
      stations=recipe.stages.map(st=>({...st,recipe:s.mode,x:flip(st.x),queue:st.queue?[flip(st.queue[0]),st.queue[1]]:undefined,facing:swap?({east:'west',west:'east'})[st.facing]||st.facing:st.facing}));
      if(ext){
        const active=stations.find(st=>st.kind==='service');
        stations.push(zone('extension','service',recipe===F.recipes.hotel?'New rooms':recipe===F.recipes.retail?'Express till':'Annex station','annex',flip(779+ext*17),336,
          {input:active.input,recipe:s.mode,queue:[flip(802+ext*15),398],facing:'east',clerk:active.clerk,stay:active.stay,stockOnly:active.stockOnly,shared:active.id}));
      }
      stations.push(zone('door','action','Exit to street','exit',471,541),zone('office','action','Manage this business','office',235,445),zone('expand','action',ext?'Extend facility':'Build annex','build',flip(823+ext*10),208));
      if(b.up[7])stations.push(zone('robot','decor','Automation','robot',flip(746),185));
      obstacles.push(block(178,142,605+ext*29,19),block(158,153,22,358),block(438,507,30,12),block(511,507,272+ext*29,14));
      for(const st of stations){
        if(['action'].includes(st.kind))continue;
        obstacles.push(block(st.x-25,st.y-14,50,29));
      }
      const storage=stations.find(st=>st.kind==='source');
      obstacles.push(block(storage.x+(swap?45:-65),storage.y-62,16,28));
    }else{
      s.mode=starters?'town':'district';
      if(starters){
        stations=Object.entries(F.recipes).filter(([,r])=>r.starter!==undefined).flatMap(([key,r])=>r.stages.map(st=>({...st,recipe:key})));
        if(s.expanded)stations.push(zone('annex-lemon','service','Express lemonade','lemonade',539,255,{input:'drink',recipe:'lemonade',queue:[545,339],facing:'south',shared:'serve'}));
        stations.push(zone('tools','action','Equipment cart','tools',246,373),zone('townExpansion','action','Expand lemonade stand','build',407,195));
        trees=F.townTrees.map(([x,y,z])=>({x,y,z}));
      }else{
        trees=F.townTrees.filter((t,i)=>i%2===0).map(([x,y,z])=>({x:mirrorX(x),y,z}));
      }
      const owned=locateLots(s,s.region);
      const pads=starters?F.lots:F.districtLots;
      lots=pads.map(([x,y],i)=>({x:mirrorX(x),y,site:owned.get(s.lotPage*6+i)}));
      for(let i=0;i<lots.length;i++){
        const {x,y,site}=lots[i], rec=site&&record(s,site);
        stations.push(zone('lot-'+i,'action',site?C.businesses[site.type].name:'Construction lot',site?'door':'build',x,y+38,{business:site?.id,index:i}));
        if(site)obstacles.push(block(x-37,y-31,74,45));
        else obstacles.push(block(x-29,y-28,58,36));
        if(rec?.eta>0)stations.at(-1).building=true;
      }
      const travel= starters?point(758,549):point(mirrorX(823),550);
      stations.push(zone('travel','action','District travel','bus',travel.x,travel.y));
      if(owned.size>=6||[...owned.keys()].some(i=>i>=6))stations.push(zone('block','action','Next business block','sign',mirrorX(855),570));
      obstacles.push(...trees.map(({x,y,z})=>block(x-9*z,y-6*z,18*z,17*z)));
      for(const st of stations.filter(st=>st.kind!=='action'))obstacles.push(block(st.x-20,st.y-14,40,24));
    }
    if(b)record(s,b);
    s.map={region:s.region,site:s.site,mode:s.mode,theme,recipe,business:b,stations,obstacles,trees,lots,ext,mirrored,starters,minY:142};
    const permitted=new Set(stations.map(st=>st.id));
    s.npcs=s.npcs.filter(n=>permitted.has(n.service));
    if(b){
      const rec=record(s,b);
      s.stock=rec.bins;
    }
    return s.map;
  }

  function clear(map,x,y,r=8){
    if(x<30+r||y<map.minY+r||x>930-r||y>609-r)return false;
    return !map.obstacles.some(o=>x+r>o.x&&x-r<o.x+o.w&&y+r>o.y&&y-r<o.y+o.h);
  }
  function slide(map,p,dx,dy,r){
    if(dx&&clear(map,p.x+dx,p.y,r))p.x+=dx;
    if(dy&&clear(map,p.x,p.y+dy,r))p.y+=dy;
  }
  function line(map,a,b,r=9){
    const n=Math.ceil(dist(a,b)/6);
    for(let i=1;i<=n;i++){
      if(!clear(map,a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,r))return false;
    }
    return true;
  }
  function route(map,from,to,r=9){
    if(dist(from,to)<8)return [];
    if(line(map,from,to,r))return [to];
    const tile=25,nx=36,ny=18, ox=42,oy=160, total=nx*ny;
    const decode=i=>point(ox+(i%nx)*tile,oy+Math.floor(i/nx)*tile);
    const nearest=p=>{
      const x=Math.round((p.x-ox)/tile),y=Math.round((p.y-oy)/tile);
      let result=-1,best=Infinity;
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
        const cx=x+dx,cy=y+dy;
        if(cx<0||cy<0||cx>=nx||cy>=ny)continue;
        const i=cy*nx+cx,q=decode(i),d=dist(q,p);
        if(d<best&&clear(map,q.x,q.y,r)&&line(map,p,q,r)){result=i;best=d;}
      }
      return result;
    };
    const start=nearest(from),goal=nearest(to);
    if(start<0||goal<0)return null;
    const visited=new Int16Array(total);visited.fill(-1);
    visited[start]=start;
    const rows=[start];
    for(let head=0;head<rows.length&&visited[goal]===-1;head++){
      const i=rows[head],x=i%nx,y=Math.floor(i/nx);
      for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
        const xx=x+dx,yy=y+dy;
        if(xx<0||yy<0||xx>=nx||yy>=ny)continue;
        const j=yy*nx+xx,p=decode(j);
        if(visited[j]!==-1||!clear(map,p.x,p.y,r))continue;
        visited[j]=i;rows.push(j);
      }
    }
    if(visited[goal]===-1)return null;
    const back=[to];
    for(let i=goal;i!==start;i=visited[i])back.push(decode(i));
    back.push(decode(start));back.reverse();
    const path=[];let cursor=from;
    for(let i=0;i<back.length;){
      let next=i;
      while(next+1<back.length&&line(map,cursor,back[next+1],r))next++;
      path.push(back[next]);cursor=back[next];i=next+1;
    }
    return path;
  }
  function stand(map,st,from){
    const opts=[point(st.x,st.y+31),point(st.x-37,st.y+3),point(st.x+37,st.y+3),point(st.x,st.y-29)];
    return opts.filter(p=>clear(map,p.x,p.y,9)).sort((a,b)=>dist(a,from)-dist(b,from))[0]||point(st.x,st.y+31);
  }
  function aim(s,st){
    const from=s.player;
    const best=stand(s.map,st,from);
    const fallback=[point(st.x,st.y+32),point(st.x+38,st.y+3),point(st.x-38,st.y+3),point(st.x,st.y-31)];
    for(const p of [best,...fallback]){
      if(!clear(s.map,p.x,p.y,10))continue;
      const path=route(s.map,from,p,10);
      if(path){from.path=path;return true;}
    }
    return false;
  }
  function moveNPC(map,n,dt,speed){
    while(n.path?.length){
      const target=n.path[0], d=dist(n,target), travel=speed*dt;
      if(d>travel){
        const dx=(target.x-n.x)/d,dy=(target.y-n.y)/d;
        n.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0);
        slide(map,n,dx*travel,dy*travel,6);
        n.anim+=dt;n.moving=true;return false;
      }
      n.x=target.x;n.y=target.y;n.path.shift();
    }
    n.moving=false;return true;
  }
  function setPath(s,n,target){
    const path=route(s.map,n,target,7);
    if(!path)return false;
    n.path=path;return true;
  }

  function trade(s,revenue,costs,b=null){
    const g=s.g;
    if(g.cash+revenue<costs){
      g.debt=Math.min(MONEY_MAX,g.debt+costs-g.cash-revenue);g.cash=0;g.recovery++;
    }else g.cash=Math.min(MONEY_MAX,g.cash+revenue-costs);
    g.totalRevenue=Math.min(MONEY_MAX,g.totalRevenue+revenue);g.totalCosts=Math.min(MONEY_MAX,g.totalCosts+costs);
    s.ledger.revenue=Math.min(MONEY_MAX,s.ledger.revenue+revenue);s.ledger.costs=Math.min(MONEY_MAX,s.ledger.costs+costs);
    if(b)record(s,b).sold+=revenue>0?1:0;
    if(revenue>0)E.update(g);
    return revenue-costs;
  }
  function terms(s,b){
    const time=Math.floor(s.elapsed);
    const previous=s.cache.get(b.id);
    if(previous?.time===time)return previous.report;
    const report=E.getTerms(s.g,b);
    s.cache.set(b.id,{time,report});return report;
  }
  function arrivals(s,b,t=terms(s,b)){
    const d=C.businesses[b.type],region=C.regions[b.region],r=F.recipes[recipeFor(b)];
    const occupancy=s.g.businesses.reduce((n,site)=>n+Number(site.region===b.region),0);
    const saturation=1+Math.max(0,occupancy-6)*.038/region.demand;
    return Math.sqrt(Math.max(.24,t.demand/d.capacity))*(1+b.up[1]*.18)/(r.traffic*saturation);
  }
  function quote(s,b,t=terms(s,b)){
    const d=C.businesses[b.type];
    const multiplier=contractMultiplier[d.tier]*sectorPricing[d.sector];
    const revenue=Math.max(1,Math.round(t.revenue/Math.max(1,t.sales)*multiplier));
    const inputs=Math.max(0,Math.round(t.materials/Math.max(1,t.sales)*multiplier));
    return {revenue,inputs,terms:t};
  }

  function queueMembers(s,st){
    return s.npcs.filter(n=>n.service===st.id&&(n.phase==='queue'||n.phase==='arrive'));
  }
  function readyAt(s,st){return s.npcs.find(n=>n.service===st.id&&n.phase==='queue'&&n.rank===0);}
  function buffer(s,st){return posCache(s,st.shared||st.id);}
  function requestStep(s,st,agent,dt){
    const stBin=buffer(s,st), b=s.map.business, r=F.recipes[st.recipe];
    const count=agent.count, type=agent.item, cap=agent.capacity||capacity(s,r);
    const free=cap-count, batch=6+(b?.up[0]||0)*2+s.expanded;
    if(st.kind==='source'&&free>0&&(!type||type===st.out)){
      agent.item=st.out;agent.count=cap;
      if(agent===s.player)s.emit('pickup',{item:st.out});
      return true;
    }
    if(st.kind==='process'){
      if(count&&type===st.input&&stBin.input<batch){
        const n=Math.min(count,batch-stBin.input);stBin.input+=n;agent.count-=n;
        if(!agent.count)agent.item='';
        if(agent===s.player)s.emit('drop',{item:type,count:n});
        return true;
      }
      if(free>0&&stBin.output>0&&(!type||type===st.out)){
        const n=Math.min(stBin.output,free);stBin.output-=n;agent.count+=n;agent.item=st.out;
        if(agent===s.player)s.emit('pickup',{item:st.out});
        return true;
      }
    }
    if(st.kind==='stock'&&count&&type===st.input){
      const output=posCache(s,st.passTo), n=Math.min(count,16-output.input);
      if(n<1)return false;
      output.input+=n;agent.count-=n;if(!agent.count)agent.item='';
      if(agent===s.player)s.emit('drop',{item:type,count:n});
      return true;
    }
    if(st.kind==='service'){
      const client=readyAt(s,st), direct=['delivery','wash','restaurant','factory','logistics','tech','property','energy','lab'].includes(st.recipe);
      if(st.dwell){
        if(!client||!count||type!==st.input){if(agent===s.player)s.wash=0;return false;}
        s.wash+=dt;
        if(s.wash<st.dwell)return false;
        s.wash=0;
      }
      if(!st.stockOnly&&count&&type===st.input&&(!direct||client)&&stBin.input<batch){
        const n=direct?1:Math.min(count,batch-stBin.input);
        stBin.input+=n;agent.count-=n;if(!agent.count)agent.item='';
        if(agent===s.player)s.emit('drop',{item:type,count:n});
        if(client&&!st.clerk)complete(s,st,client);
        return true;
      }
      if(st.clerk&&client&&stBin.input>0){
        return complete(s,st,client);
      }
    }
    return false;
  }

  function businessOrder(s,b,wait){
    const unit=quote(s,b);
    const rec=record(s,b);
    rec.done++;rec.fit=Math.min(12,rec.fit+1);
    b.rep=clamp(b.rep+(wait<10?2:1),22,100);
    return trade(s,unit.revenue,unit.inputs,b);
  }
  function paid(s,st,n){
    const g=s.g,b=s.map.business,r=F.recipes[st.recipe];
    let profit;
    if(b)profit=businessOrder(s,b,n.queueWait);
    else{
      let sale=Math.round(r.base*(1+g.tools[r.starter]*.32+(r.starter===0?s.expanded*.09:0)));
      g.worked++;g.job=r.starter;
      if(g.worked%5===0)g.points++;
      if(g.worked===3){sale+=100;s.emit('milestone',{text:'First three orders · $1 bonus'});}
      profit=trade(s,sale,r.cost);
    }
    s.served++;
    s.popups.push({x:n.x,y:n.y-32,time:1.25,amount:profit});
    s.emit('sale',{amount:profit,station:st.title,business:b?.id,worker:Boolean(n.worker)});
    n.phase='leaving';n.rank=-1;setPath(s,n,n.entry);
  }
  function complete(s,st,n){
    const stock=buffer(s,st);
    if(n.phase!=='queue'||!stock.input)return false;
    if(st.stay){
      const rec=record(s,s.map.business),occupied=rec.stays.length;
      if(occupied>=2+s.map.ext||!stock.input)return false;
      const rooms=s.map.stations.find(q=>q.id===st.stay);
      const room=rooms&&stand(s.map,rooms,n);
      n.phase='stay';n.rank=-1;n.queueWait=n.wait;
      rec.stays.push({id:n.id,time:8+occupied*1.5+(room?dist(n,room)/78:0),wait:n.queueWait,worker:n.worker});
      stock.input--;
      if(room)setPath(s,n,room);
      return true;
    }
    stock.input--;n.queueWait=n.wait;
    paid(s,st,n);
    return true;
  }

  function entryFor(s,key){
    if(s.site)return point(491,552);
    return pos(ENTRY[key]||[495,555]);
  }
  function enqueue(s,st){
    const waiting=queueMembers(s,st);
    if(waiting.length>=(s.site?4:3)||s.npcs.length>=32)return false;
    const entry=entryFor(s,st.recipe);
    const rec=s.map.recipe;
    const stage=s.map.stations.find(q=>q.recipe===st.recipe&&q.passTo===st.id&&['shelf'].includes(q.art));
    const n={...entry,entry,dir:0,moving:false,anim:random(s),id:++s.serial,service:st.id,phase:'arrive',
      color:palette[Math.floor(random(s)*palette.length)],rank:waiting.length,wait:0,patient:rec?32:39,
      car:st.recipe==='wash'||(st.art==='dock'),browse:stage?stand(s.map,stage,entry):null,worker:false};
    s.npcs.push(n);return true;
  }
  function seedLocalTraffic(s){
    if(!s.map.starters||s.g.worked>12)return;
    for(const key of ['serve','wash','porch']){
      const station=s.map.stations.find(st=>st.id===key);
      if(!station||!enqueue(s,station))continue;
      const n=s.npcs.at(-1);
      [n.x,n.y]=station.queue;
      n.dir=key==='serve'?0:3;n.phase='queue';n.wait=0;
    }
  }
  function queuePosition(s,st,rank){
    const q=pos(st.queue);
    if(st.facing==='east')q.x+=rank*20;
    else if(st.facing==='west')q.x-=rank*20;
    else q.y+=rank*20;
    const outside=queueMembers(s,st).find(n=>n.rank===rank&&n.phase==='queue');
    if(!clear(s.map,q.x,q.y,8)&&!outside)return pos(st.queue);
    return q;
  }
  function tickCustomers(s,dt){
    const grouped=new Map();
    const services=s.map.stations.filter(st=>st.kind==='service');
    for(const st of services){
      const group=grouped.get(st.recipe)||[];
      group.push(st);grouped.set(st.recipe,group);
    }
    for(const [key,stations] of grouped){
      const r=F.recipes[key],b=s.map.business;
      s.clocks[key]=(s.clocks[key]??(key==='lemonade'?-.45:key==='wash'?-1.8:key==='delivery'?-1.4:-.3))+dt;
      const spacing=b?1/arrivals(s,b):r.traffic/(1+s.expanded*.18);
      if(s.clocks[key]<spacing)continue;
      const offset=stations.length>1?Math.floor(random(s)*stations.length):0;
      if(enqueue(s,stations[offset]))s.clocks[key]=-.35-random(s)*1.1;
      else s.clocks[key]=spacing-.8;
    }
    for(const st of services){
      const list=queueMembers(s,st);
      for(let i=0;i<list.length;i++){
        const n=list[i],goal=queuePosition(s,st,i);
        if(n.rank!==i){n.rank=i;n.path=null;}
        if(n.browse){
          if(!n.path)setPath(s,n,n.browse);
          if(moveNPC(s.map,n,dt,84)){n.browse=null;n.path=null;}
          continue;
        }
        if(dist(n,goal)>3){
          if(!n.path?.length&&!setPath(s,n,goal)){n.retry=(n.retry||0)+dt;if(n.retry>8){n.phase='gone';s.missed++;}continue;}
          if(!moveNPC(s.map,n,dt,n.car?78:95))continue;
          if(dist(n,goal)>5)continue;
        }
        n.phase='queue';n.wait+=dt;
        if(n.wait>n.patient){
          n.phase='leaving';n.rank=-1;setPath(s,n,n.entry);s.missed++;
          if(s.map.business){const b=s.map.business;record(s,b).lost++;b.rep=clamp(b.rep-1,22,100);}
        }else if(n.rank===0&&!st.clerk&&buffer(s,st).input>0){
          complete(s,st,n);
        }
      }
    }
    for(const n of s.npcs){
      if(n.phase==='stay'){
        moveNPC(s.map,n,dt,85);
      }else if(n.phase==='leaving'){
        if(moveNPC(s.map,n,dt,100)||dist(n,n.entry)<5)n.phase='gone';
      }
    }
    s.npcs=s.npcs.filter(n=>n.phase!=='gone');
  }

  function tickStations(s,dt){
    const b=s.map.business;
    for(const st of s.map.stations){
      if(st.kind!=='process')continue;
      const bin=buffer(s,st);
      const output=st.passTo?posCache(s,st.passTo):bin;
      const key=st.passTo?'input':'output';
      if(!bin.input||output[key]>=16){bin.time=0;continue;}
      bin.time+=dt;
      if(bin.time<st.time/(1+(b?.up[0]||s.expanded)*.16+(b?.up[7]||0)*.12))continue;
      bin.time=0;bin.input--;output[key]++;
    }
  }

  function nextWork(s,agent,forPlayer=false){
    const active=s.map.stations.filter(st=>st.recipe);
    const filtered=s.site?active:active.filter(st=>st.recipe===agent.job);
    const b=s.map.business, key=agent.item;
    const services=filtered.filter(st=>st.kind==='service'&&!(b?.up[1]===0&&st.shared));
    const processes=filtered.filter(st=>st.kind==='process');
    const work=filtered.filter(st=>st.kind==='stock');
    // A live queue can be served before loading the next batch.
    const candidates=[];
    for(const st of services){
      const n=readyAt(s,st);
      if(n&&st.clerk&&buffer(s,st).input>0)candidates.push([st,108+n.wait*.35]);
      if(!st.stockOnly&&key===st.input&&agent.count&&buffer(s,st).input<12&&(n||st.recipe==='lemonade'))candidates.push([st,90+(n?.wait||0)*.27]);
    }
    if(!candidates.length&&key&&agent.count){
      for(const st of work)if(st.input===key&&posCache(s,st.passTo).input<14)candidates.push([st,78]);
      for(const st of processes)if(st.input===key&&buffer(s,st).input<8)candidates.push([st,72]);
    }
    if(agent.count===0){
      for(const st of processes)if(!st.passTo&&buffer(s,st).output>0)candidates.push([st,84]);
      for(const st of filtered.filter(st=>st.kind==='source')){
        const target=processes.find(other=>other.input===st.out);
        const backlog=processes.reduce((count,x)=>count+buffer(s,x).output+buffer(s,x).input,0)+services.reduce((count,x)=>count+buffer(s,x).input,0);
        const ready=services.some(x=>readyAt(s,x));
        if((target&&buffer(s,target).input<=2&&backlog<7)||(!target&&ready))candidates.push([st,44]);
      }
    }
    return candidates.filter(([st])=>!(!forPlayer&&s.workers.some(other=>other!==agent&&other.task===st.id)))
      .sort((a,b)=>(b[1]-dist(b[0],agent)*.019)-(a[1]-dist(a[0],agent)*.019))[0]?.[0]||null;
  }
  function jobsFor(s){
    const site=s.map.business;
    if(!site)return s.expanded>=2?1:0;
    return site.staff+(site.up[7]>0?1:0);
  }
  function tickWorkers(s,dt){
    const slots=jobsFor(s);
    while(s.workers.length<slots){
      const spawn= s.site?point(294+s.workers.length*15,460):point(365,348);
      s.workers.push({...spawn,dir:2,moving:false,anim:0,item:'',count:0,task:'',rethink:0,
        capacity:2+(s.map.business?.up[2]||0)+Math.floor(s.workers.length/3),job:'lemonade',color:'#6a8e58',worker:true,stalled:0});
    }
    s.workers.length=slots;
    for(const n of s.workers){
      const b=s.map.business;
      const walking=109+(b?.up[2]||0)*11+(b?.up[7]||0)*12;
      n.rethink-=dt;
      if(n.rethink<=0||!n.task){
        const candidate=nextWork(s,n);
        const old=n.task;
        n.task=candidate?.id||'';
        if(!candidate){n.moving=false;n.path=null;n.rethink=.45;continue;}
        if(old!==n.task||!n.path?.length)setPath(s,n,stand(s.map,candidate,n));
        n.rethink=.8;
      }
      const st=s.map.stations.find(q=>q.id===n.task);
      if(!st)continue;
      if(n.path?.length&&!moveNPC(s.map,n,dt,walking))continue;
      if(dist(n,st)<56){
        const served=readyAt(s,st);
        if(served)served.worker=true;
        if(requestStep(s,st,n,dt)){n.task='';n.rethink=.23;}
      }else{n.task='';n.rethink=.3;}
    }
  }

  function rate(s,b,t=terms(s,b)){
    const r=F.recipes[recipeFor(b)];
    const crew=b.staff*(1+.12*b.up[2])+(b.up[7]?1.2+.42*b.up[7]:0);
    const stages=r.stages.filter(st=>st.kind==='process').length;
    const routeCycle=(r.label==='Hotel'?10:8)+stages*2.4;
    const productivity=(1+.16*b.up[0]+.16*b.up[1]+.075*b.channels+(b.manager===1?.13:0))*t.wear;
    return {arrivals:arrivals(s,b,t), service:Math.min(1.75,(crew/routeCycle)*productivity), crew, routeCycle};
  }
  function remote(s,b,dt,factor=1){
    const rec=record(s,b);
    if(rec.eta>0||(!b.staff&&!b.up[7]))return;
    const t=terms(s,b), r=rate(s,b,t);
    rec.moment+=dt*r.arrivals;
    const newDemand=Math.floor(rec.moment);
    rec.moment-=newDemand;
    if(newDemand){
      const accepted=Math.min(newDemand,Math.max(0,3+b.up[1]*2-rec.backlog));
      rec.backlog+=accepted;
      rec.lost+=newDemand-accepted;rec.fit=Math.max(0,rec.fit-(newDemand-accepted)*.4);
    }
    if(!rec.backlog){rec.transit=Math.min(rec.transit,.75);return;}
    rec.transit+=dt*r.service*factor;
    const orders=Math.min(rec.backlog,Math.floor(rec.transit));
    if(orders<1)return;
    rec.backlog-=orders;rec.transit-=orders;rec.done+=orders;rec.sold+=orders-1;rec.fit=Math.min(12,rec.fit+orders*.7);
    const price=quote(s,b,t);
    trade(s,orders*price.revenue,orders*price.inputs,b);
  }
  function finishShift(s){
    const g=s.g;
    if(!g.businesses.length&&!g.property&&!g.debt)return;
    g.round++;
    g.points+=1+Math.floor(g.businesses.length/3);
    for(const b of g.businesses){
      const r=record(s,b);
      if(r.eta>0)continue;
      const t=terms(s,b);
      if(b.staff||b.up[7]||r.sold)trade(s,0,Math.round(t.wages+t.overhead));
      b.rep=clamp(b.rep+Math.min(3,Math.floor(r.fit/2))+b.up[4]*.24+(b.manager===2?1:0)-(r.fit===0&&b.staff?1:0),22,100);
      if(r.sold)b.wear=clamp(b.wear+Math.max(.06,Math.min(3,r.sold*.25)*E.rules[g.policy].wear-b.up[5]*.41-b.up[6]*.14-(b.manager===1?.75:0)-E.level(g,4)*.15),0,70);
      r.sold=0;r.fit=0;
    }
    const property=Math.round(g.property*.0015);
    const interest=Math.round(g.debt*(.0032-.00022*E.level(g,5)));
    trade(s,property,interest);
    const old=g.event;
    if(g.round%5===0){
      g.event=g.challenge===3&&g.round<50?2:Math.floor(random(s)*C.events.length);
      const region=Math.floor(random(s)*C.regions.length), rival=Math.floor(random(s)*3);
      const occupancy=g.businesses.filter(b=>b.region===region).length;
      g.rivals[region][rival]=clamp(g.rivals[region][rival]+Math.round((100+occupancy*132)*(g.event===2?.5:1)*(rival===0?1.4:1)),800,120000);
    }
    if(old!==g.event)s.emit('market',{event:C.events[g.event]});
    const {revenue,costs}=s.ledger;
    g.last={revenue,costs,profit:revenue-costs};
    g.history.push(g.cash);
    if(g.history.length>36)g.history.shift();
    s.ledger={revenue:0,costs:0};s.cache.clear();
    E.update(g);s.emit('shift',g.last);
  }
  function fieldOffline(g,elapsed){
    const seconds=Math.floor(limit(elapsed/1000,0,7200));
    if(seconds<120||!g.businesses.some(b=>b.up[7]&&!(g.field?.sites?.[b.id]?.eta>0)))return null;
    let revenue=0,costs=0;
    const state={g,cache:new Map,elapsed:0};
    for(const b of g.businesses){
      if(!b.up[7]||g.field?.sites?.[b.id]?.eta>0)continue;
      const t=terms(state,b),r=rate(state,b,t),p=quote(state,b,t);
      const orders=Math.floor(seconds*Math.min(r.arrivals,r.service)*(.12+.055*b.up[7]));
      revenue+=p.revenue*orders;
      costs+=p.inputs*orders+Math.round(seconds/SHIFT*(t.wages+t.overhead)*.18);
    }
    const profit=revenue-costs;
    if(profit<0)return {minutes:Math.floor(seconds/60),revenue:0,costs:0,profit:0};
    g.cash=Math.min(MONEY_MAX,g.cash+profit);g.totalRevenue=Math.min(MONEY_MAX,g.totalRevenue+revenue);g.totalCosts=Math.min(MONEY_MAX,g.totalCosts+costs);E.update(g);
    return {minutes:Math.floor(seconds/60),revenue,costs,profit};
  }

  function locate(s){
    const p=s.player;
    return s.map.stations.filter(st=>st.kind!=='decor'&&dist(p,st)<(st.kind==='action'?41:49))
      .sort((a,b)=>dist(p,a)-dist(p,b))[0]||null;
  }
  function motion(s,dt,input){
    const p=s.player;
    let dx=input.x||0,dy=input.y||0;
    const travel=speed(s)*dt;
    if(dx||dy)p.path=null;
    while(!dx&&!dy&&p.path?.length){
      const dest=p.path[0],d=dist(p,dest);
      if(d<=2){p.path.shift();continue;}
      const reach=Math.min(1,d/Math.max(.01,travel));
      dx=(dest.x-p.x)/d*reach;dy=(dest.y-p.y)/d*reach;
    }
    const mag=Math.max(1,Math.hypot(dx,dy)), before={x:p.x,y:p.y};
    slide(s.map,p,dx/mag*travel,dy/mag*travel,8);
    p.moving=dist(p,before)>.05;
    if(p.moving){
      p.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0);
      p.anim+=dt;
    }
    const focus=locate(s);
    if(s.focus?.id!==focus?.id){p.hold=0;p.cooldown=0;s.wash=0;}
    s.focus=focus;p.cooldown=Math.max(0,p.cooldown-dt);
    if(!focus||focus.kind==='action')return;
    p.hold+=dt;
    if(p.hold<.16||p.cooldown>0)return;
    if(requestStep(s,focus,p,dt))p.cooldown=focus.kind==='service'?.28:.20;
  }

  function advance(s,dt){
    s.elapsed+=dt;s.time+=dt;s.g.played=Math.floor(s.elapsed);s.shift+=dt;
    for(const b of s.g.businesses){
      const rec=record(s,b);
      if(rec.stays.length){
        for(const pending of rec.stays){
          pending.time-=dt;
          if(pending.time>0)continue;
          const n=s.site===b.id&&s.npcs.find(n=>n.id===pending.id&&n.phase==='stay');
          const station=n&&s.map.stations.find(st=>st.id===n.service);
          if(station)paid(s,station,n);
          else businessOrder(s,b,pending.wait);
        }
        rec.stays=rec.stays.filter(p=>p.time>0);
      }
      if(rec.fitout>0){
        rec.fitout=Math.max(0,rec.fitout-dt);
        if(rec.fitout===0&&s.site===b.id){refresh(s);s.emit('annex',{business:b});}
      }
      if(rec.eta<=0)continue;
      rec.eta=Math.max(0,rec.eta-dt);
      if(rec.eta<=0){if(!s.site&&s.region===b.region)rebuild(s);s.emit('built',{business:b});}
    }
  }
  function closeClock(s,dt){
    s.remoteClock+=dt;
    if(s.remoteClock>=1-1e-8){
      for(const b of s.g.businesses)if(b.id!==s.site)remote(s,b,s.remoteClock);
      s.remoteClock=0;
    }
    s.g.active=Math.floor(s.elapsed);
    if(s.shift>=SHIFT-1e-8){s.shift=Math.max(0,s.shift-SHIFT);finishShift(s);}
  }
  function step(s,input={},dt=STEP){
    dt=limit(dt,0,.1,STEP);
    advance(s,dt);
    motion(s,dt,input);
    tickStations(s,dt);
    s.visitClock+=dt;
    if(s.visitClock>=.25){
      tickCustomers(s,s.visitClock);s.visitClock=0;
    }
    tickWorkers(s,dt);
    closeClock(s,dt);
    for(const f of s.popups)f.time-=dt;
    s.popups=s.popups.filter(f=>f.time>0);
  }
  function advancePortfolio(s,seconds=1){
    if(s.site||!Number.isInteger(seconds)||seconds<1||seconds>3600)return false;
    for(let i=0;i<seconds;i++){advance(s,1);closeClock(s,1);}
    return true;
  }

  function changeScene(s,region,id=0,page=0){
    if(!s.g.regions.includes(region))return false;
    const b=id?catalog(s.g,id):null;
    if(id&&(!b||b.region!==region||record(s,b).eta>0))return false;
    const oldSite=s.site,previous=s.region;
    const oldBusiness=catalog(s.g,oldSite);
    const index=oldBusiness?record(s,oldBusiness).lot:-1;
    s.region=region;s.site=id;s.lotPage=page;
    s.npcs=[];s.workers=[];s.clocks={};s.focus=null;s.popups=[];s.wash=0;s.cache.clear();
    s.stock=s.townBins;
    s.player.item='';s.player.count=0;s.player.path=null;s.player.hold=0;
    if(region===previous&&!id&&index>=0){
      s.lotPage=Math.floor(index/6);
      const local=region===0||region===s.g.home&&Boolean(s.g.legacy);
      const pad=(local?F.lots:F.districtLots)[index%6];
      const mirror=!local&&Boolean((s.layoutSeed>>>region)&1);
      Object.assign(s.player,point(mirror?W-pad[0]:pad[0],pad[1]+68));
    }else Object.assign(s.player,id?pos(F.foyer):region===0||region===s.g.home&&s.g.legacy?point(338,377):point(471,528));
    rebuild(s);
    seedLocalTraffic(s);
    if(!clear(s.map,s.player.x,s.player.y))Object.assign(s.player,id?pos(F.foyer):point(471,529));
    s.emit('scene',{region,id});return true;
  }
  function acquire(s,type,plot=null){
    if(s.site)return false;
    const candidates=locateLots(s,s.region);
    const chosen=Number.isInteger(plot)?s.lotPage*6+plot:null;
    if(chosen!==null&&(plot<0||plot>=6||candidates.has(chosen)||chosen>255))return false;
    const b=E.buy(s.g,type,s.region);
    if(!b)return false;
    const rec=record(s,b);
    rec.eta=5+C.businesses[type].tier*3;
    rec.layout=((s.layoutSeed>>>s.region)&1)&&Boolean(s.g.legacy)?1:0;
    rec.lot=chosen??0;
    if(chosen===null)while(candidates.has(rec.lot))rec.lot++;
    s.lotPage=Math.floor(rec.lot/6);
    rebuild(s);s.emit('construction',{business:b});return b;
  }
  function upgradeTown(s){
    const cost=[430,1300,3100][s.expanded];
    if(!s.map.starters||!cost||!E.pay(s.g,cost))return false;
    s.expanded++;rebuild(s);s.emit('townBuilt',{stage:s.expanded});return true;
  }
  function startFitout(s,b){
    record(s,b).fitout=3.5;
    refresh(s);
  }
  function discard(s){
    if(!s.player.count)return false;
    s.player.item='';s.player.count=0;return true;
  }
  function refresh(s){
    s.cache.clear();
    rebuild(s);
    if(!clear(s.map,s.player.x,s.player.y))Object.assign(s.player, s.site?pos(F.foyer):point(338,377));
  }
  function blueprintLayout(s,layout){
    const b=s.map.business;
    if(!b||b.up[1]<1||![0,1].includes(layout))return false;
    const rec=record(s,b);
    rec.layout=layout;
    s.workers=[];s.npcs=[];s.clocks={};s.focus=null;
    s.player.path=null;
    refresh(s);
    return true;
  }
  function actionHint(s,st){
    if(!st)return '';
    if(st.kind==='action')return st.title;
    const bin=buffer(s,st),item=s.player.item;
    if(st.kind==='source')return item&&item!==st.out?'Deliver what you’re carrying first':'Pick up '+F.item[st.out][0].toLowerCase();
    if(st.kind==='process'){
      if(item===st.input)return 'Drop off '+F.item[st.input][0].toLowerCase();
      if(!item&&bin.output)return 'Collect '+F.item[st.out][0].toLowerCase();
      return bin.input?'Processing '+F.item[st.out][0].toLowerCase():'Needs '+F.item[st.input][0].toLowerCase();
    }
    if(st.kind==='stock')return 'Restock '+st.title.toLowerCase();
    if(st.dwell&&readyAt(s,st)&&item===st.input)return 'Stay here to wash the car';
    if(st.clerk&&readyAt(s,st)&&bin.input)return 'Serve waiting customer';
    if(item===st.input&&(readyAt(s,st)||st.recipe==='lemonade'))return 'Deliver '+F.item[st.input][0].toLowerCase();
    return readyAt(s,st)?'Waiting for '+F.item[st.input][0].toLowerCase():'Waiting for customers';
  }
  function suggest(s,job='lemonade'){
    return nextWork(s,{...s.player,job},true);
  }
  const stationsFor=(s,recipe)=>s.map.stations.filter(st=>st.recipe===recipe);
  return {W,H,STEP,SHIFT,create,snapshot,record,capacity,speed,clear,route,stand,aim,quote,rate,step,advancePortfolio,fieldOffline,changeScene,blockCount,
    acquire,upgradeTown,discard,refresh,startFitout,blueprintLayout,actionHint,suggest,stationsFor,recipeFor,buffer};
})();
