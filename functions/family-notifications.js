import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex');
import {progressSummary} from './family.js';
// One notification per first saved figure per confirmed link, including retries/imports.
export function createCompletionRecorder({db}){
 return async ({uid,before,after,at})=>{
 if(!after||!Number.isFinite(at))return;
 const previous=progressSummary(before).completedFigures;
 const added=progressSummary(after).completedFigures.filter(id=>!previous.includes(id));if(!added.length)return;
 await db.runTransaction(async tx=>{
 const membership=(await tx.get(db.doc('familyStudents/'+uid))).data();if(membership?.state!=='active')return;
 const parent=db.doc('familyHomes/'+membership.parentUid),home=(await tx.get(parent)).data(),slot=home?.slots?.[membership.slot];
 if(slot?.state!=='active'||slot.studentUid!==uid||slot.hash!==membership.hash||!slot.activeSince||at<slot.activeSince)return;
 const ref=db.doc('familyActivity/'+membership.hash),feed=(await tx.get(ref)).data()||{seen:[],items:[]};
 const fresh=added.filter(id=>!feed.seen.includes(id));if(!fresh.length)return;
 const items=fresh.map(lessonId=>({lessonId,at}));
 tx.set(ref,{seen:[...feed.seen,...fresh],items:[...items,...feed.items].sort((a,b)=>b.at-a.at).slice(0,40)});
 if(home.notifications?.email===true&&at>=home.notifications.enabledAt){
 const id=hash(membership.hash+':'+fresh.sort((a,b)=>a-b).join(','));tx.set(db.doc('familyNotifications/'+id),{parentUid:membership.parentUid,studentUid:uid,linkHash:membership.hash,slot:membership.slot,lessonIds:fresh,at});
 }
 });
 };
}
export async function prepareCompletionMail(id,{read,user}){
 const event=await read('familyNotifications/'+id);if(!event)return null;
 const home=await read('familyHomes/'+event.parentUid),slot=home?.slots?.[event.slot],membership=await read('familyStudents/'+event.studentUid);
 if(home?.notifications?.email!==true||home.notifications.enabledAt>event.at||slot?.state!=='active'||slot.studentUid!==event.studentUid||slot.hash!==event.linkHash||membership?.hash!==event.linkHash||membership?.state!=='active'||membership.parentUid!==event.parentUid)return null;
 const account=await user(event.parentUid);if(!account?.emailVerified||account.disabled)return null;
 return account.email;
}
