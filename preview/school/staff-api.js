import {doc,getDoc,getDocs,collection,query,where,limit,setDoc,updateDoc,runTransaction,serverTimestamp,Timestamp} from 'firebase/firestore';
export function staffAPI(db,auth){
 const actor=()=>{if(!auth.currentUser)throw Error('Sign in to continue.');return auth.currentUser.uid;};
 const ref=t=>{if(!/^[A-Za-z0-9_-]{20,128}$/.test(t||''))throw Error('This invitation link is incomplete. Ask your administrator for a new link.');return doc(db,'staffInvites',t);};
 return {
  get:async t=>{const d=await getDoc(ref(t));if(!d.exists())throw Error('Invitation not found.');return {token:t,...d.data()};},
  list:async s=>(await getDocs(query(collection(db,'staffInvites'),where('schoolId','==',s),limit(100)))).docs.map(d=>({token:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.toMillis()||0)-(a.createdAt?.toMillis()||0)),
  create:async(s,schoolName,email,role)=>{const uid=actor(),r=doc(collection(db,'staffInvites'));email=email.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Enter a valid email address.');await setDoc(r,{schoolId:s,schoolName,email,role,createdBy:uid,createdAt:serverTimestamp(),expiresAt:Timestamp.fromMillis(Date.now()+7*86400000),state:'pending',acceptedBy:null,acceptedAt:null});return r.id;},
  revoke:t=>updateDoc(ref(t),{state:'revoked'}),
  accept:async(t,label)=>{const uid=actor();label=label.trim();if(!label||label.length>80)throw Error('Enter your name (1–80 characters).');let schoolId;await runTransaction(db,async tx=>{
   const r=ref(t),d=await tx.get(r);if(!d.exists())throw Error('Invitation not found.');const i=d.data();schoolId=i.schoolId;
   if(i.state==='accepted'&&i.acceptedBy===uid)return;
   if(i.state!=='pending'||i.expiresAt.toMillis()<=Date.now())throw Error('This invitation has expired or been turned off. Ask for a new link.');
   const m=doc(db,'schools',i.schoolId,'members',uid),old=await tx.get(m);
   if(old.exists()&&(old.data().role!==i.role||old.data().state!=='active'))throw Error('Your existing school access needs an administrator’s help. This invitation cannot change or restore it.');
   if(!old.exists()){
    const a=doc(collection(db,'schools',i.schoolId,'membershipAudit')),snapshot={label,role:i.role,state:'active',revision:1,updatedAt:serverTimestamp(),updatedBy:uid,changeId:a.id,staffToken:t};
    tx.set(m,snapshot);tx.set(a,{memberUid:uid,actor:uid,at:serverTimestamp(),previousRevision:0,revision:1,snapshot});
   }
   tx.update(r,{state:'accepted',acceptedBy:uid,acceptedAt:serverTimestamp()});
  });return schoolId;}
 };
}
