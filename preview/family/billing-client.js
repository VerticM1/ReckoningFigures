// Enable only after Stripe sandbox acceptance and approved price configuration.
export const BILLING_ENABLED=true;
export async function billingCall(user,data){
 if(!user?.emailVerified)throw Error('Sign in and verify your email first.');
 const response=await fetch('https://us-central1-reckoningfigures-bbdae.cloudfunctions.net/familyBilling',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await user.getIdToken()},body:JSON.stringify({data})});
 const body=await response.json();if(!response.ok||body.error)throw Error(body.error?.message||'Could not connect to billing.');return body.result;
}
export async function mountBilling(host,user){
 if(!BILLING_ENABLED)return;const panel=document.createElement('section');panel.className='link-card';panel.innerHTML='<h2>Your plan</h2><p role="status">Loading billing…</p>';host.prepend(panel);
 try{const state=await billingCall(user,{action:'status'});if(!panel.isConnected)return;panel.querySelector('p').textContent=state.active?`${state.seats} student plan · ${state.plan}${state.test?' · Test mode':''}`:'No active paid plan.';const button=document.createElement('button');button.textContent='Manage billing';panel.append(button);button.onclick=async()=>{button.disabled=true;try{const r=await billingCall(user,{action:'portal'});const url=new URL(r.url);if(url.protocol!=='https:'||url.hostname!=='billing.stripe.com')throw Error('Billing link unavailable.');location.assign(url.href);}catch(e){panel.querySelector('p').textContent=e.message;button.disabled=false;}};}catch(e){panel.querySelector('p').textContent=e.message;}
}
