import {doc,getDoc,getDocs,collection,query,where,orderBy,limit,limitToLast,runTransaction,serverTimestamp} from 'firebase/firestore';
export function supportAPI(db,auth){
 const uid=()=>{if(!auth.currentUser)throw Error('Sign in to continue.');return auth.currentUser.uid;};
 const ticket=id=>doc(db,'supportTickets',id),event=(id,e)=>doc(db,'supportTickets',id,'messages',e);
 const text=(value,max,label)=>{value=String(value||'').trim();if(!value||value.length>max)throw Error(`${label} must contain 1–${max} characters.`);return value;};
 const categories=['Getting started','Lessons and answers','Reporting','Technical issue','School access'];
 return {
  categories,
  list:async(s,manager=false)=>{const filters=s?[where('schoolId','==',s),...(manager?[]:[where('createdBy','==',uid())])]:[orderBy('updatedAt','desc')];return (await getDocs(query(collection(db,'supportTickets'),...filters,limit(100)))).docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.updatedAt?.toMillis()||0)-(a.updatedAt?.toMillis()||0));},
  get:async id=>{const d=await getDoc(ticket(id));if(!d.exists())throw Error('Request not found.');return {id:d.id,...d.data()};},
  messages:async id=>(await getDocs(query(collection(db,'supportTickets',id,'messages'),orderBy('revision'),limitToLast(100)))).docs.map(d=>({id:d.id,...d.data()})),
  draftId:()=>doc(collection(db,'supportTickets')).id,
  messageId:()=>doc(collection(db,'supportTickets')).id,
  create:async(id,s,{subject,category,body})=>{const who=uid();subject=text(subject,120,'Subject');body=text(body,5000,'Description');if(!categories.includes(category))throw Error('Choose a support topic.');await runTransaction(db,async tx=>{const ref=ticket(id),old=await tx.get(ref);if(old.exists()){if(old.data().createdBy!==who)throw Error('Request ID is already in use.');const first=await tx.get(event(id,'first'));if(old.data().schoolId!==s||old.data().subject!==subject||old.data().category!==category||first.data()?.body!==body)throw Error('This request was already submitted. Refresh to view it before making changes.');return;}tx.set(ref,{schoolId:s,subject,category,createdBy:who,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),status:'open',revision:1,lastMessageId:'first'});tx.set(event(id,'first'),{authorUid:who,body,at:serverTimestamp(),status:'open',revision:1,side:'school'});});return id;},
  reply:async(id,messageId,body,status='open',owner=false)=>{const who=uid();body=text(body,5000,'Reply');
   // Some concurrent rule checks surface as permission-denied rather than ABORTED.
   // Retry only when a fresh authorized read proves the ticket revision advanced.
   for(let attempt=0;attempt<3;attempt++){
    let revisionRead=null;
    try{await runTransaction(db,async tx=>{const ref=ticket(id),message=event(id,messageId);const [t,old]=await Promise.all([tx.get(ref),tx.get(message)]);if(!t.exists())throw Error('Request not found.');if(old.exists()){if(old.data().authorUid!==who)throw Error('Reply ID is already in use.');if(old.data().body!==body||old.data().status!==status||old.data().side!==(owner?'owner':'school'))throw Error('This reply was already saved. Refresh before sending another.');return;}revisionRead=t.data().revision;const revision=revisionRead+1;tx.set(message,{authorUid:who,body,at:serverTimestamp(),status,revision,side:owner?'owner':'school'});tx.update(ref,{updatedAt:serverTimestamp(),status,revision,lastMessageId:messageId});});return;}
    catch(e){if(e.code!=='permission-denied'||revisionRead===null||attempt===2)throw e;const latest=await getDoc(ticket(id));if(!latest.exists()||latest.data().revision<=revisionRead)throw e;}
   }
  }
 };
}
