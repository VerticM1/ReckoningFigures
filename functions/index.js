import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import { millis } from './mail.js';
import { createDispatcher } from './dispatcher.js';

initializeApp();
const db = getFirestore();
const resendKey = defineSecret('RESEND_API_KEY');
const options = { region: 'us-central1', secrets: [resendKey], retry: true,
  memory: '256MiB', timeoutSeconds: 60, minInstances: 0, maxInstances: 1, concurrency: 1 };
const read = async path => (await db.doc(path).get()).data();
const user = async uid => {
  try { return await getAuth().getUser(uid); }
  catch (error) { if (error.code === 'auth/user-not-found') return null; throw error; }
};

const dispatch = createDispatcher({ db, read, user, key: () => resendKey.value() });

export const pilotAcknowledgement = onDocumentCreated({ ...options, document: 'pilotApplications/{uid}' },
  event => dispatch('pilot', event.params.uid, millis(event.data?.data().createdAt)));
export const staffInvitationEmail = onDocumentCreated({ ...options, document: 'staffInvites/{token}' },
  event => dispatch('invite', event.params.token, millis(event.data?.data().createdAt)));
export const staffWelcomeEmail = onDocumentUpdated({ ...options, document: 'staffInvites/{token}' }, event => {
  const before = event.data?.before.data(), after = event.data?.after.data();
  if (before?.state !== 'pending' || after?.state !== 'accepted') return;
  return dispatch('welcome', event.params.token, millis(after.acceptedAt));
});

import { onCall } from 'firebase-functions/v2/https';
import { createAuthMailer } from './auth-mail.js';
export const accountEmail = onCall({region:'us-central1',secrets:[resendKey],memory:'256MiB',timeoutSeconds:60,minInstances:0,maxInstances:1,concurrency:10,
 cors:['https://reckoningfigures.com','https://www.reckoningfigures.com','https://verticm1.github.io']},
 createAuthMailer({db,auth:getAuth(),key:()=>resendKey.value()}));
