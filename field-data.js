"use strict";
globalThis.FieldData = (() => {
  const item = {
    lemon:['Lemons','#f3bd36'], drink:['Lemonade','#ffce59'], soap:['Wash kit','#65bbce'],
    parcel:['Parcels','#c38956'], sorted:['Sorted parcels','#d99151'],
    carton:['Product boxes','#bc8555'], goods:['Groceries','#76ae61'],
    ingredients:['Ingredients','#e99561'], meal:['Meals','#ec9e55'],
    linen:['Used towels','#c39cc7'], fresh:['Clean towels','#88bbd8'],
    ore:['Raw materials','#929bb3'], parts:['Machine parts','#d6a76e'], pallets:['Pallets','#a87961'],
    plans:['Design briefs','#86b0d5'], code:['Builds','#8c98da'], release:['Release packages','#60b8a9'],
    panels:['Panel kits','#548caa'], power:['Charged cells','#e6ba4e'],
    timber:['Supplies','#a77e70'], fixtures:['Fixtures','#cd9e78'],
    samples:['Lab samples','#bf8bc0'], prototypes:['Prototypes','#60b6b9'], licences:['Licences','#e8be63']
  };

  const themes = [
    {label:'Maplebrook', zone:'STARTING NEIGHBOURHOOD', sky:'#9ed9bd', grass:'#9dc77b', lighter:'#acd08a', foliage:'#548b55', deep:'#38694a', path:'#ead6ae', road:'#988d83', water:'#7cb9b9', roof:'#cc7b58', accent:'#f2c455'},
    {label:'Cedar Junction', zone:'SHOPPING DISTRICT', sky:'#96cdb3', grass:'#8dbd80', lighter:'#a1c995', foliage:'#4f8864', deep:'#357459', path:'#e6ccb3', road:'#8d8494', water:'#8cb7bf', roof:'#ae688a', accent:'#eaad74'},
    {label:'Ironhaven', zone:'INDUSTRIAL AREA', sky:'#afd0bd', grass:'#aabb86', lighter:'#bcce99', foliage:'#738e5f', deep:'#536b4d', path:'#e1c9ad', road:'#8d8580', water:'#85adb0', roof:'#9c6856', accent:'#df9a56'},
    {label:'Port Solace', zone:'TOURISM DISTRICT', sky:'#99d5c5', grass:'#a8cb90', lighter:'#bfd9a0', foliage:'#608f65', deep:'#467c62', path:'#efdbb7', road:'#9ca0a2', water:'#79bdce', roof:'#eb9986', accent:'#e7aa74'},
    {label:'Circuit Bay', zone:'TECHNOLOGY DISTRICT', sky:'#a5cecd', grass:'#a2bd99', lighter:'#b5cfa9', foliage:'#719c89', deep:'#497b71', path:'#dedbc0', road:'#8b91a3', water:'#65a8bb', roof:'#818cca', accent:'#80cbd0'},
    {label:'Crown Metro', zone:'FINANCIAL DISTRICT', sky:'#a2c9cc', grass:'#a7bb86', lighter:'#beca9a', foliage:'#638f6c', deep:'#4b795d', path:'#e4d6b4', road:'#89869a', water:'#79a8bd', roof:'#897c9c', accent:'#e8be75'},
    {label:'Sunreach', zone:'ENERGY CORRIDOR', sky:'#c5dbc0', grass:'#c1c489', lighter:'#d1cf94', foliage:'#84935b', deep:'#657743', path:'#ead2a7', road:'#a29287', water:'#71a8a6', roof:'#c98d59', accent:'#f0cd71'},
    {label:'Meridian', zone:'GLOBAL LOGISTICS HUB', sky:'#99cad1', grass:'#94ba9b', lighter:'#a8cba6', foliage:'#5c8a71', deep:'#467760', path:'#d8d9c7', road:'#818e9e', water:'#78b5c0', roof:'#537f9e', accent:'#edba6e'}
  ];

  const station=(id, kind, title, art, x, y, extra={})=>({...extra,id,kind,title,art,x,y});
  const source=(id,title,art,x,y,out)=>station(id,'source',title,art,x,y,{out});
  const process=(id,title,art,x,y,input,out,time)=>station(id,'process',title,art,x,y,{input,out,time});
  const finish=(id,title,art,x,y,input,extra={})=>station(id,'service',title,art,x,y,{input,...extra});

  const recipes = {
    lemonade:{label:'Lemonade Stand',hint:'Grab lemons, mix a batch, then serve it at the counter.',starter:0,base:31,cost:3,traffic:5,icon:'glass',stages:[
      source('lemons','Lemon crates','lemon',285,284,'lemon'),
      process('mix','Mixing table','mixer',400,262,'lemon','drink',1.6),
      finish('serve','Lemonade counter','lemonade',488,286,'drink',{queue:[488,355],facing:'south'})
    ]},
    wash:{label:'Car Wash',hint:'Pick up a wash kit and stay in the bay while you clean a car.',starter:1,base:115,cost:10,traffic:10,icon:'truck',stages:[
      source('soap','Wash supplies','soap',760,282,'soap'),
      finish('wash','Wash bay','wash',850,334,'soap',{queue:[890,358],facing:'west',dwell:1.5})
    ]},
    delivery:{label:'Parcel Delivery',hint:'Pick up parcels and bring them to the lit doorstep.',starter:2,base:150,cost:7,traffic:8,icon:'box',stages:[
      source('parcels','Parcel depot','stack',170,415,'parcel'),
      finish('porch','Parkside address','porch',365,500,'parcel',{queue:[390,500],facing:'east'}),
      finish('east-porch','Hillview address','porch',592,486,'parcel',{queue:[618,486],facing:'east'})
    ]},
    retail:{label:'Market',hint:'Bring products from storage to the shelving. Shoppers browse, then queue at the till.',traffic:5,icon:'bag',floor:'#ead9b9',back:'#d1aa81',stages:[
      source('storage','Stockroom','stack',282,220,'carton'),
      station('shelf','process','Stock shelves','shelf',447,279,{input:'carton',out:'goods',time:.6,passTo:'checkout',direct:true}),
      finish('checkout','Checkout','checkout',615,388,'goods',{queue:[615,454],facing:'south',clerk:true})
    ]},
    restaurant:{label:'Café',hint:'Cook ingredients, then deliver meals to tables with orders.',traffic:5,icon:'cup',floor:'#ebd9b7',back:'#b98f75',stages:[
      source('pantry','Pantry','pantry',268,232,'ingredients'),
      process('stove','Kitchen','stove',405,225,'ingredients','meal',1.9),
      finish('table-a','Window tables','table',572,286,'meal',{queue:[571,334],facing:'south'}),
      finish('table-b','Terrace tables','table',652,423,'meal',{queue:[676,444],facing:'east'})
    ]},
    hotel:{label:'Hotel',hint:'Wash used towels, stock rooms, then check in waiting guests at reception.',traffic:8,icon:'bed',floor:'#ead5bd',back:'#b795a7',stages:[
      source('hamper','Laundry hamper','hamper',255,278,'linen'),
      process('laundry','Laundry machines','laundry',379,228,'linen','fresh',2.1),
      station('rooms','stock','Guest rooms','bed',631,231,{input:'fresh',passTo:'reception'}),
      finish('reception','Reception','reception',488,395,'fresh',{queue:[488,457],facing:'south',clerk:true,stay:'rooms',stockOnly:true})
    ]},
    factory:{label:'Factory',hint:'Feed materials into the line, palletise finished parts and load the waiting truck.',traffic:8,icon:'factory',floor:'#dcdac6',back:'#a0a98f',stages:[
      source('raw','Materials yard','ore',260,253,'ore'),
      process('mill','Production line','mill',424,210,'ore','parts',2.3),
      process('warehouse','Pallet station','pallet',595,263,'parts','pallets',1.2),
      finish('dock','Freight loading dock','dock',643,423,'pallets',{queue:[700,427],facing:'east'})
    ]},
    logistics:{label:'Logistics Hub',hint:'Sort inbound parcels and bring shipments to the active freight bay.',traffic:7,icon:'truck',floor:'#e5d6bc',back:'#9baea6',stages:[
      source('incoming','Inbound pallets','stack',269,214,'parcel'),
      process('sort','Sortation belt','belt',426,257,'parcel','sorted',1.5),
      finish('north-bay','Bay A','dock',620,229,'sorted',{queue:[675,247],facing:'east'}),
      finish('south-bay','Bay B','dock',658,421,'sorted',{queue:[714,440],facing:'east'})
    ]},
    tech:{label:'Technology Studio',hint:'Turn briefs into builds, test them, then release packages to client teams.',traffic:8,icon:'chip',floor:'#e1dfcc',back:'#a4a9c6',stages:[
      source('briefs','Project board','board',257,300,'plans'),
      process('dev','Development desks','desk',387,232,'plans','code',2.8),
      process('qa','Testing lab','server',571,236,'code','release',1.8),
      finish('launch','Launch desk','launch',632,407,'release',{queue:[638,472],facing:'south',clerk:false})
    ]},
    property:{label:'Property Workshop',hint:'Build fixtures and deliver them to clients in the handover yard.',traffic:7,icon:'building',floor:'#e9d8bd',back:'#b7a18b',stages:[
      source('supplies','Job materials','stack',255,219,'timber'),
      process('bench','Fitting bench','bench',444,264,'timber','fixtures',2),
      finish('handover','Handover yard','pallet',624,389,'fixtures',{queue:[678,410],facing:'east'})
    ]},
    energy:{label:'Energy Works',hint:'Assemble panel kits and deliver charged cells to grid customers.',traffic:8,icon:'bolt',floor:'#dfddbf',back:'#a9b196',stages:[
      source('kits','Panel kits','pallet',270,282,'panels'),
      process('array','Charging array','solar',446,215,'panels','power',2.5),
      finish('grid','Grid export point','grid',632,399,'power',{queue:[685,430],facing:'east'})
    ]},
    lab:{label:'Research Lab',hint:'Build prototypes, validate them, then fulfil research licences.',traffic:9,icon:'flask',floor:'#dce0d0',back:'#9baeb0',stages:[
      source('samples','Sample fridge','fridge',267,238,'samples'),
      process('lab','Prototype bench','lab',408,265,'samples','prototypes',2.3),
      process('rig','Validation rig','rig',579,225,'prototypes','licences',2.1),
      finish('licensing','Licensing desk','launch',639,414,'licences',{queue:[645,471],facing:'south'})
    ]}
  };
  const industry = ['restaurant','retail','logistics','tech','property','factory','energy','lab'];
  const blueprint = d=>d.sector===0&&d.tier>0?'hotel':industry[d.sector];
  const lots = [[619,210],[717,441],[426,190],[831,441],[117,250],[532,484]];
  const districtLots = [[324,263],[581,253],[744,280],[300,459],[553,473],[759,459]];
  const block=(x,y,w,h)=>({x,y,w,h});
  const townTrees = [[84,158,1.1],[132,178,.8],[205,202,1],[249,157,1.2],[350,165,.82],[453,180,1],[527,155,1.05],[685,178,.92],[741,157,1.24],[883,173,1],[913,234,1.1],[91,350,1.1],[86,456,.82],[116,532,1.13],[244,506,1.05],[309,559,.86],[452,518,1.15],[563,561,.92],[809,539,1.1],[915,490,1.05],[891,588,1.1],[69,579,1.05],[182,578,.85]];
  const indoor = block(181,145,603,371);
  const foyer = [489,547];
  return {item,themes,recipes,blueprint,lots,districtLots,townTrees,indoor,foyer,block};
})();
