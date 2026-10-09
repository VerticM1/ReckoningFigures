import {doc,getDoc,getDocs,collection,query,where,limit,runTransaction,writeBatch,serverTimestamp,deleteDoc} from 'firebase/firestore';
export function socialAPI(db,auth){
 const uid=()=>{if(!auth.currentUser)throw Error('Sign in to continue.');return auth.currentUser.uid;};
 const profile=u=>doc(db,'socialProfiles',u),handle=h=>doc(db,'socialHandles',h),request=id=>doc(db,'socialRequests',id),friend=id=>doc(db,'socialFriendships',id);
 const safe=u=>{if(!/^[A-Za-z0-9_-]{1,128}$/.test(u))throw Error('Invalid account.');return u;};
 async function label(u){const d=await getDoc(profile(u));return d.exists()?d.data().userName:'Private learner';}
 return {
  profile:async()=>{const d=await getDoc(profile(uid()));return d.exists()?d.data():null;},
  enable:async name=>{const u=uid();name=name.trim();if(!/^[A-Za-z0-9_]{3,20}$/.test(name))throw Error('Use 3–20 letters, numbers or underscores.');const h=name.toLowerCase();await runTransaction(db,async tx=>{const [old,claim]=await Promise.all([tx.get(profile(u)),tx.get(handle(h))]);if(claim.exists()&&claim.data().uid!==u)throw Error('That username is already taken.');tx.set(profile(u),{userName:name,handle:h,updatedAt:serverTimestamp()});tx.set(handle(h),{uid:u});if(old.exists()&&old.data().handle!==h)tx.delete(handle(old.data().handle));});},
  disable:async()=>{const u=uid();await runTransaction(db,async tx=>{const old=await tx.get(profile(u));if(old.exists()){tx.delete(profile(u));tx.delete(handle(old.data().handle));}});},
  search:async name=>{const u=uid(),h=name.trim().toLowerCase().replace(/^@/,'');if(!/^[a-z0-9_]{3,20}$/.test(h))throw Error('Enter the exact username (3–20 characters).');const d=await getDoc(handle(h));if(!d.exists()||d.data().uid===u)return [];const p=await getDoc(profile(d.data().uid));return p.exists()?[{uid:d.data().uid,...p.data()}]:[];},
  send:async other=>{const u=safe(uid());safe(other);if(u===other)throw Error('Choose another learner.');await runTransaction(db,async tx=>{const id=u+'~'+other,reverse=other+'~'+u;const docs=await Promise.all([tx.get(request(id)),tx.get(request(reverse)),tx.get(friend(id)),tx.get(friend(reverse))]);if(docs.some(d=>d.exists()))throw Error('A request or friendship already exists. Check your requests.');tx.set(request(id),{from:u,to:other,createdAt:serverTimestamp()});});},
  requests:async()=>{const u=uid();const lists=await Promise.all(['to','from'].map(field=>getDocs(query(collection(db,'socialRequests'),where(field,'==',u),limit(100)))));return Promise.all(lists.flatMap(s=>s.docs).map(async d=>({id:d.id,...d.data(),incoming:d.data().to===u,name:await label(d.data().to===u?d.data().from:d.data().to)})));},
  accept:async id=>{const u=uid();await runTransaction(db,async tx=>{const r=await tx.get(request(id));if(!r.exists())throw Error('This request is no longer available.');const d=r.data();if(d.to!==u)throw Error('Only the recipient can accept.');tx.set(friend(id),{user1:d.from,user2:d.to,createdAt:serverTimestamp()});tx.delete(request(id));});},
  dismiss:id=>deleteDoc(request(id)),
  friends:async()=>{const u=uid(),lists=await Promise.all(['user1','user2'].map(field=>getDocs(query(collection(db,'socialFriendships'),where(field,'==',u),limit(100)))));const peers=[...new Set(lists.flatMap(s=>s.docs.map(d=>d.data().user1===u?d.data().user2:d.data().user1)))];return Promise.all(peers.map(async u=>({uid:u,name:await label(u)})));},
  remove:async other=>{const u=safe(uid());safe(other);await runTransaction(db,async tx=>{const refs=[friend(u+'~'+other),friend(other+'~'+u)],docs=await Promise.all(refs.map(r=>tx.get(r)));docs.forEach((d,i)=>{if(d.exists())tx.delete(refs[i]);});});}
 };
}
