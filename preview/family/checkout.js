import {BILLING_ENABLED,billingCall} from './billing-client.js';
import {observe} from '../owner/client.js?v=family-link-20261021';
if(BILLING_ENABLED){
 const form=document.getElementById('plan'),status=document.getElementById('status'),price=document.querySelector('.price');let user=null;
 const audience=document.createElement('fieldset');audience.innerHTML='<legend>Who is learning?</legend><label><input type="radio" name="audience" value="family" checked> My students</label><label><input type="radio" name="audience" value="self"> I am learning (one student)</label>';form.prepend(audience);
 const button=document.createElement('button');button.type='button';button.textContent='Continue to secure checkout';form.querySelector('.summary').append(button);
 observe(value=>{user=value;});price.innerHTML='<strong>Confirm your price at checkout</strong><span>Your plan and total will be shown before payment.</span>';
 button.onclick=async()=>{button.disabled=true;try{const plan=form.querySelector('[name=billing]:checked').value,seats=Number(form.querySelector('[name=students]:checked').value),audience=form.querySelector('[name=audience]:checked').value;if(audience==='self'&&seats!==1)throw Error('Choose one student for your own learning.');const r=await billingCall(user,{action:'checkout',plan,seats,audience});const url=new URL(r.url);if(url.protocol!=='https:'||url.hostname!=='checkout.stripe.com')throw Error('Checkout link unavailable.');location.assign(url.href);}catch(e){status.textContent=e.message;}finally{button.disabled=false;}};
}
