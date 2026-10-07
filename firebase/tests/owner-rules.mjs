import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,getDocs,collection,writeBatch,updateDoc,deleteDoc,serverTimestamp,Timestamp} from 'firebase/firestore';
const env=await initializeTestEnvironment({projectId:'demo-reckoning-owner',firestore:{host:'127.0.0.1',port:8085,rules:readFileSync('firebase/owner-test.rules','utf8')}});
try{
 await env.clearFirestore();
 await env.withSecurityRulesDisabled(async ctx=>{await setDoc(doc(ctx.firestore(),'platformOwners','owner'),{active:true});await setDoc(doc(ctx.firestore(),'platformOwners','revoked'),{active:false});await setDoc(doc(ctx.firestore(),'users','student'),{role:'owner',active:true});});
 const owner=env.authenticatedContext('owner').firestore(),student=env.authenticatedContext('student').firestore(),teacher=env.authenticatedContext('teacher',{schoolId:'school-a',role:'admin'}).firestore(),guest=env.unauthenticatedContext().firestore(),revoked=env.authenticatedContext('revoked').firestore();
 function school(actor,changeId,revision=1){return {name:'Pilot School',status:'pilot',license:{plan:'pilot',seatLimit:25,startsOn:Timestamp.fromDate(new Date('2026-10-01')),endsOn:Timestamp.fromDate(new Date('2026-11-01')),courses:['algebra1']},revision,updatedAt:serverTimestamp(),updatedBy:actor,changeId};}
 async function save(db,actor,id,changeId,revision=1,alter=()=>{}){const data=school(actor,changeId,revision);alter(data);const b=writeBatch(db);b.set(doc(db,'schools',id),data);b.set(doc(db,'ownerAudit',changeId),{schoolId:id,actor,at:serverTimestamp(),previousRevision:revision-1,revision,snapshot:data});return b.commit();}
 await assertSucceeds(getDoc(doc(owner,'platformOwners','owner')));
 await assertFails(getDoc(doc(student,'platformOwners','owner')));
 for(const db of [guest,student,teacher,revoked]){await assertFails(getDocs(collection(db,'schools')));await assertFails(save(db,'student','bad','bad'));await assertFails(setDoc(doc(db,'platformOwners','student'),{active:true}));}
 await assertFails(setDoc(doc(owner,'platformOwners','another'),{active:true}));
 await assertSucceeds(save(owner,'owner','school-a','a1'));
 await assertSucceeds(save(owner,'owner','school-b','b1'));
 await assertSucceeds(getDocs(collection(owner,'schools')));
 await assertFails(getDoc(doc(student,'schools','school-a')));
 await assertFails(getDoc(doc(teacher,'schools','school-b')));
 await assertFails(setDoc(doc(owner,'schools','no-audit'),school('owner','missing')));
 await assertFails(save(owner,'owner','school-a','a2',2,d=>d.license.seatLimit=-1));
 await assertFails(save(owner,'owner','school-a','a2',2,d=>d.license.seatLimit=2.5));
 await assertFails(save(owner,'owner','school-a','a2',2,d=>d.license.endsOn=d.license.startsOn));
 await assertFails(save(owner,'owner','school-a','a2',2,d=>d.license.courses=['prealgebra']));
 await assertFails(save(owner,'someone-else','school-a','a2',2));
 await assertFails(save(owner,'owner','school-a','a2',4));
 await assertSucceeds(save(owner,'owner','school-a','a2',2,d=>d.license.seatLimit=40));
 await assertFails(updateDoc(doc(owner,'ownerAudit','a1'),{actor:'other'}));
 await assertFails(deleteDoc(doc(owner,'ownerAudit','a1')));
 await assertFails(deleteDoc(doc(owner,'schools','school-a')));
 await assertFails(setDoc(doc(student,'schools','school-a','members','student'),{role:'owner'}));
 await env.withSecurityRulesDisabled(ctx=>updateDoc(doc(ctx.firestore(),'platformOwners','owner'),{active:false}));
 await assertFails(getDoc(doc(owner,'schools','school-a')));
 await assertFails(save(owner,'owner','school-a','a3',3));
 console.log('PASS owner grants, non-owner and cross-school denial, self-promotion denial, validated licenses, atomic immutable audit, revision checks and revocation');
}finally{await env.cleanup();}
