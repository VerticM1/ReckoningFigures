import * as api from './client.js';
import {marketingCall} from '../marketing/client.js';
const $=id=>document.getElementById(id);let user,after=null,requestId=crypto.randomUUID(),generation=0;
const note=t=>$('status').textContent=t;
async function run(button,fn){button.disabled=true;try{await fn();}catch(e){note(e.message);}finally{button.disabled=false;}}
api.observe(async account=>{const g=++generation;user=account;$('console').hidden=true;if(!user){note('Sign in through the owner workspace, then return to this page.');return;}try{const r=await marketingCall({action:'settings'},user);if(g!==generation)return;$('settings').elements.address.value=r.settings.address||'';$('settings').elements.enabled.checked=r.settings.enabled===true;$('console').hidden=false;note(r.settings.enabled?'Marketing signup is enabled.':'Marketing is off. Add your mailing address and enable it when ready.');}catch(e){if(g===generation)note(e.message);}});
$('settings').onsubmit=e=>{e.preventDefault();const f=e.target;run(f.querySelector('button'),async()=>{await marketingCall({action:'configure',address:f.elements.address.value,enabled:f.elements.enabled.checked},user);note('Settings saved. '+(f.elements.enabled.checked?'Signup and welcome emails are enabled.':'Marketing signup is off.'));});};
async function contacts(append){const r=await marketingCall({action:'contacts',...(append&&after?{after}:{})},user),rows=r.data||[];if(!append)$('subscribers').replaceChildren();for(const c of rows){const row=document.createElement('p');row.textContent=c.email+' — '+(c.unsubscribed?'Unsubscribed':'Subscribed');$('subscribers').append(row);}after=rows.at(-1)?.id;$('more').hidden=!r.has_more;note(rows.length?'Loaded live Resend contacts.':'No contacts yet.');}
$('contacts').onclick=()=>run($('contacts'),()=>contacts(false));$('more').onclick=()=>run($('more'),()=>contacts(true));
const values=()=>Object.fromEntries(new FormData($('campaign')));
$('campaign').addEventListener('input',()=>requestId=crypto.randomUUID());
$('test').onclick=()=>{if(!$('campaign').reportValidity())return;run($('test'),async()=>{await marketingCall({action:'test',...values()},user);note('Preview sent to your verified owner email.');});};
$('campaign').onsubmit=e=>{e.preventDefault();run(e.target.querySelector('[type=submit]'),async()=>{await marketingCall({action:'draft',requestId,...values()},user);note('Draft saved in Resend. Open Resend → Broadcasts to review, send a test, schedule or send it.');});};
