const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);
for(const f of ['projects.js','pricing.js'])vm.runInContext(fs.readFileSync(path.join(root,'dist',f),'utf8'),ctx);
const items=ctx.window.DEMO_PROJECTS.c1011a.items,resolve=ctx.window.BoxQuote.resolve,scene=require('../dist/scene.js');
assert.equal(items.length,2);
for(const [i,item]of items.entries()){
 assert.equal(item.width,[1.29,1.25][i]);assert.equal(item.height,2.28);assert.equal(item.barLength,.5);
 for(const [glass,expected]of Object.entries({incolor:[208000,210000],fume:[217200,218900],verde:[217200,218900],bronze:[217200,218900],espelhada:[238600,239650],jateada:[238600,239650],protetora:[238600,239650]}))assert.equal(resolve(item,{glass,finish:'cromado'}).total,expected[i]);
 for(const finish of ['preto','branco','dourado','rose','amadeirado'])assert.equal(resolve(item,{glass:'incolor',finish}),null);
 assert.equal(resolve({...item,barLength:.4},{glass:'incolor',finish:'cromado'}),null);
 assert.equal(resolve({...item,width:1.3},{glass:'incolor',finish:'cromado'}),null);
 const faces=scene.model('f1',0,{glass:'incolor',finish:'cromado'},item).faces.filter(f=>f.part==='handle-bar'),ys=faces.flatMap(f=>f.points.map(p=>p[1]));
 assert(Math.abs(Math.max(...ys)-Math.min(...ys)-.5)<1e-9);
}
console.log('PASS: Carmen two items, dimensions, 14 final prices, unknown finishes, dimension/bar guards and 50 cm geometry.');
if(process.env.QA_PUBLIC!=='1')process.exit(0);
(async()=>{
 const {chromium}=require('C:/Users/Computador/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
 const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage({viewport:{width:1366,height:768},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('https://3d.vidrosecoville.com.br/?p=c1011a');await p.waitForSelector('#cash-price');assert.equal(await p.locator('#family option').count(),2);
 for(let i=0;i<2;i++){
  await p.selectOption('#family',{index:i});assert.equal(await p.evaluate(()=>active().width),[1.29,1.25][i]);assert.equal(await p.evaluate(()=>BoxQuote.resolve(active(),materials).total),[208000,210000][i]);
  await p.click('#glass-tab');await p.click('[data-material-group="glass"][data-material-value="fume"]');assert.equal(await p.evaluate(()=>BoxQuote.resolve(active(),materials).total),[217200,218900][i]);
  await p.click('#restore-materials');await p.click('#toggle');assert.equal(await p.locator('#opening').inputValue(),'100');await p.click('#toggle');assert.equal(await p.locator('#opening').inputValue(),'0');
 }
 const out=process.env.QA_OUT||path.join(root,'qa-output');fs.mkdirSync(out,{recursive:true});
 for(const [width,height]of [[1366,768],[390,844]]){await p.setViewportSize({width,height});await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await p.screenshot({path:path.join(out,`viewer-${width}.png`),fullPage:true});}
 assert.deepEqual(errors,[]);console.log('PASS: public project, two items/prices, material change, opening, desktop/mobile, no horizontal overflow or JS errors.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
