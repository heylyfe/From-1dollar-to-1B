"use strict";
globalThis.WorldRenderer = (() => {
  const O=Operations,F=FieldData;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const shade=(hex,f)=>{
    const n=parseInt(hex.slice(1),16);
    const channel=bits=>clamp(Math.round(((n>>bits)&255)*f),0,255);
    return 'rgb('+channel(16)+','+channel(8)+','+channel(0)+')';
  };
  function hash(a,b){return ((Math.imul(a,73856093)^Math.imul(b,19349663))>>>0)%1009/1009;}
  function create(canvas){
    let cx=canvas.getContext('2d',{alpha:false});
    let ground=null,groundKey='';
    const camera={x:O.W/2,y:O.H/2,z:1,w:1,h:1,dpr:1,scene:''};
    const fill=(x,y,w,h,c)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h);};
    function ellipse(x,y,rx,ry,c){
      cx.fillStyle=c;cx.beginPath();cx.ellipse(x,y,rx,ry,0,0,Math.PI*2);cx.fill();
    }
    function poly(pts,c){
      cx.fillStyle=c;cx.beginPath();cx.moveTo(pts[0][0],pts[0][1]);
      for(let i=1;i<pts.length;i++)cx.lineTo(pts[i][0],pts[i][1]);
      cx.closePath();cx.fill();
    }
    function rounded(x,y,w,h,r,c,s=null){
      cx.beginPath();cx.roundRect(x,y,w,h,r);cx.fillStyle=c;cx.fill();
      if(s){cx.strokeStyle=s;cx.lineWidth=1.2;cx.stroke();}
    }
    function line(points,color,w=2,dash=[]){
      cx.strokeStyle=color;cx.lineWidth=w;cx.lineCap='round';cx.lineJoin='round';cx.setLineDash(dash);cx.beginPath();
      cx.moveTo(points[0][0],points[0][1]);
      for(let i=1;i<points.length;i++)cx.lineTo(points[i][0],points[i][1]);
      cx.stroke();cx.setLineDash([]);
    }
    const circle=(x,y,r,c)=>ellipse(x,y,r,r,c);
    function text(str,x,y,size,color,weight=700,align='center'){
      cx.font=weight+' '+size+'px "DM Sans", system-ui, sans-serif';cx.textAlign=align;cx.textBaseline='middle';cx.fillStyle=color;cx.fillText(str,x,y);
    }

    function tree(x,y,s,t,seed=1){
      ellipse(x+7*s,y+4*s,27*s,10*s,'#36503936');
      fill(x-3*s,y-20*s,7*s,25*s,'#795d46');
      fill(x+1*s,y-17*s,3*s,22*s,'#634d3e');
      const deep=t.deep,light=t.foliage;
      circle(x+12*s,y-21*s,17*s,deep);
      circle(x-13*s,y-24*s,17*s,deep);
      circle(x,y-36*s,23*s,deep);
      circle(x-10*s,y-37*s,17*s,light);
      circle(x+7*s,y-42*s,18*s,shade(light,1.14));
      circle(x+15*s,y-26*s,14*s,light);
      circle(x-19*s,y-24*s,10*s,shade(light,1.05));
      circle(x-2*s,y-24*s,17*s,shade(light,1.11));
      for(let i=0;i<6;i++){
        const a=hash(i+seed,23),b=hash(i+seed,91);
        ellipse(x+(a-.5)*35*s,y-(19+b*29)*s,2.4*s,1.1*s,'#d5e4aa48');
      }
    }
    function planter(x,y,kind=0){
      rounded(x-13,y-7,26,11,3,'#9c7258');rounded(x-13,y-10,26,8,3,'#574f37');
      for(let i=0;i<4;i++){
        const px=x-9+i*6;circle(px,y-10-(i%2)*3,5,'#678251');
        circle(px+.5,y-13-(i%2)*3,2.1,kind?'#edc165':'#e99e8d');
      }
    }
    function paving(x,y,w,h,t,kind=0){
      rounded(x,y+4,w,h,10,shade(t.path,.84));rounded(x,y,w,h,10,t.path);
      const a=kind?'#b5a68b53':'#c3ab8563';
      cx.save();cx.beginPath();cx.roundRect(x,y,w,h,10);cx.clip();
      for(let j=y+12,n=0;j<y+h;j+=16,n++){
        line([[x,j],[x+w,j]],a,.7);
        for(let i=x+(n%2)*13;i<x+w;i+=26)line([[i,j-16],[i,j]],a,.65);
      }
      cx.restore();
    }
    function scenery(s){
      const t=s.map.theme;
      fill(0,0,960,640,t.grass);
      fill(0,0,960,150,t.sky);
      poly([[0,108],[72,82],[116,95],[177,57],[238,83],[298,58],[374,93],[448,64],[515,106],[580,75],[639,87],[710,58],[775,92],[839,58],[909,87],[960,72],[960,163],[0,163]],shade(t.lighter,.94));
      poly([[0,131],[99,103],[152,126],[254,101],[326,125],[408,102],[468,122],[576,102],[650,115],[752,93],[804,124],[882,101],[960,113],[960,185],[0,185]],shade(t.grass,.97));
      for(let i=0;i<44;i++){
        const x=(i*31+hash(i,3)*27)%960,y=117+hash(i,80)*38;
        const a=.4+hash(i,55)*.33;
        poly([[x-10*a,y],[x,y-42*a],[x+13*a,y]],i%3===0?shade(t.foliage,.91):shade(t.grass,.87));
        poly([[x,y-42*a],[x+13*a,y],[x+2*a,y]],shade(t.deep,1.10));
      }
      fill(0,153,960,14,shade(t.grass,.96));
      for(let i=0;i<370;i++){
        const x=hash(i,410)*960,y=157+hash(i,216)*483;
        const lighter=hash(i,701)>.37;
        if(lighter)ellipse(x,y,2+hash(i,19)*4,1.1,'#e0e9a94b');
        else line([[x-2,y],[x,y-3],[x+1,y]],'#55855a7a',.8);
      }
      if(!s.site){
        fill(0,584,960,56,'#726f69');
        fill(0,589,960,5,shade(t.road,1.27));
        fill(0,596,960,44,t.road);
        line([[0,620],[960,620]],'#f9e6aa',2,[25,23]);
        fill(0,575,960,11,shade(t.path,1.03));
        for(let i=20;i<960;i+=24)line([[i,577],[i,585]],'#a79270a2',1);
        if(s.map.starters){
          paving(120,306,768,101,t);
          paving(208,237,386,129,t);
          paving(122,381,128,126,t);
          paving(342,396,320,113,t);
          paving(690,231,216,167,t);
          paving(712,471,117,105,t);
          paving(302,184,144,78,t);
          paving(587,188,85,159,t);
          paving(440,509,64,75,t);
          garden(617,374,t);
          planter(574,328);planter(219,294,1);planter(609,447,1);planter(682,298);planter(697,512,1);
          line([[109,420],[109,467]],shade(t.deep,1.1),3,[3,9]);
          cottage(156,247,88,59,'#e6bb8f','#bf826f');
          cottage(877,218,72,49,'#ead0a6','#b67a62');
          cottage(365,500,52,39,'#e7cea2','#bd8273');
          cottage(592,486,54,40,'#e2d0a7','#87a383');
          rounded(819,287,68,28,7,'#b8c5b5');
          for(let i=0;i<8;i++)fill(820+i*8.3,288,7,13,i%2?'#91b7bf':'#f0e2ba');
          fill(822,300,4,13,'#627e74');fill(879,300,4,13,'#627e74');
        }else{
          paving(159,203,650,323,t,1);
          paving(425,496,101,87,t,1);
          paving(80,340,800,60,t);
          if([3,7,2].includes(s.region)){
            fill(0,172,139,395,t.water);
            for(let i=0;i<28;i++){
              const x=10+hash(i,66)*110,y=185+i*13;
              line([[x,y],[x+12,y]],'#c8efdf7d',1.6);
            }
            paving(45,265,135,65,t);
            paving(61,453,110,54,t);
          }
          for(let i=0;i<7;i++)planter(208+i*91,351,i%2);
          if(s.region===1)for(let i=0;i<4;i++)shopAwning(282+i*137,186,54,i%2?'#c494aa':'#d6a76b');
          if(s.region===2){
            for(const y of [187,201])line([[150,y],[827,y]],'#786f63',2.5);
            for(let x=151;x<828;x+=13)fill(x,181,4,25,'#8c7b615c');
            for(let i=0;i<4;i++)crate(818+(i%2)*17,216+Math.floor(i/2)*15,'#a88567');
          }
          if(s.region===3){
            line([[21,285],[153,285],[153,407]],'#e2bd8d',12);
            for(let i=0;i<5;i++)ellipse(72+i*12,317+i*23,11,4,['#f7d38e','#b87f76','#ebd7b1'][i%3]);
          }
          if(s.region===4){
            for(let x=207;x<800;x+=34){line([[x,165],[x+12,198]],'#81aeac',1.6);circle(x+12,198,2.5,'#e8e2a1');}
          }
          if(s.region===5){
            for(let i=0;i<4;i++)garden(271+i*147,189,t);
          }
          if(s.region===6){
            for(let i=0;i<6;i++){
              const x=214+i*105;
              rounded(x,171,49,20,4,'#617d85');
              for(let j=0;j<4;j++)fill(x+3+j*11,173,10,14,'#89b0b8');
            }
          }
          if(s.region===7){
            for(let i=0;i<5;i++){
              const x=222+i*119;
              rounded(x,169,54,23,4,['#b78567','#7d9e8e','#b29670'][i%3]);
              for(let j=1;j<7;j++)line([[x+j*7,171],[x+j*7,188]],'#4b66583a',1.4);
            }
          }
        }
      }
    }
    function garden(x,y,t){
      ellipse(x,y+8,41,16,'#856e5440');
      ellipse(x,y,42,19,'#dfc7a3');ellipse(x,y,36,14,t.foliage);
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6;
        circle(x+Math.cos(a)*27,y+Math.sin(a)*11,2.2,i%3?'#edb676':'#f4db8c');
      }
      ellipse(x,y+2,14,7,'#5f9388');ellipse(x,y,14,6,'#9dcfd0');ellipse(x,y-2,9,3,'#c3e0ce');
      circle(x,y-5,2,'#eff4df');
    }
    function cottage(x,y,w,h,wall,roof,signed=false){
      const left=x-w/2,top=y-h/2;
      ellipse(x+9,y+h/2+3,w*.62,h*.22,'#48524530');
      rounded(left,top+10,w,h,5,wall,'#74594954');
      fill(left,top+h-6,w,15,shade(wall,.84));
      poly([[left-6,top+15],[left+w*.47,top-19],[left+w+6,top+15],[left+w+2,top+21],[left-3,top+21]],roof);
      poly([[left+w*.47,top-19],[left+w+6,top+15],[left+w+2,top+21],[left+w*.47,top-9]],shade(roof,.77));
      line([[left+3,top+12],[left+w*.47,top-16]],shade(roof,1.25),2);
      rounded(x-8,top+h-11,16,21,3,'#55776b');
      fill(x-4,top+h-9,8,8,'#bad5b2');
      for(const u of [left+9,left+w-24]){
        rounded(u,top+29,15,12,2,'#927961');fill(u+2,top+31,11,8,'#f2d589');line([[u+7,top+31],[u+7,top+39]],'#b78157',1);
      }
      if(signed)rounded(x-19,top+23,38,6,2,'#f2ddba');
    }
    function interior(s){
      const m=s.map,{theme:t,recipe:r}=m,ext=m.ext;
      const frame=F.indoor; const flip=x=>m.business&&O.record(s,m.business).layout?960-x:x;
      let annexX=flip(782+ext*20);
      if(ext){
        const left=Math.min(annexX-40,annexX+40);
        paving(left,195,110+(ext-1)*14,252,t);
        fill(left,188,110+(ext-1)*14,14,r.back);
        line([[left,196],[left+110+(ext-1)*14,196]],shade(r.back,1.26),3);
      }
      rounded(frame.x-9,frame.y+7,frame.w+17,frame.h+7,17,'#594c386b');
      rounded(frame.x,frame.y,frame.w,frame.h,12,r.floor);
      cx.save();cx.beginPath();cx.roundRect(frame.x,frame.y,frame.w,frame.h,12);cx.clip();
      for(let y=frame.y+16,j=0;y<frame.y+frame.h;y+=21,j++){
        line([[frame.x,y],[frame.x+frame.w,y]],shade(r.floor,.92),.7);
        for(let x=frame.x+(j%2)*22;x<frame.x+frame.w;x+=44)line([[x,y-21],[x,y]],shade(r.floor,.94),.7);
      }
      cx.restore();
      rounded(frame.x-3,frame.y-12,frame.w+6,29,7,r.back,'#574e4655');
      fill(frame.x,frame.y+4,frame.w,11,shade(r.back,.81));
      fill(frame.x-14,frame.y+15,18,frame.h-20,shade(r.back,.89));
      fill(frame.x-11,frame.y+15,4,frame.h-20,shade(r.back,1.19));
      for(let i=0;i<7;i++){
        const x=223+i*81;
        rounded(x,frame.y-5,43,15,3,shade(r.back,.78));
        rounded(x+4,frame.y-3,35,10,2,'#a7cfc4');
        fill(x+19,frame.y-2,3,8,'#e4dfc0');
      }
      rounded(438,501,72,36,7,shade(r.back,.83));
      rounded(443,508,62,25,5,shade(r.floor,.96));
      for(let i=0;i<6;i++)line([[451+i*9,511],[451+i*9,530]],'#fff3cd69',1);
      for(const [x,y,k] of [[210,195,1],[746,202,0],[742,471,1],[354,473,0]])planter(x,y,k);
      if(s.mode==='hotel'){
        for(let i=0;i<3;i++){
          const x=flip(566+i*65), y=309;
          rounded(x-23,y-16,45,41,4,'#b98e80');
          rounded(x-17,y-13,34,28,4,i%2?'#a9c2cc':'#d3a39b');
          fill(x-12,y-11,24,8,'#fcf0d7');
          fill(x-17,y+14,34,5,'#907c73');
        }
      }
      if(s.mode==='retail'){
        for(const [x,y] of [[385,362],[455,363],[524,362]]) {
          rounded(flip(x)-16,y-10,32,20,4,'#b88d60');fill(flip(x)-13,y-7,26,6,'#f2dec2');
          for(let i=0;i<3;i++)rounded(flip(x)-12+i*8,y-8,7,5,1,['#9cb46b','#d88d61','#e5b751'][i]);
        }
      }
      if(['factory','logistics','energy'].includes(s.mode)){
        line([[206,322],[704,322],[704,454]],'#f9e1a5',3,[9,8]);
        line([[206,340],[687,340],[687,454]],'#f9e1a5',2,[9,8]);
      }
      if(['restaurant','tech','lab'].includes(s.mode)){
        rounded(335,306,201,105,17,'#8ba89844');
        for(let i=0;i<8;i++)line([[342+i*24,314],[342+i*24,401]],'#fbf1d72e',1);
      }
    }

    function construction(x,y,kind,progress=1){
      rounded(x-37,y-26,74,47,8,'#bca281');
      rounded(x-33,y-23,66,38,5,progress<1?'#bc8d61':'#d9bf95');
      if(progress>=1){
        cx.strokeStyle='#fbedd2';cx.lineWidth=1.4;cx.setLineDash([5,4]);cx.strokeRect(x-28,y-17,56,26);cx.setLineDash([]);
      }
      for(const u of [-33,24]){
        poly([[x+u,y+15],[x+u+9,y+15],[x+u+6,y+4],[x+u+3,y+4]],'#d99452');
        fill(x+u+1,y+11,7,2,'#ffe6bd');
      }
      rounded(x-13,y-15,26,19,4,'#edc35f','#a07f50');
      if(progress<1){
        const sway=Math.sin(progress*17)*7;
        line([[x+19,y-37],[x+19,y+5]],'#826b56',3);
        line([[x-13,y-35],[x+28,y-35]],'#8a7352',3);
        line([[x+sway,y-35],[x+sway,y-20]],'#735f54',1);
        rounded(x+sway-5,y-21,11,6,1,'#e8ba63');
        rounded(x-24,y+18,48,6,2,'#846e58');rounded(x-24,y+18,48*progress,6,2,'#f7d36b');
      }else{
        line([[x-4,y-5],[x+4,y-5]],'#765939',2);
        line([[x,y-9],[x,y-1]],'#765939',2);
      }
    }
    function crate(x,y,c='#bd8c58',w=16,h=14){
      rounded(x,y,w,h,2,c,'#644a395b');
      fill(x+1,y+1,w-2,3,shade(c,1.27));
      line([[x+3,y+5],[x+3,y+h-2]],shade(c,.82),1);
      line([[x+w-4,y+5],[x+w-4,y+h-2]],shade(c,.83),1);
    }
    function shopAwning(x,y,w,base='#e8b869'){
      ellipse(x+6,y+13,w*.56,10,'#725e4f35');
      fill(x-w/2+6,y-17,w-12,31,'#d8ac72');
      fill(x-w/2+8,y+3,w-16,9,'#f4d899');
      for(let i=0;i<10;i++){
        const left=x-w/2+i*w/10,c=i%2?'#eee2b1':base;
        poly([[left+3,y-42],[left+w/10+2,y-42],[left+w/10,y-17],[left,y-17]],c);
        rounded(left,y-21,w/10+1,9,2,shade(c,.93));
      }
      line([[x-w/2+4,y-43],[x+w/2-2,y-43]],shade(base,.83),2.5);
      line([[x-w/2+8,y-13],[x-w/2+8,y+12]],'#896b44',2.3);
      line([[x+w/2-8,y-13],[x+w/2-8,y+12]],'#896b44',2.3);
    }
    const machineArt=new Set(['mixer','stove','laundry','mill','belt','server','solar','grid','lab','rig','fridge']);
    const mat={
      lemon:['#ae8150','#e9c248'],stove:['#677e7c','#e18b67'],laundry:['#93a5a6','#d3dbd0'],
      mill:['#839377','#c3b77b'],belt:['#778c82','#b4a679'],server:['#798997','#8ed0be'],solar:['#6d909d','#93b9ca'],
      grid:['#80917d','#e4bd66'],lab:['#7e9899','#ddd49e'],rig:['#7e9c9c','#aba5cb'],fridge:['#87a1a8','#cce4d5']
    };
    function vehicle(x,y,c='#c17b62',truck=false,face=1){
      cx.save();cx.translate(x,y);cx.scale(face,1);
      ellipse(2,10,truck?34:25,8,'#3e49494b');
      for(const u of [-17,16]){rounded(u-3,-9,6,18,2,'#4b4d49');}
      rounded(-25,-12,50,22,7,shade(c,.80));rounded(-23,-13,47,17,7,c);
      rounded(-9,-12,25,16,4,'#f6ddba');
      poly([[-8,-10],[4,-10],[7,2],[-9,2]],'#84aea8');
      rounded(10,-11,8,14,3,'#8ea9a1');
      if(truck){rounded(-32,-14,28,18,4,'#edd6ac');line([[-28,-8],[-7,-8]],'#bda883',1.2);line([[-28,-3],[-7,-3]],'#bda883',1.2);}
      fill(20,-9,4,5,'#f8db78');fill(20,0,4,4,'#f8db78');
      fill(-23,-9,3,4,'#d56f5b');fill(-23,1,3,4,'#d56f5b');
      cx.restore();
    }
    function station(s,st,active){
      const {x,y,art}=st;
      const b=st.kind!=='action'&&st.kind!=='decor'?O.buffer(s,st):null;
      if(active||s.focus===st){
        const alpha=.36+Math.sin(s.time*4)*.08;
        const c='rgba(255,246,193,'+alpha+')';
        ellipse(x,y+15,33,16,c);
        cx.strokeStyle=active?'#fff0a5':'#fff8d4';cx.lineWidth=2;
        cx.beginPath();cx.ellipse(x,y+11,31,17,0,0,Math.PI*2);cx.stroke();
      }
      if(art==='lemonade'){
        shopAwning(x,y,70,'#e8aa48');
        for(let i=0;i<3;i++){rounded(x-20+i*10,y-7,8,12,2,'#f2e8b9');fill(x-19+i*10,y-5,6,7,'#eab448');}
        circle(x+16,y-3,5,'#f5cd49');
      }else if(art==='lemon'||art==='stack'||art==='ore'||art==='pallet'||art==='pantry'||art==='soap'||art==='hamper'){
        const type=F.item[st.out]?.[1]||'#b78c66';
        ellipse(x,y+9,29,9,'#6d594342');rounded(x-26,y-10,52,17,3,'#9d7d54');
        fill(x-25,y-13,50,6,'#c7a478');
        for(let i=0;i<3;i++)crate(x-22+i*15,y-17-(i%2)*6,type,14,18);
        if(art==='lemon'){for(let i=0;i<8;i++)circle(x-19+i*5,y-15+(i%3)*3,3,i%2?'#e8b242':'#ffdc63');}
      }else if(art==='wash'||art==='dock'){
        rounded(x-34,y-18,68,36,9,art==='wash'?'#a8bcc1':'#a79e89','#716e61a8');
        line([[x-30,y-14],[x+29,y-14],[x+29,y+13],[x-30,y+13],[x-30,y-14]],'#f8e2a7',1.7,[6,4]);
        if(art==='wash'){
          poly([[x-17,y+2],[x+4,y+2],[x-2,y-4],[x+10,y-4],[x+17,y+5],[x+7,y+7],[x+7,y+14],[x+1,y+14],[x+1,y+7],[x-17,y+7]],'#658d96');
          if(s.wash){for(let i=0;i<9;i++)circle(x+19+hash(i,66)*29,y+Math.sin(s.time*8+i)*12,2+hash(i,19)*3,'#e7f4ef');}
        }else for(let i=0;i<3;i++)crate(x-21+i*14,y-11,'#b48961',13,13);
      }else if(art==='porch'||art==='exit'||art==='door'){
        rounded(x-20,y-15,40,26,5,'#a08466');
        rounded(x-17,y-17,34,25,4,'#e9d7a8');
        fill(x-7,y-16,14,20,art==='porch'?'#a76e62':'#537c69');fill(x-4,y-12,8,8,'#a9c8a1');
        fill(x-17,y+7,34,4,'#cbbc91');
        if(art==='porch'){
          circle(x+13,y-11,ready(s,st)?5:2,ready(s,st)?'#ffe39a':'#c0a175');
          ellipse(x,y+19,13,3,'#9e8760');
        }
      }else if(art==='build'){
        if(!st.id.startsWith('lot')){const phase=s.map.business?O.record(s,s.map.business).fitout:0;construction(x,y,'pad',phase>0?1-phase/3.5:1);}
      }else if(art==='bus'){
        rounded(x-21,y-17,42,26,5,'#739b87','#477763');
        fill(x-18,y-16,36,11,'#b3d0b2');fill(x-15,y-5,5,14,'#537b68');fill(x+8,y-5,5,14,'#537b68');
        text('BUS',x,y-10,8,'#386250',900);
      }else if(art==='tools'||art==='office'||art==='sign'){
        rounded(x-17,y-13,34,22,5,art==='office'?'#829887':'#bd965f','#7d6950');
        fill(x-15,y-12,30,6,'#e0bc8b');
        if(art==='tools'){line([[x-7,y+2],[x+6,y-8]],'#655a50',3);circle(x+6,y-7,3.5,'#655a50');}
        else line([[x-9,y],[x+9,y]],'#f4ddb5',1.5);
      }else if(machineArt.has(art)){
        const [body,trim]=mat[art]||['#a8a47d','#e1c578'];
        ellipse(x+4,y+12,30,8,'#7c6c593e');
        rounded(x-27,y-20,54,36,6,body,'#685e57a0');rounded(x-25,y-23,50,30,5,shade(body,1.17));
        fill(x-24,y-6,48,10,trim);
        for(let i=0;i<3;i++){
          if(['laundry','mixer','lab','stove'].includes(art)){
            circle(x-15+i*15,y-11,6.5,shade(body,.72));circle(x-15+i*15,y-11,4.5,i%2?'#acc4b2':trim);
          }else{
            rounded(x-21+i*15,y-17,12,9,2,shade(body,.71));
            fill(x-19+i*15,y-15,3,3,b?.input?'#f2ca72':'#acc3ae');
          }
        }
        if(b?.input){const pulse=(s.time*2.5)%1;fill(x-22,y+9,44,4,shade(body,.64));fill(x-22,y+9,44*pulse,4,'#edce78');}
        if(b?.output)crate(x+13,y-23,'#d4ac71',12,11);
      }else if(art==='bed'||art==='annex'){
        rounded(x-28,y-18,56,35,7,'#9b8581');
        for(let i=0;i<2;i++){
          const a=x-23+i*25;
          rounded(a,y-16,21,29,3,i?'#b5cbc8':'#ccaaad');fill(a+2,y-14,17,8,'#f5e6c8');
        }
      }else if(art==='robot'){
        rounded(x-12,y-14,24,24,6,'#779994');rounded(x-9,y-10,18,12,3,'#4d706c');
        circle(x-4,y-4,2,'#d9d684');circle(x+4,y-4,2,'#d9d684');
      }else{
        const colors={checkout:'#9f9580',shelf:'#b3885e',table:'#bc8b70',reception:'#ad8f7d',board:'#799284',desk:'#9b958a',launch:'#859492',bench:'#a3896e'};
        const c=colors[art]||'#ac9876';
        ellipse(x,y+12,29,9,'#68574334');rounded(x-27,y-11,54,23,5,c,'#725b4e68');rounded(x-25,y-16,50,17,4,shade(c,1.21));fill(x-24,y+8,48,4,shade(c,.77));
        const isDesk=['launch','desk','checkout','board','reception'].includes(art);
        const goods=art==='shelf'?Math.min(3,O.buffer(s,s.map.stations.find(q=>q.id===st.passTo)).input):3;
        for(let i=0;i<(isDesk?1:goods);i++){
          const ox=isDesk?-8:-19+i*14;
          rounded(x+ox,y-16,isDesk?16:11,10,2,isDesk?'#607b78':i%2?'#dbae66':'#e5cf95');
          if(isDesk)fill(x+ox+2,y-14,12,5,'#a2c2b1');
        }
        if(art==='table')for(const u of [-21,15])circle(x+u,y+16,5,'#977763');
      }
      if(b?.input>0&&(st.kind==='service'||st.kind==='stock')){
        const col=F.item[st.input]?.[1]||'#f0d467';
        for(let i=0;i<Math.min(6,b.input);i++)rounded(x-16+i*6,y-4,4,6,1,col);
      }
    }
    function ready(s,st){return s.npcs.some(n=>n.service===st.id&&n.rank===0&&n.phase==='queue');}

    function person(p,isPlayer,s){
      if(p.car){vehicle(p.x,p.y,p.color,p.service!=='wash',p.dir===3?-1:1);return;}
      const x=p.x,y=p.y,walking=p.moving,bob=walking?Math.sin(p.anim*14)*1.2:0;
      const feet=walking?Math.sin(p.anim*14)*3.1:0;
      const choose=isPlayer?'#735d55':p.color;
      const skin=isPlayer?'#e9b68d':['#e4b291','#c48764','#efc39c'][p.id%3]||'#e4b291';
      ellipse(x+1,y+1,9,3.9,'#3f4c373f');
      fill(x-5,y-5+feet,4,6,'#584b49');fill(x+1,y-5-feet,4,6,'#584b49');
      rounded(x-7,y-16+bob,14,12,4,isPlayer?'#d98753':choose,'#52484039');
      rounded(x-8,y-25+bob,16,12,5,skin,'#634d4248');
      rounded(x-8,y-26+bob,16,6,4,p.worker?'#93aa64':isPlayer?'#604b43':'#655449');
      if(isPlayer){
        rounded(x-7,y-26+bob,14,4,2,'#80644f');
        fill(x+(p.dir===3?-8:4),y-24+bob,5,3,'#80644f');
      }
      if(p.dir===2){fill(x-4,y-19+bob,2,2,'#4b443d');fill(x+3,y-19+bob,2,2,'#4b443d');}
      if(p.dir===1||p.dir===3)fill(x+(p.dir===1?4:-5),y-19+bob,2,2,'#4b443d');
      if(isPlayer&&p.count>4&&(s.map.business?.up[0]||Math.max(...s.g.tools))>=2){
        rounded(x-14,y-2,27,9,3,'#91a386','#605b49');
        circle(x-10,y+8,3,'#514c43');circle(x+8,y+8,3,'#514c43');
      }
      if(p.count){
        const c=F.item[p.item]?.[1]||'#d9b87d';
        const xx=p.dir===3?-14:p.dir===1?5:-6, yy=p.dir===0?-27:-12;
        const layers=Math.min(3,p.count);
        for(let i=0;i<layers;i++)crate(x+xx-i*.5,y+yy+bob-i*4,c,11,8);
      }
      if(isPlayer){
        poly([[x-4,y-36+bob],[x+4,y-36+bob],[x,y-31+bob]],'#fff7da');
        circle(x,y-41+bob,2.2,'#fff8dd');
      }else if(p.phase==='queue'&&p.rank===0){
        rounded(x-6,y-40,12,10,4,(p.wait>22?'#edaa83':'#fff4d5'));
        text(p.wait>22?'!':'·',x,y-35,11,'#71563f');
      }
    }

    function lot(s,l){
      const {x,y,site}=l;
      const rec=site?O.record(s,site):null;
      if(!site||rec.eta>0){
        construction(x,y,'lot',site?1-rec.eta/(5+Catalog.businesses[site.type].tier*3):1);
        return;
      }
      const d=Catalog.businesses[site.type],sector=Catalog.sectors[d.sector],r=s.map.theme;
      const f=Math.min(4,site.up[1]);
      cottage(x,y-5,74+f*5,45+f*6,shade(r.path,.91),sector.color,true);
      if(d.sector===0&&d.tier===0)shopAwning(x,y+11,44,'#a5ac74');
      if(d.sector===5||d.sector===6){
        fill(x+19,y-36,8,24,'#927965');fill(x+18,y-37,10,4,'#d5b189');
      }
      if(f>=2)planter(x-43,y+18,1);
      if(site.up[7])circle(x+33,y+14,3.5,'#90da8f');
    }
    function label(p,str,kind='place'){
      cx.font='800 10px "DM Sans", system-ui, sans-serif';
      const w=Math.min(170,cx.measureText(str).width+16);
      const y=p.y;
      const color=kind==='focus'?'#315a46':kind==='job'?'#f6d980':'#fffae8';
      const ink=kind==='focus'?'#fffae5':kind==='job'?'#694e30':'#4e5a47';
      rounded(p.x-w/2,y-7,w,14,5,color,'#76684a45');
      text(str,p.x,y,9.4,ink,800);
    }
    function draw(s,dt,opts={}){
      const width=canvas.clientWidth,height=canvas.clientHeight;
      if(!width||!height)return;
      const dpr=clamp(globalThis.devicePixelRatio||1,1,2);
      if(camera.w!==width||camera.h!==height||camera.dpr!==dpr){
        camera.w=width;camera.h=height;camera.dpr=dpr;
        canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      }
      const base=Math.max(width/960,height/640);
      const factor=width<620?1.08:1;
      const z=base*factor;
      const fixed=(v,viewport,world)=>viewport/z>=world?world/2:clamp(v,viewport/(2*z),world-viewport/(2*z));
      const tx=fixed(s.player.x,width,960),ty=fixed(s.player.y-32,height,640);
      const key=s.region+':'+s.site+':'+s.lotPage;
      const ease=opts.motion===false||camera.scene!==key?1:1-Math.exp(-dt*12);
      camera.scene=key;camera.z=z;
      camera.x+=(tx-camera.x)*ease;camera.y+=(ty-camera.y)*ease;
      cx.setTransform(dpr,0,0,dpr,0,0);
      fill(0,0,width,height,s.map.theme.grass);
      cx.translate(width/2,height/2);cx.scale(z,z);cx.translate(-camera.x,-camera.y);
      const groundId=key+':'+s.map.ext+':'+(s.map.business?O.record(s,s.map.business).layout:0)+':'+s.map.starters;
      if(typeof OffscreenCanvas==='function'){
        if(groundKey!==groundId){
          ground=new OffscreenCanvas(960,640);groundKey=groundId;
          const live=cx;cx=ground.getContext('2d',{alpha:false});
          scenery(s);if(s.site)interior(s);cx=live;
        }
        cx.drawImage(ground,0,0);
      }else{
        scenery(s);if(s.site)interior(s);
      }
      const markers=[];
      const targets=[];
      let target=opts.guide||null;
      if(s.player.path?.length){
        const points=[[s.player.x,s.player.y],...s.player.path.map(p=>[p.x,p.y])];
        line(points,'#fff8cc92',3,[5,8]);
      }
      for(const t of s.map.trees)targets.push([t.y,()=>tree(t.x,t.y,t.z,s.map.theme,Math.floor(t.x))]);
      for(const l of s.map.lots)targets.push([l.y+20,()=>lot(s,l)]);
      for(const st of s.map.stations){
        targets.push([st.y+12,()=>station(s,st,st.id===target?.id)]);
        if(st.kind==='service'&&ready(s,st)){
          const a=st.queue;
          ellipse(a[0],a[1]+6,15,5,'#f4d99391');
        }
      }
      for(const p of s.npcs)targets.push([p.y+1,()=>person(p,false,s)]);
      for(const p of s.workers)targets.push([p.y+1,()=>person(p,false,s)]);
      targets.push([s.player.y+1,()=>person(s.player,true,s)]);
      targets.sort((a,b)=>a[0]-b[0]);for(const [,paint] of targets)paint();
      if(!s.site&&!opts.still){
        const x=((s.time*41)%1120)-80;
        vehicle(x,616,'#a9af79',false);
      }
      if(s.map.starters){
        label({x:430,y:224},'LEMONADE STAND','job');
        label({x:827,y:248},'CAR WASH','job');
        label({x:171,y:454},'PARCEL DEPOT','job');
        if(!s.g.businesses.length)label({x:620,y:171},'BUILD YOUR FIRST SHOP');
      }
      const selected=s.focus&&s.focus.kind!=='decor'?s.focus:target;
      if(selected&&!['serve','wash','parcels','annex-lemon'].includes(selected.id)){
        markers.push([selected.x,selected.y-37,selected.title]);
      }
      for(const [x,y,str] of markers)label({x,y},str,'focus');
      for(const f of s.popups){
        const y=f.y-(1.25-f.time)*24;
        cx.globalAlpha=clamp(f.time*2,0,1);rounded(f.x-22,y-8,44,16,4,'#4b8064');text('+$'+(f.amount/100).toFixed(2),f.x,y,9,'#fff5d8',850);cx.globalAlpha=1;
      }
    }
    function worldPoint(x,y){
      return {x:(x-camera.w/2)/camera.z+camera.x,y:(y-camera.h/2)/camera.z+camera.y};
    }
    return {draw,worldPoint};
  }
  return {create};
})();
