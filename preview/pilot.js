const identity=document.querySelector('#identity'),status=document.querySelector('#status'),form=document.querySelector('#application'),result=document.querySelector('#result'),submit=document.querySelector('#submit-request'),note=document.querySelector('#submit-note');let generation=0,currentUser=null,api;
const error=e=>e.code==='permission-denied'?'We can’t accept this request yet. Your details have not been submitted. Please try again once pilot applications open.':e.code==='auth/popup-closed-by-user'?'Sign-in was cancelled. Your form is still here.':e.code==='auth/popup-blocked'?'Allow the sign-in popup, then try again. Your form is still here.':e.message||'Unable to connect. Please try again.';
function button(label,action){const b=document.createElement('button');b.className='button secondary';b.textContent=label;b.onclick=async()=>{b.disabled=true;try{await action();}catch(e){status.textContent=error(e);}finally{b.disabled=false;}};return b;}
function show(data){form.hidden=true;result.hidden=false;result.replaceChildren();const h=document.createElement('h2');h.textContent='Your request is saved.';const p=document.createElement('p');p.textContent=`Status: ${data.status}. Return here with the same account to check progress. Email confirmations are not connected yet.`;result.append(h,p);}
try{
api=await import('./owner/client.js?v=pilot-20261016');
api.observe(async user=>{const current=++generation;currentUser=user;identity.replaceChildren();form.hidden=false;result.hidden=true;status.textContent='';submit.disabled=false;submit.textContent=user?'Submit pilot request →':'Verify email with Google →';note.hidden=!!user;
if(!user)return;
identity.append(document.createTextNode(`Application email: ${user.email}. `),button('Use another account',api.logout));
if(!user.emailVerified){status.textContent='Use a verified email account to apply.';submit.disabled=true;return;}
try{const saved=await api.pilot.mine();if(current!==generation)return;if(saved)show(saved);}catch(e){if(current===generation)status.textContent=error(e);}});
}catch(e){status.textContent='Secure submission could not load. Refresh the page to try again.';submit.textContent='Submission unavailable';}
form.addEventListener('submit',async e=>{e.preventDefault();if(!api)return;
if(!currentUser){submit.disabled=true;try{await api.googleLogin();status.textContent='Email verified. Review your details, then choose Submit pilot request.';}catch(e){status.textContent=error(e);}finally{submit.disabled=false;}return;}
const current=generation,values=Object.fromEntries(new FormData(form));form.querySelector('fieldset').disabled=true;status.textContent='Saving your request…';try{await api.pilot.submit(values);if(current!==generation)return;show(await api.pilot.mine());window.dispatchEvent(new Event('rf:pilot-submitted'));status.textContent='';}catch(e){if(current===generation)status.textContent=error(e);}finally{form.querySelector('fieldset').disabled=false;}});
