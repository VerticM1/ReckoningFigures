import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {doc,setDoc,getDoc,updateDoc,Timestamp,writeBatch,serverTimestamp} from 'firebase/firestore';
import {staffAPI} from '../../preview/school/staff-api.js';
const env=await initializeTestEnvironment({projectId:'demo-reckoning-owner',firestore:{host:'127.0.0.1',port:8085,rules:readFileSync('firebase/owner-test.rules','utf8')}});
const db=(u,email=u+'@example.com',verified=true)=>env.authenticatedContext(u,{email,email_verified:verified}).firestore();
const api=(u,email,verified)=>staffAPI(db(u,email,verified),{currentUser:{uid:u}}),owner=api('owner'),admin=api('admin');
async function seed(fn){let v;await env.withSecurityRulesDisabled(async c=>{v=await fn(c.firestore());});return v;}
try{
 await env.clearFirestore();await seed(async d=>{await setDoc(doc(d,'platformOwners','owner'),{active:true});for(const s of ['s','other'])await setDoc(doc(d,'schools',s),{name:'Pilot',status:'pilot',license:{seatLimit:0,startsOn:Timestamp.fromMillis(0),endsOn:Timestamp.fromMillis(Date.now()+86400000),courses:['algebra1']}});await setDoc(doc(d,'schools','s','members','admin'),{role:'administrator',state:'active'});await setDoc(doc(d,'schools','s','members','teacher'),{role:'teacher',state:'active'});});
 const t=await assertSucceeds(admin.create('s','Pilot','  NEW@example.com ','teacher'));
 await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'staffInvites',t)));
 await assertFails(api('wrong').get(t));await assertFails(api('wrong').accept(t,'Wrong'));
 await assertSucceeds(api('new','new@example.com',false).get(t));await assertFails(api('new','new@example.com',false).accept(t,'New'));
 await assertSucceeds(api('new','NEW@example.com',true).accept(t,'New'));await assertSucceeds(api('new').accept(t,'New'));
 assert.equal((await getDoc(doc(db('new'),'schools','s','members','new'))).data().role,'teacher');
 assert.equal(await seed(async d=>(await getDoc(doc(d,'schools','s','usage','seats'))).exists()),false);
 await assert.rejects(api('other','new@example.com').accept(t,'Other'));
 await assertFails(admin.create('s','Pilot','boss@example.com','administrator'));
 await assertFails(api('teacher').create('s','Pilot','x@example.com','teacher'));
 await assertFails(admin.create('other','Pilot','x@example.com','teacher'));
 const a=await owner.create('s','Pilot','boss@example.com','administrator');await assertFails(admin.revoke(a));await assertSucceeds(api('boss').accept(a,'Boss'));
 assert.equal((await getDoc(doc(db('boss'),'schools','s','members','boss'))).data().role,'administrator');
 const revoked=await admin.create('s','Pilot','revoked@example.com','teacher');await admin.revoke(revoked);await assert.rejects(api('revoked').accept(revoked,'Revoked'));
 const expired=await admin.create('s','Pilot','expired@example.com','teacher');await seed(d=>updateDoc(doc(d,'staffInvites',expired),{expiresAt:Timestamp.fromMillis(1)}));await assert.rejects(api('expired').accept(expired,'Expired'));
 const lost=await admin.create('s','Pilot','lost@example.com','teacher');await seed(d=>updateDoc(doc(d,'schools','s','members','admin'),{state:'removed'}));await assertFails(api('lost').accept(lost,'Lost'));await seed(d=>updateDoc(doc(d,'schools','s','members','admin'),{state:'active'}));
 const removed=await admin.create('s','Pilot','removed@example.com','teacher');await seed(d=>setDoc(doc(d,'schools','s','members','removed'),{role:'teacher',state:'removed'}));await assert.rejects(api('removed').accept(removed,'Removed'));
 const promoted=await admin.create('s','Pilot','promoted@example.com','teacher');const evil=db('promoted'),b=writeBatch(evil),snapshot={label:'Promoted',role:'administrator',state:'active',revision:1,updatedAt:serverTimestamp(),updatedBy:'promoted',changeId:'evil',staffToken:promoted};b.set(doc(evil,'schools','s','members','promoted'),snapshot);b.set(doc(evil,'schools','s','membershipAudit','evil'),{memberUid:'promoted',actor:'promoted',at:serverTimestamp(),previousRevision:0,revision:1,snapshot});b.update(doc(evil,'staffInvites',promoted),{state:'accepted',acceptedBy:'promoted',acceptedAt:serverTimestamp()});await assertFails(b.commit());
 const partial=await admin.create('s','Pilot','partial@example.com','teacher');await assertFails(updateDoc(doc(db('partial'),'staffInvites',partial),{state:'accepted',acceptedBy:'partial',acceptedAt:serverTimestamp()}));
 const existing=await admin.create('s','Pilot','teacher@example.com','teacher');await assertSucceeds(api('teacher').accept(existing,'Teacher'));
 const inactive=await admin.create('s','Pilot','inactive@example.com','teacher');await seed(d=>updateDoc(doc(d,'schools','s'),{status:'paused'}));await assertFails(api('inactive').accept(inactive,'Inactive'));
 console.log('PASS staff invitations: verified matching email, private reads, role authority, atomic audit, no seats, retries, expiry, revocation, removed issuer/member and paused school');
}finally{await env.cleanup();}
