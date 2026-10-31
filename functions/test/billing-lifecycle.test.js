import test from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import {createBillingWebhook,BILLING_EVENTS,learnerAccess} from '../billing.js';
function fixture(plan='monthly'){
 const docs=new Map([['familyPurchases/u',{uid:'u',order:'o',plan,price:'p',session:'cs',audience:'self',status:'active',expiresAt:500000}]]);
 const snap=path=>({data:()=>structuredClone(docs.get(path))});
 const db={doc:path=>({path,get:async()=>snap(path)}),runTransaction:async fn=>fn({get:async r=>snap(r.path),set:(r,v)=>docs.set(r.path,{...docs.get(r.path),...v})})};
 let event={livemode:true,type:'customer.subscription.updated',data:{object:{metadata:{uid:'u',order:'o'}}}};
 const sub={status:'active',cancel_at_period_end:false,latest_invoice:{status:'paid'},items:{data:[{price:{id:'p'},quantity:1,current_period_end:500}]}};
 const session={id:'cs',livemode:true,metadata:{uid:'u',order:'o'},line_items:{data:[{price:{id:'p'},quantity:1}],has_more:false},customer:'cus',subscription:plan==='monthly'?'sub':null,payment_status:'paid',payment_intent:'pi'};
 const intent={metadata:{uid:'u',order:'o'},status:'succeeded',latest_charge:{refunded:false,amount_refunded:0,disputed:false}};
 const stripe={webhooks:{constructEvent:()=>event},checkout:{sessions:{retrieve:async()=>session}},subscriptions:{retrieve:async()=>sub},paymentIntents:{retrieve:async()=>intent},charges:{retrieve:async()=>({payment_intent:'pi',customer:'cus'})}};
 const handle=createBillingWebhook({db,stripe,config:{live:true},secret:()=>'',now:()=>100000});
 let status;const res={status:n=>{status=n;return res;},send:()=>{}};
 return {docs,db,sub,session,intent,stripe,event,setEvent:e=>event=e,run:async()=>{await handle({headers:{}},res);return status;},access:()=>db.runTransaction(tx=>learnerAccess(tx,db,'u',100000))};
}
test('period-end cancellation keeps paid access; cancellation, failed invoice and pause revoke it',async()=>{
 const f=fixture();f.sub.cancel_at_period_end=true;assert.equal(await f.run(),200);assert.equal(await f.access(),true);
 f.sub.status='canceled';f.event.type='customer.subscription.deleted';await f.run();assert.equal(await f.access(),false);
 f.sub.status='active';f.sub.latest_invoice.status='open';f.event.type='invoice.payment_failed';await f.run();assert.equal(await f.access(),false);
 f.sub.latest_invoice.status='paid';f.sub.status='paused';f.event.type='customer.subscription.paused';await f.run();assert.equal(await f.access(),false);
 f.sub.status='active';f.sub.items.data[0].current_period_end=99;await f.run();assert.equal(await f.access(),false);
});
test('late paid event reads current canceled subscription, never its old active snapshot',async()=>{
 const f=fixture();f.sub.status='canceled';f.event.type='invoice.paid';await f.run();await f.run();assert.equal(await f.access(),false);
});
test('refund resolves original payment metadata before customer mapping; old order cannot revoke new purchase',async()=>{
 const f=fixture('lifetime');f.setEvent({livemode:true,type:'charge.refunded',data:{object:{payment_intent:'pi',customer:'cus'}}});
 f.intent.metadata.order='old';await f.run();assert.equal(await f.access(),true);
 f.intent.metadata.order='o';await f.run();assert.equal(await f.access(),false);assert.equal(f.docs.get('familyPurchases/u').paymentReview,true);
});
test('dispute closure retains review hold and duplicate paid events cannot restore family seats',async()=>{
 const f=fixture('lifetime');const p=f.docs.get('familyPurchases/u');p.audience='family';p.seats=1;
 f.docs.set('familyStudents/child',{state:'active',parentUid:'u',slot:0,hash:'h'});f.docs.set('familyHomes/u',{slots:[{state:'active',studentUid:'child',hash:'h'}]});
 const access=()=>f.db.runTransaction(tx=>learnerAccess(tx,f.db,'child',100000));assert.equal(await access(),true);
 f.setEvent({livemode:true,type:'charge.dispute.closed',data:{object:{charge:'ch'}}});await f.run();assert.equal(await access(),false);
 f.setEvent({livemode:true,type:'checkout.session.completed',data:{object:{metadata:{uid:'u',order:'o'}}}});await f.run();assert.equal(await access(),false);
});
test('invoice metadata maps before customer lookup and wrong environment never mutates purchase',async()=>{
 const f=fixture();f.sub.status='canceled';f.setEvent({livemode:false,type:'invoice.paid',data:{object:{parent:{subscription_details:{metadata:{uid:'u',order:'o'}}}}}});assert.equal(await f.run(),400);assert.equal(await f.access(),true);
 f.setEvent({livemode:true,type:'invoice.paid',data:{object:{parent:{subscription_details:{metadata:{uid:'u',order:'o'}}}}}});assert.equal(await f.run(),200);assert.equal(await f.access(),false);
});
test('real SDK signature verification accepts original bytes and rejects tampering',async()=>{
 const stripe=new Stripe('sk_test_local_fixture'),secret='whsec_local_fixture';
 const payload=JSON.stringify({type:'customer.created',livemode:true,data:{object:{}}});
 const signature=stripe.webhooks.generateTestHeaderString({payload,secret});
 const handle=createBillingWebhook({db:{},stripe,config:{live:true},secret:()=>secret});let code;const res={status:n=>{code=n;return res;},send:()=>{}};
 await handle({rawBody:Buffer.from(payload),headers:{'stripe-signature':signature}},res);assert.equal(code,200);
 await handle({rawBody:Buffer.from(payload+' '),headers:{'stripe-signature':signature}},res);assert.equal(code,400);
 assert.ok(BILLING_EVENTS.includes('customer.subscription.paused'));assert.ok(BILLING_EVENTS.includes('charge.dispute.closed'));
});
