'use strict';

// Somente preços finais. Custos e memória de cálculo ficam no ambiente interno.

(function(root){

// Cada item novo declara pricingId. A chave aponta somente para a sua matriz final.

// Medidas em metros; thickness em mm; total em centavos; validUntil em YYYY-MM-DD.

// Schema: {id, family, width, height, heightMode, bar, thickness, validUntil,

//          combinations:{'incolor.preto':{total:123400}}}. Canto também exige depth.

// Opcionais depth/doorWidth/hingeCount/overlap devem coincidir no item e na matriz.

// Matriz sem combinação cadastrada permanece sob consulta, sem estimativa por área.

const quotes={
"b1211r":{"family":"f1","width":1.2,"height":2.6,"heightMode":"ceiling","bar":true,"thickness":8,"overlap":0.05,"id":"b1211r","validUntil":"2026-12-02","combinations":{"incolor.preto":{"total":166800},"incolor.branco":{"total":166800},"incolor.cromado":{"total":218600}}},
"c1011a-social":{"family":"f1","width":1.29,"height":2.28,"heightMode":"ceiling","bar":true,"barLength":0.5,"thickness":8,"overlap":0.05,"id":"c1011a-social","validUntil":"2026-11-30","combinations":{"incolor.cromado":{"total":208000},"fume.cromado":{"total":217200},"verde.cromado":{"total":217200},"bronze.cromado":{"total":217200},"espelhada.cromado":{"total":238600},"jateada.cromado":{"total":238600},"protetora.cromado":{"total":238600}}},
"c1011a-suite":{"family":"f1","width":1.25,"height":2.28,"heightMode":"ceiling","bar":true,"barLength":0.5,"thickness":8,"overlap":0.05,"id":"c1011a-suite","validUntil":"2026-11-30","combinations":{"incolor.cromado":{"total":210000},"fume.cromado":{"total":218900},"verde.cromado":{"total":218900},"bronze.cromado":{"total":218900},"espelhada.cromado":{"total":239650},"jateada.cromado":{"total":239650},"protetora.cromado":{"total":239650}}},
"b1011a-teto":{"family":"f1","width":1.45,"height":2.3,"heightMode":"ceiling","bar":true,"thickness":8,"overlap":0.05,"id":"b1011a-teto","validUntil":"2026-11-30","combinations":{"incolor.preto":{"total":170100},"incolor.branco":{"total":170100},"incolor.cromado":{"total":221900},"incolor.dourado":{"total":327150},"fume.preto":{"total":180450},"fume.branco":{"total":180450},"fume.cromado":{"total":232250},"fume.dourado":{"total":337500},"verde.preto":{"total":180450},"verde.branco":{"total":180450},"verde.cromado":{"total":232250},"verde.dourado":{"total":337500},"bronze.preto":{"total":180450},"bronze.branco":{"total":180450},"bronze.cromado":{"total":232250},"bronze.dourado":{"total":337500},"espelhada.preto":{"total":204600},"espelhada.branco":{"total":204600},"espelhada.cromado":{"total":256400},"espelhada.dourado":{"total":361650},"jateada.preto":{"total":204600},"jateada.branco":{"total":204600},"jateada.cromado":{"total":256400},"jateada.dourado":{"total":361650},"protetora.preto":{"total":204600},"protetora.branco":{"total":204600},"protetora.cromado":{"total":256400},"protetora.dourado":{"total":361650}}},
"b1011a-padrao":{"family":"f1","width":1.45,"height":1.9,"heightMode":"standard","bar":false,"thickness":8,"overlap":0.05,"id":"b1011a-padrao","validUntil":"2026-11-30","combinations":{"incolor.preto":{"total":105200},"incolor.branco":{"total":105200},"incolor.cromado":{"total":119750},"incolor.dourado":{"total":189550},"fume.preto":{"total":115200},"fume.branco":{"total":115200},"fume.cromado":{"total":129700},"fume.dourado":{"total":199500},"espelhada.preto":{"total":133700},"espelhada.branco":{"total":133700},"espelhada.cromado":{"total":148250},"espelhada.dourado":{"total":218050},"jateada.preto":{"total":133700},"jateada.branco":{"total":133700},"jateada.cromado":{"total":148250},"jateada.dourado":{"total":218050},"protetora.preto":{"total":133700},"protetora.branco":{"total":133700},"protetora.cromado":{"total":148250},"protetora.dourado":{"total":218050}}},
"b0911a":{"family":"f1","width":1.43,"height":1.9,"heightMode":"standard","bar":false,"thickness":8,"overlap":0.05,"id":"b0911a","validUntil":"2026-11-29","combinations":{"incolor.preto":{"total":113700},"fume.preto":{"total":123700},"espelhada.preto":{"total":142200},"jateada.preto":{"total":142200},"protetora.preto":{"total":142200},"incolor.dourado":{"total":198050},"fume.dourado":{"total":208000},"espelhada.dourado":{"total":226550},"jateada.dourado":{"total":226550},"protetora.dourado":{"total":226550}}},"m0311a":{"label": "Box Flex articulado", "family": "flex", "width": 0.84, "height": 1.9, "heightMode": "standard", "bar": false, "thickness": 8, "glass": "incolor", "finish": "cromado", "pricingId": "m0311a", "id": "m0311a", "validUntil": "2026-11-23", "combinations": {"incolor.cromado": {"total": 212900}}},
"p0311a":{"family":"porta4","width":2.4,"height":2.1,"heightMode":"special","bar":true,"thickness":8,"id":"p0311a","validUntil":"2026-11-23","combinations":{"incolor.preto":{"total":276000},"incolor.branco":{"total":276000}}},

"b0311a":{"family":"canto","width":0.975,"depth":0.935,"height":1.9,"heightMode":"standard","bar":false,"thickness":8,"id":"b0311a","validUntil":"2026-11-23","combinations":{"incolor.preto":{"total":140550},"incolor.branco":{"total":140550},"incolor.fosco":{"total":140300},"incolor.marrom":{"total":141800},"incolor.cromado":{"total":168850},"fume.preto":{"total":154150},"fume.branco":{"total":154150},"fume.fosco":{"total":153950},"fume.marrom":{"total":155400},"fume.cromado":{"total":182500},"espelhada.preto":{"total":179500},"espelhada.branco":{"total":179500},"espelhada.fosco":{"total":179250},"espelhada.marrom":{"total":180750},"espelhada.cromado":{"total":207800},"jateada.preto":{"total":179500},"jateada.branco":{"total":179500},"jateada.fosco":{"total":179250},"jateada.marrom":{"total":180750},"jateada.cromado":{"total":207800},"protetora.preto":{"total":179500},"protetora.branco":{"total":179500},"protetora.fosco":{"total":179250},"protetora.marrom":{"total":180750},"protetora.cromado":{"total":207800}}},


"b2910a":{"family":"f1","width":1.22,"height":2.235,"heightMode":"ceiling","bar":true,"thickness":8,"overlap":0.05,"id":"b2910a","validUntil":"2026-11-18","combinations":{"incolor.branco":{"total":140000},"incolor.preto":{"total":140000},"incolor.fosco":{"total":139850},"incolor.marrom":{"total":140950},"incolor.cromado":{"total":191800},"fume.branco":{"total":148550},"fume.preto":{"total":148550},"fume.fosco":{"total":148350},"fume.marrom":{"total":149450},"fume.cromado":{"total":200350},"verde.branco":{"total":148550},"verde.preto":{"total":148550},"verde.fosco":{"total":148350},"verde.marrom":{"total":149450},"verde.cromado":{"total":200350},"bronze.branco":{"total":148550},"bronze.preto":{"total":148550},"bronze.fosco":{"total":148350},"bronze.marrom":{"total":149450},"bronze.cromado":{"total":200350},"espelhada.branco":{"total":168400},"espelhada.preto":{"total":168400},"espelhada.fosco":{"total":168250},"espelhada.marrom":{"total":169300},"espelhada.cromado":{"total":220200},"jateada.branco":{"total":168400},"jateada.preto":{"total":168400},"jateada.fosco":{"total":168250},"jateada.marrom":{"total":169300},"jateada.cromado":{"total":220200},"protetora.branco":{"total":168400},"protetora.preto":{"total":168400},"protetora.fosco":{"total":168250},"protetora.marrom":{"total":169300},"protetora.cromado":{"total":220200}}},

"b2810a-1":{"family":"f1","width":1.62,"height":2.4,"heightMode":"ceiling","bar":true,"thickness":8,"id":"b2810a-1","validUntil":"2026-11-17","combinations":{"incolor.preto":{"total":174000}}},

"b2810a-2":{"family":"canto","width":0.83,"height":1.9,"heightMode":"standard","bar":false,"thickness":8,"depth":1.1,"id":"b2810a-2","validUntil":"2026-11-17","combinations":{"incolor.branco":{"total":122100}}},

"b2810a-3":{"family":"f1","width":1.25,"height":1.9,"heightMode":"standard","bar":false,"thickness":8,"id":"b2810a-3","validUntil":"2026-11-17","combinations":{"incolor.branco":{"total":98200}}},

"b2710a":{"family":"f1","width":1.2,"height":2.4,"heightMode":"ceiling","bar":true,"thickness":8,"overlap":0.05,"id":"b2710a","validUntil":"2026-11-16","combinations":{"protetora.cromado":{"total":240650}}},

"b2710b":{"family":"f1","width":1.0,"height":2.36,"heightMode":"ceiling","bar":true,"thickness":8,"overlap":0.05,"id":"b2710b","validUntil":"2026-11-16","combinations":{"incolor.preto":{"total":152100},"incolor.branco":{"total":152100},"fume.preto":{"total":159550},"fume.branco":{"total":159550},"verde.preto":{"total":159550},"verde.branco":{"total":159550},"bronze.preto":{"total":159550},"bronze.branco":{"total":159550},"espelhada.preto":{"total":176900},"espelhada.branco":{"total":176900},"jateada.preto":{"total":176900},"jateada.branco":{"total":176900},"protetora.preto":{"total":176900},"protetora.branco":{"total":176900}}},

"b2610a-abrir":{"width":0.9,"height":2.5,"heightMode":"ceiling","bar":true,"thickness":8,"overlap":0.05,"family":"abrir","doorWidth":0.55,"hingeCount":3,"id":"b2610a-abrir","validUntil":"2026-11-15","combinations":{"incolor.preto":{"total":132450},"incolor.branco":{"total":132450},"fume.preto":{"total":139550},"fume.branco":{"total":139550},"verde.preto":{"total":139550},"verde.branco":{"total":139550},"bronze.preto":{"total":139550},"bronze.branco":{"total":139550},"espelhada.preto":{"total":156200},"espelhada.branco":{"total":156200},"jateada.preto":{"total":156200},"jateada.branco":{"total":156200}}},

"b2610a-f1":{"width":0.9,"height":2.5,"heightMode":"ceiling","bar":true,"thickness":8,"overlap":0.05,"family":"f1","id":"b2610a-f1","validUntil":"2026-11-15","combinations":{"incolor.preto":{"total":150400},"incolor.branco":{"total":150400},"incolor.fosco":{"total":150300},"incolor.marrom":{"total":151200},"incolor.cromado":{"total":200350},"fume.preto":{"total":157550},"fume.branco":{"total":157550},"fume.fosco":{"total":157400},"fume.marrom":{"total":158300},"fume.cromado":{"total":207450},"verde.preto":{"total":157550},"verde.branco":{"total":157550},"verde.fosco":{"total":157400},"verde.marrom":{"total":158300},"verde.cromado":{"total":207450},"bronze.preto":{"total":157550},"bronze.branco":{"total":157550},"bronze.fosco":{"total":157400},"bronze.marrom":{"total":158300},"bronze.cromado":{"total":207450},"espelhada.preto":{"total":174150},"espelhada.branco":{"total":174150},"espelhada.fosco":{"total":174050},"espelhada.marrom":{"total":174950},"espelhada.cromado":{"total":224100},"jateada.preto":{"total":174150},"jateada.branco":{"total":174150},"jateada.fosco":{"total":174050},"jateada.marrom":{"total":174950},"jateada.cromado":{"total":224100}}},

"b2910b-f1":{"family":"f1","width":0.97,"height":2.27,"heightMode":"ceiling","bar":true,"thickness":8,"overlap":0.05,"id":"b2910b-f1","validUntil":"2026-11-18","combinations":{"incolor.dourado":{"total":307450},"incolor.preto":{"total":149450},"incolor.branco":{"total":149450},"incolor.fosco":{"total":149300},"incolor.marrom":{"total":150200},"incolor.cromado":{"total":199350},"incolor.rose":{"total":307450},"fume.dourado":{"total":314400},"fume.preto":{"total":156400},"fume.branco":{"total":156400},"fume.fosco":{"total":156250},"fume.marrom":{"total":157150},"fume.cromado":{"total":206300},"fume.rose":{"total":314400},"verde.dourado":{"total":314400},"verde.preto":{"total":156400},"verde.branco":{"total":156400},"verde.fosco":{"total":156250},"verde.marrom":{"total":157150},"verde.cromado":{"total":206300},"verde.rose":{"total":314400},"bronze.dourado":{"total":314400},"bronze.preto":{"total":156400},"bronze.branco":{"total":156400},"bronze.fosco":{"total":156250},"bronze.marrom":{"total":157150},"bronze.cromado":{"total":206300},"bronze.rose":{"total":314400},"espelhada.dourado":{"total":330600},"espelhada.preto":{"total":172600},"espelhada.branco":{"total":172600},"espelhada.fosco":{"total":172450},"espelhada.marrom":{"total":173350},"espelhada.cromado":{"total":222500},"espelhada.rose":{"total":330600},"jateada.dourado":{"total":330600},"jateada.preto":{"total":172600},"jateada.branco":{"total":172600},"jateada.fosco":{"total":172450},"jateada.marrom":{"total":173350},"jateada.cromado":{"total":222500},"jateada.rose":{"total":330600},"protetora.dourado":{"total":330600},"protetora.preto":{"total":172600},"protetora.branco":{"total":172600},"protetora.fosco":{"total":172450},"protetora.marrom":{"total":173350},"protetora.cromado":{"total":222500},"protetora.rose":{"total":330600}}},

"b2910b-flex":{"family":"flex","width":0.97,"height":2.27,"heightMode":"ceiling","bar":false,"thickness":8,"overlap":0.05,"id":"b2910b-flex","validUntil":"2026-11-18","combinations":{"incolor.dourado":{"total":431450},"fume.dourado":{"total":438400},"verde.dourado":{"total":438400},"bronze.dourado":{"total":438400},"espelhada.dourado":{"total":454600},"jateada.dourado":{"total":454600},"protetora.dourado":{"total":454600}}},

"b2910b-abrir":{"family":"abrir","width":0.97,"height":2.27,"heightMode":"ceiling","bar":true,"thickness":8,"overlap":0.05,"doorWidth":0.62,"hingeCount":3,"id":"b2910b-abrir","validUntil":"2026-11-18","combinations":{"incolor.preto":{"total":131450},"incolor.branco":{"total":131450},"fume.preto":{"total":138400},"fume.branco":{"total":138400},"verde.preto":{"total":138400},"verde.branco":{"total":138400},"bronze.preto":{"total":138400},"bronze.branco":{"total":138400},"espelhada.preto":{"total":154600},"espelhada.branco":{"total":154600},"jateada.preto":{"total":154600},"jateada.branco":{"total":154600},"protetora.preto":{"total":154600},"protetora.branco":{"total":154600}}},

"b2910b-bt3":{"family":"bt3","width":0.97,"height":2.27,"heightMode":"ceiling","bar":true,"thickness":8,"overlap":0.1,"id":"b2910b-bt3","validUntil":"2026-11-18","combinations":{"incolor.fosco":{"total":289450},"fume.fosco":{"total":296750},"verde.fosco":{"total":296750},"bronze.fosco":{"total":296750},"espelhada.fosco":{"total":313750},"jateada.fosco":{"total":313750},"protetora.fosco":{"total":313750}}},

"b2910b-duo-safe":{"family":"duo-safe","width":0.97,"height":2.27,"heightMode":"ceiling","bar":false,"thickness":8,"overlap":0.1,"id":"b2910b-duo-safe","validUntil":"2026-11-18","combinations":{}},

// QUOTE_MATRICES: acrescentar aqui somente matrizes comerciais verificadas.

'box-1000x2390-v1':{id:'box-1000x2390-v1',family:'f1',width:1,height:2.39,heightMode:'ceiling',bar:true,thickness:8,validUntil:'2026-11-15',

combinations:{"incolor.preto":{"total":154600},"incolor.branco":{"total":154600},"incolor.cromado":{"total":206400},"incolor.rose":{"total":310650},"incolor.dourado":{"total":310650},"incolor.fosco":{"total":154450},"incolor.marrom":{"total":155500},"fume.preto":{"total":162150},"fume.branco":{"total":162150},"fume.cromado":{"total":213950},"fume.rose":{"total":318150},"fume.dourado":{"total":318150},"fume.fosco":{"total":161950},"fume.marrom":{"total":163050},"verde.preto":{"total":162150},"verde.branco":{"total":162150},"verde.cromado":{"total":213950},"verde.rose":{"total":318150},"verde.dourado":{"total":318150},"verde.fosco":{"total":161950},"verde.marrom":{"total":163050},"bronze.preto":{"total":162150},"bronze.branco":{"total":162150},"bronze.cromado":{"total":213950},"bronze.rose":{"total":318150},"bronze.dourado":{"total":318150},"bronze.fosco":{"total":161950},"bronze.marrom":{"total":163050},"espelhada.preto":{"total":179700},"espelhada.branco":{"total":179700},"espelhada.cromado":{"total":231500},"espelhada.rose":{"total":335750},"espelhada.dourado":{"total":335750},"espelhada.fosco":{"total":179550},"espelhada.marrom":{"total":180600},"jateada.preto":{"total":179700},"jateada.branco":{"total":179700},"jateada.cromado":{"total":231500},"jateada.rose":{"total":335750},"jateada.dourado":{"total":335750},"jateada.fosco":{"total":179550},"jateada.marrom":{"total":180600}},

}};

function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}

freeze(quotes);

const legacy=quotes['box-1000x2390-v1'];

function tableFor(item){

 if(!item||typeof item!=='object')return null;

 // Compatibilidade restrita ao próprio item t01, nunca a outro item de medidas iguais.

 const legacyItem=root.DEMO_PROJECTS&&root.DEMO_PROJECTS.t01&&root.DEMO_PROJECTS.t01.items[0];

 const id=item.pricingId===undefined&&item===legacyItem?legacy.id:item.pricingId;

 const table=typeof id==='string'&&Object.hasOwn(quotes,id)?quotes[id]:null;

 if(!table||!['f1','abrir','canto','flex','bt3','duo-safe','porta4'].includes(item.family)||!Number.isFinite(item.width)||item.width<=0||!Number.isFinite(item.height)||item.height<=0||typeof item.bar!=='boolean'||!['standard','ceiling','special'].includes(item.heightMode)||table.family!==item.family||table.width!==item.width||table.height!==item.height||table.bar!==item.bar||table.heightMode!==item.heightMode)return null;

 for(const key of ['depth','doorWidth','hingeCount','overlap','barLength'])if((table[key]!==undefined||item[key]!==undefined)&&table[key]!==item[key])return null;

 if(item.family==='canto'&&(!Number.isFinite(item.depth)||item.depth<=0))return null;

 const thickness=item.thickness===undefined&&item===legacyItem?8:item.thickness;

 if(!Number.isFinite(thickness)||thickness<=0||table.thickness!==thickness)return null;

 return table;

}

function resolve(item,selection){

 const table=tableFor(item);

 if(!table||!selection||!table.combinations||typeof table.combinations!=='object')return null;

 const key=selection.glass+'.'+selection.finish;

 const value=Object.hasOwn(table.combinations,key)?table.combinations[key]:null;

 return value&&Number.isSafeInteger(value.total)&&value.total>=0?value:null;

}

root.BoxQuote=Object.freeze({id:legacy.id,width:legacy.width,height:legacy.height,validUntil:legacy.validUntil,combinations:legacy.combinations,quotes,tableFor,resolve});

})(window);


