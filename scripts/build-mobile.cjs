const fs=require('fs'),path=require('path'),esbuild=require('esbuild');
const out='dist';
const excluded=new Set(['pilot.html','pilot.js','family/index.html','family/family.js','family/checkout.js','family/sandbox.html','family/sandbox.js','family/success.html','family/success.js']);
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
fs.cpSync('preview',path.join(out,'preview'),{recursive:true,filter:src=>{
 const rel=path.relative('preview',src).split(path.sep).join('/');
 if(rel==='scripts'||rel.startsWith('scripts/')||rel==='owner'||rel.startsWith('owner/'))return false;
 if(rel.startsWith('organization/')&&!rel.endsWith('.css')&&!fs.statSync(src).isDirectory())return false;
 return !excluded.has(rel)&&!rel.endsWith('.txt')&&!rel.endsWith('-source.js')&&rel!=='firebase-client.js';
}});
fs.copyFileSync('website.css',out+'/website.css');
fs.mkdirSync(out+'/preview/owner',{recursive:true});fs.copyFileSync('preview/owner/owner.css',out+'/preview/owner/owner.css');fs.mkdirSync(out+'/preview/vendor',{recursive:true});
const bundle=(entry,outfile)=>esbuild.buildSync({entryPoints:[entry],outfile,bundle:true,format:'esm',minify:true,target:'safari15'});
bundle('preview/owner/client-source.js',out+'/preview/owner/client.js');
bundle('preview/firebase-client.js',out+'/preview/vendor/firebase.js');
bundle('preview/native/runtime.js',out+'/preview/native/runtime.js');
// Defense in depth: the native build cannot initiate Stripe checkout or portal sessions.
const billing=out+'/preview/family/billing-client.js';let source=fs.readFileSync(billing,'utf8');source=source.replace('export async function billingCall(user,data){',"export async function billingCall(user,data){\n if(['checkout','portal'].includes(data.action))throw Error('Purchases and billing changes are not available in this iOS pilot build.');");fs.writeFileSync(billing,source);
// The profile still shows existing access and connections, without a web payment CTA.
const profile=out+'/preview/profile.js';source=fs.readFileSync(profile,'utf8').replace('s.canManage?', 'false?');fs.writeFileSync(profile,source);
function transform(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,item.name);if(item.isDirectory()){transform(file);continue;}
 if(item.name.endsWith('.html')){
  let html=fs.readFileSync(file,'utf8');const prefix=path.relative(path.dirname(file),out+'/preview/native').split(path.sep).join('/')||'.';
  html=html.replace(/content="width=device-width,initial-scale=1"/g,'content="width=device-width,initial-scale=1,viewport-fit=cover"');
  html=html.replace(/<script[^>]*src="[^\"]*website-analytics[^\"]*"[^>]*><\/script>/g,'');
  html=html.replace('</head>',`<link rel="stylesheet" href="${prefix}/runtime.css"><script type="module" src="${prefix}/runtime.js"></script></head>`);
  fs.writeFileSync(file,html);
 }
 if(item.name.endsWith('.css')){let css=fs.readFileSync(file,'utf8');css=css.replace(/@import\s+url\(['"]?https:\/\/fonts\.googleapis\.com[^;]+;/g,'');fs.writeFileSync(file,css);}
}}
transform(out);
fs.writeFileSync(out+'/index.html','<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Reckoning Figures</title></head><body><script>location.replace("./preview/index.html")</script></body></html>');
console.log('Built iOS pilot assets: local learning, account/profile, family and school access; no owner workspace, legacy app or Stripe checkout.');
