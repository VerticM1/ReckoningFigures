import { createHash, randomUUID } from 'node:crypto';
import { HttpsError } from 'firebase-functions/v2/https';
import { renderEmail } from './email-templates.js';
import { postEmail } from './mail.js';
const BASE='https://reckoningfigures.com';
const hash=s=>createHash('sha256').update(s).digest('hex');
export function returnPath(value){
 try {const u=new URL(value,BASE);if(u.origin!==BASE)return '/preview/school/';
 if(!['/preview/family/dashboard.html','/preview/family/link.html','/preview/pilot.html','/preview/school/','/preview/school/staff-join.html','/preview/school/join.html','/preview/owner/','/preview/'].includes(u.pathname))return '/preview/school/';
 const clean=new URL(u.pathname,BASE);for(const key of ['invite','school']){const v=u.searchParams.get(key);if(v&&/^[A-Za-z0-9_-]{1,128}$/.test(v))clean.searchParams.set(key,v);}return clean.pathname+clean.search;
 }catch{return '/preview/school/';}
}
// Only generated Firebase codes reach the branded handler. Never accept action URLs from callers.
export function actionURL(generated,kind,next){
 const code=new URL(generated).searchParams.get('oobCode');if(!code)throw Error('Missing action code');
 const url=new URL('/preview/account-action.html',BASE);url.searchParams.set('mode',kind==='verify'?'verifyEmail':'resetPassword');url.searchParams.set('oobCode',code);url.searchParams.set('next',returnPath(next));return url.href;
}
export function createAuthMailer({db,auth,key,send=postEmail,now=Date.now}){
 return async request=>{
 const kind=request.data?.kind;if(!['verify','reset'].includes(kind))throw new HttpsError('invalid-argument','Invalid request.');
 if(kind==='verify'&&!request.auth?.uid)throw new HttpsError('unauthenticated','Sign in first.');
 let account,email;
 if(kind==='verify'){account=await auth.getUser(request.auth.uid);if(account.disabled)throw new HttpsError('permission-denied','Account unavailable.');if(account.emailVerified)return {ok:true};email=account.email;}
 else email=String(request.data?.email||'').trim().toLowerCase();
 if(!email||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new HttpsError('invalid-argument','Enter a valid email address.');
 email=email.toLowerCase();const time=now(),hour=Math.floor(time/3600000);
 // Private aggregate counters bound public reset abuse without revealing account existence.
 const limits=[{id:'recipient-'+hash(email),max:4,cooldown:60000},{id:'ip-'+hash(request.rawRequest?.ip||'unknown'),max:20,cooldown:0},{id:'global',max:100,cooldown:0}];
 const allowed=await db.runTransaction(async tx=>{const refs=limits.map(l=>db.doc('authMailLimits/'+l.id));const snapshots=await Promise.all(refs.map(r=>tx.get(r)));const values=snapshots.map(s=>s.data()||{});
 if(values.some((v,i)=>(v.hour===hour&&v.count>=limits[i].max)||(limits[i].cooldown&&time-(v.at||0)<limits[i].cooldown)))return false;
 refs.forEach((ref,i)=>tx.set(ref,{hour,count:values[i].hour===hour?(values[i].count||0)+1:1,at:time}));return true;});
 if(!allowed){if(kind==='reset')return {ok:true};throw new HttpsError('resource-exhausted','Please wait before requesting another email.');}
 if(kind==='reset'){try{account=await auth.getUserByEmail(email);}catch(e){if(e.code==='auth/user-not-found')return {ok:true};throw new HttpsError('unavailable','Please try again shortly.');}if(account.disabled)return {ok:true};}
 const next=returnPath(request.data?.next),settings={url:BASE+next};
 try {
 const generated=kind==='verify'?await auth.generateEmailVerificationLink(email,settings):await auth.generatePasswordResetLink(email,settings);
 const rendered=renderEmail(kind,{actionUrl:actionURL(generated,kind,next),logoUrl:BASE+'/preview/assets/brand-transparent.png',helpText:'Need help? Reply to reach Reckoning Figures at support@reckoningfigures.com.'});
 const result=await send({from:'Reckoning Figures <support@reckoningfigures.com>',reply_to:'support@reckoningfigures.com',to:[email],...rendered},key(),'auth-'+randomUUID());
 if(!result.id)throw Error('Provider did not accept message');
 }catch{ // Do not log action codes, email addresses or provider response bodies.
 console.error('Authentication email delivery failed', {kind});
 if(kind==='verify')throw new HttpsError('unavailable','Email could not be sent. Please try again shortly.');
 }
 return {ok:true};
 };
}
