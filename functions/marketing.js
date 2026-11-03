import {createHash, randomBytes} from 'node:crypto';
import {HttpsError} from 'firebase-functions/v2/https';
import {postEmail} from './mail.js';
const BASE='https://reckoningfigures.com';
const FROM='Reckoning Figures <support@reckoningfigures.com>';
const CONSENT='Send me Reckoning Figures learning tips, product updates and promotional offers. I can unsubscribe at any time.';
const groups=['parent','educator','student'];
const hash=s=>createHash('sha256').update(s).digest('hex');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validateSignup(d){
 const email=String(d.email||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!groups.includes(d.group)||d.consent!==true||d.ageEligible!==true)throw new HttpsError('invalid-argument','Enter your email, audience, age confirmation and email preference.');
 return {email,group:d.group,consent:CONSENT,consentVersion:'2026-11-03'};
}
export function renderMarketing({subject,title,body,url,label='Explore Reckoning Figures',address,unsubscribe}){
 if(!address?.trim()||!unsubscribe)throw new HttpsError('failed-precondition','Add your mailing address before sending marketing emails.');
 const u=new URL(url);if(u.origin!==BASE||u.protocol!=='https:')throw new HttpsError('invalid-argument','Use a reckoningfigures.com link.');
 return {subject,html:`<!doctype html><html><body style="background:#f5f7f5;font-family:Arial,sans-serif;color:#193b37;padding:24px"><main style="max-width:560px;margin:auto;background:white;padding:32px;border-radius:18px;border-top:6px solid #dfb94f"><p style="font-weight:bold">RECKONING FIGURES</p><h1>${esc(title)}</h1>${body.split('\n').filter(Boolean).map(p=>`<p style="line-height:1.7">${esc(p)}</p>`).join('')}<p><a style="display:inline-block;padding:15px 22px;background:#f2d991;color:#193b37;border-radius:10px;font-weight:bold" href="${esc(url)}">${esc(label)}</a></p><hr><p style="font-size:12px;line-height:1.6">You opted in to Reckoning Figures learning tips, updates and offers.<br>${esc(address)}<br><a href="${esc(unsubscribe)}">Unsubscribe from marketing emails</a> · support@reckoningfigures.com</p></main></body></html>`,text:`${title}\n\n${body}\n\n${label}: ${url}\n\n${address}\nUnsubscribe: ${unsubscribe}`};
}
export function createResend(key,fetcher=fetch){let queue=Promise.resolve();return async(path,method='GET',body,idempotency)=>{
 const slot=queue.then(()=>new Promise(resolve=>setTimeout(resolve,600)));queue=slot;await slot;
 let r;try{r=await fetcher('https://api.resend.com'+path,{method,headers:{Authorization:'Bearer '+key(),'Content-Type':'application/json',...(idempotency?{'Idempotency-Key':idempotency}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)});}catch{throw new HttpsError('unavailable','Email service is temporarily unavailable. Try again.');}
 if(r.status===404&&method==='GET')return null;
 if(!r.ok)throw new HttpsError('unavailable','Resend could not complete this request. Check API permissions and marketing settings.');
 return r.json();
};}
export function createMarketing({db,auth,key,provider=createResend(key),send=postEmail,now=Date.now}){
 const ref=id=>db.doc('marketingSubscribers/'+id),read=async r=>(await r.get()).data();
 const settings=()=>read(db.doc('marketingSettings/current'));
 async function owner(request){if(!request.auth?.uid)throw new HttpsError('unauthenticated','Sign in to your owner account.');const [a,o]=await Promise.all([auth.getUser(request.auth.uid),read(db.doc('platformOwners/'+request.auth.uid))]);if(a.disabled||!a.emailVerified||o?.active!==true)throw new HttpsError('permission-denied','Owner access required.');return a;}
 async function lock(id,fn){const r=ref(id),lease=randomBytes(16).toString('hex');await db.runTransaction(async tx=>{const d=(await tx.get(r)).data();if(!d)throw new HttpsError('not-found','Link not found.');if(d.leaseUntil>now())throw new HttpsError('aborted','Please wait a moment and try again.');tx.set(r,{lease,leaseUntil:now()+120000},{merge:true});});try{return await fn(r,await read(r));}finally{await db.runTransaction(async tx=>{const d=(await tx.get(r)).data();if(d?.lease===lease)tx.set(r,{leaseUntil:0},{merge:true});});}}
 async function limit(request,email){const hour=Math.floor(now()/3600000),items=[['recipient-'+hash(email),3],['ip-'+hash(request.rawRequest?.ip||'unknown'),12],['global',100]];return db.runTransaction(async tx=>{const refs=items.map(([id])=>db.doc('marketingLimits/'+id)),rows=await Promise.all(refs.map(r=>tx.get(r)));if(rows.some((r,i)=>r.data()?.hour===hour&&r.data().count>=items[i][1]))return false;refs.forEach((r,i)=>tx.set(r,{hour,count:rows[i].data()?.hour===hour?rows[i].data().count+1:1}));return true;});}
 async function complete(id,token){return lock(id,async(r,d)=>{
 if(d.confirmHash!==hash(token)||d.confirmExpires<now())throw new HttpsError('invalid-argument','This confirmation link expired. Please sign up again.');
 if(d.state==='unsubscribed')return {ok:true,suppressed:true};
 const config=await settings();if(!config?.enabled)throw new HttpsError('failed-precondition','Email signup is not open yet.');
 let contact=await provider('/contacts/'+encodeURIComponent(d.email));
 // Never re-subscribe a contact suppressed in Resend; old confirmation links cannot undo opt-outs.
 if(contact?.unsubscribed===true){await r.set({state:'unsubscribed',updatedAt:now()},{merge:true});return {ok:true,suppressed:true};}
 if(!contact){contact=await provider('/contacts','POST',{email:d.email,unsubscribed:false},'rf-contact-'+id);await r.set({contactId:contact.id},{merge:true});}

 await provider('/contacts/'+encodeURIComponent(contact.id)+'/segments/'+encodeURIComponent(config.segments[d.group]),'POST');
 await provider('/contacts/'+encodeURIComponent(contact.id)+'/segments/'+encodeURIComponent(config.segments.all),'POST');
 await r.set({state:'subscribed',contactId:contact.id,confirmedAt:d.confirmedAt||now(),updatedAt:now()},{merge:true});
 if(!d.welcomeSentAt){
 const unsubscribe=BASE+'/preview/marketing/?unsubscribe='+id+'#token='+d.unsubscribeToken;
 const rendered=renderMarketing({subject:'Your Algebra 1 starter pack is ready',title:'A little practice. A fresh start.',body:'Welcome to Reckoning Figures. Your free practice pack includes guided problems, hints and worked answers.\nTry one problem today, then build from there. We’ll also send learning tips, product updates and occasional offers.',url:BASE+'/preview/marketing/practice-pack.html',label:'Open your free practice pack',address:config.address,unsubscribe});
 // Retry sends only inside the provider’s 24-hour idempotency window; older ambiguity needs review.
 if(!d.welcomeAttemptAt)await r.set({welcomeAttemptAt:now()},{merge:true});
 if(!d.welcomeAttemptAt||now()-d.welcomeAttemptAt<20*3600000){const result=await send({from:FROM,reply_to:'support@reckoningfigures.com',to:[d.email],...rendered,headers:{'List-Unsubscribe':`<https://us-central1-reckoningfigures-bbdae.cloudfunctions.net/marketingUnsubscribe?id=${id}&token=${d.unsubscribeToken}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}},key(),'rf-welcome-'+id);if(!result.id)throw new HttpsError('unavailable','Your subscription is saved. Try this confirmation again to finish welcome delivery.');await r.set({welcomeSentAt:now()},{merge:true});}
 }
 return {ok:true};
 });}
 async function unsubscribe(id,token){if(!/^[a-f0-9]{64}$/.test(id||'')||!/^[a-f0-9]{64}$/.test(token||''))throw new HttpsError('invalid-argument','Invalid link.');return lock(id,async(r,d)=>{if(d.unsubscribeToken!==token)throw new HttpsError('invalid-argument','Invalid link.');await r.set({state:'unsubscribed',updatedAt:now()},{merge:true});const contact=await provider('/contacts/'+encodeURIComponent(d.email));if(contact)await provider('/contacts/'+encodeURIComponent(contact.id),'PATCH',{unsubscribed:true});return {ok:true};});}
 const call=async request=>{
 const d=request.data||{},action=d.action;
 if(action==='availability'){const c=await settings();return {enabled:c?.enabled===true};}
 if(action==='unsubscribe')return unsubscribe(d.id,d.token);
 if(action==='confirm'){if(!/^[a-f0-9]{64}$/.test(d.id||'')||!/^[a-f0-9]{64}$/.test(d.token||''))throw new HttpsError('invalid-argument','Invalid link.');return complete(d.id,d.token);}
 if(action==='subscribe'){
 const config=await settings();if(!config?.enabled)throw new HttpsError('failed-precondition','Email signup is not open yet. Your practice pack is available below.');
 const signup=validateSignup(d);if(d.website)return {ok:true};if(!await limit(request,signup.email))return {ok:true};
 const id=hash(signup.email),r=ref(id),token=randomBytes(32).toString('hex');
 const created=await db.runTransaction(async tx=>{const old=(await tx.get(r)).data();if(old?.state==='unsubscribed'||old?.state==='subscribed'||old?.leaseUntil>now())return false;tx.set(r,{...signup,state:'pending',createdAt:old?.createdAt||now(),requestedAt:now(),source:['homepage','account','signup'].includes(d.source)?d.source:'signup',confirmHash:hash(token),confirmExpires:now()+7*86400000,unsubscribeToken:old?.unsubscribeToken||randomBytes(32).toString('hex')},{merge:true});return true;});
 if(!created)return {ok:true};
 const url=BASE+'/preview/marketing/?confirm='+id+'#token='+token;
 const pending=await read(r);
 const confirmation=renderMarketing({subject:'Confirm your Reckoning Figures email subscription',title:'One step closer.',body:'You requested learning tips, product updates and offers from Reckoning Figures. Confirm your subscription to receive your starter pack.\nIf you did not request this, ignore this email. Your account email settings are unchanged.',url,label:'Confirm subscription',address:config.address,unsubscribe:BASE+'/preview/marketing/?unsubscribe='+id+'#token='+pending.unsubscribeToken});
 const result=await send({from:FROM,reply_to:'support@reckoningfigures.com',to:[signup.email],...confirmation},key(),'rf-confirm-'+id+'-'+hash(token));
 if(!result.id)throw new HttpsError('unavailable','We could not send your confirmation. Please try again later.');return {ok:true};
 }
 const account=await owner(request);
 if(action==='settings')return {settings:await settings()||{enabled:false,address:'',segments:{}},ownerEmail:account.email};
 if(action==='configure'){
 const address=String(d.address||'').trim();if(d.enabled&&address.length<10)throw new HttpsError('invalid-argument','Enter your valid business mailing address.');
 let c=await settings()||{segments:{}};const segments={...c.segments};
 if(d.enabled){for(const group of ['all',...groups]){if(!segments[group]){const result=await provider('/segments','POST',{name:'RF opt-in '+group},'rf-segment-'+group);segments[group]=result.id;await db.doc('marketingSettings/current').set({segments},{merge:true});}}}
 await db.doc('marketingSettings/current').set({enabled:d.enabled===true,address,segments,updatedAt:now(),updatedBy:account.uid},{merge:true});return {ok:true};
 }
 if(action==='contacts'){const q=d.after?'?limit=100&after='+encodeURIComponent(d.after):'?limit=100';return await provider('/contacts'+q);}
 if(['draft','test'].includes(action)){
 const c=await settings();if(!c?.enabled)throw new HttpsError('failed-precondition','Finish marketing setup first.');
 if(!['all',...groups].includes(d.group)||!d.subject?.trim()||d.subject.length>150||!d.body?.trim()||d.body.length>10000)throw new HttpsError('invalid-argument','Choose an audience and enter a subject and message.');
 const rendered=renderMarketing({subject:d.subject,title:d.subject,body:d.body,url:d.url||BASE+'/preview/',address:c.address,unsubscribe:action==='draft'?'{{{RESEND_UNSUBSCRIBE_URL}}}':BASE+'/preview/marketing/'});
 if(action==='test'){const result=await send({from:FROM,to:[account.email],reply_to:'support@reckoningfigures.com',...rendered,subject:'[OWNER PREVIEW] '+rendered.subject},key(),'rf-preview-'+randomBytes(16).toString('hex'));if(!result.id)throw new HttpsError('unavailable','Preview delivery failed.');return {ok:true};}
 if(!/^[a-f0-9-]{36}$/.test(d.requestId||''))throw new HttpsError('invalid-argument','Reload the campaign editor.');
 const previous=await read(db.doc('marketingDrafts/'+d.requestId));if(previous?.providerId)return {id:previous.providerId};
 const draft=await provider('/broadcasts','POST',{segment_id:c.segments[d.group],from:FROM,reply_to:'support@reckoningfigures.com',name:d.subject,subject:rendered.subject,html:rendered.html,text:rendered.text,send:false},'rf-draft-'+d.requestId);
 await db.doc('marketingDrafts/'+d.requestId).set({providerId:draft.id,createdBy:account.uid,createdAt:now(),subject:d.subject,group:d.group});return {id:draft.id};
 }
 throw new HttpsError('invalid-argument','Unknown marketing action.');
 };
 return {call,unsubscribe};
}
