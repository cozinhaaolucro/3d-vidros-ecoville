(function(root){
 'use strict';
 const Materials=typeof module!=='undefined'&&module.exports?require('./materials.js'):root.BoxMaterials;
 function model(family,opening,selection={},config={}){
  const chosen=Materials.selection(selection.glass,selection.finish),glass=Materials.glasses[chosen.glass],finish=Materials.finishes[chosen.finish];
  const k=Math.max(0,Math.min(1,opening)), faces=[], lines=[];
  const line=(a,b,color='#b7c8c0',width=1,material=null)=>lines.push({a,b,color,width,material,group:material?'finish':null});
  const pane=(a,b,h)=>{faces.push({points:[[a[0],0,a[1]],[b[0],0,b[1]],[b[0],h,b[1]],[a[0],h,a[1]]],fill:glass.fill,stroke:glass.edge,material:glass,group:'glass'});};
  const bar=(a,b)=>line(a,b,finish.color,7,finish);
  const handle=(x,y,z)=>{const half=config.bar?.20:.065;line([x,y-half,z],[x,y+half,z],finish.color,5,finish);};
  const block=(x0,y0,z0,x1,y1,z1,material=finish)=>{
   const P=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
   for(const [ids,normal] of [[[0,3,2,1],[0,0,-1]],[[4,5,6,7],[0,0,1]],[[0,4,7,3],[-1,0,0]],[[1,2,6,5],[1,0,0]],[[0,1,5,4],[0,-1,0]],[[3,7,6,2],[0,1,0]]]){
    faces.push({points:ids.map(i=>P[i]),fill:material.color,stroke:material.edge||material.color,material,group:'finish',hardware:true,normal});
   }
  };
  const W=config.width||(family==='abrir'?.91:family==='f1'?1.30:.95),H=config.height||(family==='abrir'?2.41:1.90),D=config.depth||W;
  const min=-.35,max=Math.max(W,D)+.35;
  faces.push({points:[[min,-.015,-.48],[max,-.015,-.48],[max,-.015,1.15],[min,-.015,1.15]],fill:'#e1e8e1',stroke:'#d3dfd6'});
  for(let t=min;t<max+.01;t+=.25)line([t,-.01,-.48],[t,-.01,1.15],'#cddad1',1);
  for(let t=-.48;t<1.16;t+=.25)line([min,-.01,t],[max,-.01,t],'#cddad1',1);
  if(family==='abrir'){
   const leaf=W*.50,angle=k*Math.PI/2;
   pane([leaf,0],[W,0],H);pane([0,0],[leaf*Math.cos(angle),-leaf*Math.sin(angle)],H);
   bar([0,0,0],[0,H,0]);bar([W,0,0],[W,H,0]);bar([leaf,0,0],[W,0,0]);
   [0.33,H-.33].forEach(y=>line([-.012,y,0],[.06*Math.cos(angle),y,-.06*Math.sin(angle)],finish.color,9,finish));
   handle((leaf-.07)*Math.cos(angle),1.05,-(leaf-.07)*Math.sin(angle));
  }else if(family==='f1'){
   const mid=W/2,shift=k*(mid-.04);pane([0,0],[mid+.025,0],H);pane([mid-.025-shift,.035],[W-shift,.035],H);
   // Illustrative extruded profiles: a wider header, slender wall channels and lower track.
   block(-.014,H-.034,-.025,W+.014,H+.022,.072);
   block(-.014,-.008,-.015,W+.014,.014,.064);
   block(-.014,.012,-.018,.009,H-.034,.064);
   block(W-.009,.012,-.018,W+.014,H-.034,.064);
   // Twin runner grooves and rubber seals, inset within the aluminium.
   const seal={kind:'solid',color:'#394748',edge:'#273334'};
   block(0,.014,.011,W,.018,.017,seal);
   block(0,.014,.043,W,.018,.049,seal);
   block(0,H-.037,.012,W,H-.034,.018,seal);
   block(.008,.018,.002,.012,H-.034,.009,seal);
   block(W-.012,.018,.038,W-.008,H-.034,.046,seal);
   const hx=W-.065-shift,cy=H*.47,half=config.bar?.20:.065;
   // Bar handle with two mounting pads, projecting brackets, and a flat rectangular grip.
   for(const yy of [cy-half+.025,cy+half-.025]){
    block(hx-.013,yy-.014,.034,hx+.013,yy+.014,.046);
    block(hx-.006,yy-.007,.046,hx+.006,yy+.007,.083);
   }
   block(hx-.009,cy-half,.076,hx+.009,cy+half,.094);
   // Inner grip remains visible through the glass at oblique angles.
   block(hx-.007,cy-half,.002,hx+.007,cy+half,.016);
  }else{
   const half=W/2,shift=k*(half-.04);pane([0,0],[half+.02,0],H);pane([half-.02-shift,.025],[W-shift,.025],H);
   const halfD=D/2,shiftD=k*(halfD-.04);pane([W,D],[W,halfD-.02],H);pane([W-.025,shiftD],[W-.025,halfD+.02+shiftD],H);
   bar([0,H,0],[W,H,0]);bar([W,H,0],[W,H,D]);bar([0,0,0],[W,0,0]);bar([W,0,0],[W,0,D]);
   bar([0,0,0],[0,H,0]);bar([W,0,D],[W,H,D]);handle(W-.07-shift,H*.47,.03);handle(W-.03,H*.47,.07+shiftD);
  }
  return {family,width:W,depth:family==='canto'?D:0,height:H,faces,lines,selection:chosen};
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
 function render(ctx,m,yaw,pitch,width,height){
  const factor=Math.min(1.30/m.width,2.30/m.height);const pr=p=>projection([(p[0]-m.width/2)*factor+.55,(p[1]-m.height/2)*factor+1.1,(p[2]-(m.depth||0)/2)*factor+.1],yaw,pitch,width,height);
  const primitives=[...m.faces.map(f=>({...f,kind:'face',screen:f.points.map(pr),depth:f.points.reduce((a,p)=>a+pr(p).depth,0)/f.points.length})),...m.lines.map(l=>({...l,kind:'line',screen:[pr(l.a),pr(l.b)],depth:(pr(l.a).depth+pr(l.b).depth)/2+.002}))].sort((a,b)=>Number(!!a.group)-Number(!!b.group)||a.depth-b.depth);
  for(const v of primitives){
   if(v.kind==='face'){
    const pts=v.screen;path(ctx,pts);
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
     ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=tint(mat.color,-.25);ctx.lineWidth=.45;ctx.lineJoin='round';ctx.stroke();
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
