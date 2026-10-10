import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDocFromServer,updateDoc,deleteDoc,serverTimestamp,Timestamp,disableNetwork,enableNetwork} from 'firebase/firestore';
import {course} from '../../preview/course.js';
import {challenge} from '../../preview/two-step.js';
import {classroomAPI} from '../../preview/school/classroom-api.js';
const env=await initializeTestEnvironment({projectId:'demo-reckoning-owner',firestore:{host:'127.0.0.1',port:8085,rules:readFileSync('firebase/owner-test.rules','utf8')}});
const db=uid=>env.authenticatedContext(uid).firestore(),teacher=db('teacher'),student=db('student');
const api=classroomAPI(student,{currentUser:{uid:'student'}}),base=['schools','licensed','classes','math'];
const lessons=course.flatMap(u=>u.lessons).filter(l=>l.available&&l.questions.length);
const time=offset=>Timestamp.fromMillis(Date.now()+offset);
const school=()=>({name:'Licensed school',status:'pilot',license:{plan:'pilot',seatLimit:20,courses:['algebra1'],startsOn:time(-86400000),endsOn:time(86400000)}});
const assignment=ids=>({title:'Licensed Algebra 1',instructions:'Practice',lessonIds:ids,due:'2026-12-01',createdBy:'teacher',createdAt:serverTimestamp()});
const payload=l=>({uid:'student',lessonId:l.id,questions:l.questions.filter(q=>q.type!=='tutorial').length+(l.id===2?1:0),firstTry:1,supportSteps:0,seconds:60,sessionId:'license-check',completedAt:serverTimestamp()});
const unrestricted=fn=>env.withSecurityRulesDisabled(ctx=>fn(ctx.firestore()));
try{
 await env.clearFirestore();
 await unrestricted(async d=>{
  await setDoc(doc(d,'schools','licensed'),school());
  for(const [uid,role] of [['teacher','teacher'],['teacher2','teacher'],['student','student'],['other','student']])await setDoc(doc(d,'schools','licensed','members',uid),{role,state:'active'});
  await setDoc(doc(d,...base),{name:'Math',teacherUid:'teacher'});await setDoc(doc(d,...base,'students','student'),{label:'Student'});
 });
 assert.equal(lessons.length,58);assert.equal(lessons.filter(l=>l.premium).length,40);
 await assertSucceeds(setDoc(doc(teacher,...base,'assignments','all'),assignment(lessons.map(l=>l.id))));
 // Every currently shipped figure can be opened and completed through a licensed assignment.
 for(const l of lessons){
  await assertSucceeds(api.authorizePractice('licensed','math','all',l.id));
  await assertSucceeds(setDoc(doc(student,...base,'assignments','all','results','student_'+l.id),payload(l)));
 }
 await disableNetwork(student);await assert.rejects(api.authorizePractice('licensed','math','all',58),{code:'unavailable'});await enableNetwork(student);
 const last=lessons.at(-1);assert.equal(last.id,58);
 await assertSucceeds(setDoc(doc(teacher,...base,'assignments','limited'),assignment([1])));
 await assertFails(api.authorizePractice('licensed','math','limited',58));
 await assertFails(api.authorizePractice('licensed','math','missing',58));
 await assertFails(api.authorizePractice('different-school','math','all',58));
 for(const who of ['other','teacher','teacher2'])await assertFails(classroomAPI(db(who),{currentUser:{uid:who}}).authorizePractice('licensed','math','all',58));
 await assertFails(getDocFromServer(doc(env.unauthenticatedContext().firestore(),...base,'assignments','all','practice','58')));
 await assertFails(setDoc(doc(student,...base,'assignments','all','practice','58'),{allowed:true}));
 for(const id of ['0','59','058','1.0','not-a-lesson'])await assertFails(getDocFromServer(doc(student,...base,'assignments','all','practice',id)));
 await assertFails(setDoc(doc(teacher,...base,'assignments','unknown'),assignment([59])));
 await assertSucceeds(setDoc(doc(teacher,...base,'assignments','pending'),assignment([58])));
 const pending=doc(student,...base,'assignments','pending','results','student_58');
 for(const change of [{status:'paused'},{status:'archived'},{'license.endsOn':time(-86400000)},{'license.startsOn':time(86400000)},{'license.courses':[]}]){
  await unrestricted(async d=>{await setDoc(doc(d,'schools','licensed'),school());await updateDoc(doc(d,'schools','licensed'),change);});
  await assertFails(api.authorizePractice('licensed','math','all',58));
  await assertFails(setDoc(doc(teacher,...base,'assignments','blocked'),assignment([58])));
  await assertFails(setDoc(pending,payload(last)));
  // Suspension retains permitted historical reads, including premium-figure results.
  await assertSucceeds(getDocFromServer(doc(student,...base,'assignments','all')));
  await assertSucceeds(getDocFromServer(doc(student,...base,'assignments','all','results','student_58')));
 }
 await unrestricted(d=>setDoc(doc(d,'schools','licensed'),{...school(),status:'active'}));
 await assertSucceeds(api.authorizePractice('licensed','math','all',58));
 await unrestricted(d=>updateDoc(doc(d,'schools','licensed','members','student'),{state:'removed'}));
 await assertFails(api.authorizePractice('licensed','math','all',58));await assertFails(setDoc(pending,payload(last)));
 await unrestricted(d=>updateDoc(doc(d,'schools','licensed','members','student'),{state:'active'}));
 await assertSucceeds(deleteDoc(doc(teacher,...base,'students','student')));
 await assertFails(api.authorizePractice('licensed','math','all',58));await assertFails(setDoc(pending,payload(last)));
 await unrestricted(d=>setDoc(doc(d,...base,'students','student'),{label:'Student'}));
 await assertSucceeds(api.authorizePractice('licensed','math','pending',58));await assertSucceeds(setDoc(pending,payload(last)));
 console.log('PASS all 58 licensed figures, server-only start authorization, premium results, missing entitlement, license dates, suspension, cross-class/school isolation and revocation.');
}finally{await env.cleanup();}
