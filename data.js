"use strict";
globalThis.Catalog = (() => {
  const sectors = [
    {name:'Hospitality', icon:'coffee', color:'#e9ad69', input:'Supplies', role:'Guest team', lever:'Premium service', focus:'Bookings', supplier:1, types:['Coffee Shop','Maplebrook Inn','Luxury Hotel Chain','International Resorts'], detail:['Coffee and pastries reward fast service.','Room occupancy depends on housekeeping and reviews.','Premium guests pay for a consistent experience.','International bookings favour strong destination brands.']},
    {name:'Retail', icon:'bag', color:'#ea8c79', input:'Stock', role:'Sales team', lever:'Broader assortment', focus:'Foot traffic', supplier:2, types:['Corner Market','Supermarket','Shopping Centre','Global Retail Network'], detail:['Fresh stock keeps neighbourhood customers returning.','Volume pricing rewards a reliable supplier.','Tenant mix attracts visitors from further away.','Assortment and distribution compete at international scale.']},
    {name:'Logistics', icon:'truck', color:'#6fc5a3', input:'Fuel', role:'Dispatch team', lever:'Express routing', focus:'Deliveries', supplier:6, types:['Courier Depot','Regional Freight','Cargo Airline','Global Logistics Network'], detail:['Dispatchers make the most of limited van capacity.','Route planning cuts empty return trips.','Aircraft inspections protect capacity and punctuality.','Dense networks benefit from cleaner energy and local freight hubs.']},
    {name:'Technology', icon:'chip', color:'#a8a2f2', input:'Compute', role:'Engineering', lever:'Product launches', focus:'Subscriptions', supplier:5, types:['Web Studio','Software House','Telecom Network','Global Technology Platform'], detail:['A small studio earns from local clients and retainers.','Product releases compete for subscription customers.','Network uptime influences long-term adoption.','A global platform needs capacity as much as new users.']},
    {name:'Property', icon:'building', color:'#efb084', input:'Materials', role:'Site crew', lever:'Tenant improvements', focus:'Leases', supplier:5, types:['Repair Garage','Property Agency','Construction Group','International Infrastructure'], detail:['Bay capacity and a trained crew determine turnaround.','Tenant satisfaction keeps units occupied.','Long contracts depend on equipment upkeep.','Public projects reward dependable capacity across regions.']},
    {name:'Manufacturing', icon:'factory', color:'#89b6de', input:'Components', role:'Production crew', lever:'Precision tooling', focus:'Orders', supplier:2, types:['Wood Workshop','Electronics Assembly','Automotive Works','Semiconductor Foundry'], detail:['Local inputs and skilled hands keep waste low.','Distribution links cut the cost of fulfilling orders.','Production targets depend on reliable machinery.','Precision tooling improves yield when component costs rise.']},
    {name:'Energy', icon:'bolt', color:'#ead26f', input:'Parts', role:'Technicians', lever:'Grid storage', focus:'Power contracts', supplier:4, types:['Solar Installer','Community Utility','Renewable Energy Grid','Continental Power Group'], detail:['Crews convert bookings into successful installations.','Maintenance protects local reliability.','Storage reduces losses from supply shocks.','Multi-region contracts favour a well-maintained grid.']},
    {name:'Innovation', icon:'flask', color:'#83d5da', input:'Lab materials', role:'Research team', lever:'Pilot projects', focus:'Licences', supplier:3, types:['Design Lab','Applied Research Lab','Space Technology Works','Innovation Conglomerate'], detail:['Prototype work earns design fees.','Better pilots win larger licensing deals.','Complex equipment needs regular calibration.','Shared computing helps a portfolio of research labs scale.']}
  ];
  const regions = [
    ['Maplebrook','Small town',0,0,1,1,1,[0,1],12,63],
    ['Cedar Junction','Suburban corridor',24000,1800,1.12,1.08,1.06,[1,4],27,46],
    ['Ironhaven','Industrial district',175000,13000,1.24,1.23,1.04,[2,5],43,62],
    ['Port Solace','Coastal destination',1200000,90000,1.37,1.25,1.21,[0,2],57,35],
    ['Circuit Bay','Technology hub',9000000,680000,1.52,1.48,1.42,[3,7],70,55],
    ['Crown Metro','Financial centre',63000000,4700000,1.66,1.65,1.63,[3,4],81,26],
    ['Sunreach','International power corridor',480000000,34000000,1.84,1.76,1.78,[5,6],87,67],
    ['Meridian','Global trade capital',3500000000,260000000,2.05,2,2.1,[2,7],92,40]
  ].map(([name,kind,gate,cost,demand,wages,rent,strength,x,y],id)=>({id,name,kind,gate,cost,demand,wages,rent,strength,x,y}));
  const businesses = sectors.flatMap((s,sector)=>s.types.map((name,tier)=>({
    id:sector*4+tier, name, sector,tier, detail:s.detail[tier],
    cost:Math.round([1300,190000,15500000,850000000][tier]*(.86+sector*.055)),
    gate:[0,210000,8200000,360000000][tier],
    base:Math.round([270,6800,135000,2200000][tier]*(.86+sector*.056)),
    capacity:[12,28,75,160][tier]+sector,
    materials:[.28,.44,.32,.20,.38,.47,.23,.24][sector],
    staff:[.115,.082,.115,.19,.115,.11,.125,.18][sector],
    elasticity:[1.11,1.6,1.05,.86,.98,1.1,.74,.97][sector]
  })));
  const jobs = [
    {name:'Lemonade Stand',icon:'glass',desc:'Choose a batch size to match local demand.', options:['Small batch','Regular batch','Big batch'], payouts:[32,46,58], cost:[0,8,19]},
    {name:'Dog Walking',icon:'paw',desc:'Balance route length and the number of dogs.',options:['Quick loop','Park route','Group walk'],payouts:[45,73,104],cost:[0,0,5]},
    {name:'Bicycle Delivery',icon:'truck',desc:'Pick a neighbourhood route and earn delivery fees.',options:['Local drop','Two stops','Across town'],payouts:[76,112,156],cost:[0,6,15]}
  ];
  const challenges = [
    ['No Loans','Build a billion-dollar group entirely with your own capital.'],
    ['Single Industry','Choose one industry with your first acquisition, then stay in it.'],
    ['Small Town Empire','Operate exclusively out of Maplebrook.'],
    ['Recession Recovery','Start in a prolonged downturn and build a profitable portfolio.'],
    ['Technology Specialist','Open and operate technology businesses exclusively.'],
    ['Hospitality Empire','Open and operate hospitality businesses exclusively.'],
    ['Manufacturing Empire','Open and operate manufacturing businesses exclusively.'],
    ['Sustainable Corporation','Found an energy business and install clean operations at every site.'],
    ['Limited Workforce','Manage with a maximum of two hires per business.'],
    ['International Expansion','Operate businesses in at least six regions to win.']
  ];
  const events = [
    ['Town festival','Hospitality and retail get a boost in demand.',[0,1],1.22,1,'positive'],
    ['Fuel shortage','Logistics and manufacturing pay more for inputs.',[2,5],.96,1.35,'negative'],
    ['Slow quarter','Households defer purchases across most sectors.',[0,1,3,4,5,7],.82,1,'negative'],
    ['Tourism season','Bookings and transport demand are up.',[0,2],1.28,1,'positive'],
    ['Clean power grants','Demand for renewable power is climbing.',[6],1.3,.89,'positive'],
    ['Infrastructure programme','A wave of new construction and energy contracts opens.',[4,6],1.25,1.05,'positive'],
    ['Chip cycle','Technology and labs see brisk demand and pricier components.',[3,7],1.18,1.17,'positive'],
    ['Quiet market','Demand and supplier costs follow seasonal averages.',[],1,1,'neutral'],
    ['Supply disruption','Retail and production need to manage higher input costs.',[1,5],.96,1.22,'negative'],
    ['Business confidence','More clients are ordering professional services.',[2,3,4,7],1.16,1,'positive']
  ];
  const tracks = [
    ['Operations','wrench','Better processes and tools',['Standard Procedures','Predictive Maintenance','Inventory Planning','Shift Scheduling','Flexible Production','Robotic Workcells','Autonomous Operations'],['Lower base overhead','Cut wear penalties','Reduce materials costs','Make small teams more productive','Reduce excess stock and losses','Expand effective capacity','Unlock advanced automation']],
    ['Market insight','chart','Find demand and build loyalty',['Customer Surveys','Demand Forecasts','Local Partnerships','Brand Standards','Dynamic Pricing','Global Brand','Predictive Markets'],['Gain demand','Reveal next market event','Improve contract rewards','Improve satisfaction','Reduce high price penalties','Gain demand in unlocked regions','Reduce competitor pressure']],
    ['Supply chains','truck','Reliable inputs and distribution',['Supplier Directory','Consolidated Orders','Regional Carriers','Regional Warehouses','Sourcing Network','Intermodal Freight','Integrated Supply'],['Cut input costs','Reduce supply shocks','Strengthen logistics links','Open distribution contracts','Reduce inventory costs','Strengthen regional capacity','Unlock corporate supply projects']],
    ['People','users','Train and organise the workforce',['Staff Handbook','Mentorship','Team Leads','Quality Circles','Skills Academy','Shared Services','Executive Office'],['Reduce wage pressure','Boost training','Improve management','Raise satisfaction','Increase worker output','Cut office costs','Unlock portfolio operations project']],
    ['Sustainability','bolt','Produce more with less',['Energy Audit','Efficient Equipment','Renewable Procurement','Heat Recovery','Grid Storage','Circular Materials','Clean Operations'],['Cut upkeep','Lower wear','Improve power links','Lower operating costs','Reduce shock exposure','Cut waste','Unlock green infrastructure project']],
    ['Finance','coins','Stronger cash management',['Cash Forecasts','Credit Review','Budget Controls','Risk Office','Capital Markets','Portfolio Reporting','Corporate Treasury'],['Unlock property investment','Lower interest','Reduce overhead','Improve emergency options','Increase credit limit','Improve asset value','Unlock corporate finance project']],
    ['Expansion','world','Build across regions',['Market Entry','Franchise Guide','Regional Offices','Cross-Border Teams','Acquisition Review','Trade Agreements','Global Headquarters'],['Reduce regional permits','Unlock franchise deals','Raise regional demand','Reduce remote wage costs','Unlock merger planning','Improve overseas contracts','Unlock global leadership project']],
    ['Innovation','flask','Develop and license new technology',['Prototyping','Product Analytics','Lab Partnerships','Rapid Iteration','Advanced Computing','Intellectual Property','Frontier Projects'],['Boost technology products','Gain demand for innovation','Open research contracts','Improve research efficiency','Increase effective capacity','Increase licensing margins','Unlock frontier research project']]
  ];
  const research=tracks.flatMap(([name,icon,desc,items,effects],branch)=>items.map((title,level)=>({id:branch*7+level,title,branch,level,effect:effects[level],gate:[0,7000,65000,560000,5500000,54000000,460000000][level],cost:[350,1700,13000,98000,750000,5800000,44000000][level],points:[1,2,4,7,12,20,30][level]})));
  const milestones=[100,10000,100000,1000000,10000000,100000000,1000000000,10000000000,100000000000,1000000000000,10000000000000];
  return {sectors,regions,businesses,jobs,challenges,events,tracks,research,milestones};
})();
