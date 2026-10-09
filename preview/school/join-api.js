import {doc,getDoc,getDocs,collection,query,where,limit,writeBatch,runTransaction,serverTimestamp,Timestamp,increment,updateDoc} from 'firebase/firestore';
export function joinAPI(db,auth){
 const actor=()=>{if(!auth.currentUser)throw Error('Sign in to continue.');return auth.currentUser.uid;};
 const inviteRef=t=>doc(db,'classInvites',t),requestRef=(t,u)=>doc(db,'classInvites',t,'requests',u);
 async function get(t){if(!/^[A-Za-z0-9_-]{20,128}$/.test(t||''))throw Error('This invitation link is incomplete. Ask your teacher for a new link.');const d=await getDoc(inviteRef(t));if(!d.exists())throw Error('Invitation not found. Ask your teacher for a new link.');return {token:t,...d.data()};}
 function usable(i){if(!i.active)throw Error('This invitation has been turned off. Ask your teacher for a new link.');if(i.expiresAt&&i.expiresAt.toMillis()<=Date.now())throw Error('This invitation has expired. Ask your teacher for a new link.');}
 async function admit(t,uid,label,approve=false){
  const who=actor();let outcome;
  await runTransaction(db,async tx=>{
   const iDoc=await tx.get(inviteRef(t));if(!iDoc.exists())throw Error('Invitation not found.');const i=iDoc.data();usable(i);
   const req=requestRef(t,uid),old=await tx.get(req);
   if(old.exists()&&old.data().state!=='pending'){outcome={...i,state:old.data().state};return;}
   const name=old.exists()?old.data().label:label.trim();if(!name||name.length>80)throw Error('Enter the name your teacher knows (1–80 characters).');
   if(!approve&&i.mode==='approval'){if(!old.exists())tx.set(req,{label:name,state:'pending',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});outcome={...i,state:'pending'};return;}
   const member=doc(db,'schools',i.schoolId,'members',uid),roster=doc(db,'schools',i.schoolId,'classes',i.classId,'students',uid);
   const [m,r]=await Promise.all([tx.get(member),tx.get(roster)]);
   if(m.exists()&&(m.data().role!=='student'||m.data().state!=='active'))throw Error('This school account needs administrator help before joining as a student.');
   if(!m.exists()){
    const audit=doc(collection(db,'schools',i.schoolId,'membershipAudit'));
    const snapshot={label:name,role:'student',state:'active',revision:1,updatedAt:serverTimestamp(),updatedBy:who,changeId:audit.id,joinToken:t};
    tx.set(member,snapshot);tx.set(audit,{memberUid:uid,actor:who,at:serverTimestamp(),previousRevision:0,revision:1,snapshot});
    tx.set(doc(db,'schools',i.schoolId,'usage','seats'),{occupied:increment(1),memberUid:uid,changeId:audit.id,joinToken:t,updatedAt:serverTimestamp()},{merge:true});
   }
   if(!r.exists())tx.set(roster,{label:name,addedAt:serverTimestamp(),joinToken:t});
   tx.set(req,{label:name,state:'admitted',createdAt:old.exists()?old.data().createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
   outcome={...i,state:'admitted'};
  });return outcome;
 }
 return {
  get,
  current:async(s,c)=>{const d=await getDoc(doc(db,'schools',s,'classes',c,'invite','current'));return d.exists()?get(d.data().token):null;},
  create:async(s,c,{schoolName,className,mode='automatic',days=30,previous=null})=>{actor();const ref=doc(collection(db,'classInvites')),batch=writeBatch(db);batch.set(ref,{schoolId:s,classId:c,schoolName,className,mode,active:true,expiresAt:days?Timestamp.fromMillis(Date.now()+days*86400000):null,createdAt:serverTimestamp()});batch.set(doc(db,'schools',s,'classes',c,'invite','current'),{token:ref.id});if(previous)batch.update(inviteRef(previous),{active:false});await batch.commit();return get(ref.id);},
  revoke:async t=>updateDoc(inviteRef(t),{active:false}),
  request:async t=>{const d=await getDoc(requestRef(t,actor()));return d.exists()?d.data():null;},
  pending:async t=>(await getDocs(query(collection(db,'classInvites',t,'requests'),where('state','==','pending'),limit(100)))).docs.map(d=>({uid:d.id,...d.data()})),
  join:(t,label)=>admit(t,actor(),label),
  approve:(t,uid)=>admit(t,uid,'',true),
  reject:(t,uid)=>updateDoc(requestRef(t,uid),{state:'rejected',updatedAt:serverTimestamp()})
 };
}
