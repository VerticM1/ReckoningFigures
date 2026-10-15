import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {recentSchools,rememberSchool,forgetSchool} from '../school/recent-schools.js';
import {emailTypes,renderEmail} from '../owner/email-templates.js';
const tick=()=>new Promise(r=>setTimeout(r,0));
const dom=new JSDOM('<main id="school-app"></main><dialog id="member-editor"></dialog>',{url:'https://example.org/preview/school/',runScripts:'outside-only'});
globalThis.localStorage=dom.window.localStorage;dom.window.HTMLDialogElement.prototype.close=function(){};
rememberSchool('a',{id:'school1',name:'Test school'});rememberSchool('a',{id:'school1',name:'Renamed school'});assert.equal(recentSchools('a').length,1);assert.equal(recentSchools('b').length,0);assert.equal(recentSchools('a')[0].name,'Renamed school');
let observer;const api={observe:fn=>observer=fn,logout:async()=>{},login:async()=>{},googleLogin:async()=>{}};
const source=fs.readFileSync(new URL('../school/school.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
dom.window.Function('api','recentSchools','forgetSchool',source)(api,recentSchools,forgetSchool);
observer(null);assert(dom.window.document.querySelector('#login'));assert(dom.window.document.querySelector('a[href="recover.html"]'));
observer({uid:'a'});assert(dom.window.document.body.textContent.includes('Renamed school'));assert(dom.window.document.querySelector('a[href="?school=school1"]'));dom.window.document.querySelector('[data-forget]').click();assert.equal(recentSchools('a').length,0);
observer({uid:'b'});assert(!dom.window.document.body.textContent.includes('Renamed school'));
// Opening a saved URL still uses the existing server membership check.
const denied=new JSDOM('<main id="school-app"></main><dialog id="member-editor"></dialog>',{url:'https://example.org/preview/school/?school=school1',runScripts:'outside-only'});denied.window.HTMLDialogElement.prototype.close=function(){};let checked=false;
denied.window.Function('api','recentSchools','forgetSchool',source)({...api,observe:fn=>fn({uid:'a'}),schoolContext:async()=>{checked=true;throw Error('Access removed');}},recentSchools,forgetSchool);await tick();assert(checked);assert(denied.window.document.body.textContent.includes('Access removed'));assert(!denied.window.document.querySelector('a[href^="classroom"]'));
const recoverySource=fs.readFileSync(new URL('../school/recover.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
for(const error of [null,'auth/user-not-found','auth/too-many-requests','auth/network-request-failed']){const d=new JSDOM('<form id="recovery"><input name="email" value="teacher@example.org"><button>Reset</button><p id="recovery-status"></p></form>',{runScripts:'outside-only'});let received;d.window.Function('resetPassword',recoverySource)(async email=>{received=email;if(error)throw {code:error};});d.window.document.querySelector('form').dispatchEvent(new d.window.Event('submit',{cancelable:true}));await tick();assert.equal(received,'teacher@example.org');const text=d.window.document.querySelector('#recovery-status').textContent;assert(error==='auth/too-many-requests'?text.includes('Too many'):error==='auth/network-request-failed'?text.includes('Could not'):text.includes('If this email'));assert(!d.window.document.querySelector('button').disabled);d.window.close();}
const data={schoolName:'School <script>alert(1)</script>',role:'teacher',invitedEmail:'teacher@example.invalid',expiresText:'22 October 2026',actionUrl:'https://example.invalid/invite?x=1&y=2',helpText:'Ask your administrator'};
for(const type of Object.keys(emailTypes)){const rendered=renderEmail(type,data);assert(rendered.subject&&rendered.text&&rendered.html);assert(!rendered.html.includes('<script>'));assert(rendered.html.includes('x=1&amp;y=2'));assert(rendered.text.includes(data.actionUrl));assert.throws(()=>renderEmail(type,{...data,actionUrl:'javascript:alert(1)'}));}
assert.throws(()=>renderEmail('invite',{...data,role:'owner'}));assert.throws(()=>renderEmail('invite',{...data,expiresText:''}));
for(const file of ['school/recover.html','owner/pilot-operations.html','owner/email-preview.html']){const d=new JSDOM(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'));for(const el of d.window.document.querySelectorAll('script[src],link[rel="stylesheet"]')){const url=(el.getAttribute('src')||el.getAttribute('href')).split('?')[0];assert(fs.existsSync(new URL(url,new URL('../'+file,import.meta.url))),url);}}
dom.window.close();denied.window.close();console.log('PASS account-isolated shortcuts, membership denial, recovery states, six escaped email templates, safe URLs and page assets');
