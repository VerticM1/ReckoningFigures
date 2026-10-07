import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,writeBatch,updateDoc,deleteDoc,serverTimestamp,Timestamp} from 'firebase/firestore';
const env=await initializeTestEnvironment({projectId:'demo-reckoning-owner',firestore:{host:'127.0.0.1',port:8085,rules:readFileSync('firebase/owner-test.rules','utf8')}});
let serial=0;
const db=uid=>env.authenticatedContext(uid).firestore();
const owner=db('owner'),admin=db('admin'),teacher=db('teacher'),student=db('student');
function change(database,actor,uid,{school='a',role='student',state='active',revision=1,before=0,count=0,omit=false}={}){
 const id='event'+(++serial),b=writeBatch(database),snapshot={label:'Test '+uid,role,state,revision,updatedAt:serverTimestamp(),updatedBy:actor,changeId:id};
 b.set(doc(database,'schools',school,'members',uid),snapshot);
 b.set(doc(database,'schools',school,'membershipAudit',id),{memberUid:uid,actor,at:serverTimestamp(),previousRevision:revision-1,revision,snapshot});
 const delta=(role==='student'&&state==='active'?1:0)-before;
 if(delta&&!omit)b.set(doc(database,'schools',school,'usage','seats'),{occupied:count+delta,memberUid:uid,changeId:id,updatedAt:serverTimestamp()});
 return b;
}
try{
 await env.clearFirestore();
 await env.withSecurityRulesDisabled(async c=>{
  const d=c.firestore();await setDoc(doc(d,'platformOwners','owner'),{active:true});
  for(const id of ['a','b','expired'])await setDoc(doc(d,'schools',id),{name:'Test school',status:'pilot',license:{plan:'pilot',seatLimit:1,startsOn:Timestamp.fromMillis(Date.now()-86400000),endsOn:Timestamp.fromMillis(Date.now()+(id==='expired'?-1000:86400000)),courses:['algebra1']},revision:1});
 });
 await assertSucceeds(change(owner,'owner','admin',{role:'administrator'}).commit());
 await assertSucceeds(change(admin,'admin','teacher',{role:'teacher'}).commit());
 await assertSucceeds(change(admin,'admin','student').commit());
 if((await getDoc(doc(owner,'schools','a','usage','seats'))).data().occupied!==1)throw Error('Seat not allocated');
 await assertFails(change(admin,'admin','second',{count:1}).commit());
 // Two student grants cannot share a single forged seat increment.
 const multi=change(owner,'owner','extra',{school:'b'}),fake={label:'Other',role:'student',state:'active',revision:1,updatedAt:serverTimestamp(),updatedBy:'owner',changeId:'multi-other'};
 multi.set(doc(owner,'schools','b','members','other'),fake);
 multi.set(doc(owner,'schools','b','membershipAudit','multi-other'),{memberUid:'other',actor:'owner',at:serverTimestamp(),previousRevision:0,revision:1,snapshot:fake});
 await assertFails(multi.commit());
 // An editable legacy profile must not confer administrative rights.
 await assertSucceeds(setDoc(doc(student,'users','student'),{role:'administrator',schoolId:'a'}));
 await assertFails(change(student,'student','spoof',{role:'teacher'}).commit());
 await assertFails(change(admin,'admin','second',{omit:true}).commit());
 await assertFails(change(admin,'admin','newadmin',{role:'administrator'}).commit());
 await assertFails(change(admin,'admin','admin',{role:'teacher',revision:2}).commit());
 await assertFails(change(admin,'admin','intruder',{school:'b',role:'teacher'}).commit());
 for(const database of [student,teacher,db('outsider'),env.unauthenticatedContext().firestore()]){
  await assertFails(getDocs(collection(database,'schools','a','members')));
  await assertFails(change(database,'student','promotion',{role:'administrator'}).commit());
  await assertFails(getDoc(doc(database,'schools','b')));
 }
 await assertSucceeds(getDoc(doc(student,'schools','a')));
 await assertSucceeds(getDoc(doc(student,'schools','a','members','student')));
 await assertFails(getDoc(doc(student,'schools','a','members','teacher')));
 await assertFails(setDoc(doc(admin,'schools','a','usage','seats'),{occupied:0,memberUid:'student',changeId:'fake',updatedAt:serverTimestamp()}));
 await assertFails(change(admin,'admin','student',{revision:4,before:1,count:1,state:'removed'}).commit());
 await assertSucceeds(change(admin,'admin','student',{revision:2,before:1,count:1,state:'removed'}).commit());
 await assertFails(getDoc(doc(student,'schools','a')));
 await assertSucceeds(change(admin,'admin','teacher',{revision:2,role:'student',count:0}).commit());
 await assertSucceeds(change(admin,'admin','teacher',{revision:3,role:'teacher',before:1,count:1}).commit());
 await assertFails(change(owner,'owner','late',{school:'expired',role:'teacher'}).commit());
 await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'schools','a'),{status:'paused'}));
 await assertFails(change(admin,'admin','paused',{role:'teacher'}).commit());
 await assertSucceeds(change(admin,'admin','teacher',{revision:4,role:'teacher',state:'removed'}).commit());
 await assertFails(deleteDoc(doc(owner,'schools','a','members','teacher')));
 await assertFails(deleteDoc(doc(owner,'schools','a','membershipAudit','event1')));
 await assertFails(updateDoc(doc(owner,'schools','a','membershipAudit','event1'),{actor:'forged'}));
 await assertSucceeds(change(owner,'owner','admin',{role:'administrator',state:'removed',revision:2}).commit());
 await assertFails(getDocs(collection(admin,'schools','a','members')));
 console.log('PASS membership roles, school isolation, seat limits, seat release and role changes, immutable audit, expiry, pause, and revocation');
}finally{await env.cleanup();}
