const assert=require('node:assert/strict'),scene=require('../dist/scene.js');let n=0;
for(const family of ['bt3','duo-safe'])for(const width of [.7,.97,1.2,1.5])for(const heightMode of ['standard','ceiling']){
 const config={width,height:heightMode==='ceiling'?2.27:1.9,heightMode};
 for(let step=0;step<=100;step++){
  const m=scene.model(family,step/100,{glass:'incolor',finish:'dourado'},config),q=m.motion;
  assert(m.faces.every(f=>f.points.flat().every(Number.isFinite)));
  assert.equal(m.faces.filter(f=>f.group==='glass').length,family==='bt3'?3:2);
  assert(q.starts.every(x=>x>=-1e-9&&x+q.span<=width+1e-9));
  assert.equal(q.mobileLeaves,2);
  assert.equal(q.fixedLeaves,family==='bt3'?1:0);
  assert(new Set(q.runnerPlanes).size===q.runnerPlanes.length);
  assert(!m.faces.some(f=>f.part==='header'),'must not reuse F1 assembly');
  if(family==='duo-safe'){
   assert.equal(m.handleType,'pressure-profile');
   assert(m.faces.some(f=>f.part==='duo-pressure-pull'));
   assert(!m.faces.some(f=>f.part==='handle-bar'));
  }else{
   const pull=m.faces.filter(f=>f.part?.startsWith('handle-')).flatMap(f=>f.points);
   assert(Math.min(...pull.map(p=>p[0]))>=q.span+.007,'pull must not pass fixed glass');
  }
  n++;
 }
 assert.deepEqual(scene.model(family,-1,{},config).faces,scene.model(family,0,{},config).faces);
 assert.deepEqual(scene.model(family,2,{},config).faces,scene.model(family,1,{},config).faces);
}
for(const f of ['f1','abrir','canto','flex'])for(const k of [0,.25,.5,.75,1])assert(scene.model(f,k).faces.length>0);
console.log('PASS compact: '+n+' positions /16 assemblies; glass counts, tracks, pressure pulls, pull clearance, clamping, legacy family smoke.');
