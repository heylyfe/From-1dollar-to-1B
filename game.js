"use strict";
(() => {
  const C=Catalog,E=Economy,S=Saves;
  const $=s=>document.querySelector(s);
  const dollars=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
  const money=n=>Math.abs(n)>=1e8?compact(n):dollars.format(n/100);
  const compact=n=> {
    const abs=Math.abs(n/100), units=[[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']];
    const unit=units.find(([cut])=>abs>=cut);
    return unit?(n<0?'−':'')+'$'+(abs/unit[0]).toLocaleString('en-US',{maximumFractionDigits:2})+unit[1]:dollars.format(n/100);
  };
  const art={
    empire:'<path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-5h6v5M9 10h6"/>',
    building:'<path d="M3 21h18M5 21V7h8v14m0-10h6v10M8 10h2m-2 4h2m6 0h1m-9 4h2m6 0h1"/>',
    world:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c4 4 4 14 0 18-4-4-4-14 0-18Z"/>',
    flask:'<path d="M9 3h6m-5 0v7l-6 9a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2l-6-9V3m-7 11h10"/>',
    coins:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v5c0 4 16 4 16 0V6M4 11v5c0 4 16 4 16 0v-5"/>',
    chart:'<path d="M3 3v17h18M7 15l5-5 3 3 6-7m-5 0h5v5"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 3l2 2 3 .4 1 3 2 2v3l-2 2-1 3-3 .4-2 2-2-2-3-.4-1-3-2-2v-3l2-2 1-3 3-.4Z"/>',
    trophy:'<path d="M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 2v6m-4 2h8"/>',
    glass:'<path d="M6 8h12l-2 13H8L6 8Zm6 0 2-6h4M8 13h8"/>',
    paw:'<circle cx="5" cy="10" r="2"/><circle cx="9" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="19" cy="10" r="2"/><path d="M8 20c-4-1-2-5 0-6s2-4 4-4 2 3 4 4 4 5 0 6c-2 .5-2-1-4-1s-2 1.5-4 1Z"/>',
    truck:'<path d="M3 5h11v12H3V5Zm11 5h4l3 4v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    arrow:'<path d="m9 5 7 7-7 7"/>',
    pin:'<path d="M19 9c0 5-7 11-7 11S5 14 5 9a7 7 0 1 1 14 0Z"/><circle cx="12" cy="9" r="2"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    coffee:'<path d="M5 8h12v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Zm12 1h2a2 2 0 0 1 0 4h-2M3 21h17M9 3v2m4-2v2"/>',
    bag:'<path d="M5 8h14l1 13H4L5 8Zm4 2V6a3 3 0 0 1 6 0v4"/>',
    chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4"/><path d="M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3"/>',
    factory:'<path d="M3 21V11l6 3V9l7 4V4h4l1 17H3Zm4-4h2m3 0h2m3 0h2"/>',
    bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    calendar:'<rect x="4" y="6" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v5m8-5v5"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3m1-15a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/>',
    wrench:'<path d="M20 7a5 5 0 0 1-6 6l-7 7a2 2 0 1 1-3-3l7-7a5 5 0 0 1 6-6l-3 3 2 3 4-3Z"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>'
  };
  const icon=(name,size=20)=>'<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(art[name]||art.building)+'</svg>';
  let opts={slot:0,music:0,fx:.28,motion:true,completed:0,fastest:0,legacy:0,...S.meta()};
  let lastAction=0;
  let g, tab='Empire', region=0, branch=0, selected=null, slotRequest=0, toastTimer, audio, score, musicStep=0, awayAt=0, savedFocus=null;
  const pages=[['Empire','empire'],['Businesses','building'],['World','world'],['Research','flask'],['Finance','coins']];
  const dialog=$('#dialog');
  function loadSlot(i){
    lastAction=0;opts.slot=i;const saved=S.getSlot(i);g=saved||E.newGame();region=g.home;selected=null;
    const away=saved?E.offline(g,Date.now()-g.stamp):null;
    save();return away;
  }
  function save(){
    g.stamp=Math.max(g.stamp,Date.now());
    S.store(opts.slot,g);S.settings(opts);
  }
  function notify(text){
    const el=$('#toast');el.innerHTML=icon('check',17)+'<span></span>';el.querySelector('span').textContent=text;
    el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2900);
  }
  function sound(kind='tap'){
    if(!opts.fx)return;
    try{
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==='suspended')audio.resume().catch(()=>{});
      const notes={tap:[440],buy:[440,660,880],win:[392,523,659,784],work:[520,700]}[kind];
      notes.forEach((note,i)=>tone(note,audio.currentTime+i*.065,.10,opts.fx*.16,'triangle'));
    }catch{}
  }
  function tone(freq,start,length,volume,type){
    const o=audio.createOscillator(), gain=audio.createGain();
    o.type=type;o.frequency.value=freq;
    gain.gain.setValueAtTime(Math.max(.0001,volume),start);
    gain.gain.exponentialRampToValueAtTime(.0001,start+length);
    o.connect(gain).connect(audio.destination);o.start(start);o.stop(start+length);
  }
  function music(){
    clearInterval(score);
    if(!opts.music||document.hidden)return;
    try{
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==='suspended')audio.resume().catch(()=>{});
      const seq=[261.63,329.63,392,523.25,293.66,349.23,440,587.33,220,261.63,329.63,440,196,246.94,293.66,392];
      score=setInterval(()=>tone(seq[musicStep++%seq.length],audio.currentTime,1.5,opts.music*.07,'sine'),560);
    }catch{}
  }
  const btn=(label,act,args=[],options={})=>'<button type="button" class="'+(options.class||'button')+'" data-act="'+act+'" data-args="'+args.join(',')+'"'+(options.disabled?' disabled':'')+'>'+label+'</button>';
  const badge=(text,kind='')=>'<span class="badge '+kind+'">'+text+'</span>';
  const panel=(title,body,kicker='')=>'<section class="panel"><div class="section-head">'+(kicker?'<span>'+kicker+'</span>':'')+'<h2>'+title+'</h2></div>'+body+'</section>';
  const percent=(n,max)=>Math.max(0,Math.min(100,n/max*100));
  const progress=(v,max)=>'<div class="progress" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.floor(percent(v,max))+'"><i style="width:'+percent(v,max)+'%"></i></div>';
  function nextObjective(){
    if(!g.worked)return ['Earn your first dollar','Run a shift at the lemonade stand.',0,1];
    if(!g.tools.some(Boolean)&&!g.businesses.length)return ['Upgrade your kit','A better kit increases earnings on every shift.',g.cash,150];
    if(!g.businesses.length)return ['Open your first business','Save enough cash to acquire a storefront.',g.cash,C.businesses[0].cost];
    if(!g.staffHired)return ['Hire your first employee','Open your storefront and add a crew member.',0,1];
    if(!g.businesses.some(b=>b.up[7])&&!g.skipTutorial)return ['Automate a business','Hire staff and reach $40 net worth to install automation.',E.worth(g),4000];
    if(g.regions.length===1&&g.challenge!==2)return ['Expand to Cedar Junction','Acquire a regional permit on the World map.',E.worth(g),C.regions[1].gate];
    const next=C.milestones.find(n=>n>E.worth(g));
    return next?['Reach '+compact(next)+' in net worth','Reinvest profits and grow the value of your holdings.',E.worth(g),next]:
      ['Build your legacy','Complete corporate projects and industry masteries.',g.projects.length,E.projects.length];
  }
  function summary(label,value,name,tint=''){
    return '<div class="metric"><div class="metric-icon '+tint+'">'+icon(name,20)+'</div><div><span>'+label+'</span><strong>'+value+'</strong></div></div>';
  }
  function renderTop(){
    $('#top').innerHTML='<div class="top-inner"><div class="brand"><img src="./assets/emblem.svg" width="43" height="43" alt=""><div><strong>From $1 to $1 Billion</strong><small>BUSINESS TYCOON</small></div></div><div class="top-actions">'+badge(icon('calendar',15)+' Period '+(g.round+1),'top-badge')+btn(icon('trophy')+'<span class="sr">Achievements</span>','awards',[],{class:'icon-button'})+btn(icon('settings')+'<span class="sr">Settings</span>','settings',[],{class:'icon-button'})+'</div></div>';
    $('#nav').innerHTML='<div class="nav-inner">'+pages.map(([label,name])=>'<button type="button" data-act="nav" data-args="'+label+'" '+(tab===label?'aria-current="page"':'')+'>'+icon(name,21)+'<span>'+label+'</span></button>').join('')+'</div>';
  }
  function town(){
    const r=C.regions[g.home];
    return '<div class="town"><img class="town-image" src="./assets/maplebrook.webp" alt="A lemonade stand in a lantern-lit town square, beside shops and a winding street"><div class="town-mark">'+icon('pin',15)+r.name+'</div><div class="firefly f1"></div><div class="firefly f2"></div><div class="firefly f3"></div><div class="town-caption"><span><i></i> LOCAL MARKET OPEN</span><strong>'+r.name+'</strong><p>'+r.kind+' · '+(g.businesses.length?g.businesses.length+' businesses in your portfolio':'Your first neighbourhood')+'</p></div></div>';
  }
  function jobBoard(){
    return panel('Local jobs','<p class="intro">Take a shift to earn cash for your first business.</p><div class="job-list">'+C.jobs.map((j,i)=>{
      const locked=g.worked<[0,3,8][i];
      return btn('<span class="job-icon j'+i+'">'+icon(j.icon,21)+'</span><span class="job-copy"><strong>'+j.name+'</strong><small>'+(locked?'Unlocks after '+[0,3,8][i]+' shifts':i===0?'Make and sell lemonade':i===1?'Walk dogs around town':'Deliver orders by bike')+'</small></span><span class="job-end">'+(locked?icon('lock',16):icon('arrow',17))+'</span>','jobView',[i],{class:'job-row',disabled:locked});
    }).join('')+'</div>'+btn(icon('wrench',17)+' Upgrade job equipment','tools',[],{class:'button outline full'}),'MAPLEBROOK JOB BOARD');
  }
  function empire(){
    const net=E.worth(g), total=E.aggregate(g), [title,desc,v,max]=nextObjective();
    const event=C.events[g.event];
    const objective='<div class="objective"><div class="objective-icon">'+icon('target',24)+'</div><div class="objective-copy"><span>NEXT OBJECTIVE</span><strong>'+title+'</strong><small>'+desc+'</small></div><div class="objective-progress"><span>'+Math.floor(percent(v,max))+'%</span>'+progress(v,max)+'</div></div>';
    const sidebar=g.businesses.length?panel('Trading desk','<p class="intro">Review conditions, choose an operating plan and close the period to collect your profit.</p>'+rulesList()+btn(icon('check',18)+' Close period · '+money(total.profit),'closePeriod',[],{class:'button primary full'})+btn('Find side work','sideWork',[],{class:'button text full'})):jobBoard();
    return '<div class="page-heading"><div><span class="overline">EMPIRE OVERVIEW</span><h1>Your empire</h1><p>Manage your businesses and track your progress toward $1 billion.</p></div>'+badge(g.won?'Billionaire':g.mode+' campaign','mode')+'</div>'+
      '<div class="metrics">'+summary('Cash balance',money(g.cash),'coins','mint')+summary('Net worth',money(net),'chart','mint')+summary('Profit / period',money(total.profit),'bolt','gold')+summary('Businesses',String(g.businesses.length),'building','lilac')+'</div>'+
      '<div class="layout"><div>'+town()+objective+'</div><aside>'+sidebar+'</aside></div>'+
      '<div class="below layout">'+panel('Market bulletin','<div class="bulletin"><div class="metric-icon gold">'+icon('chart')+'</div><div><strong>'+event[0]+'</strong><p>'+event[1]+'</p></div>'+badge(event[5]==='neutral'?'Stable':event[5]==='positive'?'Growth':'Slowdown',event[5])+'</div>')+
      (g.businesses.length?contractPanel():panel('Your first storefront','<p class="intro">Compare local business listings and pick where to invest your first earnings.</p>'+btn('Browse businesses '+icon('arrow',15),'nav',['Businesses'],{class:'button outline full'})))+'</div>';
  }
  function rulesList(){
    return '<div class="rule-list">'+E.rules.map((rule,i)=>btn('<span><strong>'+rule.name+'</strong><small>'+rule.detail+'</small></span><b>'+money(E.aggregate(g,i).profit)+'</b>','policy',[i],{class:'rule '+(g.policy===i?'chosen':'')})).join('')+'</div>';
  }
  function contractPanel(){
    const c=E.contract(g);
    return panel('Client contracts','<div class="contract"><strong>'+c.name+'</strong><p>'+c.eligible+'/'+c.need+' eligible sites · Reputation '+c.rep+'+ · Tier '+(c.tier+1)+' · '+c.regions+' permits</p></div>'+progress(c.eligible,c.need)+btn('Claim '+money(c.reward),'claim',[],{class:'button outline full',disabled:!c.ready||c.reward<=0}));
  }
  function title(text,desc,extra=''){
    return '<div class="page-heading"><div><h1>'+text+'</h1><p>'+desc+'</p></div>'+extra+'</div>';
  }
  function businessList(){
    const owned=g.businesses.filter(b=>b.region===region);
    return title('Businesses','Acquire and operate businesses across your markets.',badge(money(g.cash)+' cash','mode'))+
      '<label class="select-label">Region <select data-field="region">'+g.regions.map(id=>'<option value="'+id+'" '+(id===region?'selected':'')+'>'+C.regions[id].name+'</option>').join('')+'</select></label>'+
      (owned.length?'<div class="portfolio-head"><h2 class="subheading">Your businesses</h2><div>'+btn('Standard pricing','bulk',['standard'],{class:'button outline',disabled:!owned.some(b=>b.price!==1)})+btn('Service all','bulk',['service'],{class:'button outline',disabled:!owned.some(b=>b.wear>=5)})+'</div></div><div class="card-grid">'+owned.map(b=>businessCard(C.businesses[b.type],b)).join('')+'</div>':'')+
      '<h2 class="subheading">Business listings</h2><div class="card-grid">'+C.businesses.filter(d=>!owned.some(b=>b.type===d.id)).map(d=>businessCard(d)).join('')+'</div>';
  }
  function businessCard(d,b){
    const s=C.sectors[d.sector], t=b?E.getTerms(g,b):null, cost=E.quote(g,d.id,region);
    const can=E.canBuy(g,d.id,region);
    return '<article class="panel small-card"><div class="card-start"><span class="metric-icon sector" style="--sector:'+s.color+'">'+icon(s.icon)+'</span><span>'+s.name+' · Tier '+(d.tier+1)+'</span></div><h2>'+d.name+'</h2><p>'+d.detail+'</p><div class="card-foot">'+(b?'<strong>'+money(t.profit)+' / period</strong>'+btn('Manage','manage',[b.id],{class:'button outline'}):
      '<strong>'+money(cost)+'</strong>'+btn(can?'Acquire':d.gate>E.worth(g)?'Needs '+compact(d.gate)+' net worth':'Restricted','buy',[d.id],{class:'button outline',disabled:!can||g.cash<cost}))+'</div></article>';
  }
  function buildingScene(b,s,d){
    const floors=1+Math.min(6,d.tier+b.up[1]), widths=[170,212,240,268,296], w=widths[Math.min(4,d.tier+Math.floor(b.up[1]/2))], left=300-w/2, right=300+w/2, y=190-floors*17;
    const winCount=5+d.tier;
    const windows=Array.from({length:floors},(_,row)=>Array.from({length:winCount},(_,col)=>'<rect x="'+(left+12+col*((w-22)/winCount))+'" y="'+(y+10+row*16)+'" width="15" height="9" rx="1" fill="'+((row+col)%3?'#fff2ad':'#356a71')+'"/>').join('')).join('');
    const trees=[54,94,489,542].map((x,i)=>'<path d="M'+x+' 202v21" stroke="#483c31" stroke-width="6"/><circle cx="'+x+'" cy="'+(196-i%2*12)+'" r="'+(20+i%2*5)+'" fill="'+(i%2?'#397962':'#559471')+'"/>').join('');
    const workers=Array.from({length:Math.min(8,b.staff+1)},(_,i)=>'<g class="worker" style="--delay:-'+i*1.6+'s"><circle cx="'+(112+i*46)+'" cy="241" r="4" fill="#d99976"/><path d="M'+(112+i*46)+' 246v9" stroke="'+(i%2?'#eac276':'#a6c4f2')+'" stroke-width="5"/></g>').join('');
    return '<div class="business-scene"><svg viewBox="0 0 600 285" role="img" aria-label="'+d.name+', '+floors+' floors"><rect width="600" height="285" fill="#243c4e"/><circle cx="478" cy="45" r="24" fill="#eac276"/><path d="M0 135 102 65l94 50 80-58 126 78 110-40 88 40v150H0Z" fill="#315959"/><path d="M0 156 142 120l114 49 109-35 117 23 118-28v156H0Z" fill="#4a7769"/><path d="M0 213h600v72H0z" fill="#b99d81"/><path d="M0 260h600v25H0z" fill="#4a5154"/><path d="M0 274h600" stroke="#e6bc76" stroke-width="2" stroke-dasharray="25 14"/>'+trees+'<path d="M'+left+' '+y+' '+(left+32)+' '+(y-23)+' '+(right+31)+' '+(y-23)+' '+right+' '+y+'Z" fill="#5d7874"/><path d="M'+right+' '+y+' '+(right+31)+' '+(y-23)+'v182l-31 33Z" fill="#4f6c69"/><rect x="'+left+'" y="'+y+'" width="'+w+'" height="'+(219-y)+'" fill="'+s.color+'"/>'+windows+'<rect x="'+(left+8)+'" y="195" width="'+(w-16)+'" height="6" fill="#304b46"/><rect x="283" y="197" width="34" height="22" rx="2" fill="#29453d"/><path d="M289 201h9v15h-9zm13 0h9v15h-9z" fill="#92b7ae"/>'+workers+'<g class="delivery"><rect x="20" y="263" width="42" height="11" rx="2" fill="'+s.color+'"/><rect x="53" y="258" width="16" height="16" rx="3" fill="#72aa96"/><circle cx="31" cy="274" r="4" fill="#273331"/><circle cx="59" cy="274" r="4" fill="#273331"/></g></svg><div>'+icon(s.icon,18)+' '+s.name+' · '+C.regions[b.region].name+'</div></div>';
  }
  function businessDetail(b){
    const d=C.businesses[b.type],s=C.sectors[d.sector],t=E.getTerms(g,b);
    const controls=E.upgrades.map(([name,desc,,limit],i)=>{
      const cost=E.upgradeCost(b,i,g), locked=b.up[i]>=limit||(i===7&&(!b.staff||E.worth(g)<4000));
      const preview={...b,up:[...b.up]};preview.up[i]++;
      const change=E.getTerms(g,preview).profit-t.profit;
      return '<div class="action-row"><span><strong>'+name+' · Lv '+b.up[i]+'</strong><small>'+desc+(b.up[i]<limit?' · '+(change>=0?'+':'')+money(change)+'/period':'')+'</small></span>'+btn(b.up[i]>=limit?'Max':money(cost),'improve',[b.id,'upgrade',i],{class:'button outline',disabled:locked||g.cash<cost})+'</div>';
    }).join('');
    const choice=(name,description,action,cost,disabled)=>'<div class="action-row"><span><strong>'+name+'</strong><small>'+description+'</small></span>'+btn(money(cost),'improve',[b.id,action,0],{class:'button outline',disabled:disabled||g.cash<cost})+'</div>';
    return '<div class="crumb">'+btn('‹ All businesses','allBusinesses',[],{class:'button text'})+'</div>'+title(d.name,d.detail,badge(money(g.cash)+' cash','mode'))+
      '<div class="layout"><div>'+buildingScene(b,s,d)+'<div class="metrics business-metrics">'+summary('Revenue',money(t.revenue),'coins','mint')+summary('Expenses',money(t.costs),'wrench','gold')+summary('Profit',money(t.profit),'chart','mint')+'</div>'+
      panel('Operations','<div class="stat-rows"><div><span>'+s.focus+' served / demand</span><strong>'+t.sales+' / '+t.demand+'</strong></div><div><span>Capacity</span><strong>'+t.capacity+'</strong></div><div><span>Reputation</span><strong>'+b.rep+'/100</strong></div><div><span>Equipment wear</span><strong>'+Math.round(b.wear)+'%</strong></div><div><span>'+s.input+' costs'+(t.link?' · supplier link active':'')+'</span><strong>'+money(t.materials)+'</strong></div><div><span>Wages / overhead</span><strong>'+money(t.wages)+' / '+money(t.overhead)+'</strong></div></div>'+
      '<label class="select-label">Pricing <select data-field="price">'+['Value (−15%)','Standard','Premium (+18%)'].map((x,i)=>'<option value="'+i+'" '+(i===b.price?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
      choice(s.lever,'Improve the industry-specific offer.','special',Math.round(d.cost*.35),b.special)+choice('Expand distribution','Open another channel after upgrading the facility.','channel',E.channelCost(b),b.channels>=12||b.up[1]<1)+choice('Service equipment','Restore full tool condition.','repair',Math.round(d.cost*.02*b.wear/45),b.wear<5)+btn('Sell business','sellPrompt',[b.id],{class:'button text'}))+'</div>'+
      '<aside>'+panel('Workforce',choice('Hire '+s.role.toLowerCase(),b.staff+' crew · '+money(t.wages)+' wages / period','hire',E.hireCost(b),b.staff>=(g.challenge===8?2:8))+'<div class="manager-buttons">'+['Operations','Marketing','Finance'].map((x,i)=>btn(x,'improve',[b.id,'manager',i+1],{class:'button outline',disabled:b.staff<2||b.manager===i+1||g.cash<Math.round(d.cost*.25)})).join('')+'</div><p class="help">Managers require two employees and cost '+money(Math.round(d.cost*.25))+'.</p>')+panel('Upgrades',controls)+panel('Partnerships',E.deals.map(([name,desc,i])=>{
      const active=(b.dealUntil||0)>g.round;
      const requirements=i===2?' · Franchise Guide':i===3?' · Capital Markets':'';
      const cost=E.dealQuote(g,b,i);
      return '<div class="action-row"><span><strong>'+name+'</strong><small>'+desc+requirements+' · Reputation 65+</small></span>'+
        btn(active&&b.deal===i?(b.dealUntil-g.round)+' periods':money(cost),'sign',[b.id,i],{class:'button outline',disabled:active||b.rep<65||g.cash<cost||(i===2&&!g.tech.includes(43))||(i===3&&!g.tech.includes(39))})+'</div>';
    }).join(''))+'</aside></div>';
  }
  function world(){
    const r=C.regions[region], owned=g.regions.includes(region), price=Math.round(r.cost*(1-.045*E.level(g,6)));
    const rivals=['Aster Holdings','BudgetWorks','Cobalt Group'];
    return title('World map','Compare economies and open new markets.')+'<div class="layout"><section class="panel map-panel"><div class="map"><svg viewBox="0 0 650 345" preserveAspectRatio="none" aria-hidden="true"><path d="M0 190 68 166 100 109 207 112 234 71 323 76 344 50 412 43 464 21 565 44 616 90 650 86V345H0Z" fill="#365a47"/><path d="M0 237 68 227 151 192 206 215 252 227 302 224 388 152 469 193 503 154 574 100 650 165" fill="none" stroke="#d3bf83" stroke-width="2" stroke-dasharray="4 8"/><path d="M18 320q92-80 162-45t138-1q62-60 133-33t142-37l57-8" fill="none" stroke="#6b9c9c" stroke-width="16"/><path d="m38 144 16-31 18 31m43-45 16-29 18 29m92-58 16-22 19 22m64 87 14-29 18 29m75-34 15-25 20 25m79 151 15-23 18 23" fill="#5e8663" stroke="#87a977" stroke-width="4" stroke-linejoin="round"/></svg>'+C.regions.map(point=>'<button type="button" class="map-point '+(g.regions.includes(point.id)?'open':'')+' '+(region===point.id?'current':'')+'" aria-label="'+point.name+'" data-act="region" data-args="'+point.id+'" style="left:'+point.x+'%;top:'+point.y+'%">'+icon(g.regions.includes(point.id)?'pin':'lock',16)+'</button>').join('')+'</div><div class="region-strip">'+C.regions.map(p=>btn(p.name,'region',[p.id],{class:'button '+(p.id===region?'primary':'outline')})).join('')+'</div></section><aside>'+
      panel(r.name,'<p class="intro">'+r.kind+'</p><div class="stat-rows"><div><span>Demand index</span><strong>'+Math.round(r.demand*100)+'</strong></div><div><span>Labour index</span><strong>'+Math.round(r.wages*100)+'</strong></div><div><span>Property index</span><strong>'+Math.round(r.rent*100)+'</strong></div><div><span>Specialities</span><strong>'+r.strength.map(i=>C.sectors[i].name).join(', ')+'</strong></div><div><span>Owned businesses</span><strong>'+g.businesses.filter(b=>b.region===region).length+'</strong></div></div>'+
      (owned?btn('View businesses','openRegion',[region],{class:'button primary full'}):btn('Buy permit · '+money(price),'permit',[region],{class:'button primary full',disabled:g.cash<price||E.worth(g)<r.gate||g.challenge===2})+'<p class="help">Requires '+compact(r.gate)+' net worth and an eligible campaign.</p>'))+
      panel('Regional rivals','<div class="stat-rows">'+rivals.map((name,i)=>{
        const stake=g.rivals[region][i], cost=E.mergerQuote(g,region,i);
        return '<div><span>'+name+'<br>'+['Expansionist','Low cost','Premium'][i]+' · Influence '+(stake/1000).toFixed(1)+'</span>'+
          (g.tech.includes(46)?btn('Acquire stake · '+money(cost),'merger',[region,i],{class:'button outline',disabled:!owned||stake<2200||!g.businesses.some(b=>b.region===region)||g.cash<cost}):'')+'</div>';
      }).join('')+'</div><p class="help">Acquisition Review unlocks regional stake deals. Deals reduce rival influence and improve your local reputation.</p>')+'</aside></div>';
  }
  function research(){
    return title('Research','Invest in one of eight branches to shape your group.',badge(g.points+' research points','mode'))+
      '<div class="region-strip research-tabs">'+C.tracks.map(([name,art],i)=>btn(icon(art,17)+' '+name,'branch',[i],{class:'button '+(i===branch?'primary':'outline')})).join('')+'</div>'+
      panel(C.tracks[branch][0],'<p class="intro">'+C.tracks[branch][2]+'. Earn research points by working shifts and closing periods.</p><div class="research-list">'+C.research.filter(t=>t.branch===branch).map(t=>{
        const done=g.tech.includes(t.id), allowed=(!t.level||g.tech.includes(t.id-1))&&E.worth(g)>=t.gate;
        return '<div class="action-row tech"><div class="metric-icon '+(done?'mint':'lilac')+'">'+icon(done?'check':'flask',19)+'</div><span><strong>'+t.title+'</strong><small>'+t.effect+' · '+(done?'Completed':t.points+' points'+(!allowed&&t.level?' · previous technology and '+compact(t.gate)+' net worth':''))+'</small></span>'+btn(done?'Complete':money(t.cost),'study',[t.id],{class:'button outline',disabled:done||!allowed||g.cash<t.cost||g.points<t.points})+'</div>';
      }).join('')+'</div>');
  }
  function graph(){
    if(g.history.length<2)return '<p class="intro">Close two trading periods to chart your cash balance.</p>';
    const min=Math.min(...g.history),max=Math.max(...g.history);
    const points=g.history.map((v,i)=>(10+i*580/(g.history.length-1))+','+(116-(v-min)/(max-min||1)*100)).join(' ');
    return '<div class="chart-wrap"><svg viewBox="0 0 600 132" role="img" aria-label="Cash history from '+money(g.history[0])+' to '+money(g.history.at(-1))+'"><path d="M10 115H590M10 65H590M10 15H590" stroke="#e4ded2" stroke-dasharray="5 5"/><polyline fill="none" stroke="#3c826d" stroke-width="3" points="'+points+'"/></svg><div><span>'+money(min)+' low</span><span>'+money(max)+' high</span></div></div>';
  }
  function finance(){
    const assets=g.businesses.reduce((sum,b)=>sum+E.value(b,g),0);
    const credit=E.credit(g);
    return title('Finance','Track cash flow, manage debt and invest in property.')+
      '<div class="metrics">'+summary('Cash balance',money(g.cash),'coins','mint')+summary('Business assets',money(assets),'building','lilac')+summary('Property assets',money(g.property),'empire','gold')+summary('Liabilities',money(g.debt),'chart','gold')+'</div>'+
      '<div class="layout"><div>'+panel('Cash flow',graph()+'<div class="stat-rows"><div><span>Last period revenue</span><strong>'+money(g.last.revenue)+'</strong></div><div><span>Last period expenses</span><strong>'+money(g.last.costs)+'</strong></div><div><span>Last period profit</span><strong>'+money(g.last.profit)+'</strong></div><div><span>Lifetime revenue</span><strong>'+money(g.totalRevenue)+'</strong></div><div><span>Lifetime operating profit</span><strong>'+money(g.totalRevenue-g.totalCosts)+'</strong></div></div>')+
      panel('Corporate projects','<p class="intro">Complete research branches and build a portfolio capable of delivering larger projects.</p>'+E.projects.map(([name,tech,cost,points,tier,sites],i)=>'<div class="action-row"><span><strong>'+name+'</strong><small>'+C.research[tech].title+' · '+points+' RP · '+sites+' tier '+(tier+1)+' sites</small></span>'+btn(g.projects.includes(i)?'Complete':money(cost),'project',[i],{class:'button outline',disabled:g.projects.includes(i)||!g.tech.includes(tech)||g.cash<cost||g.points<points||g.businesses.filter(b=>C.businesses[b.type].tier>=tier).length<sites})+'</div>').join(''))+'</div><aside>'+
      panel('Capital desk','<div class="stat-rows"><div><span>Available credit</span><strong>'+money(credit)+'</strong></div><div><span>Interest per period</span><strong>'+((.011-.00065*E.level(g,5))*100).toFixed(2)+'%</strong></div></div><div class="two-buttons">'+btn('Borrow','capital',['loan'],{class:'button outline',disabled:!credit||!g.businesses.length||g.challenge===0})+btn('Repay','capital',['repay'],{class:'button outline',disabled:!g.debt||!g.cash})+'</div>')+
      panel('Commercial property','<p class="intro">Property earns 0.6% per trading period. A purchase retains 97% of cash as book value. Selling returns 90% of book value.</p><div class="two-buttons">'+btn('Invest','capital',['property'],{class:'button outline',disabled:!g.tech.includes(35)||!g.cash})+btn('Sell property','capital',['liquidate'],{class:'button outline',disabled:!g.property})+'</div>')+'</aside></div>';
  }
  function render(){
    document.documentElement.classList.toggle('less-motion',!opts.motion);
    renderTop();
    const b=g.businesses.find(b=>b.id===selected);
    if(tab==='Businesses'&&!g.regions.includes(region))region=g.home;
    $('#main').innerHTML=({Empire:empire,Businesses:()=>b?businessDetail(b):businessList(),World:world,Research:research,Finance:finance})[tab]();
  }
  function open(name,title,content){
    if(!dialog.open)savedFocus=document.activeElement;
    dialog.innerHTML='<div class="dialog-head"><h2 id="dialog-title">'+title+'</h2>'+btn(icon('close')+'<span class="sr">Close</span>','dismiss',[],{class:'icon-button'})+'</div><div class="dialog-body">'+content+'</div>';
    if(!dialog.open)dialog.showModal();
  }
  function dismiss(){
    if(dialog.open)dialog.close();
    if(savedFocus?.isConnected)savedFocus.focus();
  }
  function jobView(i){
    const job=C.jobs[i],signal=(g.worked+g.event+(g.seed%5))%3;
    open('job',job.name,'<p class="intro">'+job.desc+'</p><p class="signal">'+icon('chart',17)+' Local forecast favours <strong>'+job.options[signal].toLowerCase()+'</strong>.</p><div class="option-list">'+job.options.map((option,n)=>btn('<span><strong>'+option+'</strong><small>'+money(job.cost[n])+' supplies</small></span><b>Earn '+money(Math.round(job.payouts[n]*(n===signal?1.35:n===2&&signal===0?.68:1)*(1+g.tools[i]*.29))-job.cost[n])+'</b>','work',[i,n],{class:'rule',disabled:g.cash<job.cost[n]})).join('')+'</div>');
  }
  function toolView(){
    open('tools','Job equipment','<p class="intro">Every equipment level improves that job’s payout by 29% of the base.</p>'+C.jobs.map((job,i)=>'<div class="action-row"><span><strong>'+job.name+'</strong><small>Kit level '+g.tools[i]+' / 4</small></span>'+btn(g.tools[i]>=4?'Max':money(E.toolCost(g,i)),'tool',[i],{class:'button outline',disabled:g.tools[i]>=4||g.cash<E.toolCost(g,i)})+'</div>').join(''));
  }
  function settings(){
    open('settings','Settings','<div class="settings-grid"><label>Music <input type="range" min="0" max="1" step=".02" value="'+opts.music+'" data-field="music"></label><label>Sound effects <input type="range" min="0" max="1" step=".02" value="'+opts.fx+'" data-field="fx"></label><label>Motion <input type="checkbox" '+(opts.motion?'checked':'')+' data-field="motion"></label><label>Skip tutorial goals <input type="checkbox" '+(g.skipTutorial?'checked':'')+' data-field="tutorial"></label></div>'+
      '<div class="modal-buttons">'+btn('Campaigns','campaigns')+btn('Save now','save')+btn('Export save','export')+btn('Import save','import')+btn('Help','help')+'</div><p class="help">'+(S.persistent()?'Progress autosaves after actions on this browser.':'Browser storage is unavailable. Export your save before closing.')+'</p>');
  }
  function campaigns(){
    open('campaigns','Campaigns','<p class="intro">Three independent save slots. New campaigns begin with $1.</p>'+[0,1,2].map(i=>{
      const slot=S.getSlot(i);
      return '<div class="action-row"><span><strong>Slot '+(i+1)+(i===opts.slot?' · Active':'')+'</strong><small>'+(slot?slot.mode+' · '+compact(E.worth(slot))+' net worth':'Empty')+'</small></span>'+btn(slot?'Load':'Create',slot?'load':'newPrompt',[i],{class:'button outline',disabled:i===opts.slot})+(slot?btn('Delete','deletePrompt',[i],{class:'button text',disabled:i===opts.slot}):'')+'</div>';
    }).join('')+'<p class="help">Active campaign play '+Math.floor(g.played/60)+' min · Campaign wins '+opts.completed+(opts.fastest?' · Fastest recorded play '+Math.round(opts.fastest/60)+' min':'')+'</p>'+(g.won?btn('Start New Game Plus','newPrompt',[opts.slot,1],{class:'button primary full'}):''));
  }
  function newPrompt(slot,plus){
    slotRequest=slot;
    open('new','New '+(plus?'legacy ':'')+'campaign','<label class="select-label">Difficulty <select id="difficulty"><option>Casual</option><option selected>Standard</option><option>Expert</option></select></label><label class="select-label">Challenge <select id="challenge"><option value="-1">Open campaign</option>'+C.challenges.map(([n,d],i)=>'<option value="'+i+'">'+n+'</option>').join('')+'</select></label><p class="intro" id="challenge-desc">Choose your own industry and expansion plan.</p>'+
      (plus?'<label class="select-label">Start in <select id="start-region"><option value="0">Maplebrook</option><option value="1">Cedar Junction</option></select></label><p class="help">This replaces the current campaign in this slot.</p>':'')+btn('Begin with $1','newGame',[plus||0],{class:'button primary full'}));
  }
  function awards(){
    open('awards','Achievements','<p class="intro">'+g.achievements.length+' / '+E.achievements.length+' earned in this campaign</p><div class="award-grid">'+E.achievements.map(([n,m],i)=>'<div class="award '+(g.achievements.includes(i)?'earned':'')+'">'+icon(g.achievements.includes(i)?'trophy':'lock',17)+'<span>'+n+(m?' · '+compact(m):'')+'</span></div>').join('')+'</div>');
  }
  function offlineDialog(data){
    if(!data)return;
    open('offline','Welcome back','<p class="intro">Automated businesses operated while you were away. Up to 24 reduced trading periods are credited.</p><div class="stat-rows"><div><span>Time away credited</span><strong>'+data.minutes+' min</strong></div><div><span>Revenue</span><strong>'+money(data.revenue)+'</strong></div><div><span>Expenses</span><strong>'+money(data.costs)+'</strong></div><div><span>Net result</span><strong>'+money(data.profit)+'</strong></div></div>'+btn('Continue','dismiss',[],{class:'button primary full'}));
  }
  function mutate(result,label,kind='tap'){
    if(!result){notify('This action is unavailable.');return false;}
    const newly=[];
    for(let i=0;i<E.achievements.length;i++){
      if(!g.achievements.includes(i)&&E.achievements[i][2](g)){g.achievements.push(i);newly.push(E.achievements[i][0]);}
    }
    if(g.won&&!g.winLogged){
      g.winLogged=true;opts.completed++;opts.legacy++;opts.fastest=opts.fastest?Math.min(opts.fastest,g.completedAt):g.completedAt;
      sound('win');dismiss();open('won','You built a billion-dollar empire','<p class="intro">Your portfolio reached '+money(E.worth(g))+' in net worth with positive operating profit and manageable debt.</p>'+btn('Keep building','dismiss',[],{class:'button primary full'}));
    }else if(kind) sound(kind);
    save();render();
    if(label||newly.length)notify(label||(newly.length===1?'Achievement · '+newly[0]:newly.length+' achievements earned'));
    return true;
  }
  function navigate(dest){
    tab=dest;selected=null;dismiss();render();window.scrollTo(0,0);$('#main').focus({preventScroll:true});
  }
  document.addEventListener('click',e=>{
    const control=e.target.closest('[data-act]');
    if(!control)return;
    const now=Date.now();
    if(lastAction&&now>=lastAction)g.played+=Math.floor(Math.min(60000,now-lastAction)/1000);
    lastAction=now;
    const [a,b,c]=control.dataset.args.split(',');
    const n=Number(a), x=Number(b), y=Number(c);
    const site=g.businesses.find(site=>site.id===n);
    switch(control.dataset.act){
      case 'nav':navigate(a);break;
      case 'jobView':jobView(n);break;
      case 'sideWork':open('work','Find a shift','<p class="intro">Jobs stay available while you build your portfolio.</p><div class="modal-buttons">'+C.jobs.map((job,i)=>btn(job.name,'jobView',[i],{class:'button outline',disabled:g.worked<[0,3,8][i]})).join('')+btn('Job equipment','tools')+'</div>');break;
      case 'bulk':{const count=E.consolidate(g,region,a);mutate(count,count+' sites updated');break;}
      case 'work':{
        const earned=E.job(g,n,x);
        if(mutate(earned!==false,'Shift complete · +'+money(earned),'work'))dismiss();
        break;
      }
      case 'tools':toolView();break;
      case 'tool':if(mutate(E.tool(g,n),'Equipment upgraded','buy'))toolView();break;
      case 'policy':g.policy=n;save();render();break;
      case 'closePeriod':{const result=E.close(g);mutate(result,result?(result.profit>=0?'Period closed · +':'Period closed · ')+money(result.profit):'');break;}
      case 'claim':mutate(E.claim(g),'Client contract completed','buy');break;
      case 'manage':selected=n;render();window.scrollTo(0,0);break;
      case 'allBusinesses':navigate('Businesses');break;
      case 'buy':{const bought=E.buy(g,n,region);if(bought){selected=bought.id;window.scrollTo(0,0);}mutate(bought,bought?C.businesses[n].name+' opened':'','buy');break;}
      case 'improve':if(site)mutate(E.improve(g,site,b,y),'Operations improved','buy');break;
      case 'sign':if(site)mutate(E.sign(g,site,x),'Partnership signed','buy');break;
      case 'merger':mutate(E.acquireRival(g,n,x),'Regional stake acquired','buy');break;
      case 'sellPrompt':if(site)open('sell','Sell '+C.businesses[site.type].name+'?','<p class="intro">Sale proceeds '+money(Math.round(E.value(site,g)*.87))+'. The business, crew and upgrades transfer to the buyer.</p>'+btn('Confirm sale','sell',[n],{class:'button primary full'}));break;
      case 'sell':if(site){selected=null;dismiss();mutate(E.sell(g,site),'Business sold');}break;
      case 'region':region=n;render();break;
      case 'permit':mutate(E.unlock(g,n),C.regions[n].name+' permit acquired','buy');break;
      case 'openRegion':region=n;navigate('Businesses');break;
      case 'branch':branch=n;render();break;
      case 'study':mutate(E.study(g,n),'Research completed','buy');break;
      case 'project':mutate(E.project(g,n),'Corporate project completed','win');break;
      case 'capital':{
        const max={loan:E.credit(g),repay:Math.min(g.debt,g.cash),property:g.cash,liquidate:g.property}[a];
        open('capital',({loan:'Borrow capital',repay:'Repay debt',property:'Invest in property',liquidate:'Sell property'})[a],'<label class="select-label">Amount in dollars <input type="number" id="amount" min=".01" step=".01" max="'+(max/100)+'" value="'+(max/100)+'" inputmode="decimal"></label>'+btn('Confirm','capitalApply',[a],{class:'button primary full'}));break;
      }
      case 'capitalApply':{
        const amount=Math.round(Number($('#amount').value)*100);
        if(mutate(E.finance(g,a,amount),'Capital transaction complete'))dismiss();break;
      }
      case 'settings':settings();break;
      case 'campaigns':campaigns();break;
      case 'awards':awards();break;
      case 'dismiss':dismiss();break;
      case 'save':save();notify(S.persistent()?'Campaign saved':'Saved for this session. Export for a permanent copy.');break;
      case 'load':{save();const away=loadSlot(n);navigate('Empire');offlineDialog(away);break;}
      case 'newPrompt':newPrompt(n,x);break;
      case 'newGame':{
        const mode=$('#difficulty').value, challenge=Number($('#challenge').value), start=Number($('#start-region')?.value||0);
        save();opts.slot=slotRequest;g=E.newGame(Date.now(),mode,challenge,n?opts.legacy:0,start);region=g.home;
        save();navigate('Empire');notify('Campaign started');break;
      }
      case 'deletePrompt':open('delete','Delete slot '+(n+1)+'?','<p class="intro">This removes both the save and its backup.</p>'+btn('Delete campaign','erase',[n],{class:'button primary full'}));break;
      case 'erase':if(n!==opts.slot&&n>=0&&n<=2){S.erase(n);campaigns();notify('Slot deleted');}break;
      case 'export':{
        save();open('export','Export campaign','<p class="intro">Copy the portable save to keep it or move it between browsers.</p><textarea id="save-text" aria-label="Campaign save" readonly></textarea>'+btn('Download JSON save','exportFile',[],{class:'button outline full'}));
        $('#save-text').value=S.encode(g);$('#save-text').select();break;
      }
      case 'exportFile':{
        const url=URL.createObjectURL(new Blob([S.encode(g)],{type:'application/json'}));
        const a=document.createElement('a');a.href=url;a.download='billion-slot-'+(opts.slot+1)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;
      }
      case 'import':open('import','Import campaign','<p class="intro">Paste an exported save. A valid import replaces the current slot and preserves the previous save as a backup.</p><textarea id="import-text" aria-label="Paste a campaign save"></textarea>'+btn('Replace current campaign','applyImport',[],{class:'button primary full'}));break;
      case 'applyImport':{
        const data=S.decode($('#import-text').value.trim());
        if(!data){notify('That save is invalid or damaged.');break;}
        g=data;region=g.home;save();navigate('Empire');notify('Campaign imported');break;
      }
      case 'help':open('help','How to play','<div class="help-copy"><p><strong>Shifts.</strong> Use the local forecast to select a job. Spend earnings on a kit or save for a business.</p><p><strong>Trading periods.</strong> Open Empire, compare operating plans and close the period. Each close settles income and bills. You can trade at your own pace. You can still work shifts through the Trading desk.</p><p><strong>Profit and net worth.</strong> Profit is revenue minus expenses. Net worth is cash plus property and conservatively valued businesses, less debt.</p><p><strong>Capacity and demand.</strong> Customers beyond capacity can lower reputation. When you have spare capacity, consider marketing or a price change.</p><p><strong>Expansion.</strong> Hire and automate, research technologies, take contracts and unlock new markets. Automation earns limited income while away.</p><p><strong>Winning.</strong> Reach $1 billion with at least two businesses, positive trading profit and debt below 20% of net worth. A challenge may add objective requirements.</p></div>');break;
    }
  });
  document.addEventListener('change',e=>{
    const el=e.target;
    if(el.id==='challenge'){$('#challenge-desc').textContent=C.challenges[Number(el.value)]?.[1]||'Choose your own industry and expansion plan.';return;}
    switch(el.dataset.field){
      case 'region':region=Number(el.value);render();break;
      case 'price':{const b=g.businesses.find(b=>b.id===selected);if(b){b.price=Number(el.value);mutate(true,'Pricing updated');}break;}
      case 'music':opts.music=Number(el.value);S.settings(opts);music();break;
      case 'fx':opts.fx=Number(el.value);S.settings(opts);sound();break;
      case 'motion':opts.motion=el.checked;save();render();break;
      case 'tutorial':g.skipTutorial=el.checked;save();render();break;
    }
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){awayAt=Date.now();lastAction=0;save();clearInterval(score);score=null;}
    else if(awayAt){
      music();
      const result=E.offline(g,Date.now()-Math.max(awayAt,g.stamp));awayAt=0;save();render();offlineDialog(result);
    }
  });
  window.addEventListener('pagehide',()=>{if(!awayAt)save();});
  document.addEventListener('pointerdown',()=>{if(opts.music&&!score)music();},{once:true});
  const pending=loadSlot([0,1,2].includes(opts.slot)?opts.slot:0);
  render();offlineDialog(pending);
})();
