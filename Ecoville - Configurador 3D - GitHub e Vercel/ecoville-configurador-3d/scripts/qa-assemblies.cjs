const assert=require('node:assert/strict'),fs=require('node:fs');
const scene=require('../dist/scene.js');
const selection={glass:'incolor',finish:'preto'},summary=[];
for(const family of ['f1','canto'])for(const heightMode of ['standard','ceiling'])for(const width of [.7,1,1.45]){
 const config={width,depth:.95,height:heightMode==='standard'?1.9:2.39,heightMode,bar:heightMode==='ceiling'};
 const fixed0=scene.model(family,0,selection,config).faces.filter(f=>f.group==='glass')[0].points;
 for(let step=0;step<=100;step++){
  const model=scene.model(family,step/100,selection,config),m=model.motion;
  assert(m.handleMin>=m.fixedEdge+m.stopGap-1e-9,'pull crosses fixed pane');
  if(family==='f1'){
   const glass=model.faces.filter(f=>f.group==='glass'),edge=Math.max(...glass[0].points.map(p=>p[0])),pulls=model.faces.filter(f=>f.part?.startsWith('handle-'));
   assert(Math.min(...pulls.flatMap(f=>f.points.map(p=>p[0])))>=edge-1e-9,'actual handle mesh crosses fixed pane');
   const moving=glass[1].points.map(p=>p[0]);assert(Math.min(...moving)>=0&&Math.max(...moving)<=width+1e-9,'sliding leaf leaves frame');
  }
  if(m.returnSide)assert(m.returnSide.handleMax<=m.returnSide.fixedEdge-m.stopGap+1e-9,'return pull crosses fixed pane');
  assert.deepEqual(model.faces.filter(f=>f.group==='glass')[0].points,fixed0,'fixed pane moves');
 }
 const end=scene.model(family,1,selection,config);
 assert.equal(end.handleType,heightMode==='standard'?'small-knob':'flat-bar');
 assert(end.faces.some(f=>f.part===(heightMode==='standard'?'handle-knob':'handle-bar')));
 assert(!end.faces.some(f=>f.part===(heightMode==='standard'?'handle-bar':'handle-knob')));
 summary.push({family,heightMode,width,travel:end.motion.travel,clearance:end.motion.handleMin-end.motion.fixedEdge});
}
assert.equal(scene.model('f1',0,selection,{height:1.9,heightMode:'standard',bar:true}).handleType,'small-knob','explicit standard overrides old flag');
assert.equal(scene.model('f1',0,selection,{height:1.9,bar:true}).handleType,'small-knob','standard height ignores stale bar flag');
assert.equal(scene.model('f1',0,selection,{height:2.39,heightMode:'ceiling'}).handleType,'flat-bar','ceiling needs bar even without legacy flag');
for(const f of ['bt3','duo-safe','unknown'])assert.throws(()=>scene.model(f,0),/sem geometria específica/);
// Summary stays in memory; no runtime files are written.
console.log('PASS:12 assemblies,1212 opening positions; pull clearance, fixed panes, distinct knob/bar, unsupported models rejected.');
