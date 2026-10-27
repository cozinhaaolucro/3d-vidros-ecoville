(function(root){
 'use strict';
 // Artistic previews, not manufacturer colorimetry or a compatibility/price table.
 const glasses={
  protetora:{label:'Película protetora',description:'Incolor + película protetora',kind:'transparent',fill:'rgba(217,230,223,0.10)',edge:'#819a91',swatch:'linear-gradient(135deg,#fff,#e5eee8)'},
  incolor:{label:'Incolor',kind:'transparent',fill:'rgba(217,230,223,0.10)',edge:'#819a91',swatch:'linear-gradient(135deg,#fff,#e5eee8)'},
  fume:{label:'Fumê',kind:'transparent',fill:'rgba(57,57,57,0.43)',edge:'#626262',swatch:'#737373'},
  verde:{label:'Verde',kind:'transparent',fill:'rgba(74,128,93,0.30)',edge:'#5e8c70',swatch:'#7fa68a'},
  bronze:{label:'Bronze',kind:'transparent',fill:'rgba(143,105,65,0.34)',edge:'#927450',swatch:'#ad8b65'},
  espelhada:{label:'Película espelhada',description:'Incolor + película espelhada',kind:'mirror',fill:'rgba(218,231,232,0.86)',edge:'#9aaeb0',swatch:'linear-gradient(125deg,#c6d7da,#ffffff 46%,#d9e6e8 65%,#eff5f5)'},
  jateada:{label:'Película jateada',description:'Incolor + película jateada',kind:'frosted',fill:'rgba(237,241,236,0.87)',edge:'#a6b5ab',swatch:'linear-gradient(135deg,#fff,#cfd8d0)'}
 };
 const finishes={
  fosco:{label:'Prata natural fosco',kind:'solid',color:'#aeb5b6',edge:'#7c878a',swatch:'#aeb5b6'},
  branco:{label:'Branco',kind:'solid',color:'#fafbf8',edge:'#bbc6bd',swatch:'#fafbf8'},
  preto:{label:'Preto',kind:'solid',color:'#282929',edge:'#111616',swatch:'#282929'},
  cromado:{label:'Cromado',kind:'metal',color:'#b4bfc2',stops:['#647176','#e5ecee','#ffffff','#8e9a9f','#d8e0e1'],swatch:'linear-gradient(115deg,#69777b,#fff 45%,#929fa2 70%,#e5ecec)'},
  dourado:{label:'Dourado',kind:'metal',color:'#bc9a50',stops:['#806229','#c8ad69','#f2e2ae','#a8873e','#dfc78a'],swatch:'linear-gradient(115deg,#927139,#e6d398 45%,#b99647 75%,#d7bd7c)'},
  marrom:{label:'Marrom / bronze',kind:'solid',color:'#6c4c37',edge:'#483324',swatch:'#6c4c37'},
  amadeirado:{label:'Amadeirado',kind:'wood',color:'#986538',edge:'#633e24',swatch:'repeating-linear-gradient(86deg,#946438 0 3px,#a77744 4px 7px,#82542f 8px 9px)'},
  rose:{label:'Rosê neutro',kind:'metal',color:'#c79785',stops:['#986a5d','#d2a697','#f3d8ca','#b67e6e','#e4c0af'],swatch:'linear-gradient(115deg,#a47869,#f0d3c5 45%,#bb8777 75%,#e1baaa)'}
 };
 for(const collection of [glasses,finishes]){for(const v of Object.values(collection)){if(v.stops)Object.freeze(v.stops);Object.freeze(v);}Object.freeze(collection);}
 function selection(glass='incolor',finish='branco'){
  return Object.freeze({glass:Object.hasOwn(glasses,glass)?glass:'incolor',finish:Object.hasOwn(finishes,finish)?finish:'branco'});
 }
 function update(current,group,value){
  if(group==='glass')return selection(value,current.finish);
  if(group==='finish')return selection(current.glass,value);
  return selection(current.glass,current.finish);
 }
 const api=Object.freeze({glasses,finishes,selection,update});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BoxMaterials=api;
})(typeof window==='undefined'?globalThis:window);


