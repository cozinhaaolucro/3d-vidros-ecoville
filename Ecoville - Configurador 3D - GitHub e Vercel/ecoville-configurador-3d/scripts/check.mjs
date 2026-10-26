import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'dist');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
 const name=m[1];if(/^(?:https?:|#|data:)/.test(name))continue;
 const target=path.resolve(dir,name.split('?')[0]);
 if(!target.startsWith(dir+path.sep)||!fs.existsSync(target))throw Error('Recurso ausente: '+name);
}
for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.js')))execFileSync(process.execPath,['--check',path.join(dir,name)]);
const context=vm.createContext({window:{}});
for(const name of ['projects.js','pricing.js'])vm.runInContext(fs.readFileSync(path.join(dir,name),'utf8'),context);
const {DEMO_PROJECTS,BoxQuote}=context.window;
const item=DEMO_PROJECTS.t01.items[0];
if(item.width!==1||item.height!==2.39)throw Error('Verificar medidas do exemplo');
if(BoxQuote.resolve(item,{glass:'incolor',finish:'preto'})?.total!==154600)throw Error('Preço do exemplo divergente');
if(BoxQuote.resolve(item,{glass:'incolor',finish:'amadeirado'})!==null)throw Error('Opção sem custo deve ficar sob consulta');
if(BoxQuote.resolve({...item,width:1.2},{glass:'incolor',finish:'preto'})!==null)throw Error('Preço não pode ser reutilizado para outras medidas');
const keys=Object.keys(BoxQuote.combinations||{});
if(keys.length!==42)throw Error('Verificar matriz de combinações do exemplo');
console.log('OK: recursos locais, sintaxe JS, 42 combinações e proteção por medidas.');

execFileSync(process.execPath,[path.join(root,'scripts/qa-assemblies.cjs')],{stdio:'inherit',cwd:root});
