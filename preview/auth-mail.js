import {getFunctions,httpsCallable} from 'firebase/functions';
import {sendEmailVerification,sendPasswordResetEmail} from 'firebase/auth';
// Enable only after accountEmail is deployed. Existing account flows remain available during rollout.
const BRANDED_EMAIL_ENABLED=false;
export function accountMail(auth,kind,email){
 if(!BRANDED_EMAIL_ENABLED)return kind==='verify'?sendEmailVerification(auth.currentUser):sendPasswordResetEmail(auth,email);
 const path=location.pathname.replace(/^\/ReckoningFigures/,'')+location.search;
 return httpsCallable(getFunctions(auth.app,'us-central1'),'accountEmail')({kind,email:kind==='reset'?email:undefined,next:path});
}
