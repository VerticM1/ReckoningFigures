import {initializeApp} from 'firebase/app';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signInWithPopup,GoogleAuthProvider,signOut,createUserWithEmailAndPassword,sendEmailVerification,reload,getIdToken} from 'firebase/auth';
import {getFirestore,doc,getDoc,getDocs,collection,query,orderBy,limit,runTransaction,serverTimestamp,Timestamp} from 'firebase/firestore';
const app=initializeApp({apiKey:'AIzaSyA3uLzOVcNw9cFQ37pHnktHAVbBRASXico',authDomain:'reckoningfigures-bbdae.firebaseapp.com',projectId:'reckoningfigures-bbdae',appId:'1:174051558845:web:d459a96c6d94c108e63ed4'});
const auth=getAuth(app),db=getFirestore(app);
export const observe=cb=>onAuthStateChanged(auth,cb);
export const login=(email,password)=>signInWithEmailAndPassword(auth,email,password);
export const googleLogin=()=>signInWithPopup(auth,new GoogleAuthProvider());
export const logout=()=>signOut(auth);
export async function access(){if(!auth.currentUser)return false;const s=await getDoc(doc(db,'platformOwners',auth.currentUser.uid));return s.exists()&&s.data().active===true;}
export async function schools(){const s=await getDocs(query(collection(db,'schools'),orderBy('name'),limit(200)));return s.docs.map(d=>({id:d.id,...d.data()}));}
export async function history(){const s=await getDocs(query(collection(db,'ownerAudit'),orderBy('at','desc'),limit(30)));return s.docs.map(d=>({id:d.id,...d.data()}));}
export async function saveSchool(id,values,expectedRevision){
 const uid=auth.currentUser?.uid;if(!uid)throw Error('Sign in again.');
 const name=values.name.trim(),seats=Number(values.seats),start=new Date(values.startsOn+'T00:00:00Z'),end=new Date(values.endsOn+'T00:00:00Z');
 if(!name||name.length>100||!Number.isInteger(seats)||seats<1||seats>100000||!Number.isFinite(+start)||!Number.isFinite(+end)||end<=start)throw Error('Check the name, seat limit, and dates. End date must follow start date.');
 const ref=id?doc(db,'schools',id):doc(collection(db,'schools')),audit=doc(collection(db,'ownerAudit'));
 await runTransaction(db,async tx=>{const [old,usage]=await Promise.all([tx.get(ref),tx.get(doc(db,'schools',ref.id,'usage','seats'))]);if(usage.exists()&&seats<usage.data().occupied)throw Error('The seat limit cannot be lower than the allocated student seats. Remove unused memberships first.');const previous=old.exists()?old.data().revision:0;if(previous!==expectedRevision)throw Error('This school changed in another session. Refresh and try again.');const snapshot={name,status:values.status,license:{plan:values.plan,seatLimit:seats,startsOn:Timestamp.fromDate(start),endsOn:Timestamp.fromDate(end),courses:['algebra1']},revision:previous+1,updatedAt:serverTimestamp(),updatedBy:uid,changeId:audit.id};tx.set(ref,snapshot);tx.set(audit,{schoolId:ref.id,actor:uid,at:serverTimestamp(),previousRevision:previous,revision:previous+1,snapshot});});
}
export async function schoolContext(schoolId){
 const uid=auth.currentUser?.uid;if(!uid)throw Error('Sign in to open your school.');
 const owner=await access(),member=await getDoc(doc(db,'schools',schoolId,'members',uid));
 if(!owner&&(!member.exists()||member.data().state!=='active'))throw Error('This account has not been added to this school, or its access was removed.');
 const s=await getDoc(doc(db,'schools',schoolId));if(!s.exists())throw Error('School not found.');
 return {school:{id:s.id,...s.data()},member:member.exists()?member.data():null,owner,uid};
}
export async function members(schoolId){const s=await getDocs(query(collection(db,'schools',schoolId,'members'),orderBy('label'),limit(500)));return s.docs.map(d=>({uid:d.id,...d.data()}));}
export async function seatUsage(schoolId){const s=await getDoc(doc(db,'schools',schoolId,'usage','seats'));return s.exists()?s.data().occupied:0;}
export async function membershipHistory(schoolId){const s=await getDocs(query(collection(db,'schools',schoolId,'membershipAudit'),orderBy('at','desc'),limit(30)));return s.docs.map(d=>({id:d.id,...d.data()}));}
export async function saveMember(schoolId,memberUid,values,expectedRevision){
 const actor=auth.currentUser?.uid;if(!actor)throw Error('Sign in again.');
 memberUid=memberUid.trim();const label=values.label.trim();
 if(!/^[A-Za-z0-9_-]{1,128}$/.test(memberUid)||!label||label.length>80)throw Error('Enter a valid account UID and a label of 1–80 characters.');
 const schoolRef=doc(db,'schools',schoolId),ref=doc(db,'schools',schoolId,'members',memberUid),usage=doc(db,'schools',schoolId,'usage','seats'),audit=doc(collection(db,'schools',schoolId,'membershipAudit'));
 await runTransaction(db,async tx=>{
  const [school,old,counter]=await Promise.all([tx.get(schoolRef),tx.get(ref),tx.get(usage)]);
  if(!school.exists())throw Error('School not found.');
  const previous=old.exists()?old.data().revision:0;if(previous!==expectedRevision)throw Error('Membership changed in another session. Refresh before editing.');
  const seat=d=>d?.role==='student'&&d?.state==='active'?1:0;
  const next={label,role:values.role,state:values.state,revision:previous+1,updatedAt:serverTimestamp(),updatedBy:actor,changeId:audit.id},delta=seat(next)-seat(old.exists()?old.data():null),occupied=(counter.exists()?counter.data().occupied:0)+delta;
  if(occupied>school.data().license.seatLimit)throw Error('All student seats are allocated. Increase the license limit or remove an unused student membership.');
  tx.set(ref,next);tx.set(audit,{memberUid,actor,at:serverTimestamp(),previousRevision:previous,revision:previous+1,snapshot:next});
  if(delta)tx.set(usage,{occupied,memberUid,changeId:audit.id,updatedAt:serverTimestamp()});
 });
}

import {classroomAPI} from '../school/classroom-api.js';
export const classroom=classroomAPI(db,auth);
export const currentUid=()=>auth.currentUser?.uid||null;

export const register=(email,password)=>createUserWithEmailAndPassword(auth,email,password);
import {joinAPI} from '../school/join-api.js';
export const invitations=joinAPI(db,auth);

import {staffAPI} from "../school/staff-api.js";
export const staffInvitations=staffAPI(db,auth);
export const verifyEmail=()=>sendEmailVerification(auth.currentUser);
export async function refreshIdentity(){await reload(auth.currentUser);await getIdToken(auth.currentUser,true);return auth.currentUser;}

import {socialAPI} from '../social-api.js';
export const social=socialAPI(db,auth);

import {supportAPI} from '../support-api.js';
export const support=supportAPI(db,auth);
