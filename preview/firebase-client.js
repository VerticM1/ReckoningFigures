import {initializeApp} from 'firebase/app';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,sendPasswordResetEmail} from 'firebase/auth';
import {getFirestore,doc,runTransaction} from 'firebase/firestore';
import {mergeProgress} from './sync-model.js';
const app=initializeApp({apiKey:'AIzaSyA3uLzOVcNw9cFQ37pHnktHAVbBRASXico',authDomain:'reckoningfigures-bbdae.firebaseapp.com',projectId:'reckoningfigures-bbdae',appId:'1:174051558845:web:d459a96c6d94c108e63ed4'});
const auth=getAuth(app),db=getFirestore(app);
export const observe=callback=>onAuthStateChanged(auth,callback);
export const login=(email,password)=>signInWithEmailAndPassword(auth,email,password);
export const register=(email,password)=>createUserWithEmailAndPassword(auth,email,password);
export const logout=()=>signOut(auth);
export const reset=email=>sendPasswordResetEmail(auth,email);
export async function sync(uid,local){
 if(auth.currentUser?.uid!==uid)throw Error('Sign in again before syncing.');
 const ref=doc(db,'users',uid,'appProgress','v2');
 return runTransaction(db,async tx=>{const snapshot=await tx.get(ref);const merged=mergeProgress(local,snapshot.exists()?snapshot.data():{});const {xp,cloud,completedLessons,visits,practiceDays,sessions}=merged;tx.set(ref,{xp,cloud,completedLessons,visits,practiceDays,sessions,schemaVersion:2});return merged;});
}
