"use strict";
globalThis.Saves = (() => {
  const memory = new Map();
  let persistent = true;
  const get = key => {
    try{return localStorage.getItem(key)??memory.get(key)??null;}
    catch{return memory.get(key)??null;}
  };
  const set = (key,v) => {
    if(v===null)memory.delete(key);else memory.set(key,v);
    try{if(v===null)localStorage.removeItem(key);else localStorage.setItem(key,v);}
    catch{persistent=false;}
  };
  const key = i=>'one-billion.campaign.'+i;
  function hash(text){
    let h=2166136261;
    for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);
    return (h>>>0).toString(16);
  }
  const integer = (x,min=0,max=8e14)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
  const array = (x,length,check)=>Array.isArray(x)&&x.length===length&&x.every(check);
  const ids = (x,n)=>Array.isArray(x)&&x.length<=n&&new Set(x).size===x.length&&x.every(v=>integer(v,0,n-1));
  function valid(g){
    if(!g||typeof g!=='object'||!['Casual','Standard','Expert'].includes(g.mode))return false;
    const balances=['cash','debt','property','peak','totalRevenue','totalCosts','stamp','round','active','played','deals','worked','staffHired','sold','points','contracts','nextId','completedAt','recovery','legacy'];
    if(!balances.every(k=>integer(g[k]))||!integer(g.seed,1,4294967295)||!integer(g.challenge,-1,9)||!integer(g.industry,-1,7)||!integer(g.job,0,2)||
       !integer(g.event,0,Catalog.events.length-1)||!integer(g.policy,0,2)||typeof g.won!=='boolean'||typeof g.skipTutorial!=='boolean')return false;
    if(!ids(g.regions,8)||!g.regions.includes(0)||!g.regions.includes(g.home)||!ids(g.tech,56)||!ids(g.projects,6)||
       !array(g.tools,3,n=>integer(n,0,4))||!ids(g.achievements,Economy.achievements.length)||
       !array(g.rivals,8,row=>array(row,3,n=>integer(n,0,120000)))||
       !Array.isArray(g.history)||g.history.length>36||!g.history.every(v=>integer(v))||
       !g.last||!integer(g.last.revenue)||!integer(g.last.costs)||!integer(g.last.profit,-8e14))return false;
    if(!Array.isArray(g.businesses)||g.businesses.length>256)return false;
    const sites = new Set();
    const businessIds = new Set();
    return g.businesses.every(b=>{
      if(!b||!integer(b.id,1,g.nextId-1)||businessIds.has(b.id)||!integer(b.type,0,31)||!g.regions.includes(b.region)||
         !integer(b.spent,1)||!integer(b.staff,0,8)||!integer(b.rep,0,100)||!Number.isFinite(b.wear)||b.wear<0||b.wear>70||
         !integer(b.price,0,2)||!integer(b.manager,0,3)||!integer(b.special,0,1)||!integer(b.channels,0,12)||!integer(b.deal??0,0,3)||!integer(b.dealUntil??0)||
         !Array.isArray(b.up)||b.up.length!==8||!b.up.every((v,i)=>integer(v,0,Economy.upgrades[i][3])))return false;
      const site=b.type+':'+b.region;
      if(sites.has(site))return false;
      sites.add(site);businessIds.add(b.id);return true;
    });
  }
  function encode(game){
    const payload=JSON.stringify(game);
    return JSON.stringify({version:3,checksum:hash(payload),payload});
  }
  function decode(raw){
    if(typeof raw!=='string'||raw.length>600000)return null;
    try{
      const envelope=JSON.parse(raw);
      if(![1,2,3].includes(envelope.version)||typeof envelope.payload!=='string'||hash(envelope.payload)!==envelope.checksum)return null;
      let game=JSON.parse(envelope.payload);
      if(envelope.version===1&&game)game={...Economy.newGame(game.seed),...game};
      if(game&&!Number.isSafeInteger(game.played))game.played=0;
      if(game&&game.deals===undefined)game.deals=0;
      if(game&&!Number.isInteger(game.industry))game.industry=Catalog.businesses[game.businesses?.[0]?.type]?.sector??-1;
      return valid(game)?game:null;
    }catch{return null;}
  }
  function getSlot(i){return decode(get(key(i)))??decode(get(key(i)+'.backup'));}
  function store(i,g){
    const prev=get(key(i));
    if(decode(prev))set(key(i)+'.backup',prev);
    set(key(i),encode(g));
    return persistent;
  }
  function erase(i){set(key(i),null);set(key(i)+'.backup',null);}
  function meta(){
    try{return JSON.parse(get('one-billion.settings'))||{};}catch{return {};}
  }
  const settings = data=>set('one-billion.settings',JSON.stringify(data));
  return {getSlot,store,erase,meta,settings,encode,decode,persistent:()=>persistent};
})();
