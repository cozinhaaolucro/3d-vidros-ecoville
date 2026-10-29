(function(root){
 'use strict';
 const Materials=typeof module!=='undefined'&&module.exports?require('./materials.js'):root.BoxMaterials;
 function model(family,opening,selection={},config={}){
  if(!['f1','abrir','canto','flex','bt3','duo-safe'].includes(family))throw new Error('Modelo de box sem geometria específica: '+family);
  const chosen=Materials.selection(selection.glass,selection.finish),glass=Materials.glasses[chosen.glass],finish=Materials.finishes[chosen.finish];
  const k=Math.max(0,Math.min(1,opening)), faces=[], lines=[];
  const line=(a,b,color='#b7c8c0',width=1,material=null)=>lines.push({a,b,color,width,material,group:material?'finish':null});
  const pane=(a,b,h)=>{faces.push({points:[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],h,b[1]],[a[0],h,a[1]]],fill:glass.fill,stroke:glass.edge,material:glass,group:'glass'});};
  const bar=(a,b)=>line(a,b,finish.color,7,finish);
  const block=(x0,y0,z0,x1,y1,z1,material=finish,part='profile')=>{
   const P=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
   for(const [ids,normal] of [[[0,3,2,1],[0,0,-1]],[[4,5,6,7],[0,0,1]],[[0,4,7,3],[-1,0,0]],[[1,2,6,5],[1,0,0]],[[0,1,5,4],[0,-1,0]],[[3,7,6,2],[0,1,0]]]){
    faces.push({points:ids.map(i=>P[i]),fill:material.color,stroke:material.edge||material.color,material,group:'finish',hardware:true,normal,part});
   }
  };
  const extrude=(axis,start,end,ring,material=finish,part='profile')=>{
   const other=[0,1,2].filter(a=>a!==axis),point=(u,t)=>{const p=[0,0,0];p[axis]=t;p[other[0]]=u[0];p[other[1]]=u[1];return p;};
   const face=(points,normal)=>faces.push({points,fill:material.color,stroke:material.edge||material.color,material,group:'finish',hardware:true,normal,part,soft:true});
   const n0=[0,0,0],n1=[0,0,0];n0[axis]=-1;n1[axis]=1;
   face(ring.map(u=>point(u,start)),n0);face(ring.map(u=>point(u,end)),n1);
   ring.forEach((a,i)=>{const b=ring[(i+1)%ring.length],du=b[0]-a[0],dv=b[1]-a[1],len=Math.hypot(du,dv),n=[0,0,0];n[other[0]]=dv/len;n[other[1]]=-du/len;face([point(a,start),point(b,start),point(b,end),point(a,end)],n);});
  };
  const bevel=(x0,y0,z0,x1,y1,z1,r=.003,material=finish,part='profile')=>{
   const lo=[x0,y0,z0],hi=[x1,y1,z1],size=hi.map((v,i)=>v-lo[i]),axis=size.indexOf(Math.max(...size)),other=[0,1,2].filter(a=>a!==axis),a=lo[other[0]],b=lo[other[1]],c=hi[other[0]],d=hi[other[1]],q=Math.min(r,(c-a)/3,(d-b)/3);
   extrude(axis,lo[axis],hi[axis],[[a+q,b],[c-q,b],[c,b+q],[c,d-q],[c-q,d],[a+q,d],[a,d-q],[a,b+q]],material,part);
  };
  const disc=(x,y,z0,z1,r,material=finish,part='handle-mount')=>extrude(2,z0,z1,Array.from({length:20},(_,i)=>[x+Math.cos(i*Math.PI/10)*r,y+Math.sin(i*Math.PI/10)*r]),material,part);
  const W=config.width||(family==='abrir'?.91:family==='f1'?1.30:.95),H=config.height||1.90,D=config.depth||W;
  const heightMode=config.heightMode||(H<=1.90?'standard':config.bar===true?'ceiling':'special'),handleType=family==='duo-safe'?'pressure-profile':heightMode==='ceiling'&&family!=='flex'?'flat-bar':'small-knob';
  // Projected clearance for a protruding pull: its inner grip must not cross the fixed pane.
  // This belongs to the illustrative assembly, not to fabrication or a nominal passage dimension.
  const handleHalfWidth=.016,stopGap=.006;
  const maxTravel=(span,inset,overlap)=>Math.max(0,span-inset-(span/2+overlap+handleHalfWidth+stopGap));
  let motion=null,openingFocus=null;
  const seal={kind:'solid',color:'#394748',edge:'#273334'},washer={kind:'solid',color:'#727f7b',edge:'#495754'};
  const pull=(x,y,z)=>{
   if(handleType==='flat-bar'){
    for(const yy of [y-.175,y+.175]){
     disc(x,yy,z-.004,z+.001,.014,washer,'handle-gasket');
     bevel(x-.013,yy-.014,z+.001,x+.013,yy+.014,z+.013,.003,finish,'handle-mount');
     bevel(x-.006,yy-.007,z+.013,x+.006,yy+.007,z+.05,.002,finish,'handle-support');
    }
    bevel(x-.010,y-.20,z+.044,x+.010,y+.20,z+.064,.003,finish,'handle-bar');
    bevel(x-.008,y-.20,z-.034,x+.008,y+.20,z-.018,.002,finish,'handle-inner');
   }else{
    disc(x,y,z-.004,z+.004,.016,washer,'handle-gasket');
    disc(x,y,z+.004,z+.013,.014,finish,'handle-mount');
    disc(x,y,z+.013,z+.025,.009,finish,'handle-neck');
    bevel(x-.016,y-.016,z+.022,x+.016,y+.016,z+.047,.006,finish,'handle-knob');
    disc(x,y,z-.015,z-.005,.014,finish,'handle-mount');
    bevel(x-.016,y-.016,z-.047,x+.016,y+.016,z-.020,.006,finish,'handle-knob');
   }
  };
  if(family==='abrir'){
   const leaf=config.doorWidth||W*.50,overlap=config.overlap||0,hingeCount=config.hingeCount||2,angle=k*Math.PI/2,pivotZ=.014;
   if(!(leaf>overlap&&leaf<W)||![2,3].includes(hingeCount))throw new Error('Composição de abrir inválida');
   pane([leaf-overlap,0],[W,0],H);pane([0,pivotZ],[leaf*Math.cos(angle),pivotZ-leaf*Math.sin(angle)],H);
   // Opening assemblies use a lower guide, fixed-glass U and wall hinges,
   // never the upper roller track of a sliding F1. Positions are illustrative.
   bevel(-.012,-.008,-.014,W+.012,.010,.025,.002,finish,'opening-threshold');
   bevel(W-.010,.010,-.014,W+.014,H,.014,.002,finish,'fixed-u');
   bevel(leaf-overlap,.010,-.014,W,.025,.014,.002,finish,'fixed-u');
   block(leaf-.007,.025,-.002,leaf+.007,H,.008,seal,'opening-seal');
   const rotateNewFaces=first=>{for(const face of faces.slice(first)){
    face.points=face.points.map(([x,y,z])=>[x*Math.cos(angle)+(z-pivotZ)*Math.sin(angle),y,pivotZ-x*Math.sin(angle)+(z-pivotZ)*Math.cos(angle)]);
    const [nx,ny,nz]=face.normal;face.normal=[nx*Math.cos(angle)+nz*Math.sin(angle),ny,-nx*Math.sin(angle)+nz*Math.cos(angle)];
   }};
   const ys=hingeCount===3?[.25,H/2,H-.25]:[.25,H-.25];
   for(const y of ys){
    bevel(-.026,y-.028,-.026,.006,y+.028,.017,.004,finish,'hinge-wall');
    extrude(1,y-.033,y+.033,Array.from({length:12},(_,i)=>[.005+Math.cos(i*Math.PI/6)*.008,pivotZ+Math.sin(i*Math.PI/6)*.008]),finish,'hinge-axis');
    const first=faces.length;bevel(.008,y-.025,.005,.052,y+.025,.026,.004,finish,'hinge-leaf');rotateNewFaces(first);
   }
   const first=faces.length;pull(leaf-.06,H*.47,pivotZ);rotateNewFaces(first);
   openingFocus=[(leaf-.06)*Math.cos(angle),H*.47,pivotZ-(leaf-.06)*Math.sin(angle)];
   motion={angle,doorWidth:leaf,hingeCount,overlap};
  }else if(family==='flex'){
   // Illustrative bi-fold: equal leaves, wall pivot and articulated centre.
   // No roller header/track from an F1 sliding assembly is reused.
   const gap=.018,pivot=.018,L=(W-pivot-gap-.012)/2,angle=k*Math.PI*80/180;
   if(!(L>.10))throw new Error('Largura Flex inválida');
   const c=Math.cos(angle),sn=Math.sin(angle),joint=[pivot+L*c,L*sn];
   const transform=(first,origin,a)=>{
    const co=Math.cos(a),si=Math.sin(a);
    for(const face of faces.slice(first)){
     face.points=face.points.map(([x,y,z])=>[origin[0]+x*co-z*si,y,origin[1]+x*si+z*co]);
     if(face.normal){const [nx,ny,nz]=face.normal;face.normal=[nx*co-nz*si,ny,nx*si+nz*co];}
    }
   };
   const leaf=(origin,a,id,withPull)=>{
    const first=faces.length,t=.008,y0=.018,y1=H-.018;
    // 8 mm glass prism: two surfaces plus polished edges, using existing colours.
    const P=[[0,y0,-t/2],[L,y0,-t/2],[L,y1,-t/2],[0,y1,-t/2],[0,y0,t/2],[L,y0,t/2],[L,y1,t/2],[0,y1,t/2]];
    for(const ids of [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]])faces.push({points:ids.map(i=>P[i]),fill:glass.fill,stroke:glass.edge,material:glass,group:'glass',part:'flex-glass',leaf:id});
    if(withPull)pull(L-.065,H*.47,.004);
    transform(first,origin,a);
   };
   leaf([pivot,0],angle,0,false);
   const origin2=[joint[0]+gap*c,joint[1]];
   leaf(origin2,-angle,1,true);
   // Slender wall U, bottom water threshold and discrete hinge bodies.
   bevel(-.012,0,-.016,.012,H,.016,.002,finish,'flex-wall-u');
   bevel(-.012,-.008,-.020,W+.012,.008,.020,.002,finish,'flex-threshold');
   for(const y of [.25,H/2,H-.25]){
    bevel(-.020,y-.030,-.025,.006,y+.030,.025,.003,finish,'flex-wall-hinge');
    extrude(1,y-.033,y+.033,Array.from({length:12},(_,i)=>[pivot+Math.cos(i*Math.PI/6)*.009,Math.sin(i*Math.PI/6)*.009]),finish,'flex-pivot');
    let first=faces.length;bevel(.006,y-.026,-.012,.052,y+.026,.024,.003,finish,'flex-hinge-leaf');transform(first,[pivot,0],angle);
    // Two clamping plates follow their own glass; central pin bridges the gap.
    first=faces.length;bevel(L-.047,y-.026,-.012,L+.006,y+.026,.024,.003,finish,'flex-centre-hinge');transform(first,[pivot,0],angle);
    first=faces.length;bevel(-.006,y-.026,-.012,.047,y+.026,.024,.003,finish,'flex-centre-hinge');transform(first,origin2,-angle);
    extrude(1,y-.030,y+.030,Array.from({length:12},(_,i)=>[joint[0]+gap*c/2+Math.cos(i*Math.PI/6)*.008,joint[1]+Math.sin(i*Math.PI/6)*.008]),finish,'flex-centre-pin');
   }
   openingFocus=[origin2[0]+(L-.065)*c,H*.47,origin2[1]-(L-.065)*sn];
   motion={angle,leafWidth:L,gap,pivot:[pivot,0],joint,secondOrigin:origin2,freeEnd:[origin2[0]+L*c,origin2[1]-L*sn],maxAngle:Math.PI*80/180};
  }else if(family==='bt3'||family==='duo-safe'){
   // Commercial illustration, not cutting dimensions. BT3: 1 fixed + 2 mobile.
   // Duo Safe manual: two mobile leaves, pressure pull profiles, central nylon guide.
   const duo=family==='duo-safe',count=duo?2:3,overlap=.025,span=W/count+overlap;
   const zs=duo?[0,.038]:[0,.035,.070],inset=.065,clear=.016+.008;
   const travel=duo?Math.max(0,W-span-inset-clear):Math.max(0,W-span-inset-clear);
   const shift=k*travel,starts=duo?[0,W-span-shift]:[0,(W-span)/2-shift/2,W-span-shift];
   // Each mobile leaf remains inside the frame and on a distinct runner plane.
   starts.forEach((x,i)=>pane([x,zs[i]],[x+span,zs[i]],H));
   bevel(-.014,H-.065,-.026,W+.014,H+.018,duo?.084:.118,.004,finish,duo?'duo-header':'bt3-header');
   bevel(-.014,-.008,-.018,W+.014,.016,duo?.080:.114,.002,finish,duo?'duo-bottom-track':'bt3-bottom-track');
   for(const x of [0,W])bevel(x-.010,.016,-.018,x+.010,H-.065,duo?.080:.114,.002,finish,'wall-channel');
   for(const z of zs)block(0,.016,z-.003,W,.020,z+.003,seal,'runner-groove');
   const headerZ=duo?.084:.118;
   for(const z of [-.026,headerZ-.006])bevel(-.014,H-.065,z,W+.014,H-.018,z+.006,.001,finish,'track-cover');
   if(duo){
    // Native pressure handles at both outer closing edges; no drilled bar handle.
    for(const [i,x] of [[0,starts[0]+.018],[1,starts[1]+span-.018]]){
     bevel(x-.010,.025,zs[i]-.010,x+.010,H-.070,zs[i]+.013,.002,finish,'duo-pressure-pull');
     bevel(x-.010,H*.40,zs[i]+.012,x+.020,H*.57,zs[i]+.030,.002,finish,'duo-pressure-grip');
    }
    for(const z of [.010,.056])bevel(W/2-.020,.020,z,W/2+.020,.042,z+.012,.002,seal,'nylon-guide');
    for(const x of [.012,W-.024])for(const z of [.012,.050])bevel(x,.08,z,x+.012,.10,z+.014,.002,seal,'closing-buffer');
   }else{
    pull(starts[2]+span-inset,H*.47,zs[2]);
    for(const z of [.012,.047,.082])bevel(span-.020,.020,z,span+.020,.040,z+.010,.002,seal,'nylon-guide');
   }
   motion={travel,shift,starts,span,runnerPlanes:zs,fixedLeaves:duo?0:1,mobileLeaves:2,openingSide:'right',illustrative:true};
   openingFocus=[duo?starts[1]+span-.018:starts[2]+span-inset,H*.47,zs[zs.length-1]];
  }else if(family==='f1'){
   const mid=W/2,travel=maxTravel(W,.065,.025),shift=k*travel;
   motion={travel,shift,fixedEdge:mid+.025,handleMin:W-.065-shift-handleHalfWidth,stopGap};
   pane([0,0],[mid+.025,0],H);pane([mid-.025-shift,.035],[W-shift,.035],H);
   // Illustrative extruded profiles: a wider header, slender wall channels and lower track.
   bevel(-.014,H-.034,-.025,W+.014,H+.022,.072,.004,finish,'header');
   bevel(-.014,-.008,-.015,W+.014,.014,.064,.002,finish,'bottom-track');
   bevel(-.014,.012,-.018,.009,H-.034,.064,.002,finish,'wall-channel');
   bevel(W-.009,.012,-.018,W+.014,H-.034,.064,.002,finish,'wall-channel');
   // Twin runner grooves and rubber seals, inset within the aluminium.
   block(0,.014,.011,W,.018,.017,seal);
   block(0,.014,.043,W,.018,.049,seal);
   block(0,H-.037,.012,W,H-.034,.018,seal);
   block(.008,.018,.002,.012,H-.034,.009,seal);
   block(W-.012,.018,.038,W-.008,H-.034,.046,seal);
   // The nylon guide sits at the fixed-pane end; the sliding leaf passes in its groove.
   const gx=mid+.025;
   bevel(gx-.018,.012,.016,gx+.018,.034,.025,.002,seal,'nylon-guide');
   bevel(gx-.018,.012,.045,gx+.018,.034,.054,.002,seal,'nylon-guide');
   // Two compact closing buffers in the side channel, not exposed rollers.
   for(const y of [.18,H-.18])bevel(W-.016,y-.012,.023,W-.006,y+.012,.047,.002,seal,'closing-buffer');
   pull(W-.065-shift,H*.47,.035);
  }else{
   const half=W/2,travel=maxTravel(W,.07,.02),shift=k*travel;pane([0,0],[half+.02,0],H);pane([half-.02-shift,.025],[W-shift,.025],H);
   const halfD=D/2,travelD=maxTravel(D,.07,.02),shiftD=k*travelD;pane([W,D],[W,halfD-.02],H);pane([W-.025,shiftD],[W-.025,halfD+.02+shiftD],H);
   motion={travel,shift,fixedEdge:half+.02,handleMin:W-.07-shift-handleHalfWidth,stopGap,returnSide:{travel:travelD,shift:shiftD,fixedEdge:halfD-.02,handleMax:.07+shiftD+handleHalfWidth}};
   bar([0,H,0],[W,H,0]);bar([W,H,0],[W,H,D]);bar([0,0,0],[W,0,0]);bar([W,0,0],[W,0,D]);
   bar([0,0,0],[0,H,0]);bar([W,0,D],[W,H,D]);pull(W-.07-shift,H*.47,.03);
   const first=faces.length;pull(.07+shiftD,H*.47,.03);
   for(const face of faces.slice(first)){face.points=face.points.map(([x,y,z])=>[W-z,y,x]);const [nx,ny,nz]=face.normal;face.normal=[-nz,ny,nx];}
  }
  const movingX=family==='f1'?W-.065-motion.shift:W/2;
  return {family,width:W,depth:family==='canto'?D:0,height:H,faces,lines,selection:chosen,heightMode,handleType,motion,detailFocus:openingFocus||[movingX,H*.47,.04]};
 }
 function tint(hex,amount){
  const c=hex.replace('#',''),rgb=[0,2,4].map(i=>parseInt(c.slice(i,i+2),16));
  return '#'+rgb.map(v=>Math.round(Math.max(0,Math.min(255,amount>=0?v+(255-v)*amount:v*(1+amount)))).toString(16).padStart(2,'0')).join('');
 }
 function projection(point,yaw,pitch,width,height){
  const x=point[0]-.55,y=point[1]-1.1,z=point[2]-.10,c=Math.cos(yaw),s=Math.sin(yaw),a=x*c-z*s,b=x*s+z*c;
  const v=y*Math.cos(pitch)-b*Math.sin(pitch),depth=y*Math.sin(pitch)+b*Math.cos(pitch),scale=Math.min(width/2.25,height/3.0);
  return {x:width*.5+a*scale,y:height*.5-v*scale,depth};
 }
 function path(ctx,points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();}
 const stageYaw=.32,stagePitch=.10,floorY=-.014,backWall=-.82,tileSize=1.20,stageCache=new Map();
 function room(project,width,height,key){
  if(stageCache.has(key))return stageCache.get(key);
  const faces=[],corners=[[-3,-3],[width+3,-3],[width+3,height+3],[-3,height+3]];
  // Invert the affine projection of each plane. Extend tiles beyond all viewport
  // edges instead of showing a finite, floating slab in a narrow/tall canvas.
  for(const surface of ['wall','floor']){
   const point=surface==='wall'?(a,b)=>[a,b,backWall]:(a,b)=>[a,floorY,b];
   const o=project(point(0,0)),u=project(point(1,0)),v=project(point(0,1));
   const ax=u.x-o.x,ay=u.y-o.y,bx=v.x-o.x,by=v.y-o.y,det=ax*by-ay*bx;
   const uv=corners.map(([x,y])=>{const dx=x-o.x,dy=y-o.y;return [(dx*by-dy*bx)/det,(ax*dy-ay*dx)/det];});
   const a0=Math.floor(Math.min(...uv.map(p=>p[0]))/tileSize)*tileSize,a1=Math.ceil(Math.max(...uv.map(p=>p[0]))/tileSize)*tileSize;
   const edge=surface==='wall'?floorY:backWall;
   const b0=Math.max(edge,Math.floor(Math.min(...uv.map(p=>p[1]))/tileSize)*tileSize),b1=Math.ceil(Math.max(...uv.map(p=>p[1]))/tileSize)*tileSize;
   for(let a=a0;a<a1-.0001;a+=tileSize){
    // Preserve a single world grid when the floor/wall intersection cuts a tile.
    for(let b=b0;b<b1-.0001;){
     const bb=Math.min(b1,(Math.floor((b+.00001)/tileSize)+1)*tileSize);
     const points=[point(a,b),point(a+tileSize,b),point(a+tileSize,bb),point(a,bb)],screen=points.map(project);
     if(Math.max(...screen.map(p=>p.x))>=-2&&Math.min(...screen.map(p=>p.x))<=width+2&&Math.max(...screen.map(p=>p.y))>=-2&&Math.min(...screen.map(p=>p.y))<=height+2){
      faces.push({points,screen,depth:screen.reduce((sum,p)=>sum+p.depth,0)/4,kind:'face',tile:true,surface,materialId:'neutral-porcelain',tileIndex:Math.abs(Math.round(a/tileSize)*13+Math.floor(b/tileSize)),fill:'#f5f5f3',stroke:'#e5e7e3'});
     }
     b=bb;
    }
   }
  }
  if(stageCache.size>=16)stageCache.delete(stageCache.keys().next().value);
  stageCache.set(key,faces);return faces;
 }
 function render(ctx,m,yaw,pitch,width,height,options={}){
  const zoom=Math.max(1,Math.min(3.5,options.zoom||1)),detail=Math.min(1,(zoom-1)/1.5),focus=m.detailFocus;
  const center=[m.width/2+(focus[0]-m.width/2)*detail,m.height/2+(focus[1]-m.height/2)*detail,(m.depth||0)/2];
  const baseFactor=Math.min(1.30/m.width,2.30/m.height);
  const projector=(factor,origin,angle,elevation)=>p=>projection([(p[0]-origin[0])*factor+.55,(p[1]-origin[1])*factor+1.1,(p[2]-origin[2])*factor+.1],angle,elevation,width,height);
  // A box stays upright on its base. Rotate it only around the vertical axis,
  // then project the product AND the floor with the same stationary camera.
  // Zoom magnifies that whole view, so contact stays correct at every scale.
  const stagePr=projector(baseFactor*zoom,center,stageYaw,stagePitch);
  const baseY=Math.min(0,...m.faces.flatMap(f=>f.points.map(p=>p[1]))),turn=yaw-stageYaw,c=Math.cos(turn),s=Math.sin(turn);
  const world=p=>{const x=p[0]-m.width/2,z=p[2]-(m.depth||0)/2;return [m.width/2+x*c-z*s,p[1]+floorY-baseY,(m.depth||0)/2+x*s+z*c];};
  const pr=p=>stagePr(world(p));
  const visible=f=>!f.hardware||f.normal[1]*Math.sin(stagePitch)+(f.normal[0]*Math.sin(yaw)+f.normal[2]*Math.cos(yaw))*Math.cos(stagePitch)>=-.0001;
  const environment=room(stagePr,width,height,JSON.stringify([width,height,baseFactor,zoom,...center]));
  const primitives=[...environment,...m.faces.filter(visible).map(f=>{const worldPoints=f.points.map(world),screen=worldPoints.map(stagePr);return {...f,worldPoints,kind:'face',screen,depth:screen.reduce((a,p)=>a+p.depth,0)/screen.length};}),...m.lines.map(l=>({...l,kind:'line',screen:[pr(l.a),pr(l.b)],depth:(pr(l.a).depth+pr(l.b).depth)/2+.002}))].sort((a,b)=>Number(!!a.group)-Number(!!b.group)||a.depth-b.depth);
  let shadowDrawn=false;
  for(const v of primitives){
   if(v.group&&!shadowDrawn){
    shadowDrawn=true;
    const bottom=m.faces.filter(f=>f.part==='bottom-track').flatMap(f=>f.points),foot=bottom.length?bottom:m.faces.flatMap(f=>f.points).filter(p=>p[1]===baseY);
    if(foot.length){
     const minX=Math.min(...foot.map(p=>p[0])),maxX=Math.max(...foot.map(p=>p[0])),minZ=Math.min(...foot.map(p=>p[2])),maxZ=Math.max(...foot.map(p=>p[2]));
     const contact=[[minX,baseY,minZ-.018],[maxX,baseY,minZ-.018],[maxX,baseY,maxZ+.018],[minX,baseY,maxZ+.018]].map(pr);
     ctx.save();ctx.shadowColor='rgba(39,55,48,.16)';ctx.shadowBlur=5;ctx.shadowOffsetY=2;ctx.fillStyle='rgba(39,55,48,.08)';path(ctx,contact);ctx.fill();ctx.restore();
    }
   }
   if(v.kind==='face'){
    const pts=v.screen;path(ctx,pts);
    if(v.tile){
     const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
     const variation=((v.tileIndex*7)%5-2)*.001,shade=v.surface==='floor'?-.012:0;
     const g=ctx.createLinearGradient(x,y,x+w*.8,y+h);g.addColorStop(0,tint(v.fill,shade+variation+.006));g.addColorStop(.6,tint(v.fill,shade+variation));g.addColorStop(1,tint(v.fill,shade+variation-.008));
     ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=v.stroke;ctx.lineWidth=.45;ctx.stroke();
     ctx.save();path(ctx,pts);ctx.clip();ctx.fillStyle='rgba(100,104,102,.012)';
     for(let i=0;i<32;i++){const px=x+((i*73+v.tileIndex*11)%101)/101*w,py=y+((i*47+v.tileIndex*7)%103)/103*h;ctx.fillRect(px,py,.7,.7);}ctx.restore();continue;
    }
    if(v.hardware){
     const mat=v.material,n=v.normal,c=Math.cos(yaw),s=Math.sin(yaw),nx=n[0]*c-n[2]*s,nz=n[0]*s+n[2]*c;
     const light=Math.max(0,nx*-.45+n[1]*.65+nz*.6);
     const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
     const g=ctx.createLinearGradient(x,y,w>h?x:x+w,w>h?y+h:y);
     if(mat.kind==='metal'){
      mat.stops.forEach((color,i)=>g.addColorStop(i/(mat.stops.length-1),tint(color,(light-.5)*.16)));
     }else{
      g.addColorStop(0,tint(mat.color,-.2+light*.1));g.addColorStop(.25,tint(mat.color,light*.08));g.addColorStop(.6,tint(mat.color,-.06));g.addColorStop(1,tint(mat.color,-.22));
     }
     ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=tint(mat.color,-.25);ctx.lineWidth=v.soft?.22:.4;ctx.lineJoin='round';ctx.stroke();
     if(mat.kind==='wood'){
      ctx.save();path(ctx,pts);ctx.clip();ctx.strokeStyle='rgba(77,42,18,.28)';ctx.lineWidth=.45;
      for(let t=0;t<6;t++){const xx=x+w*t/6;ctx.beginPath();ctx.moveTo(xx,y);ctx.bezierCurveTo(xx+2,y+h*.3,xx-1,y+h*.7,xx+1,y+h);ctx.stroke();}ctx.restore();
     }
     continue;
    }
    ctx.fillStyle=v.fill;ctx.fill();
    if(v.material){
     const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
     ctx.save();path(ctx,pts);ctx.clip();
     if(v.material.kind==='mirror'){
      const g=ctx.createLinearGradient(x,y,x+w,y+h*.2);[[0,'rgba(207,220,221,.88)'],[.22,'rgba(238,245,245,.92)'],[.43,'rgba(255,255,255,.96)'],[.5,'rgba(214,227,228,.9)'],[.75,'rgba(241,248,248,.94)'],[1,'rgba(201,218,220,.88)']].forEach(s=>g.addColorStop(...s));ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
      ctx.fillStyle='rgba(255,255,255,.17)';ctx.beginPath();ctx.moveTo(x+w*.18,y);ctx.lineTo(x+w*.30,y);ctx.lineTo(x+w*.66,y+h);ctx.lineTo(x+w*.54,y+h);ctx.closePath();ctx.fill();
     }else if(v.material.kind==='frosted'){
      ctx.fillStyle='rgba(255,255,255,.17)';for(let i=0;i<95;i++){const px=x+((i*73)%101)/101*w,py=y+((i*47)%103)/103*h;ctx.fillRect(px,py,1.1,1.1);}
     }else{
      const g=ctx.createLinearGradient(x,y,x+w,y+h*.25);g.addColorStop(0,'rgba(255,255,255,.015)');g.addColorStop(.28,'rgba(255,255,255,.13)');g.addColorStop(.36,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,.035)');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
     }
     ctx.restore();
    }
    path(ctx,pts);ctx.strokeStyle=v.stroke;ctx.lineWidth=1.3;ctx.stroke();
   }else{
    const [a,b]=v.screen,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
    const stroke=(color,width,offset=0)=>{ctx.beginPath();ctx.moveTo(a.x+nx*offset,a.y+ny*offset);ctx.lineTo(b.x+nx*offset,b.y+ny*offset);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();};
    const mat=v.material;
    if(mat){
     stroke(mat.edge||'#657173',v.width+1.4);
     if(mat.kind==='metal'){
      const g=ctx.createLinearGradient(a.x-nx*v.width/2,a.y-ny*v.width/2,a.x+nx*v.width/2,a.y+ny*v.width/2);mat.stops.forEach((color,i)=>g.addColorStop(i/(mat.stops.length-1),color));stroke(g,v.width);
     }else{
      stroke(mat.color,v.width);
      if(mat.kind==='wood'){
       for(const [off,color] of [[-2,'#bb8b50'],[-.5,'#704322'],[1.5,'#c29154']]){
        ctx.beginPath();for(let i=0;i<=12;i++){const t=i/12,o=off+Math.sin(t*9+off)*.4,p={x:a.x+dx*t+nx*o,y:a.y+dy*t+ny*o};if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);}ctx.strokeStyle=color;ctx.lineWidth=.65;ctx.stroke();
       }
      }else stroke('rgba(255,255,255,.22)',.8,-v.width*.3);
     }
    }else stroke(v.color,v.width);
   }
  }
  return primitives;
 }
 function hitTest(primitives,x,y){
  // Profiles win within a small touch target. Floors never select a material.
  for(const v of [...primitives].reverse().filter(v=>v.kind==='line'&&v.group==='finish')){
   const [a,b]=v.screen,dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/l)):0;
   if(Math.hypot(x-a.x-t*dx,y-a.y-t*dy)<=Math.max(9,v.width/2+3))return 'finish';
  }
  // Extruded hardware keeps a forgiving touch target, even on narrow mobile profiles.
  for(const v of [...primitives].reverse().filter(v=>v.hardware)){
   const ps=v.screen;
   for(let i=0,j=ps.length-1;i<ps.length;j=i++){
    const a=ps[j],b=ps[i],dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/l)):0;
    if(Math.hypot(x-a.x-t*dx,y-a.y-t*dy)<=7)return 'finish';
   }
  }
  for(const v of [...primitives].reverse().filter(v=>v.kind==='face'&&v.group)){
   let inside=false;const ps=v.screen;
   for(let i=0,j=ps.length-1;i<ps.length;j=i++){const a=ps[i],b=ps[j];if(((a.y>y)!==(b.y>y))&&(x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x))inside=!inside;}
   if(inside)return v.group;
  }
  return null;
 }
 const api={model,projection,render,hitTest};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BoxScene=api;
})(typeof window==='undefined'?globalThis:window);
