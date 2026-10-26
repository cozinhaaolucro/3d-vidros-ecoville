'use strict';
const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d'),family=document.getElementById('family'),opening=document.getElementById('opening');
const projectKey=new URLSearchParams(location.search).get('p')||'t01';
const project=DEMO_PROJECTS[projectKey]||DEMO_PROJECTS.t01;
family.replaceChildren(...project.items.map((item,i)=>new Option(item.label,String(i))));
const active=()=>project.items[Number(family.value)||0];
const HOME={yaw:.32,pitch:.10,opening:35};
let yaw=HOME.yaw,pitch=HOME.pitch,zoom=1,drag=null,animation=0,materials=BoxMaterials.selection('incolor',active().finish),projected=[];
let idleTimer=0,homeAnimation=0,hovering=false;
const ids=id=>document.getElementById(id);
const money=cents=>(cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function updatePrice(){
 const quote=DEMO_PROJECTS[projectKey]?BoxQuote.resolve(active(),materials):null,g=BoxMaterials.glasses[materials.glass],f=BoxMaterials.finishes[materials.finish];
 ids('price-selection').textContent=(g.description||g.label)+' · '+f.label;
 const expired=new Date().toISOString().slice(0,10)>BoxQuote.validUntil;
 ids('price-available').hidden=!quote||expired;ids('price-pending').hidden=!!quote&&!expired;
 if(!quote||expired){for(const id of ['cash-price'])ids(id).textContent='';return;}
 ids('cash-price').textContent=money(quote.total);
}
function cancelHome(){clearTimeout(idleTimer);cancelAnimationFrame(homeAnimation);}
function returnHome(){
 if(hovering||drag||document.hidden)return;
 cancelAnimationFrame(animation);
 const start={yaw,pitch,zoom,opening:Number(opening.value)},t0=performance.now();
 const delta=((HOME.yaw-yaw+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
 function step(now){
  const t=matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.min(1,(now-t0)/900),e=t*t*(3-2*t);
  yaw=start.yaw+delta*e;pitch=start.pitch+(HOME.pitch-start.pitch)*e;zoom=start.zoom+(1-start.zoom)*e;opening.value=Math.round(start.opening+(HOME.opening-start.opening)*e);draw();
  if(t<1)homeAnimation=requestAnimationFrame(step);else{yaw=HOME.yaw;pitch=HOME.pitch;draw();}
 }
 homeAnimation=requestAnimationFrame(step);
}
function scheduleHome(){cancelHome();if(!hovering&&!drag)idleTimer=setTimeout(returnHome,5000);}
function draw(){
 const r=canvas.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,r.width,r.height);
 projected=BoxScene.render(ctx,BoxScene.model(active().family,Number(opening.value)/100,materials,active()),yaw,pitch,r.width,r.height,{zoom});
 ids('zoom-out').disabled=zoom<=1;ids('zoom-in').disabled=zoom>=3.5;
 ids('toggle').textContent=Number(opening.value)>=95?'Fechar box':'Abrir totalmente';
}
function updateDescription(){
 const item=active(),f=item.family,g=BoxMaterials.glasses[materials.glass],a=BoxMaterials.finishes[materials.finish];
 const dims=[item.width,...(f==='canto'?[item.depth]:[]),item.height].map(n=>Math.round(n*1000)).join(' × ');
 ids('spec').textContent=dims+' mm · '+(g.description||g.label)+' · 8 mm · '+a.label;
 ids('selected-materials').textContent=(g.description||g.label)+' · '+a.label;
 ids('glass-detail').textContent=g.kind==='mirror'?'Incolor com película espelhada. A reflexão e a transparência mudam conforme a iluminação dos dois lados.':g.kind==='frosted'?'Incolor com película jateada. Aparência fosca e difusão de luz; os detalhes através do vidro ficam suavizados.':'Vidro '+g.label.toLowerCase()+'. A tonalidade varia com a espessura, a luz e o ambiente.';
 document.querySelectorAll('[data-material-group]').forEach(b=>b.setAttribute('aria-pressed',String(materials[b.dataset.materialGroup]===b.dataset.materialValue)));
 updatePrice();
}
function showPalette(group,focus=false){
 for(const key of ['glass','finish']){ids(key+'-palette').hidden=key!==group;ids(key+'-tab').setAttribute('aria-pressed',String(key===group));}
 if(focus){ids(group+'-tab').focus({preventScroll:true});ids('material-controls').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});}
}
function choose(group,value){materials=BoxMaterials.update(materials,group,value);updateDescription();draw();}
for(const [group,collection] of [['glass',BoxMaterials.glasses],['finish',BoxMaterials.finishes]]){
 const container=ids(group+'-swatches');
 for(const [value,material] of Object.entries(collection)){
  const button=document.createElement('button');button.type='button';button.className='swatch';button.dataset.materialGroup=group;button.dataset.materialValue=value;button.setAttribute('aria-label',(group==='glass'?'Vidro: ':'Acabamento: ')+(material.description||material.label));button.setAttribute('aria-pressed',String(materials[group]===value));
  const chip=document.createElement('span');chip.className='chip';chip.style.background=material.swatch;chip.setAttribute('aria-hidden','true');
  const label=document.createElement('span');label.textContent=({fosco:'Prata fosco',marrom:'Marrom / bronze',rose:'Rosê neutro',espelhada:'Espelhado',jateada:'Jateado'})[value]||material.label;button.append(chip,label);button.addEventListener('click',()=>choose(group,value));container.appendChild(button);
 }
 ids(group+'-tab').addEventListener('click',()=>showPalette(group));
}
ids('restore-materials').onclick=()=>{materials=BoxMaterials.selection('incolor',active().finish);updateDescription();draw();};
function changeFamily(){
 const f=active().family;ids('title').textContent=active().label;materials=BoxMaterials.selection('incolor',active().finish);

 yaw=HOME.yaw;pitch=HOME.pitch;zoom=1;opening.value=HOME.opening;updateDescription();draw();
}
opening.addEventListener('input',()=>{cancelAnimationFrame(animation);draw();});family.addEventListener('change',()=>{cancelAnimationFrame(animation);changeFamily();});
ids('toggle').onclick=()=>{cancelAnimationFrame(animation);const start=Number(opening.value),end=start>=95?0:100,t0=performance.now();function step(now){const t=Math.min(1,(now-t0)/650);opening.value=Math.round(start+(end-start)*(t*t*(3-2*t)));draw();if(t<1)animation=requestAnimationFrame(step);}if(matchMedia('(prefers-reduced-motion: reduce)').matches){opening.value=end;draw();}else animation=requestAnimationFrame(step);};
ids('left').onclick=()=>{yaw-=.2;draw();};ids('right').onclick=()=>{yaw+=.2;draw();};ids('reset').onclick=()=>{cancelHome();hovering=false;returnHome();};
ids('zoom-in').onclick=()=>{zoom=Math.min(3.5,zoom+.5);draw();};ids('zoom-out').onclick=()=>{zoom=Math.max(1,zoom-.5);draw();};
canvas.addEventListener('pointerdown',e=>{if(e.isPrimary===false||e.button>0)return;drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false,id:e.pointerId};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const moved=drag.moved||Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6;if(moved){yaw+=(e.clientX-drag.x)*.007;drag.moved=true;draw();}drag.x=e.clientX;drag.y=e.clientY;});
canvas.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;const clicked=!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<=6;drag=null;if(clicked){const r=canvas.getBoundingClientRect(),group=BoxScene.hitTest(projected,e.clientX-r.left,e.clientY-r.top);if(group)showPalette(group,true);}});
canvas.addEventListener('pointercancel',()=>drag=null);canvas.addEventListener('lostpointercapture',()=>drag=null);
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')yaw-=.15;if(e.key==='ArrowRight')yaw+=.15;if(e.key==='ArrowUp')zoom=Math.min(3.5,zoom+.5);if(e.key==='ArrowDown')zoom=Math.max(1,zoom-.5);draw();}});
canvas.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovering=true;cancelHome();}});
canvas.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hovering=false;scheduleHome();}});
canvas.addEventListener('pointerup',()=>scheduleHome());
canvas.addEventListener('pointercancel',()=>scheduleHome());
document.querySelector('main').addEventListener('pointerdown',cancelHome,true);
document.querySelector('main').addEventListener('pointerup',scheduleHome);
document.querySelector('main').addEventListener('input',scheduleHome);
document.querySelector('main').addEventListener('change',scheduleHome);
document.querySelector('main').addEventListener('keydown',()=>{cancelHome();scheduleHome();},true);
document.addEventListener('visibilitychange',()=>{cancelHome();if(!document.hidden)scheduleHome();});
new ResizeObserver(draw).observe(canvas);changeFamily();

ids('details-open').onclick=()=>ids('details-dialog').showModal();
ids('details-close').onclick=()=>ids('details-dialog').close();
