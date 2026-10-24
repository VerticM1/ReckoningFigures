import test from 'node:test';
import assert from 'node:assert/strict';
import {accountBilling,schoolConnections} from '../profile.js';
const config={live:false,enabled:false,currency:'usd',portalConfiguration:'portal',amounts:{monthly:{1:799},lifetime:{1:14900}}};
test('billing summary exposes renewal cancellation and masked card only',async()=>{
 const p={status:'active',plan:'monthly',seats:1,audience:'self',expiresAt:2000,subscription:'sub',customer:'cus',session:'cs'};
 const stripe={subscriptions:{retrieve:async()=>({status:'active',cancel_at_period_end:true,items:{data:[{current_period_end:2}]},default_payment_method:{type:'card',card:{brand:'visa',last4:'4242',exp_month:12,exp_year:2030,fingerprint:'private'}}})}};
 const s=await accountBilling({p,stripe,config,now:1000});assert.equal(s.active,true);assert.equal(s.cancelAtPeriodEnd,true);assert.equal(s.renewalAt,2000);assert.equal(s.paymentMethod.last4,'4242');assert.equal(s.paymentMethod.fingerprint,undefined);assert.equal(s.canManage,true);assert.equal(s.amount,799);assert.equal(s.test,true);
});
test('Stripe detail outage preserves cached access and explicitly marks unavailable details',async()=>{
 const s=await accountBilling({p:{status:'active',plan:'lifetime',seats:1,customer:'cus'},stripe:{customers:{retrieve:async()=>{throw Error('outage');}}},config,now:1000});assert.equal(s.active,true);assert.equal(s.detailsUnavailable,true);assert.equal(s.renewalAt,null);
 const free=await accountBilling({config,stripe:{},now:1000});assert.equal(free.active,false);assert.equal(free.canManage,false);assert.equal(free.status,'free');
});
test('school connections only return active memberships of the authenticated user',async()=>{
 const rows=['a','b','c'].map(id=>({id,data:()=>({name:'School '+id,status:'pilot'})}));
 const db={collection:()=>({select:()=>({limit:()=>({get:async()=>({docs:rows})})})}),doc:path=>path,getAll:async(...refs)=>{assert.deepEqual(refs,rows.map(s=>'schools/'+s.id+'/members/me'));return [{data:()=>({state:'active',role:'student'})},{data:()=>({state:'removed',role:'teacher'})},{data:()=>undefined}];}};
 assert.deepEqual(await schoolConnections(db,'me'),{schools:[{id:'a',name:'School a',role:'student',status:'pilot'}],more:false});
});
