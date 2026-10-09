import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,updateDoc,deleteDoc,serverTimestamp,writeBatch} from 'firebase/firestore';
import {supportAPI} from '../../preview/support-api.js';
const env=await initializeTestEnvironment({projectId:'demo-reckoning-owner',firestore:{host:'127.0.0.1',port:8085,rules:readFileSync('firebase/owner-test.rules','utf8')}});
const databases=new Map();const db=u=>{if(!databases.has(u))databases.set(u,env.authenticatedContext(u).firestore());return databases.get(u);};const api=u=>supportAPI(db(u),{currentUser:{uid:u}}),teacher=api('teacher'),admin=api('admin'),owner=api('owner');
const values={subject:'Figure not loading',category:'Technical issue',body:'Test figure displays a blank screen.'};
try{
 await env.clearFirestore();await env.withSecurityRulesDisabled(async c=>{const d=c.firestore();await setDoc(doc(d,'platformOwners','owner'),{active:true});for(const s of ['s','other'])await setDoc(doc(d,'schools',s),{name:s,status:'paused'});for(const [u,role,s] of [['teacher','teacher','s'],['colleague','teacher','s'],['admin','administrator','s'],['student','student','s'],['outside','administrator','other']])await setDoc(doc(d,'schools',s,'members',u),{role,state:'active'});});
 const id=teacher.draftId();await assertSucceeds(teacher.create(id,'s',values));await assertSucceeds(teacher.create(id,'s',values));assert.equal((await teacher.messages(id)).length,1);await assert.rejects(teacher.create(id,'s',{...values,subject:'Changed'}),/already submitted/);
 assert.equal((await teacher.list('s')).length,1);assert.equal((await api('colleague').list('s')).length,0);assert.equal((await admin.list('s',true)).length,1);assert.equal((await owner.list()).length,1);
 await assertFails(api('colleague').get(id));await assertFails(api('outside').get(id));await assertFails(api('student').get(id));await assertFails(api('outside').messages(id));await assertFails(teacher.list('s',true));await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'supportTickets',id)));
 await assertFails(api('student').create('badstudent','s',values));await assertFails(api('outside').create('badother','s',values));await assertFails(api('outsider').create('outsider','s',values));
 await assertFails(teacher.reply(id,'fake-owner','Resolved','resolved',true));await assertFails(teacher.reply(id,'fake-status','Resolved','resolved',false));
 await assertSucceeds(owner.reply(id,'response','Please try refreshing.','waiting',true));assert.equal((await teacher.get(id)).status,'waiting');
 await assertSucceeds(owner.reply(id,'response','Please try refreshing.','waiting',true));assert.equal((await teacher.messages(id)).length,2);await assert.rejects(owner.reply(id,'response','Changed','waiting',true),/already saved/);
 await assertSucceeds(teacher.reply(id,'followup','Still blank.'));assert.equal((await owner.get(id)).status,'open');
 await assertSucceeds(owner.reply(id,'resolved','A fix is available.','resolved',true));await assertSucceeds(admin.reply(id,'reopen','We need another check.'));assert.equal((await owner.get(id)).status,'open');
 await Promise.all([owner.reply(id,'race-owner','Checking now.','waiting',true),teacher.reply(id,'race-school','Additional details.')]);const events=await teacher.messages(id);assert.deepEqual(events.map(e=>e.revision),[1,2,3,4,5,6,7]);assert.equal((await owner.get(id)).revision,7);
 await assertFails(updateDoc(doc(db('owner'),'supportTickets',id),{status:'resolved',updatedAt:serverTimestamp(),revision:8,lastMessageId:'missing'}));
 await assertFails(setDoc(doc(db('teacher'),'supportTickets',id,'messages','orphan'),{authorUid:'teacher',body:'orphan',at:serverTimestamp(),status:'open',revision:8,side:'school'}));
 await assertFails(updateDoc(doc(db('owner'),'supportTickets',id,'messages','first'),{body:'Changed'}));await assertFails(deleteDoc(doc(db('owner'),'supportTickets',id)));await assertFails(updateDoc(doc(db('teacher'),'supportTickets',id),{schoolId:'other'}));
 const forged=writeBatch(db('teacher'));forged.update(doc(db('teacher'),'supportTickets',id),{updatedAt:serverTimestamp(),status:'open',revision:8,lastMessageId:'spoof'});forged.set(doc(db('teacher'),'supportTickets',id,'messages','spoof'),{authorUid:'owner',body:'Forged',at:serverTimestamp(),status:'open',revision:8,side:'school'});await assertFails(forged.commit());
 await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'schools','s','members','teacher'),{state:'removed'}));await assertFails(teacher.get(id));await assertFails(teacher.reply(id,'removed','Hello'));await assertSucceeds(admin.get(id));
 await env.withSecurityRulesDisabled(c=>updateDoc(doc(c.firestore(),'platformOwners','owner'),{active:false}));await assertFails(owner.get(id));
 console.log('PASS support school isolation, teacher privacy, paused-license access, atomic replies/status, idempotent retries, concurrent history, forgery denial and role revocation');
}finally{await env.cleanup();}
