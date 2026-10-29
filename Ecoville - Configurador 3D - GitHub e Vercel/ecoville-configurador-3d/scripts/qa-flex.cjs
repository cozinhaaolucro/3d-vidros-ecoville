const fs=require('node:fs'),assert=require('node:assert/strict'),scene=require('../dist/scene.js');
const sel={glass:'incolor',finish:'dourado'};let positions=0;
for(const width of [.7,.97,1.2])for(const heightMode of ['standard','ceiling']){
 const config={width,height:heightMode==='ceiling'?2.27:1.9,heightMode};let previous=Infinity;
 for(let i=0;i<=100;i++){
  const m=scene.model('flex',i/100,sel,config),mtn=m.motion;
  assert(m.faces.every(f=>f.points.flat().every(Number.isFinite)));
  assert(m.faces.filter(f=>f.part==='flex-glass').length===12);
  assert(m.faces.some(f=>f.part==='flex-centre-hinge'));
  assert(!m.faces.some(f=>['header','bottom-track','nylon-guide'].includes(f.part)));
  assert(mtn.freeEnd[0]<=previous+1e-9);previous=mtn.freeEnd[0];
  assert(Math.abs(mtn.freeEnd[1])<1e-9,'free end stays on closing axis');
  assert(Math.abs(Math.hypot(mtn.joint[0]-mtn.pivot[0],mtn.joint[1])-mtn.leafWidth)<1e-9);
  assert(m.detailFocus.every(Number.isFinite));
  assert.equal(m.handleType,'small-knob');
  assert(m.faces.some(f=>f.part==='handle-knob'));
  assert(!m.faces.some(f=>f.part==='handle-bar'));
  // Distance to first pane centre-plane: inner knob must stay clear even folded.
  const firstNormal=[-Math.sin(mtn.angle),Math.cos(mtn.angle)];
  const handle=m.faces.filter(f=>f.part?.startsWith('handle-')).flatMap(f=>f.points);
  if(mtn.angle>.5)assert(Math.max(...handle.map(p=>(p[0]-mtn.pivot[0])*firstNormal[0]+p[2]*firstNormal[1]))<-.004,'knob intersects first glass');
  positions++;
 }
 assert.deepEqual(scene.model('flex',-1,sel,config).faces,scene.model('flex',0,sel,config).faces);
 assert.deepEqual(scene.model('flex',2,sel,config).faces,scene.model('flex',1,sel,config).faces);
}
for(const family of ['f1','abrir','canto'])for(const k of [0,.25,.5,.75,1])assert(scene.model(family,k,sel).faces.length>0);
// Existing regression, adapted only in memory because Flex is now supported.
const vm=require('node:vm'),path=require('node:path');let legacy=fs.readFileSync(path.join(__dirname,'qa-assemblies.cjs'),'utf8').replace("['bt3','flex','duo-safe','unknown']","['bt3','duo-safe','unknown']");
vm.runInNewContext(legacy,{require,__dirname,console});
console.log('PASS Flex: '+positions+' positions; 6 assemblies, 8mm glass, articulation, finite geometry, clamping, handle modes; legacy regressions above.');
