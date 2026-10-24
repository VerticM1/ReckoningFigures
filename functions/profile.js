// Only return the authenticated account's billing summary and memberships.
export async function accountBilling({p,stripe,config,now,sandbox=false}){
 const active=p?.status==='active'&&!p.paymentReview&&(p.plan==='lifetime'||p.plan==='monthly'&&p.expiresAt>now);
 const result={enabled:config.enabled||sandbox,active,plan:p?.plan||null,seats:p?.seats||0,audience:p?.audience||null,expiresAt:p?.expiresAt||null,test:!config.live,status:p?.paymentReview?'review':p?.status||'free',amount:config.amounts?.[p?.plan]?.[p?.seats]??null,currency:config.currency,canManage:Boolean(p?.customer&&config.portalConfiguration),subscriptionStatus:null,cancelAtPeriodEnd:false,renewalAt:null,paymentMethod:null,detailsUnavailable:false,session:p?.session||null};
 try{
  let method;
  if(p?.subscription){const sub=await stripe.subscriptions.retrieve(p.subscription,{expand:['default_payment_method']});result.subscriptionStatus=sub.status;result.cancelAtPeriodEnd=Boolean(sub.cancel_at_period_end||sub.cancel_at);result.renewalAt=sub.items?.data?.[0]?.current_period_end*1000||null;method=sub.default_payment_method;}
  if(!method&&p?.customer){const customer=await stripe.customers.retrieve(p.customer,{expand:['invoice_settings.default_payment_method']});method=customer.invoice_settings?.default_payment_method;}
  if(method&&typeof method==='object')result.paymentMethod=method.card?{type:'card',brand:method.card.brand,last4:method.card.last4,expMonth:method.card.exp_month,expYear:method.card.exp_year}:{type:method.type};
 }catch{result.detailsUnavailable=true;}
 return result;
}
export async function schoolConnections(db,uid){
 // Bounded pilot lookup. Membership documents predate a per-user school index.
 const schools=await db.collection('schools').select('name','status').limit(201).get();
 const rows=schools.docs.slice(0,200);if(!rows.length)return {schools:[],more:false};
 const memberships=await db.getAll(...rows.map(s=>db.doc('schools/'+s.id+'/members/'+uid)));
 return {schools:rows.flatMap((s,i)=>{const m=memberships[i].data();return m?.state==='active'?[{id:s.id,name:s.data().name,role:m.role,status:s.data().status}]:[];}),more:schools.docs.length>200};
}
