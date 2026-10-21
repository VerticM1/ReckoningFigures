import {getFunctions,httpsCallable} from 'firebase/functions';
import {sendEmailVerification,sendPasswordResetEmail} from 'firebase/auth';
// accountEmail deployment confirmed on 21 October 2026.
const BRANDED_EMAIL_ENABLED=true;
export function accountMail(auth,kind,email){
 if(!BRANDED_EMAIL_ENABLED)return kind==='verify'?sendEmailVerification(auth.currentUser):sendPasswordResetEmail(auth,email);
 const path=location.pathname.replace(/^\/ReckoningFigures/,'')+location.search;
 return httpsCallable(getFunctions(auth.app,'us-central1'),'accountEmail')({kind,email:kind==='reset'?email:undefined,next:path});
}
