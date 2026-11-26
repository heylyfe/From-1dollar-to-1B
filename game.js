"use strict";
(() => {
  const C=Catalog,E=Economy,F=FieldData,O=Operations,S=Saves;
  const $=s=>document.querySelector(s);
  const usd=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
  const money=n=> {
    const tiers=[[1e14,'T'],[1e11,'B'],[1e8,'M'],[1e5,'K']];
    const unit=tiers.find(([v])=>Math.abs(n)>=v);
    return unit?(n<0?'−':'')+'$'+(Math.abs(n)/unit[0]).toLocaleString('en-US',{maximumFractionDigits:2})+unit[1]:usd.format(n/100);
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
    box:'<path d="m12 3 9 5v8l-9 5-9-5V8l9-5Zm-9 5 9 5 9-5m-9 5v8m-4-16 9 5"/>',
    cup:'<path d="M4 6h13v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V6Zm13 2h2a2 2 0 0 1 0 4h-2M4 21h15"/>',
    bed:'<path d="M3 4v16m18-2v2M3 15h18v3H3m3-3V9h12a3 3 0 0 1 3 3v3"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
    move:'<path d="M12 3v18M3 12h18M9 6l3-3 3 3M6 9l-3 3 3 3m3 3 3 3 3-3m3-9 3 3-3 3"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>'
  };
  const icon=(name,size=20)=>'<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(art[name]||art.building)+'</svg>';
  const canvas=$('#world'), dialog=$('#dialog'), renderer=WorldRenderer.create(canvas);
  const input={x:0,y:0}, keys=new Set(), reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const prefs=S.meta();
  const settings={slot:[0,1,2].includes(prefs.slot)?prefs.slot:0,
    sound:Number.isFinite(prefs.sound)?Math.max(0,Math.min(1,prefs.sound)):.30,
    motion:prefs.motion!==false,legacy:Number.isInteger(prefs.legacy)?prefs.legacy:0,
    completed:Number.isInteger(prefs.completed)?prefs.completed:0,fastest:Number.isInteger(prefs.fastest)?prefs.fastest:0};
  const starterKeys=['lemonade','wash','delivery'];
  let g,s,job='lemonade',guide,modal='',dirty=true,last=0,acc=0,hudClock=0,autosaveClock=0,guideClock=0;
  let selection={region:0,branch:0,sector:0,plot:0,site:0,slot:0,plus:false};
  let contextKey='', zoneKey='', inventoryKey='', toastTimer=0, previousFocus=null, hiddenAt=0, soundEngine;
  let drag=null;
  let tutorial={supply:false,batch:false,sales:0};
  const press=(label,action,value='',kind='secondary',disabled=false)=>'<button type="button" class="btn '+kind+'" data-action="'+action+'" data-value="'+value+'"'+(disabled?' disabled':'')+'>'+label+'</button>';
  const title=(name,description='')=>'<h3>'+name+'</h3>'+(description?'<p class="muted">'+description+'</p>':'');
  const badge=text=>'<span class="badge">'+text+'</span>';
  const row=(label,value)=>'<div class="data-row"><span>'+label+'</span><strong>'+value+'</strong></div>';
  const rule=(label,detail,button='')=>'<div class="menu-row"><div><strong>'+label+'</strong><small>'+detail+'</small></div>'+button+'</div>';
  const section=(label,content)=>'<section class="sheet-section">'+title(label)+content+'</section>';
  const business=()=>s.map.business;
  const stats=(label,val,art,id)=>'<div class="stat">'+icon(art,16)+'<span><small>'+label+'</small><strong id="'+id+'">'+val+'</strong></span></div>';
  const roundProfit=()=>g.last.profit;
  function sound(type){
    if(!settings.sound)return;
    try{
      soundEngine||=new (window.AudioContext||window.webkitAudioContext)();
      if(soundEngine.state==='suspended')soundEngine.resume().catch(()=>{});
      const notes={sale:[523,690,830],build:[330,440,587],tap:[440],pickup:[460],won:[392,523,659,784]}[type]||[440];
      for(let i=0;i<notes.length;i++){
        const time=soundEngine.currentTime+i*.055,osc=soundEngine.createOscillator(),volume=soundEngine.createGain();
        osc.type='triangle';osc.frequency.value=notes[i];
        volume.gain.setValueAtTime(settings.sound*.08,time);
        volume.gain.exponentialRampToValueAtTime(.0001,time+.13);
        osc.connect(volume).connect(soundEngine.destination);osc.start(time);osc.stop(time+.13);
      }
    }catch{}
  }
  function announce(message,art='check'){
    const el=$('#toast');el.innerHTML=icon(art,18)+'<span></span>';el.lastElementChild.textContent=message;
    el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2850);
  }
  function emit(type,data){
    if(type==='sale'){
      tutorial.sales++;
      if(!data.worker&&s.popups.length<5)sound('sale');
      dirty=true;
    }
    if(type==='pickup'&&s.site===0){
      if(data.item==='lemon')tutorial.supply=true;
      if(data.item==='drink')tutorial.batch=true;
      if(!data.worker)sound('pickup');
      dirty=true;
    }
    if(type==='built'){announce(C.businesses[data.business.type].name+' is open','building');sound('build');dirty=true;}
    if(type==='annex'){announce('The new floor is open','building');sound('build');dirty=true;}
    if(type==='construction'||type==='townBuilt'){sound('build');dirty=true;}
    if(type==='market'){announce(data.event[0]+' · '+data.event[1],'chart');dirty=true;}
    if(type==='milestone')announce(data.text,'trophy');
    if(type==='scene'){dirty=true;contextKey='';zoneKey='';guide=null;}
    if(type==='shift')dirty=true;
  }
  function save(){
    g.field=O.snapshot(s);
    g.stamp=Math.max(g.stamp,Date.now());
    S.store(settings.slot,g);S.settings(settings);
  }
  function load(slot,fresh=null){
    settings.slot=slot;
    const saved=fresh?null:S.getSlot(slot);
    g=fresh||saved||E.newGame();
    const elapsed=saved?Date.now()-g.stamp:0;
    const offline=elapsed>0?O.fieldOffline(g,elapsed):null;
    s=O.create(g,emit);
    if(!g.field&&g.played)s.elapsed=g.played;
    tutorial={supply:g.worked>0,batch:g.worked>0,sales:g.worked};
    job=starterKeys[g.job]||'lemonade';
    guide=O.suggest(s,job);
    selection={region:s.region,branch:0,sector:0,plot:0,site:s.site,slot,plus:false};
    hiddenAt=0;acc=0;guideClock=0;contextKey='';inventoryKey='';zoneKey='';dirty=true;
    save();
    return offline;
  }
  function wins(){
    if(g.won&&!g.winLogged){
      g.winLogged=true;
      settings.completed++;
      settings.legacy++;
      const time=g.completedAt||g.played;
      settings.fastest=settings.fastest?Math.min(settings.fastest,time):time;
      announce('Your portfolio reached a sustainable $1 billion!','trophy');sound('won');
      save();
    }
    for(let i=0;i<E.achievements.length;i++){
      if(!g.achievements.includes(i)&&E.achievements[i][2](g))g.achievements.push(i);
    }
  }

  function objective(){
    const b=business(), owns=g.businesses.length;
    if(b){
      const r=s.map.recipe;
      if(!b.staff)return ['Run the '+r.label.toLowerCase(),'Fill orders yourself. Hire a worker from the office to keep it operating when you leave.',icon('users',18)];
      if(!b.up[1])return ['Make room to grow','The expansion pad adds a new station. Your crew can keep the original line moving.',icon('building',18)];
      return ['Keep orders flowing',r.hint,icon(r.icon,18)];
    }
    if(!s.map.starters)return ['Find your next site','Walk to a lot to build. Follow the bus sign to change districts.',icon('building',18)];
    if(!owns&&g.worked<3)return ['Your first orders',F.recipes[job].hint,icon(F.recipes[job].icon,18)];
    if(!owns){
      const min=Math.min(...C.businesses.filter(d=>d.tier===0&&E.canBuy(g,d.id,s.region)).map(d=>E.quote(g,d.id,s.region)));
      return ['Open your first shop','Save '+money(min)+' for a storefront. Walk to a construction lot to choose your business.',icon('building',18)];
    }
    if(g.regions.length<2&&g.challenge!==2)return ['Grow beyond Maplebrook','Hire staff, open another business, then buy a permit for Cedar Junction at '+money(C.regions[1].gate)+' net worth.',icon('world',18)];
    return [g.won?'Grow your legacy':'Build a billion-dollar group','Keep profitable sites running and reinvest in larger industries.',icon('chart',18)];
  }
  function renderChrome(){
    const b=business(), theme=s.map.theme, id=s.region+':'+s.site;
    if(zoneKey!==id){
      zoneKey=id;
      $('#location').textContent=b?C.businesses[b.type].name:theme.label;
      $('#zone').textContent=b?theme.label.toUpperCase()+' / '+C.sectors[C.businesses[b.type].sector].name.toUpperCase():theme.zone;
      $('#scene-tag').innerHTML=icon('sun',16)+(b?'Open for business':'Open district');
    }
    $('#cash').textContent=money(g.cash);
    $('#worth').textContent=money(E.worth(g));
    $('#profit').textContent=money(roundProfit());
    $('#orders-count').textContent=s.served+' '+(s.served===1?'order':'orders')+' fulfilled';
    const item=s.player.item, count=s.player.count,cap=O.capacity(s,F.recipes[job]);
    const ik=item+':'+count+':'+cap;
    if(inventoryKey!==ik){
      inventoryKey=ik;
      const label=icon('box',17)+'<span>'+(item?F.item[item][0]:'Carry')+'</span><strong>'+count+'/'+cap+'</strong>';
      $('#inventory').innerHTML=item?press(label,'inventory','','inventory-button'):label;
      $('#inventory').classList.toggle('loaded',Boolean(item));
    }
    const st=s.focus;
    let action=st?.kind==='action'?st:null;
    let hint=st?O.actionHint(s,st):s.player.item?'Carry your items to the highlighted station':'Walk to a station to work';
    if(action?.building){hint='Building in progress';action=null;}
    const actKey=hint+':'+(action?.id||'')+':'+Boolean(st);
    if(contextKey!==actKey){
      contextKey=actKey;
      $('#context').innerHTML=action?press(icon('arrow',15)+hint+'<kbd>E</kbd>','context','','action'):st?'<span>'+icon('target',15)+hint+'</span>':'';
    }
    if(dirty)renderBook();
  }
  function renderBook(){
    dirty=false;
    const [headline,detail,emblem]=objective();
    const b=business(), local=s.map.starters,r=local?F.recipes[job]:s.map.recipe;
    const first=!g.worked&&local;
    const requirements=job==='lemonade'?[
      ['Collect lemons',tutorial.supply],['Mix and collect lemonade',tutorial.batch],['Serve a customer',tutorial.sales>0]
    ]:job==='wash'?[['Pick up a wash kit',s.player.item==='soap'],['Wash a waiting car',tutorial.sales>0]]:[['Pick up a parcel',s.player.item==='parcel'],['Deliver to a lit doorstep',tutorial.sales>0]];
    const steps=(local&&g.worked<3)?'<ol class="steps">'+requirements.map(([label,done],i)=>'<li class="'+(done?'done':'')+'"><i>'+(done?icon('check',12):i+1)+'</i>'+label+'</li>').join('')+'</ol>':'';
    const guideButton=first?press(icon('arrow',16)+' Show me where','guide','','primary'):
      (r?press(icon('target',17)+' Next workstation','guide','','secondary'):'');
    const jobs=local?'<div class="job-pickers">'+starterKeys.map((key,i)=>{
      const r=F.recipes[key];
      return '<button type="button" class="job-pick '+(job===key?'selected':'')+'" data-action="job" data-value="'+key+'" aria-pressed="'+(job===key)+'"><span class="job-art job-'+i+'">'+icon(r.icon,18)+'</span><span><strong>'+r.label+'</strong><small>'+(i===0?'Mix and serve':i===1?'Clean waiting cars':'Take parcels to doors')+'</small></span>'+icon('arrow',14)+'</button>';
    }).join('')+'</div>':'';
    const rec=b?O.record(s,b):null;
    const siteCard=b?'<section class="paper"><div class="paper-label">ON SITE</div><div class="quick-data">'+row('Orders fulfilled',rec.done)+row('Crew on duty',String(b.staff))+row('Reputation',Math.round(b.rep)+'%')+'</div>'+press(icon('building',17)+' Manage business','manage',b.id,'secondary full')+'</section>':
      local?'<section class="paper work-card"><div class="paper-label">LOCAL JOBS</div>'+jobs+'</section>':
      '<section class="paper"><div class="paper-label">DISTRICT</div>'+title(s.map.theme.label,C.regions[s.region].kind)+press(icon('pin',17)+' Find construction lot','findLot','','secondary full')+'</section>';
    const event=C.events[g.event];
    $('#fieldbook').innerHTML='<section class="paper objective"><div class="objective-top"><span class="objective-icon">'+emblem+'</span><span class="paper-label">CURRENT OBJECTIVE</span></div>'+title(headline,detail)+steps+guideButton+'</section>'+siteCard+
      '<div class="market-note">'+icon(event[5]==='negative'?'chart':'sun',16)+'<div><strong>'+event[0]+'</strong><small>'+event[1]+'</small></div></div>';
  }
  function layout(){
    $('#header-actions').innerHTML='<span class="live-status"><i></i> LIVE SIMULATION</span>'+press(icon('trophy',19)+'<span class="sr">Achievements</span>','achievements','','icon')+press(icon('settings',19)+'<span class="sr">Settings</span>','settings','','icon');
    $('#stats').innerHTML=stats('Cash balance',money(g.cash),'coins','cash')+stats('Net worth',money(E.worth(g)),'trophy','worth')+stats('Last shift profit',money(roundProfit()),'chart','profit');
    $('#move-help').innerHTML=icon('move',15)+'<span class="key-help"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or click to move</span><span class="touch-help">Drag or tap to move</span>';
    $('.nav-inner').innerHTML=[['Play','empire','play'],['Businesses','building','portfolio'],['Districts','world','world'],['Research','flask','research'],['Finance','coins','finance']].map(([label,i,a])=>press(icon(i,20)+'<span>'+label+'</span>',a,'','nav-btn'+(a==='play'?' active':''))).join('');
    renderChrome();
  }
  function open(name,label,body,classes=''){
    if(!dialog.open)previousFocus=document.activeElement;
    keys.clear();stopDrag();
    modal=name;dialog.className=classes;
    dialog.innerHTML='<div class="sheet-head"><div><span class="paper-label">FROM $1 TO $1 BILLION</span><h2 id="dialog-title">'+label+'</h2></div>'+press(icon('close')+'<span class="sr">Close</span>','dismiss','','icon')+'</div><div class="sheet-body">'+body+'</div>';
    if(!dialog.open)dialog.showModal();
  }
  function close(){
    modal='';if(dialog.open)dialog.close();dirty=true;
    if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
  }
  function offline(note){
    if(!note)return;
    open('offline','Welcome back',title('Automated sites kept working','Offline orders come from staffed, automated production.')+
      row('Time credited',note.minutes+' min')+row('Revenue',money(note.revenue))+row('Expenses',money(note.costs))+row('Net result',money(note.profit))+
      press('Back to work','dismiss','','primary full'));
  }
  function construction(){
    const sector=selection.sector;
    const bType=C.sectors[sector];
    const drop='<label class="form-row">Industry <select data-field="sector">'+C.sectors.map((sec,i)=>'<option value="'+i+'"'+(sector===i?' selected':'')+'>'+sec.name+'</option>').join('')+'</select></label>';
    const body=C.businesses.filter(d=>d.sector===sector).map(d=>{
      const cost=E.quote(g,d.id,s.region);
      const can=E.canBuy(g,d.id,s.region);
      const detail=d.detail+' '+(!can&&d.gate>E.worth(g)?'Requires '+money(d.gate)+' net worth.':!can?'Unavailable in this district or campaign.':'');
      return rule(d.name,detail,press('Build '+money(cost),'build',d.id,'secondary',!can||g.cash<cost));
    }).join('');
    open('construction','Build in '+C.regions[s.region].name,title('Available sites',bType.name+' businesses for this district.')+drop+body);
  }
  function tools(){
    const levels=g.tools;
    open('tools','Equipment cart',title('Carry more per trip','Job kits increase carrying capacity, walking speed and the value of completed orders.')+starterKeys.map((key,i)=>{
      const cost=E.toolCost(g,i);
      return rule(F.recipes[key].label,'Level '+levels[i]+' of 4',press(levels[i]===4?'Max level':money(cost),'tool',i,'secondary',levels[i]===4||g.cash<cost));
    }).join(''));
  }
  function expansion(){
    const b=business();
    if(!b){
      const cost=[430,1300,3100][s.expanded];
      open('expansion','Expand the lemonade stand',title(['Express counter','Hire a stand assistant','Upgrade the prep line','Fully expanded'][s.expanded],
        ['Open a second serving position and carry an extra item.','An assistant supplies and serves the stand while you work nearby.','Improve preparation speed and carrying capacity.','The stand has all three expansions.'][s.expanded])+
        (cost?press('Build · '+money(cost),'townUpgrade','','primary full',g.cash<cost):''));
      return;
    }
    const cost=E.upgradeCost(b,1,g);
    open('expansion','Expand the facility',title('Build an annex','Adds floor space and a second service position. Layout controls unlock after the first expansion.')+
      press('Build · '+money(cost),'improve',b.id+',upgrade,1','primary full',g.cash<cost||b.up[1]>=E.upgrades[1][3]));
  }
  function portfolio(){
    const b=g.businesses.slice().sort((a,b)=>a.region-b.region||a.id-b.id);
    const list=b.map(site=>{
      const d=C.businesses[site.type], rec=O.record(s,site), rate=O.rate(s,site);
      const controls=press('Manage','manage',site.id)+press(rec.eta>0?'Building':'Visit','visit',site.id,'secondary',rec.eta>0||(site.region!==s.region&&g.businesses.length<2));
      return rule(d.name,C.regions[site.region].name+' · '+site.staff+' crew · '+rec.done+' orders'+(rate.crew?' · Staffed':' · Owner operated'),'<div class="button-group">'+controls+'</div>');
    }).join('');
    open('portfolio','Your businesses',list||title('The first storefront','Walk to a construction lot to open your first business.')+press(icon('pin',16)+' Find a lot','findLot','','primary full'));
  }
  function manage(id){
    const b=g.businesses.find(x=>x.id===id);
    if(!b)return portfolio();
    selection.site=id;
    const d=C.businesses[b.type], r=O.record(s,b), rates=O.rate(s,b), cost=E.hireCost(b), max=g.challenge===8?2:8;
    const q=O.quote(s,b), cap=b.up[7]?'Automated':b.staff?'Staffed':'Owner operated';
    const ops=section('Operations',row('Revenue per completed order',money(q.revenue))+row('Supplies per order',money(q.inputs))+row('Staffed capacity',Math.round(rates.service*60)+' orders/min')+row('Completed orders',r.done)+row('Reputation',Math.round(b.rep)+'%')+row('Equipment wear',Math.round(b.wear)+'%')+
      '<label class="form-row">Pricing <select data-field="price"><option value="0" '+(b.price===0?'selected':'')+'>Value</option><option value="1" '+(b.price===1?'selected':'')+'>Standard</option><option value="2" '+(b.price===2?'selected':'')+'>Premium</option></select></label>');
    const crew=section('Workforce',rule('Hire '+C.sectors[d.sector].role.toLowerCase(),b.staff+' of '+max+' workers. Staff walk supplies and orders between stations.',
      press(money(cost),'improve',id+',hire,0','secondary',b.staff>=max||g.cash<cost))+
      ['Operations manager','Marketing manager','Finance manager'].map((label,i)=>rule(label,i===0?'Faster shipping and lower wear.':i===1?'Improves reputation.':'Reduces overhead.',
        press(b.manager===i+1?'Assigned':money(Math.round(d.cost*.25)),'improve',id+',manager,'+(i+1),'secondary',b.staff<2||b.manager===i+1||g.cash<Math.round(d.cost*.25)))).join(''));
    const upgrades=section('Upgrades',E.upgrades.map(([label,desc,,limit],i)=>{
      const price=E.upgradeCost(b,i,g);
      return rule(label+' · '+b.up[i]+'/'+limit,desc,press(money(price),'improve',id+',upgrade,'+i,'secondary',b.up[i]===limit||g.cash<price||(i===7&&(!b.staff||E.worth(g)<4000))));
    }).join('')+
      rule(C.sectors[d.sector].lever,'Improve the offer in this industry.',press(money(Math.round(d.cost*.35)),'improve',id+',special,0','secondary',b.special||g.cash<Math.round(d.cost*.35)))+
      rule('Distribution channel','Reach a wider market. Requires an annex.',press(money(E.channelCost(b)),'improve',id+',channel,0','secondary',!b.up[1]||b.channels>=12||g.cash<E.channelCost(b)))+
      rule('Service the equipment','Restore performance lost to wear.',press('Service','improve',id+',repair,0','secondary',b.wear<5||g.cash<Math.round(d.cost*.02*b.wear/45)))+
      (s.site===id&&b.up[1]?rule('Workshop layout','Switch between two workstation layouts.',press(r.layout?'Original':'Mirror','blueprint',r.layout?0:1)):''));
    const partners=section('Partnerships', E.deals.map(([label,desc,i])=>{
      const price=E.dealQuote(g,b,i);
      return rule(label,desc+' Reputation 65+ and applicable research.',press((b.dealUntil||0)>g.round?'Active':money(price),'sign',id+','+i,'secondary',b.rep<65||g.cash<price||(b.dealUntil||0)>g.round||(i===2&&!g.tech.includes(43))||(i===3&&!g.tech.includes(39))));
    }).join(''));
    open('manage',d.name,'<div class="sheet-summary">'+badge(C.regions[b.region].name)+badge(cap)+badge('Tier '+(d.tier+1))+'</div>'+ops+crew+upgrades+partners+press('Sell business','sellPrompt',id,'danger'));
  }
  function districts(){
    const r=C.regions[selection.region], has=g.regions.includes(r.id), cost=Math.round(r.cost*(1-.045*E.level(g,6)));
    const openable=r.id===s.region||g.businesses.length>=2||s.focus?.id==='travel';
    const options='<div class="chipbar">'+C.regions.map(q=>press((g.regions.includes(q.id)?'':'◦ ')+q.name,'region',q.id,q.id===r.id?'selected':'secondary')).join('')+'</div>';
    const inspect=section(r.name,row('District',r.kind)+row('Demand index',Math.round(r.demand*100))+row('Wages index',Math.round(r.wages*100))+
      row('Specialities',r.strength.map(i=>C.sectors[i].name).join(', '))+row('Owned businesses',g.businesses.filter(b=>b.region===r.id).length));
    const action=has?press('Travel to '+r.name,'travelTo',r.id,'primary full',!openable):
      press('Purchase permit · '+money(cost),'permit',r.id,'primary full',g.cash<cost||E.worth(g)<r.gate||g.challenge===2)+'<p class="muted">Requires '+money(r.gate)+' net worth.</p>';
    const note=has&&!openable?'<p class="muted">Walk to the bus stop. Fast travel unlocks when you own two businesses.</p>':'';
    const competitors=section('Regional rivals',['Aster Holdings','BudgetWorks','Cobalt Group'].map((name,i)=>{
      const value=g.rivals[r.id][i], cost=E.mergerQuote(g,r.id,i);
      return rule(name,['Expansionist','Low cost','Premium'][i]+' · Influence '+(value/1000).toFixed(1),
        press('Acquire stake · '+money(cost),'stake',r.id+','+i,'secondary',!g.tech.includes(46)||!has||value<2200||g.cash<cost||!g.businesses.some(b=>b.region===r.id)));
    }).join(''));
    open('districts','Districts',options+inspect+action+note+competitors);
  }
  function research(){
    const branch=selection.branch;
    const tabs='<div class="chipbar">'+C.tracks.map(([name,i],idx)=>press(icon(i,15)+name,'branch',idx,idx===branch?'selected':'secondary')).join('')+'</div>';
    const content=C.research.filter(t=>t.branch===branch).map(t=>{
      const studied=g.tech.includes(t.id), available=(!t.level||g.tech.includes(t.id-1))&&E.worth(g)>=t.gate;
      return rule(t.title,t.effect+' · '+t.points+' RP'+(t.gate?' · '+money(t.gate)+' net worth':''),press(studied?'Complete':money(t.cost),'study',t.id,'secondary',studied||!available||g.points<t.points||g.cash<t.cost));
    }).join('');
    open('research','Research','<p class="muted">Research points accumulate with business shifts and starter orders.</p>'+badge(g.points+' RP available')+tabs+section(C.tracks[branch][0],content));
  }
  function flowChart(){
    if(g.history.length<2)return '<p class="muted">Cash history appears after two shifts.</p>';
    const highest=Math.max(...g.history),lowest=Math.min(...g.history),range=Math.max(1,highest-lowest);
    const points=g.history.map((v,i)=>(8+i*404/(g.history.length-1)).toFixed(1)+','+(68-60*(v-lowest)/range).toFixed(1)).join(' ');
    return '<div class="cash-chart"><svg viewBox="0 0 420 76" role="img" aria-label="Cash balance from '+money(g.history[0])+' to '+money(g.history.at(-1))+'">'+
      '<path d="M8 9H412M8 38H412M8 68H412" stroke="#d9d9bd" stroke-dasharray="3 5" fill="none"/><polyline points="'+points+'" stroke="#5b8162" stroke-width="2.25" fill="none" /></svg></div>';
  }
  function finance(){
    const values=g.businesses.reduce((n,b)=>n+E.value(b,g),0);
    const c=E.contract(g);
    const stats=section('Last shift',row('Revenue',money(g.last.revenue))+row('Expenses',money(g.last.costs))+row('Operating profit',money(g.last.profit))+
      row('Portfolio assets',money(values))+row('Property book value',money(g.property))+row('Lifetime revenue',money(g.totalRevenue))+row('Debt',money(g.debt))+flowChart());
    const capital=section('Capital',rule('Available credit',money(E.credit(g)),press('Borrow','capital','loan','secondary',g.challenge===0||!g.businesses.length||!E.credit(g)))+
      rule('Debt repayment',money(g.debt),press('Repay','capital','repay','secondary',!g.debt||!g.cash))+
      rule('Commercial property','Earn rent per shift. Cash Forecasts unlocks investments.',press('Invest','capital','property','secondary',!g.tech.includes(35)||!g.cash))+
      rule('Sell property',money(g.property)+' book value',press('Liquidate','capital','liquidate','secondary',!g.property)));
    const policy=section('Operating policy','<div class="chipbar">'+E.rules.map((r,i)=>press(r.name,'policy',i,g.policy===i?'selected':'secondary')).join('')+'</div><p class="muted">'+E.rules[g.policy].detail+'</p>');
    const contracts=section('Portfolio contracts',rule(c.name,c.eligible+'/'+c.need+' eligible sites · Tier '+(c.tier+1)+' · Reputation '+c.rep+'+ · '+c.regions+' permits',
      press('Claim '+money(c.reward),'claim','','secondary',!c.ready||c.reward<=0)));
    const projects=section('Corporate projects',E.projects.map(([name,tech,cost,points,tier,sites],i)=>rule(name,C.research[tech].title+' · '+points+' RP · '+sites+' tier '+(tier+1)+' sites',
      press(g.projects.includes(i)?'Complete':money(cost),'project',i,'secondary',g.projects.includes(i)||g.cash<cost||g.points<points||!g.tech.includes(tech)||g.businesses.filter(b=>C.businesses[b.type].tier>=tier).length<sites))).join(''));
    open('finance','Finance',stats+policy+capital+contracts+projects);
  }
  function capital(kind){
    const max=({loan:E.credit(g),repay:Math.min(g.debt,g.cash),property:g.cash,liquidate:g.property})[kind];
    const name=({loan:'Business loan',repay:'Repay debt',property:'Buy commercial property',liquidate:'Sell property'})[kind];
    if(!name||!max)return finance();
    open('capital',name,'<label class="form-row">Amount in dollars <input id="amount" min=".01" step=".01" max="'+max/100+'" type="number" inputmode="decimal"></label><p class="muted">Available '+money(max)+'</p>'+press('Confirm','capitalApply',kind,'primary full'));
  }
  function preferences(){
    open('settings','Settings','<div class="settings-grid"><label>Sound effects <input data-field="sound" type="range" min="0" max="1" step=".02" value="'+settings.sound+'"></label><label>Camera motion <input type="checkbox" data-field="motion" '+(settings.motion?'checked':'')+'></label></div>'+
      '<div class="chipbar">'+press('Campaign slots','slots')+press('Save now','save')+press('Export save','export')+press('Import save','import')+press('How to play','help')+'</div>'+
      '<p class="muted">'+(S.persistent()?'Your progress is saved in this browser. Export a save to move between devices.':'Storage is unavailable. Export a copy before you leave.')+'</p>');
  }
  function slots(){
    const list=[0,1,2].map(i=>{
      const data=S.getSlot(i);
      const active=i===settings.slot;
      return rule('Slot '+(i+1)+(active?' · Active':''),data?data.mode+' · '+money(E.worth(data))+' net worth':'Empty',
        '<div class="button-group">'+press(data?'Load':'Create',data?'load':'newPrompt',i,'secondary',active)+(data?press('Delete','deletePrompt',i,'danger',active):'')+'</div>');
    }).join('');
    open('slots','Campaigns',list+row('Campaigns won',settings.completed)+row('Play time',Math.floor(s.elapsed/60)+' min')+
      (g.won?press('Begin New Game Plus','newPrompt',settings.slot+',1','primary full'):''));
  }
  function campaignOffer(slot,plus){
    selection.slot=slot;selection.plus=plus;
    const challenges='<select id="challenge"><option value="-1">Open campaign</option>'+C.challenges.map(([name],i)=>'<option value="'+i+'">'+name+'</option>').join('')+'</select>';
    const places=plus?'<label class="form-row">Starting home <select id="home"><option value="0">Maplebrook</option><option value="1">Cedar Junction</option></select></label><p class="muted">This replaces the active slot.</p>':'';
    open('new','Start a campaign','<label class="form-row">Difficulty <select id="difficulty"><option>Casual</option><option selected>Standard</option><option>Expert</option></select></label>'+
      '<label class="form-row">Challenge '+challenges+'</label><p class="muted" id="challenge-copy">Choose any industry and expansion plan.</p>'+places+
      press('Start with $1','newGame','','primary full'));
  }
  function achievements(){
    const rows=E.achievements.map(([name,amount],i)=>'<li class="'+(g.achievements.includes(i)?'earned':'')+'">'+icon(g.achievements.includes(i)?'trophy':'lock',16)+'<span>'+name+(amount?' · '+money(amount):'')+'</span></li>').join('');
    open('achievements','Achievements','<p class="muted">'+g.achievements.length+' of '+E.achievements.length+' unlocked</p><ul class="achievement-list">'+rows+'</ul>');
  }
  function help(){
    open('help','How to play',section('Movement','<p class="muted">Use WASD or the arrow keys on a keyboard. On touchscreens, drag the joystick or drag anywhere in the field. Tap any point to walk there.</p>')+
      section('Workstations','<p class="muted">Move within reach of a station to pick up or drop off a batch. Wait at a machine while it finishes, then collect the output. Walk into a car wash bay to clean the waiting car.</p>')+
      section('Growing the business','<p class="muted">Walk to a construction lot, door, bus stop or office. Press E or use the nearby action button. Staff keep your other businesses running while you work elsewhere.</p>')+
      section('Accounting','<p class="muted">Customers pay when you fulfil an order. Wages, upkeep and interest settle automatically at the end of a shift. Earn a sustainable $1 billion with at least two businesses and positive operating results.</p>'));
  }
  function stationAction(){
    const st=s.focus;
    if(!st||st.kind!=='action'||st.building)return;
    sound('tap');
    if(st.id==='door')change(s.region);
    else if(st.id==='office')manage(s.site);
    else if(st.id==='expand'||st.id==='townExpansion')expansion();
    else if(st.id==='tools')tools();
    else if(st.id==='travel'){selection.region=s.region;districts();}
    else if(st.id==='block'){
      const pages=O.blockCount(s);
      if(O.changeScene(s,s.region,0,(s.lotPage+1)%pages))save();
    }else if(st.id.startsWith('lot-')){
      if(st.business)change(s.region,st.business);
      else{selection.plot=st.index;construction();}
    }
  }
  function change(region,id=0){
    if(O.changeScene(s,region,id)){close();save();return true;}
    announce('This site is still under construction','building');return false;
  }
  function mutate(ok,next,text){
    if(!ok){announce('That option is unavailable','info');return false;}
    O.refresh(s);dirty=true;save();
    if(text)announce(text);
    if(next)next();
    return true;
  }
  function waypoint(type){
    if(type==='lot'){
      if(s.site)change(s.region);
      close();
      const st=s.map.stations.find(p=>p.id.startsWith('lot-')&&!p.business);
      if(st){guide=st;O.aim(s,st);}
      else announce('This block is full. Try the next block or district.','info');
    }else{
      const st=O.suggest(s,job);
      if(st){guide=st;O.aim(s,st);}
      else announce('Look for a waiting customer or an item to collect.','info');
    }
  }
  const number=v=>Number(v);
  const navActions={play:close,portfolio,world:()=>{selection.region=s.region;districts();},research,finance};
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');
    if(!button||button.disabled)return;
    const a=button.dataset.action,v=button.dataset.value,d=v.split(',');
    if(Object.hasOwn(navActions,a))return navActions[a]();
    switch(a){
      case 'context':stationAction();break;
      case 'inventory':open('inventory','Carried supplies',title(F.item[s.player.item]?.[0]||'Empty',s.player.count+' carried')+press('Empty hands','discard','','secondary full',!s.player.count));break;
      case 'discard':if(mutate(O.discard(s),null,'Hands free'))close();break;
      case 'guide':waypoint();break;
      case 'findLot':waypoint('lot');break;
      case 'job':job=v;guide=O.suggest(s,job);dirty=true;break;
      case 'build':{
        const built=O.acquire(s,number(v),selection.plot);
        if(mutate(built,null,built?'Construction started for '+C.businesses[built.type].name:''))close();
        break;
      }
      case 'tool':mutate(E.tool(g,number(v)),tools,'Equipment upgraded');break;
      case 'townUpgrade':if(mutate(O.upgradeTown(s),null,'Stand upgraded'))close();break;
      case 'manage':manage(number(v));break;
      case 'visit':{const b=g.businesses.find(p=>p.id===number(v));if(b&&(b.region===s.region||g.businesses.length>=2))change(b.region,b.id);break;}
      case 'improve':{
        const b=g.businesses.find(p=>p.id===number(d[0]));
        if(b){
          const old=modal;
          const ok=E.improve(g,b,d[1],number(d[2]));
          if(ok&&d[1]==='upgrade'&&number(d[2])===1)O.startFitout(s,b);
          if(mutate(ok,old==='manage'?()=>manage(b.id):null,d[1]==='hire'?'Worker hired':d[1]==='upgrade'&&number(d[2])===1?'Facility expanded':'Business upgraded')&&old==='expansion'){
            close();sound('build');
          }
        }
        break;
      }
      case 'blueprint':mutate(O.blueprintLayout(s,number(v)),()=>manage(s.site),'Layout updated');break;
      case 'sign':{
        const b=g.businesses.find(p=>p.id===number(d[0]));
        if(b)mutate(E.sign(g,b,number(d[1])),()=>manage(b.id),'Partnership signed');break;
      }
      case 'sellPrompt':{
        const b=g.businesses.find(p=>p.id===number(v));
        if(b)open('sell','Sell '+C.businesses[b.type].name+'?',title('Sale proceeds · '+money(Math.round(E.value(b,g)*.87)),'The crew, business and equipment transfer out of your portfolio.')+
          press('Confirm sale','sell',b.id,'danger full'));break;
      }
      case 'sell':{
        const b=g.businesses.find(p=>p.id===number(v));
        if(b&&E.sell(g,b)){
          delete s.sites[b.id];
          if(s.site===b.id)change(b.region);else mutate(true,portfolio,'Business sold');
        }
        break;
      }
      case 'region':selection.region=number(v);districts();break;
      case 'travelTo':if(s.region===number(v)||g.businesses.length>=2||s.focus?.id==='travel')change(number(v));break;
      case 'permit':mutate(E.unlock(g,number(v)),districts,'District permit acquired');break;
      case 'stake':mutate(E.acquireRival(g,number(d[0]),number(d[1])),districts,'Rival stake acquired');break;
      case 'branch':selection.branch=number(v);research();break;
      case 'study':mutate(E.study(g,number(v)),research,'Research completed');break;
      case 'policy':g.policy=number(v);mutate(true,finance,'Operating policy updated');break;
      case 'claim':mutate(E.claim(g),finance,'Contract completed');break;
      case 'project':mutate(E.project(g,number(v)),finance,'Corporate project completed');break;
      case 'capital':capital(v);break;
      case 'capitalApply':mutate(E.finance(g,v,Math.round(Number($('#amount').value)*100)),finance,'Capital transaction complete');break;
      case 'settings':preferences();break;
      case 'slots':slots();break;
      case 'newPrompt':campaignOffer(number(d[0]),d[1]==='1');break;
      case 'newGame':{
        const mode=$('#difficulty').value,id=number($('#challenge').value),home=number($('#home')?.value??'0');
        const next=E.newGame(Date.now(),mode,id,selection.plus?settings.legacy:0,home);
        save();close();load(selection.slot,next);layout();break;
      }
      case 'load':{save();close();const note=load(number(v));layout();offline(note);break;}
      case 'deletePrompt':open('delete','Delete slot '+(number(v)+1)+'?',title('Delete campaign and backup','This permanently clears the selected slot.')+press('Delete campaign','delete',v,'danger full'));break;
      case 'delete':if([0,1,2].includes(number(v))&&number(v)!==settings.slot){S.erase(number(v));slots();announce('Campaign deleted');}break;
      case 'save':save();announce(S.persistent()?'Campaign saved':'Saved for this tab');break;
      case 'export':{
        save();open('export','Export save','<p class="muted">Copy the save below or download the JSON file.</p><textarea id="save-text" readonly aria-label="Campaign JSON"></textarea>'+press('Download JSON','download','','secondary full'));
        $('#save-text').value=S.encode(g);$('#save-text').select();break;
      }
      case 'download':{
        const file=URL.createObjectURL(new Blob([S.encode(g)],{type:'application/json'}));
        const link=document.createElement('a');link.href=file;link.download='billion-campaign-'+(settings.slot+1)+'.json';link.click();
        setTimeout(()=>URL.revokeObjectURL(file),1000);break;
      }
      case 'import':open('import','Import save','<p class="muted">Paste exported campaign JSON to replace the current slot. Its previous version is retained as a backup.</p><textarea id="save-text" aria-label="Paste campaign JSON"></textarea>'+press('Replace this slot','importApply','','primary full'));break;
      case 'importApply':{
        const data=S.decode($('#save-text').value.trim());
        if(!data){announce('The save could not be read','info');break;}
        close();load(settings.slot,data);layout();announce('Campaign imported');break;
      }
      case 'achievements':achievements();break;
      case 'help':help();break;
      case 'dismiss':close();break;
    }
  });
  document.addEventListener('change',event=>{
    const target=event.target,v=Number(target.value);
    if(target.id==='challenge')$('#challenge-copy').textContent=C.challenges[v]?.[1]||'Choose any industry and expansion plan.';
    if(target.dataset.field==='sector'){selection.sector=v;construction();}
    if(target.dataset.field==='price'){
      const b=g.businesses.find(p=>p.id===selection.site);
      if(b&&[0,1,2].includes(v)){b.price=v;mutate(true,()=>manage(b.id),'Pricing updated');}
    }
    if(target.dataset.field==='sound'&&Number.isFinite(v)){settings.sound=v;S.settings(settings);sound('tap');}
    if(target.dataset.field==='motion'){settings.motion=target.checked;S.settings(settings);}
  });
  dialog.addEventListener('close',()=>{modal='';});
  const direction={w:[0,-1],a:[-1,0],s:[0,1],d:[1,0],arrowup:[0,-1],arrowleft:[-1,0],arrowdown:[0,1],arrowright:[1,0]};
  document.addEventListener('keydown',event=>{
    if(dialog.open||event.ctrlKey||event.metaKey||event.altKey)return;
    const key=event.key.toLowerCase();
    if(direction[key]){event.preventDefault();keys.add(key);}
    else if(key==='e'&&!event.repeat){event.preventDefault();stationAction();}
  });
  document.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
  function stopDrag(){
    drag=null;input.x=0;input.y=0;$('#joystick').style.removeProperty('--dx');$('#joystick').style.removeProperty('--dy');
  }
  window.addEventListener('blur',()=>{keys.clear();stopDrag();});
  window.addEventListener('pagehide',save);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      hiddenAt=Date.now();keys.clear();stopDrag();save();last=0;
    }else if(hiddenAt){
      const note=O.fieldOffline(g,Date.now()-Math.max(hiddenAt,g.stamp));
      hiddenAt=0;s.cache.clear();last=0;dirty=true;save();offline(note);
    }
  });
  function coordinate(event){
    const r=canvas.getBoundingClientRect();
    return renderer.worldPoint(event.clientX-r.left,event.clientY-r.top);
  }
  function begin(event){
    if(dialog.open||drag||event.button>0)return;
    if(event.target===canvas)canvas.focus({preventScroll:true});
    const origin=event.currentTarget.id==='joystick'?'joystick':'world';
    const box=event.currentTarget.getBoundingClientRect();
    const center=origin==='joystick'?[box.left+box.width/2,box.top+box.height/2]:[event.clientX,event.clientY];
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag={id:event.pointerId,x:center[0],y:center[1],moved:false,origin};
    if(origin==='joystick')dragMove(event);
    event.preventDefault();
  }
  function dragMove(event){
    if(drag?.id!==event.pointerId)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    const distance=Math.hypot(dx,dy),d=Math.max(38,distance);
    if(distance>7)drag.moved=true;
    if(!drag.moved)return;
    input.x=dx/d;input.y=dy/d;
    $('#joystick').style.setProperty('--dx',input.x*17+'px');
    $('#joystick').style.setProperty('--dy',input.y*17+'px');
  }
  function end(event){
    if(drag?.id!==event.pointerId)return;
    if(!drag.moved&&drag.origin==='world'&&event.type==='pointerup'){
      const p=coordinate(event);
      const near=s.map.stations.filter(st=>Math.hypot(st.x-p.x,st.y-p.y)<30).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
      if(near&&near.kind==='action'&&s.focus?.id===near.id)stationAction();
      else if(near){O.aim(s,near);guide=near;}
      else{
        const land={x:Math.max(40,Math.min(920,p.x)),y:Math.max(152,Math.min(596,p.y))};
        if(O.clear(s.map,land.x,land.y,8))s.player.path=O.route(s.map,s.player,land);
      }
    }
    stopDrag();
  }
  for(const el of [canvas,$('#joystick')]){
    el.addEventListener('pointerdown',begin);el.addEventListener('pointermove',dragMove);
    el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',stopDrag);
  }
  function loop(now){
    const dt=last?Math.min(.25,(now-last)/1000):0;
    last=now;
    if(!document.hidden){
      if(!dialog.open){
        acc+=dt;
        let x=input.x,y=input.y;
        for(const k of keys){x+=direction[k][0];y+=direction[k][1];}
        const m=Math.max(1,Math.hypot(x,y));
        while(acc>=O.STEP){O.step(s,{x:x/m,y:y/m});acc-=O.STEP;}
        if(x||y)guide=null;
        guideClock+=dt;autosaveClock+=dt;
        if(guideClock>.30){
          guideClock=0;
          if(!s.player.path?.length)guide=O.suggest(s,job)||null;
        }
        if(autosaveClock>8){autosaveClock=0;save();}
      }
      hudClock+=dt;
      if(hudClock>.18){hudClock=0;wins();renderChrome();}
      renderer.draw(s,dt,{guide,motion:settings.motion&&!reduced.matches,still:!settings.motion||reduced.matches});
    }
    requestAnimationFrame(loop);
  }
  const saved=load(settings.slot);
  layout();offline(saved);
  requestAnimationFrame(loop);
})();
