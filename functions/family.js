import {randomBytes,createHash} from 'node:crypto';
import {HttpsError} from 'firebase-functions/v2/https';
const fail=(code,message)=>{throw new HttpsError(code,message);};
const digest=t=>createHash('sha256').update(t).digest('hex');
const safeLabel=v=>String(v||'').trim();
export function progressSummary(data={}){
 const completed=[...new Set((Array.isArray(data.completedLessons)?data.completedLessons:[]).filter(x=>Number.isInteger(x)&&x>=1&&x<=63))].sort((a,b)=>a-b);
 const days=[...new Set((Array.isArray(data.practiceDays)?data.practiceDays:[]).filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)))].sort();
 return {completedFigures:completed,lastPractice:days.at(-1)||null,practiceDays:days.length};
}
export function createFamilyService({db,auth,now=Date.now,token=()=>randomBytes(32).toString('base64url')}){
 return async request=>{
 const uid=request.auth?.uid;if(!uid)fail('unauthenticated','Sign in to continue.');
 const account=await auth.getUser(uid);if(account.disabled||!account.emailVerified)fail('permission-denied','Verify your email first.');
 const {action,slot,code,label}=request.data||{},home=db.doc('familyHomes/'+uid),mine=db.doc('familyStudents/'+uid);
 const index=()=>{if(!Number.isInteger(slot)||slot<0||slot>3)fail('invalid-argument','Choose a valid student slot.');return slot;};
 const linkRef=()=>{if(typeof code!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(code))fail('invalid-argument','This family invitation is incomplete.');return db.doc('familyLinks/'+digest(code));};
 if(action==='dashboard')return db.runTransaction(async tx=>{
 const [h,m]=await Promise.all([tx.get(home),tx.get(mine)]),slots=h.data()?.slots||[null,null,null,null];
 const children=await Promise.all(slots.map(async(s,i)=>{if(!s)return {slot:i,state:'empty'};const result={slot:i,label:s.label,state:s.state,expiresAt:s.expiresAt};if(s.state==='pending')result.studentEmail=s.studentEmail;if(s.state==='active'){const membership=await tx.get(db.doc('familyStudents/'+s.studentUid));if(membership.data()?.parentUid!==uid||membership.data()?.state!=='active'||membership.data()?.hash!==s.hash||membership.data()?.slot!==i)return {slot:i,state:'empty'};result.progress=progressSummary((await tx.get(db.doc('users/'+s.studentUid+'/appProgress/v2'))).data());}return result;}));
 const feeds=await Promise.all(slots.map(async(s,i)=>s?.state==='active'&&children[i].state==='active'?((await tx.get(db.doc('familyActivity/'+s.hash))).data()?.items||[]).map(item=>({...item,slot:i,label:s.label})):[]));
 return {notifications:{email:h.data()?.notifications?.email===true},activity:feeds.flat().sort((a,b)=>b.at-a.at).slice(0,40),children,sharing:m.exists?{state:m.data().state,parentEmail:m.data().parentEmail}:null};
 });
 if(action==='notifications'){if(typeof request.data.email!=='boolean')fail('invalid-argument','Choose an email preference.');await db.runTransaction(async tx=>{const h=(await tx.get(home)).data();tx.set(home,{slots:(h?.slots||[null,null,null,null]).map(s=>s?.state==='active'&&!s.activeSince?{...s,activeSince:now()}:s),notifications:{email:request.data.email,enabledAt:request.data.email?(h?.notifications?.email?h.notifications.enabledAt:now()):0}},{merge:true});});return {ok:true};}
 if(action==='invite'){
 const i=index(),name=safeLabel(label);if(!name||name.length>40)fail('invalid-argument','Enter a nickname of 1–40 characters.');if(request.data.guardian!==true)fail('failed-precondition','Confirm you are the parent or guardian.');
 const raw=token(),hash=digest(raw),expiresAt=now()+86400000;
 await db.runTransaction(async tx=>{const snapshot=await tx.get(home),h=snapshot.data()||{},slots=h.slots||[null,null,null,null],old=slots[i];if(old?.state==='active'||old?.state==='pending')fail('failed-precondition','Remove or review this link before creating another invitation.');if(now()-(h.lastInviteAt||0)<10000)fail('resource-exhausted','Please wait a moment before creating another link.');
 if(old?.hash)tx.set(db.doc('familyLinks/'+old.hash),{state:'revoked'},{merge:true});slots[i]={label:name,state:'invited',hash,expiresAt};tx.set(home,{slots,lastInviteAt:now()},{merge:true});tx.set(db.doc('familyLinks/'+hash),{parentUid:uid,parentEmail:account.email,slot:i,label:name,expiresAt,state:'invited'});});
 return {url:'https://reckoningfigures.com/preview/family/link.html#invite='+raw,expiresAt};
 }
 if(action==='inspect'){
 const snap=await db.doc(linkRef().path).get(),l=snap.data();if(!l||l.state!=='invited'||l.expiresAt<=now())fail('failed-precondition','This invitation is expired or unavailable.');if(l.parentUid===uid)fail('failed-precondition','Open this invitation with the student’s own account.');return {parentEmail:l.parentEmail,label:l.label};
 }
 if(action==='request'){
 if(request.data.consent!==true)fail('failed-precondition','Confirm that you want to share progress.');const ref=linkRef();
 await db.runTransaction(async tx=>{const [snapshot,existing]=await Promise.all([tx.get(ref),tx.get(mine)]),l=snapshot.data();if(!l||l.state!=='invited'||l.expiresAt<=now())fail('failed-precondition','This invitation is expired or unavailable.');if(l.parentUid===uid)fail('failed-precondition','Parent and student must use separate accounts.');if(existing.exists)fail('failed-precondition','This account already has a family link or pending request. Disconnect it first.');
 const parent=db.doc('familyHomes/'+l.parentUid),h=(await tx.get(parent)).data(),slots=h?.slots;if(!slots||slots[l.slot]?.hash!==digest(code)||slots[l.slot]?.state!=='invited')fail('failed-precondition','This invitation is no longer available.');
 slots[l.slot]={...slots[l.slot],state:'pending',studentUid:uid,studentEmail:account.email};tx.set(parent,{slots},{merge:true});tx.set(ref,{state:'pending'},{merge:true});tx.set(mine,{parentUid:l.parentUid,parentEmail:l.parentEmail,slot:l.slot,state:'pending',hash:digest(code)});});return {ok:true};
 }
 if(action==='approve'||action==='remove'){
 const i=index();await db.runTransaction(async tx=>{const h=(await tx.get(home)).data(),slots=h?.slots,s=slots?.[i];if(!s)fail('not-found','This link no longer exists.');const student=s.studentUid?db.doc('familyStudents/'+s.studentUid):null,m=student?(await tx.get(student)).data():null;
 if(action==='approve'){if(s.state!=='pending'||s.expiresAt<=now()||m?.parentUid!==uid||m?.hash!==s.hash)fail('failed-precondition','This request is unavailable. Remove it and create a new invitation.');slots[i]={...s,state:'active',activeSince:now()};tx.set(student,{state:'active'},{merge:true});tx.set(db.doc('familyLinks/'+s.hash),{state:'accepted'},{merge:true});}
 else{slots[i]=null;if(m?.parentUid===uid&&m?.hash===s.hash)tx.delete(student);tx.set(db.doc('familyLinks/'+s.hash),{state:'revoked'},{merge:true});}
 tx.set(home,{slots},{merge:true});});return {ok:true};
 }
 if(action==='disconnect'){
 await db.runTransaction(async tx=>{const m=(await tx.get(mine)).data();if(!m)return;const parent=db.doc('familyHomes/'+m.parentUid),h=(await tx.get(parent)).data(),slots=h?.slots;if(slots?.[m.slot]?.studentUid===uid){slots[m.slot]=null;tx.set(parent,{slots},{merge:true});}tx.set(db.doc('familyLinks/'+m.hash),{state:'revoked'},{merge:true});tx.delete(mine);});return {ok:true};
 }
 fail('invalid-argument','Unknown family action.');
 };
}
