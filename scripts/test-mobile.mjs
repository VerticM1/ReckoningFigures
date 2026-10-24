import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {JSDOM} from 'jsdom';
import {mobileDestination} from '../preview/native/policy.js';
const base='capacitor://localhost/preview/';
assert.equal(mobileDestination('profile.html',base),null);
assert.equal(mobileDestination('../main-menu-modules.html',base),'/preview/native/unavailable.html');
assert.equal(mobileDestination('family/',base),'/preview/native/unavailable.html');
assert.equal(mobileDestination('family/dashboard.html',base),null);
assert.equal(mobileDestination('owner/',base),'/preview/native/unavailable.html');
assert.equal(mobileDestination('https://checkout.stripe.com/test',base),'/preview/native/unavailable.html');
assert.equal(mobileDestination('mailto:support@reckoningfigures.com',base),null);
assert.equal(mobileDestination('javascript:alert(1)',base),'/preview/native/unavailable.html');
assert.equal(mobileDestination('../../',base),'/preview/');
for(const name of ['dist/preview/index.html','dist/preview/profile.html','dist/preview/family/dashboard.html','dist/preview/owner/client.js','dist/preview/vendor/firebase.js','dist/preview/native/runtime.js'])assert.ok(fs.existsSync(name),name);
for(const name of ['dist/main-menu-modules.html','dist/preview/owner/index.html','dist/preview/family/sandbox.html','dist/preview/family/index.html'])assert.equal(fs.existsSync(name),false,name);
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of files('dist')){
 if(file.endsWith('.html')){const dom=new JSDOM(fs.readFileSync(file,'utf8'));for(const node of dom.window.document.querySelectorAll('script[src],link[rel=stylesheet]')){const url=node.getAttribute('src')||node.getAttribute('href');if(!url||/^https?:/.test(url))continue;assert.ok(fs.existsSync(path.resolve(path.dirname(file),url.split('?')[0])),`${file}: missing ${url}`);}}
 if(file.endsWith('.css'))assert.doesNotMatch(fs.readFileSync(file,'utf8'),/@import.*fonts.googleapis/);
}
const w=new JSDOM('<body><div id="profile"></div></body>',{url:'https://localhost/preview/profile.html',runScripts:'outside-only'}).window;
let haptics=0,state,network;Object.assign(w,{Capacitor:{isNativePlatform:()=>true},App:{addListener:async(n,fn)=>{state=fn;},getInfo:async()=>({version:'0.3.0',build:'2'})},Network:{getStatus:async()=>({connected:true}),addListener:async(n,fn)=>{network=fn;}},Haptics:{notification:async()=>{haptics++;}},NotificationType:{Success:'SUCCESS',Warning:'WARNING'},mobileDestination});
w.eval(fs.readFileSync('preview/native/runtime.js','utf8').replace(/^import .*;\n/gm,''));await new Promise(r=>setTimeout(r,0));
network({connected:false});assert.equal(w.document.getElementById('native-network').hidden,false);
let resumes=0;w.addEventListener('rf:resume',()=>resumes++);network({connected:true});state({isActive:true});assert.equal(resumes,2);
w.document.dispatchEvent(new w.CustomEvent('rf:answer',{detail:{correct:true}}));await Promise.resolve();assert.equal(haptics,1);w.localStorage.setItem('rfHaptics','off');w.document.dispatchEvent(new w.CustomEvent('rf:answer',{detail:{correct:false}}));assert.equal(haptics,1);
const billing=fs.readFileSync('dist/preview/family/billing-client.js','utf8');const mod=await import('data:text/javascript;base64,'+Buffer.from(billing).toString('base64'));await assert.rejects(mod.billingCall(null,{action:'checkout'}),/not available/);await assert.rejects(mod.billingCall(null,{action:'portal'}),/not available/);
console.log('iOS checks passed: local assets, excluded surfaces, URL policy, offline banner, resume events, haptic preference and payment guards.');
