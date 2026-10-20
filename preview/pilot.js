export function mountPilot(api, doc=document) {
 const $=id=>doc.getElementById(id), form=$('application'), status=$('status'), submit=$('submit-request');
 let currentUser=null, generation=0, mode='register', authBusy=false;
 const notify=message=>{status.textContent=message;status.focus();};
 const errors={
  'auth/unauthorized-domain':'Sign-in is not configured for this website address. Please contact schools@reckoningfigures.com.',
  'auth/operation-not-allowed':'This sign-in option is not enabled yet. Please contact schools@reckoningfigures.com or use the other option.',
  'auth/email-already-in-use':'This email already has an account. Choose Sign in below, or reset your password.',
  'auth/invalid-credential':'The email or password did not match. Try again or choose Forgot password.',
  'auth/wrong-password':'The email or password did not match. Try again or choose Forgot password.',
  'auth/user-not-found':'The email or password did not match. Try again or create an account.',
  'auth/weak-password':'Choose a stronger password with at least 6 characters.',
  'auth/password-does-not-meet-requirements':'Choose a stronger password that meets the account password requirements.',
  'auth/invalid-email':'Enter a valid email address.',
  'auth/too-many-requests':'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed':'We could not connect. Check your connection and try again. Your details are still here.',
  'auth/popup-closed-by-user':'Google sign-in was cancelled. You can try again or continue with email.',
  'auth/popup-blocked':'Allow the Google sign-in popup, or continue with email instead.',
  'permission-denied':'We could not save this request. Try signing out and back in. If it persists, contact schools@reckoningfigures.com and mention permission-denied.'
 };
 const error=e=>errors[e.code]||'We could not complete that step. Please try again.';
 function button(label,action){const b=doc.createElement('button');b.type='button';b.className='button secondary';b.textContent=label;b.onclick=async()=>{b.disabled=true;try{await action();}catch(e){notify(error(e));}finally{b.disabled=false;}};return b;}
 function show(data){form.hidden=true;$('result').hidden=false;$('result').replaceChildren();const h=doc.createElement('h2');h.textContent='Your request is saved.';const p=doc.createElement('p');p.textContent=`Status: ${data.status}. Return with this account to check progress. For a new request, look for a confirmation email from Reckoning Figures Schools. Check spam if needed.`;$('result').append(h,p);}
 async function renderUser(user){
  const version=++generation;currentUser=user;$('identity').replaceChildren();$('verification').replaceChildren();$('account-panel').hidden=!!user;form.hidden=false;$('result').hidden=true;submit.disabled=false;submit.textContent='Submit pilot request →';$('submit-note').hidden=!!user;
  if(!user)return;
  $('account-password').value='';
  $('identity').append(doc.createTextNode(`Application email: ${user.email}. `),button('Use another account',async()=>{await api.logout();notify('Sign in with the email you want to use for this application.');}));
  if(!user.emailVerified){
   const p=doc.createElement('p');p.textContent=`Verify ${user.email} before submitting. Open the link in your inbox, then return here.`;
   $('verification').append(p,button('Send verification email',async()=>{await api.verifyEmail();notify('Verification email sent. Check your inbox and spam folder, then choose I’ve verified my email.');}),button('I’ve verified my email',async()=>{const refreshed=await api.refreshIdentity();await renderUser(refreshed);notify(refreshed.emailVerified?'Email verified. You can submit your request now.':'Your email is not verified yet. Open the link in your inbox first.');}));return;
  }
  try{const saved=await api.pilot.mine();if(version===generation&&saved)show(saved);}catch(e){if(version===generation)notify(error(e));}
 }
 function updateMode(){const registering=mode==='register';$('account-title').textContent=registering?'Continue with your email':'Welcome back';$('email-continue').textContent=registering?'Create account':'Sign in';$('account-mode').textContent=registering?'Already have an account? Sign in':'New here? Create an account';$('account-password').autocomplete=registering?'new-password':'current-password';$('account-password').minLength=registering?6:1;$('forgot-password').hidden=registering;$('account-hint').textContent=registering?'We’ll email you a verification link. Your application details stay here while you verify.':'Use your existing Reckoning Figures account. An already verified email does not need to be verified again.';}
 $('account-mode').onclick=()=>{mode=mode==='register'?'login':'register';updateMode();};
 async function authenticate(action,registering=false){
  if(authBusy)return;authBusy=true;$('account-form').querySelectorAll('button').forEach(b=>b.disabled=true);
  try{const result=await action();await renderUser(result.user);
   if(registering&&!result.user.emailVerified){try{await api.verifyEmail();notify('Account created. Check your inbox for the verification link, then return here.');}catch(e){notify('Your account was created, but the verification email could not be sent. Choose Send verification email to try again.');}}
   else notify(result.user.emailVerified?'Signed in. Review your details, then submit your pilot request.':'Signed in. Verify your email using the buttons above before submitting.');
  }catch(e){notify(error(e));if(e.code==='auth/email-already-in-use'){mode='login';updateMode();}}
  finally{authBusy=false;$('account-form').querySelectorAll('button').forEach(b=>b.disabled=false);}
 }
 $('account-form').onsubmit=e=>{e.preventDefault();if(!$('account-form').reportValidity())return;const email=$('account-email').value.trim(),password=$('account-password').value;authenticate(()=>mode==='register'?api.register(email,password):api.login(email,password),mode==='register');};
 $('google-continue').onclick=()=>authenticate(api.googleLogin);
 $('forgot-password').onclick=async()=>{
  if(!$('account-email').reportValidity())return;const b=$('forgot-password');b.disabled=true;
  try{await api.resetPassword($('account-email').value.trim());notify('If this email has an account, a password-reset link has been sent. Check your inbox and spam folder.');}catch(e){notify(error(e));}finally{b.disabled=false;}
 };
 api.observe(user=>{if(!authBusy)renderUser(user);});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(authBusy)return;
  if(!form.checkValidity()){const invalid=form.querySelector('input:invalid,select:invalid,textarea:invalid');notify(invalid?.type==='checkbox'?'Please check the consent box before submitting.':'Please complete the required fields with valid values.');invalid?.focus();form.reportValidity();return;}
  if(!currentUser){notify('Create an account or sign in above to submit. You can use your school email or Google.');$('account-email').focus();return;}
  if(!currentUser.emailVerified){notify('Verify your email using the buttons above before submitting.');$('verification').scrollIntoView?.({block:'center',behavior:'smooth'});return;}
  const version=generation,values=Object.fromEntries(new doc.defaultView.FormData(form));form.querySelector('fieldset').disabled=true;notify('Saving your request…');const slow=setTimeout(()=>notify('Still waiting for the connection. Keep this page open; your request has not been confirmed yet.'),12000);
  try{await api.pilot.submit(values);if(version!==generation)return;show(await api.pilot.mine());doc.defaultView.dispatchEvent(new doc.defaultView.Event('rf:pilot-submitted'));status.textContent='';}catch(e){if(version===generation)notify(error(e));}finally{clearTimeout(slow);form.querySelector('fieldset').disabled=false;}
 });
}
if(typeof document!=='undefined'){
 try{mountPilot(await import('./owner/client.js?v=pilot-email-20261020'));}
 catch{document.getElementById('status').textContent='Secure submission could not load. Refresh the page to try again.';document.getElementById('submit-request').textContent='Submission unavailable';}
}
