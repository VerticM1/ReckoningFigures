// Owner-operated inventory. Unknown/shared references fail closed for deletion.
const privateFields=new Set(['password','passwordHash','passwordSalt','tokens','refreshToken','accessToken','secret','hash','nonce','code']);
const ownCollections=new Set(['users','profiles','familyEntitlements','pilotApplications']);
export function references(value,uid,email){if(typeof value==='string')return value===uid||Boolean(email&&value.toLowerCase()===email.toLowerCase());if(Array.isArray(value))return value.some(v=>references(v,uid,email));if(value&&typeof value==='object')return Object.values(value).some(v=>references(v,uid,email));return false;}
export function ownPath(path,uid){const parts=path.split('/');return ownCollections.has(parts[0])&&parts[1]===uid;}
function clean(value){if(Array.isArray(value))return value.map(clean);if(value&&typeof value==='object'){if(typeof value.toDate==='function')return value.toDate().toISOString();return Object.fromEntries(Object.entries(value).filter(([k])=>!privateFields.has(k)).map(([k,v])=>[k,clean(v)]));}return value;}
export function planPrivacy(account,records){
 const owned=[],review=[],hashes=new Set();
 const direct=r=>r.path.split('/').includes(account.uid)||references(r.data,account.uid,account.email);
 // Assignments/activity are keyed by link hash and contain no UID. Include them
 // while the link still exists, including revoked links, before any unlinking.
 for(const r of records){
  const [collection,id]=r.path.split('/');
  if(collection==='familyLinks'&&direct(r))hashes.add(id);
  if(collection==='familyStudents'&&direct(r)&&r.data.hash)hashes.add(r.data.hash);
  if(collection==='familyNotifications'&&direct(r)&&r.data.linkHash)hashes.add(r.data.linkHash);
  if(collection==='familyHomes')for(const slot of r.data.slots||[])if(slot?.hash&&(id===account.uid||slot.studentUid===account.uid||references(slot,account.uid,account.email)))hashes.add(slot.hash);
 }
 for(const r of records){const [collection,id]=r.path.split('/');const linked=(['familyWork','familyActivity'].includes(collection)&&hashes.has(id))||(collection==='familyNotifications'&&hashes.has(r.data.linkHash));if(ownPath(r.path,account.uid))owned.push(r);else if(direct(r)||linked)review.push({path:r.path,reason:'Shared, billing, notification, social or unclassified reference: manual review required.'});}
 return {uid:account.uid,owned,review,canDelete:review.length===0,scope:'Firestore inventory and Firebase Authentication only; provider logs, backups and device storage require separate handling.'};
}
export function exportAccount(account,plan){
 // Deliberately allowlisted export; never include another user's family/school data or auth internals.
 const progress=plan.owned.filter(r=>r.path===`users/${account.uid}/appProgress/v2`).map(r=>({path:r.path,data:clean(Object.fromEntries(['xp','completedLessons','visits','practiceDays','sessions'].filter(k=>k in r.data).map(k=>[k,r.data[k]])))}));
 return {version:1,account:{uid:account.uid,email:account.email||null,displayName:account.displayName||null,emailVerified:Boolean(account.emailVerified)},learning:progress,scope:'Account identity and personal learning progress. School, family, support and other records require a separately reviewed export; this is not a complete data-access response.',additionalReviewRequired:plan.owned.length>progress.length||plan.review.length>0};
}
export async function executeDeletion({uid,confirmation,inventory,auth,db}){
 if(confirmation!==`DELETE ${uid}`)throw Error('Exact confirmation required.');
 let current=await inventory();if(!current.canDelete)throw Error('Manual review required; no records deleted.');
 // Disable and revoke first. If any later operation fails, account remains disabled for operator recovery.
 await auth.updateUser(uid,{disabled:true});await auth.revokeRefreshTokens(uid);
 current=await inventory();if(!current.canDelete)throw Error('References changed; account disabled, deletion stopped for review.');
 for(const record of current.owned)await db.doc(record.path).delete();
 const after=await inventory();if(after.owned.length||after.review.length)throw Error('Records remain; account disabled, deletion incomplete.');
 await auth.deleteUser(uid);
 return {status:'firebase-records-deleted',externalCleanupRequired:true};
}
