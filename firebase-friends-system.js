// Legacy authentication compatibility. Personal profile data is private.
// Social actions now live at preview/friends.html and never read these records.
class FirebaseFriendsSystem {
 constructor(){this.auth=window.firebaseAuth;this.db=window.firebaseDB;this.currentUser=null;}
 async waitForAuth(){return new Promise(resolve=>{const off=this.auth.onAuthStateChanged(user=>{this.currentUser=user;resolve(user);queueMicrotask(off);});});}
 getCurrentUserId(){return this.currentUser?.uid||null;}
 async createOrUpdateUser(username,xp=0,streak=0){const user=this.auth.currentUser;if(!user)throw Error('Not authenticated');if(!/^[A-Za-z0-9_]{3,20}$/.test(username))throw Error('Username must be 3–20 letters, numbers or underscores.');const ref=this.db.collection('users').doc(user.uid);await this.db.runTransaction(async tx=>{const old=await tx.get(ref);const data={userId:user.uid,userName:username,email:user.email,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};if(!old.exists)Object.assign(data,{xp,streak,createdAt:firebase.firestore.FieldValue.serverTimestamp()});tx.set(ref,data,{merge:true});});return {success:true};}
 async syncProgressFromLocalStorage(){const user=this.auth.currentUser;if(!user)return;let local;try{local=JSON.parse(localStorage.getItem('reckonProgress')||'{}');}catch{return;}const ref=this.db.collection('users').doc(user.uid);await this.db.runTransaction(async tx=>{const old=await tx.get(ref);if(!old.exists)return;const saved=old.data(),number=v=>Number.isFinite(v)&&v>=0?v:0;tx.set(ref,{xp:Math.max(number(saved.xp),number(local.xp)),streak:Math.max(number(saved.streak),number(local.streak),number(local.bestQuestionStreak)),completed:[...new Set([...(Array.isArray(saved.completed)?saved.completed:[]),...(Array.isArray(local.completed)?local.completed:[])])],updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});});}
 async getUserData(uid){if(uid!==this.auth.currentUser?.uid)throw Error('Personal profiles are private.');const d=await this.db.collection('users').doc(uid).get();return d.exists?d.data():null;}
 async getCurrentUserData(){const uid=this.auth.currentUser?.uid;return uid?this.getUserData(uid):null;}
}
window.FirebaseFriendsSystem=FirebaseFriendsSystem;
