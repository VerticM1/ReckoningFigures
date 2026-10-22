import {randomUUID} from 'node:crypto';
import {HttpsError} from 'firebase-functions/v2/https';
import {catalog} from './family-catalog.js';
const fail=(code,message)=>{throw new HttpsError(code,message);};
const validId=s=>typeof s==='string'&&/^[A-Za-z0-9_-]{16,80}$/.test(s);
const lessons=catalog.flatMap(u=>u.lessons);
export function premiumAccess(e,now){return e?.status==='active'&&e.courses?.includes('algebra1')&&(e.plan==='lifetime'||(e.plan==='monthly'&&Number(e.expiresAt)>now));}
export const taskStatus=t=>t.cancelled?'Cancelled':t.completed.length===t.lessonIds.length?'Completed':t.startedAt?'In progress':'Not started';
const publicTask=t=>({id:t.id,title:t.title,lessonIds:t.lessonIds,due:t.due,createdAt:t.createdAt,completed:t.completed,status:taskStatus(t)});
export function createFamilyPractice({db,auth,now=Date.now,random=randomUUID}){
 return async request=>{
 const uid=request.auth?.uid;if(!uid)fail('unauthenticated','Sign in to continue.');const user=await auth.getUser(uid);if(user.disabled||!user.emailVerified)fail('permission-denied','Verify your email first.');
 const data=request.data||{},action=data.action,parentAction=['parentList','create','cancel'].includes(action);if(![...['parentList','create','cancel'],'studentList','start','complete'].includes(action))fail('invalid-argument','Unknown assignment action.');
 return db.runTransaction(async tx=>{
 let membership,home,slot,studentUid;
 if(parentAction){if(!Number.isInteger(data.slot)||data.slot<0||data.slot>3)fail('invalid-argument','Choose a student.');home=(await tx.get(db.doc('familyHomes/'+uid))).data();slot=home?.slots?.[data.slot];studentUid=slot?.studentUid;if(studentUid)membership=(await tx.get(db.doc('familyStudents/'+studentUid))).data();}
 else {membership=(await tx.get(db.doc('familyStudents/'+uid))).data();studentUid=uid;if(membership?.parentUid){home=(await tx.get(db.doc('familyHomes/'+membership.parentUid))).data();slot=home?.slots?.[membership.slot];}}
 const paired=slot?.state==='active'&&membership?.state==='active'&&slot.studentUid===studentUid&&slot.hash===membership.hash&&(!parentAction||membership.parentUid===uid);
 if(!paired){if(action==='studentList')return {paired:false,tasks:[]};fail('permission-denied','This parent connection is no longer active.');}
 const work=db.doc('familyWork/'+membership.hash),record=(await tx.get(work)).data()||{},tasks=record.tasks||[];
 const entitlement=(await tx.get(db.doc('familyEntitlements/'+studentUid))).data(),premium=premiumAccess(entitlement,now());
 const allowed=l=>l&&!l.premium||l&&premium;
 const availableIds=lessons.filter(allowed).map(l=>l.id);
 if(action==='parentList')return {tasks:tasks.map(publicTask),catalog,availableIds};
 if(action==='studentList')return {paired:true,tasks:tasks.filter(t=>!t.cancelled&&taskStatus(t)!=='Completed').map(t=>({...publicTask(t),availableIds:t.lessonIds.filter(id=>availableIds.includes(id))}))};
 if(action==='create'){
 if(!validId(data.id))fail('invalid-argument','Invalid assignment identifier.');
 let selected,title;if(data.kind==='unit'){const u=catalog.find(u=>u.id===data.selection);selected=u?.lessons;title=u?.name;}else if(data.kind==='figure'){const l=lessons.find(l=>l.id===data.selection);selected=l?[l]:null;title=l?'Figure '+l.id+' · '+l.title:null;}
 if(!selected?.length)fail('invalid-argument','Choose an available figure or unit.');if(selected.some(l=>!allowed(l)))fail('failed-precondition','This selection requires verified Premium access. Choose available practice for now.');
 const due=data.due||'';if(due&&(!/^\d{4}-\d{2}-\d{2}$/.test(due)||!Number.isFinite(Date.parse(due+'T00:00:00Z'))||new Date(due+'T00:00:00Z').toISOString().slice(0,10)!==due))fail('invalid-argument','Choose a valid due date.');
 const ids=selected.map(l=>l.id),existing=tasks.find(t=>t.id===data.id);if(existing){if(JSON.stringify(existing.lessonIds)!==JSON.stringify(ids)||existing.due!==due)fail('already-exists','This request was already used. Refresh and try again.');return {task:publicTask(existing)};}
 const active=tasks.filter(t=>!t.cancelled&&taskStatus(t)!=='Completed');if(active.length>=20)fail('resource-exhausted','Finish or cancel an assignment before adding more.');
 const task={id:data.id,title,lessonIds:ids,due,createdAt:now(),completed:[],runs:{},startedAt:0,cancelled:false};const history=tasks.filter(t=>t.cancelled||taskStatus(t)==='Completed').slice(-20);tx.set(work,{tasks:[...history,...active,task]});return {task:publicTask(task)};
 }
 if(!validId(data.id))fail('invalid-argument','Invalid assignment identifier.');const task=tasks.find(t=>t.id===data.id);if(!task)fail('not-found','Assignment unavailable.');
 if(action==='cancel'){task.cancelled=true;task.runs={};tx.set(work,{tasks});return {ok:true};}
 if(task.cancelled)fail('failed-precondition','This assignment was cancelled.');
 const lesson=lessons.find(l=>l.id===data.lessonId);if(!task.lessonIds.includes(data.lessonId)||!allowed(lesson))fail('permission-denied','Practice access could not be confirmed.');
 if(action==='start'){
 if(task.completed.includes(data.lessonId))return {completed:true};const run={nonce:random(),startedAt:now()};task.runs[String(data.lessonId)]=run;task.startedAt=task.startedAt||now();tx.set(work,{tasks});return {nonce:run.nonce};
 }
 const run=task.runs[String(data.lessonId)];if(!run||run.nonce!==data.nonce)fail('failed-precondition','This practice session is no longer current. Reopen the assignment.');
 if(task.completed.includes(data.lessonId))return {ok:true};
 // A fresh server-issued session is required. Completion is app-reported, not a proctored score.
 if(now()<=run.startedAt)fail('failed-precondition','Finish the figure before saving.');task.completed.push(data.lessonId);tx.set(work,{tasks});return {ok:true};
 });
 };
}
