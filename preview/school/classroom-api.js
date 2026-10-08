// Bundled through the shared Firebase client; do not initialize a second app.
import {doc,getDoc,getDocs,collection,query,where,limit,setDoc,deleteDoc,serverTimestamp} from 'firebase/firestore';
export function classroomAPI(db,auth){
 const current=()=>{if(!auth.currentUser)throw Error('Sign in again.');return auth.currentUser.uid;};
 const base=(s,c)=>['schools',s,'classes',c];
 const list=async q=>(await getDocs(q)).docs.map(d=>({id:d.id,...d.data()}));
 return {
  classes:async(s,manager)=>list(query(collection(db,'schools',s,'classes'),...(manager?[]:[where('teacherUid','==',current())]),limit(100))),
  createClass:async(s,name,teacherUid)=>{const ref=doc(collection(db,'schools',s,'classes'));await setDoc(ref,{name:name.trim(),teacherUid,createdBy:current(),createdAt:serverTimestamp()});return ref.id;},
  classInfo:async(s,c)=>{const d=await getDoc(doc(db,...base(s,c)));if(!d.exists())throw Error('Class not found.');return {id:d.id,...d.data()};},
  classRoster:async(s,c)=>list(query(collection(db,...base(s,c),'students'),limit(500))),
  enroll:async(s,c,uid,label)=>{if(!/^[A-Za-z0-9_-]{1,128}$/.test(uid))throw Error('Enter the existing student account UID.');await setDoc(doc(db,...base(s,c),'students',uid),{label:label.trim(),addedAt:serverTimestamp()});},
  unenroll:async(s,c,uid)=>deleteDoc(doc(db,...base(s,c),'students',uid)),
  assignments:async(s,c)=>list(query(collection(db,...base(s,c),'assignments'),limit(100))),
  createAssignment:async(s,c,values)=>{const ref=doc(collection(db,...base(s,c),'assignments'));await setDoc(ref,{...values,createdBy:current(),createdAt:serverTimestamp()});return ref.id;},
  assignment:async(s,c,a)=>{const d=await getDoc(doc(db,...base(s,c),'assignments',a));if(!d.exists())throw Error('Assignment not found.');return {id:d.id,...d.data()};},
  results:async(s,c,a,manager)=>list(query(collection(db,...base(s,c),'assignments',a,'results'),...(manager?[]:[where('uid','==',current())]),limit(1000))),
  submit:async(s,c,a,data)=>{const uid=current(),ref=doc(db,...base(s,c),'assignments',a,'results',uid+'_'+data.lessonId);
   // First completion is immutable. A retry or second device cannot duplicate it.
   // Query first so a missing result never needs a read rule based on nonexistent data.
   const existing=await list(query(collection(db,...base(s,c),'assignments',a,'results'),where('uid','==',uid),limit(100)));
   if(existing.some(r=>r.lessonId===data.lessonId))return;
   try{await setDoc(ref,{...data,uid,completedAt:serverTimestamp()});}catch(error){
    const after=await list(query(collection(db,...base(s,c),'assignments',a,'results'),where('uid','==',uid),limit(100)));
    if(!after.some(r=>r.lessonId===data.lessonId))throw error;
   }
  }
 };
}
