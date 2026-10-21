import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { mountPilot } from '../pilot.js';
const html=readFileSync(new URL('../pilot.html',import.meta.url),'utf8');
const tick=()=>new Promise(r=>setTimeout(r,0));
async function fixture(){
 const dom=new JSDOM(html,{url:'https://example.test/preview/pilot.html'}),d=dom.window.document;
 let observer,user=null,verified=false,saved=null,verifyCount=0,submits=0;
 const api={observe:fn=>{observer=fn;fn(user);},register:async(email,password)=>{assert.equal(password,'password123');user={email,emailVerified:false};observer(user);return{user};},login:async email=>{user={email,emailVerified:true};observer(user);return{user};},googleLogin:async()=>{throw{code:'auth/unauthorized-domain'};},verifyEmail:async()=>{verifyCount++;},refreshIdentity:async()=>({...user,emailVerified:verified}),logout:async()=>{user=null;observer(null);},resetPassword:async()=>{},pilot:{mine:async()=>saved,submit:async values=>{submits++;saved={...values,status:'submitted'};}}};
 mountPilot(api,d);await tick();
 const click=id=>d.getElementById(id).click();
 const auth=async()=>{d.getElementById('account-form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}));await tick();};
 d.getElementById('account-email').value='teacher@example.com';d.getElementById('account-password').value='password123';
 for(const [id,value]of Object.entries({name:'Test Teacher',school:'Test School',students:'20'}))d.getElementById(id).value=value;
 d.querySelector('input[type=checkbox]').checked=true;
 return{dom,d,api,click,auth,verify:()=>verified=true,count:()=>({verifyCount,submits})};
}
{
 const f=await fixture();await f.auth();assert.equal(f.count().verifyCount,1);assert.equal(f.d.getElementById('school').value,'Test School');assert.equal(f.d.getElementById('account-password').value,'');
 f.click('submit-request');await tick();assert.equal(f.count().submits,0);
 f.verify();f.dom.window.dispatchEvent(new f.dom.window.Event('focus'));await tick();await tick();assert.equal(f.count().submits,1);assert.equal(f.d.getElementById('result').hidden,false);assert.equal(f.d.getElementById('application').hidden,true);f.dom.window.close();
}
{
 const f=await fixture();f.click('account-mode');await f.auth();assert.equal(f.count().verifyCount,0);f.click('submit-request');await tick();assert.equal(f.count().submits,1);f.dom.window.close();
}
{
 const f=await fixture();f.api.register=async()=>{throw{code:'auth/email-already-in-use'};};await f.auth();assert.equal(f.d.getElementById('email-continue').textContent,'Sign in');assert.equal(f.d.getElementById('forgot-password').hidden,false);assert.equal(f.d.getElementById('school').value,'Test School');f.dom.window.close();
}
{
 const f=await fixture();f.click('google-continue');await tick();assert.match(f.d.getElementById('status').textContent,/not configured/);assert.equal(f.d.getElementById('email-continue').disabled,false);await f.auth();assert.equal(f.count().verifyCount,1);f.dom.window.close();
}
console.log('Pilot email flow passed: signup, verification gate, submit, existing account, duplicate account and Google failure recovery.');
