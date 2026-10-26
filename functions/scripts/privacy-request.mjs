import fs from 'node:fs';import {initializeApp} from 'firebase-admin/app';import {getFirestore} from 'firebase-admin/firestore';import {getAuth} from 'firebase-admin/auth';
import {planPrivacy,exportAccount,executeDeletion} from '../privacy-process.js';
const [action,project,uid,output,confirmation]=process.argv.slice(2);
if(!['inspect','export','delete'].includes(action)||!project||!uid||uid.includes('/')||!output)throw Error('Usage: node scripts/privacy-request.mjs inspect|export|delete PROJECT UID PRIVATE_OUTPUT_FILE ["DELETE UID"]');
if(fs.existsSync(output))throw Error('Output file already exists; choose a new private filename.');
const emulator=project.startsWith('demo-')&&['127.0.0.1','localhost'].some(h=>process.env.FIRESTORE_EMULATOR_HOST?.startsWith(h+':'))&&['127.0.0.1','localhost'].some(h=>process.env.FIREBASE_AUTH_EMULATOR_HOST?.startsWith(h+':'));
if(action==='delete'&&!emulator)throw Error('Production deletion is not enabled. Complete the isolated rehearsal and production write-freeze/provider/backup procedure first.');
initializeApp({projectId:project});const db=getFirestore(),auth=getAuth();const account=await auth.getUser(uid);
async function inventory(){const records=[];let count=0;
 // listDocuments includes missing parent documents that may still have subcollections.
 async function completeWalk(collection){for(const ref of await collection.listDocuments()){const snap=await ref.get();if(++count>10000)throw Error('Pilot inventory limit reached.');if(snap.exists)records.push({path:ref.path,data:snap.data()});for(const sub of await ref.listCollections())await completeWalk(sub);}}
 for(const c of await db.listCollections())await completeWalk(c);return planPrivacy(account,records);}
const plan=await inventory();let result=action==='export'?exportAccount(account,plan):{uid,ownedPaths:plan.owned.map(r=>r.path),review:plan.review,canDelete:plan.canDelete,scope:plan.scope};
if(action==='delete')result=await executeDeletion({uid,confirmation,inventory,auth,db});
fs.writeFileSync(output,JSON.stringify(result,null,2),{mode:0o600,flag:'wx'});console.log('Private output written. No account data printed.');
