// Requires STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in Secret Manager.
import Stripe from 'stripe';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {defineSecret} from 'firebase-functions/params';
import {onCall,onRequest} from 'firebase-functions/v2/https';
import {createBilling,createBillingWebhook} from './billing.js';
import {billingConfig as config} from './billing-config.js';
const key=defineSecret('STRIPE_SECRET_KEY'),signing=defineSecret('STRIPE_WEBHOOK_SECRET');
const client=()=>new Stripe(key.value());
export const familyBilling=onCall({region:'us-central1',secrets:[key],maxInstances:1,concurrency:1},request=>createBilling({db:getFirestore(),auth:getAuth(),stripe:client(),config})(request));
export const familyBillingWebhook=onRequest({region:'us-central1',secrets:[key,signing],maxInstances:1,concurrency:1},(req,res)=>createBillingWebhook({db:getFirestore(),stripe:client(),config,secret:()=>signing.value()})(req,res));
