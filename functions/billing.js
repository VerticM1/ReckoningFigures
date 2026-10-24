import {HttpsError} from 'firebase-functions/v2/https';
import {accountBilling,schoolConnections} from './profile.js';
import {randomUUID} from 'node:crypto';
const fail=(code,message)=>{throw new HttpsError(code,message);};
const BASE='https://reckoningfigures.com/preview/family/';
export const purchaseActive=(p,now=Date.now())=>p?.status==='active'&&!p.paymentReview&&(p.plan==='lifetime'||p.plan==='monthly'&&p.expiresAt>now);
export async function learnerAccess(tx,db,uid,now=Date.now()){
 const own=(await tx.get(db.doc('familyPurchases/'+uid))).data();if(own?.audience==='self'&&purchaseActive(own,now))return true;
 const m=(await tx.get(db.doc('familyStudents/'+uid))).data();if(m?.state!=='active')return false;
 const h=(await tx.get(db.doc('familyHomes/'+m.parentUid))).data(),p=(await tx.get(db.doc('familyPurchases/'+m.parentUid))).data(),slot=h?.slots?.[m.slot];
 return Boolean(p?.audience==='family'&&purchaseActive(p,now)&&m.slot<p.seats&&slot?.state==='active'&&slot.studentUid===uid&&slot.hash===m.hash);
}
export function createBilling({db,auth,stripe,config,now=Date.now,uuid=randomUUID}){
 return async request=>{
 const uid=request.auth?.uid;if(!uid)fail('unauthenticated','Sign in first.');const account=await auth.getUser(uid);if(account.disabled||!account.emailVerified)fail('permission-denied','Verify your email first.');
 const data=request.data||{},ref=db.doc('familyPurchases/'+uid);
 const sandbox=data.sandbox===true;
 if(sandbox){const owner=(await db.doc('platformOwners/'+uid).get()).data();if(config.live||owner?.active!==true)fail('permission-denied','Sandbox checkout is available only to the active platform owner.');}
 if(data.action==='access')return db.runTransaction(async tx=>({premium:await learnerAccess(tx,db,uid,now())}));
 if(data.action==='schools')return schoolConnections(db,uid);
 if(data.action==='status'){const p=(await ref.get()).data();return accountBilling({p,stripe,config,now:now(),sandbox});}
 if(data.action==='portal'){
  const p=(await ref.get()).data();if(!p?.customer)fail('failed-precondition','No billing account found.');
  if(!config.live){const owner=(await db.doc('platformOwners/'+uid).get()).data();if(owner?.active!==true)fail('permission-denied','Test billing is limited to the platform owner.');}
  if(!config.portalConfiguration)fail('failed-precondition','Billing management is being set up. Contact support for help.');
  return {url:(await stripe.billingPortal.sessions.create({customer:p.customer,configuration:config.portalConfiguration,return_url:'https://reckoningfigures.com/preview/profile.html'})).url};
 }
 if(!config.enabled&&!sandbox)fail('failed-precondition','Payments are not open yet.');
 if(data.action!=='checkout')fail('invalid-argument','Unknown billing action.');
 const {plan,seats,audience}=data,price=config.prices[plan]?.[seats];if(!['monthly','lifetime'].includes(plan)||!Number.isInteger(seats)||seats<1||seats>4||!['self','family'].includes(audience)||audience==='self'&&seats!==1||!price)fail('invalid-argument','Choose an available plan.');
 const verified=await stripe.prices.retrieve(price);if(!verified.active||verified.livemode!==config.live||verified.currency!==config.currency||verified.unit_amount!==config.amounts?.[plan]?.[seats]||(plan==='monthly'?(verified.recurring?.interval!=='month'||verified.recurring.interval_count!==1):Boolean(verified.recurring)))fail('failed-precondition','This plan is not configured correctly.');
 // Keep an unresolved order even after its local timer expires. Only Stripe expiration
 // permits replacement; completed delayed payments must retain their order mapping.
 const order=await db.runTransaction(async tx=>{
  const p=(await tx.get(ref)).data();
  if(p?.subscription||p?.paymentReview)fail('failed-precondition','Manage your existing billing account before starting another purchase.');
  if(purchaseActive(p,now()))fail('failed-precondition','You already have an active plan. Open Manage billing.');
  if(p?.order){
   let expired=false;
   if(p.session){
    const previous=await stripe.checkout.sessions.retrieve(p.session);
    if(previous.metadata?.uid!==uid||previous.metadata?.order!==p.order||previous.livemode!==config.live)fail('failed-precondition','Your previous checkout needs review.');
    expired=previous.status==='expired';
    if(!expired&&previous.status!=='open')fail('failed-precondition','Your payment is being confirmed. Please check your account shortly.');
   }
   if(!expired){
    if(p.plan!==plan||p.seats!==seats||p.audience!==audience)fail('failed-precondition','Finish your open checkout before changing plans.');
    // Never replay a creation request after Stripe may have pruned its idempotency key.
    if(!p.session&&now()>=p.pendingUntil)fail('failed-precondition','Your checkout needs support review before retrying.');
    return p;
   }
  }
  const next={order:uuid(),uid,plan,seats,audience,status:'pending',price,pendingUntil:now()+40*60000,checkoutEmail:account.email,sandbox};tx.set(ref,next);return next;
 });
 const session=order.session?await stripe.checkout.sessions.retrieve(order.session):await stripe.checkout.sessions.create({mode:plan==='monthly'?'subscription':'payment',integration_identifier:'reckoning_figures_web_qmzvtrpa',line_items:[{price,quantity:1}],customer_email:order.checkoutEmail,client_reference_id:uid,metadata:{uid,order:order.order},...(plan==='monthly'?{subscription_data:{billing_mode:{type:'flexible'},metadata:{uid,order:order.order}}}:{customer_creation:'always',invoice_creation:{enabled:true},payment_intent_data:{metadata:{uid,order:order.order}}}),success_url:BASE+'success.html?session_id={CHECKOUT_SESSION_ID}',cancel_url:order.sandbox?BASE+'sandbox.html?checkout=cancelled':BASE+'?checkout=cancelled',expires_at:Math.floor((order.pendingUntil-5*60000)/1000)},{idempotencyKey:'checkout-'+order.order});
 if(session.status!=='open'||!session.url)fail('failed-precondition','Your checkout is being confirmed or has expired. Please refresh your account.');
 await db.runTransaction(async tx=>{const p=(await tx.get(ref)).data();if(p?.order===order.order)tx.set(ref,{session:session.id},{merge:true});});return {url:session.url,test:!config.live};
 };
}
export const BILLING_EVENTS=['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired','customer.subscription.updated','customer.subscription.deleted','invoice.paid','invoice.payment_failed','charge.refunded','charge.dispute.created','charge.dispute.updated'];
// Re-read current Stripe objects instead of trusting a redirect or out-of-order event snapshot.
export function createBillingWebhook({db,stripe,config,secret,now=Date.now}){
 return async (req,res)=>{
 let event;try{event=stripe.webhooks.constructEvent(req.rawBody,req.headers['stripe-signature'],secret());}catch{return res.status(400).send('Invalid signature');}
 if(!BILLING_EVENTS.includes(event.type))return res.status(200).send('Ignored');
 if(event.livemode!==config.live)return res.status(400).send('Wrong payment environment');
 try{
 const object=event.data.object;let uid=object.metadata?.uid,order=object.metadata?.order;
 if(!uid&&object.charge){const charge=await stripe.charges.retrieve(typeof object.charge==='string'?object.charge:object.charge.id);if(charge.payment_intent){const intent=await stripe.paymentIntents.retrieve(charge.payment_intent);uid=intent.metadata?.uid;order=intent.metadata?.order;}if(!uid)object.customer=charge.customer;}

 if(!uid&&object.customer){const matches=await db.collection('familyPurchases').where('customer','==',typeof object.customer==='string'?object.customer:object.customer.id).limit(1).get();const p=matches.docs[0]?.data();uid=p?.uid;order=p?.order;}
 if(!uid||!order)return res.status(200).send('Ignored');
 const ref=db.doc('familyPurchases/'+uid),p=(await ref.get()).data();if(p?.order!==order)return res.status(200).send('Old order');
 const sessionId=p.session||(object.object==='checkout.session'?object.id:null);if(!sessionId)throw Error('Checkout not recorded yet');
 const session=await stripe.checkout.sessions.retrieve(sessionId,{expand:['line_items']});if(session.metadata?.uid!==uid||session.metadata?.order!==order)throw Error('Order mismatch');
 const lines=session.line_items;if(session.livemode!==config.live||lines?.has_more||lines?.data?.length!==1||lines.data[0].price?.id!==p.price||lines.data[0].quantity!==1)throw Error('Unexpected checkout purchase');
 let status='inactive',expiresAt=0;
 if(p.plan==='monthly'&&session.subscription){const sub=await stripe.subscriptions.retrieve(session.subscription,{expand:['latest_invoice']});const item=sub.items.data[0];if(sub.items.data.length!==1||item.price.id!==p.price||item.quantity!==1)throw Error('Unexpected subscription price');expiresAt=item.current_period_end*1000;status=sub.status==='active'&&sub.latest_invoice?.status==='paid'&&expiresAt>now()?'active':'inactive';}
 if(p.plan==='lifetime'&&session.payment_status==='paid'&&session.payment_intent){const intent=await stripe.paymentIntents.retrieve(session.payment_intent,{expand:['latest_charge']});if(intent.status==='succeeded'&&intent.latest_charge&&!intent.latest_charge.refunded&&!intent.latest_charge?.amount_refunded&&!intent.latest_charge?.disputed)status='active';}
 // Refunds/disputes create a persistent review hold; later duplicate events cannot restore access.
 const review=['charge.refunded','charge.dispute.created','charge.dispute.updated'].includes(event.type);
 await db.runTransaction(async tx=>{const current=(await tx.get(ref)).data();if(current?.order!==order)return;tx.set(ref,{status:review||current.paymentReview?'inactive':status,paymentReview:Boolean(review||current.paymentReview),expiresAt,customer:typeof session.customer==='string'?session.customer:session.customer?.id||null,session:session.id,subscription:typeof session.subscription==='string'?session.subscription:null,updatedAt:now()},{merge:true});});
 return res.status(200).send('OK');
 }catch{return res.status(500).send('Please retry');}
 };
}
