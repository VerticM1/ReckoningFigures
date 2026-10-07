import {initializeApp} from 'firebase/app';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signInWithPopup,GoogleAuthProvider,signOut} from 'firebase/auth';
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
 await runTransaction(db,async tx=>{const old=await tx.get(ref),previous=old.exists()?old.data().revision:0;if(previous!==expectedRevision)throw Error('This school changed in another session. Refresh and try again.');const snapshot={name,status:values.status,license:{plan:values.plan,seatLimit:seats,startsOn:Timestamp.fromDate(start),endsOn:Timestamp.fromDate(end),courses:['algebra1']},revision:previous+1,updatedAt:serverTimestamp(),updatedBy:uid,changeId:audit.id};tx.set(ref,snapshot);tx.set(audit,{schoolId:ref.id,actor:uid,at:serverTimestamp(),previousRevision:previous,revision:previous+1,snapshot});});
}
