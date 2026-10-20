import { FieldValue } from 'firebase-admin/firestore';
import { randomUUID } from 'node:crypto';
import { prepareMail, claimDecision, postEmail, hash } from './mail.js';

export function createDispatcher({ db, read, user, key, send = postEmail }) {
return async function dispatch(kind, id, sourceTime) {
  // No secret values, recipient addresses, invitation links, or email bodies in logs.
  const ref = db.doc(`mailEvents/${hash(`${kind}:${id}`)}`);
  const nonce = randomUUID();
  const claimed = await db.runTransaction(async tx => {
    const record = (await tx.get(ref)).data();
    const now = Date.now(), decision = claimDecision(record, sourceTime, now);
    if (decision === 'failed') {
      tx.set(ref, { state: 'failed', reason: 'retry_limit_or_age', payload: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    }
    if (decision !== 'claim') return { decision };
    tx.set(ref, { kind, state: 'sending', attempts: (record?.attempts || 0) + 1,
      leaseUntil: now + 90000, nonce, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return { decision, payload: record?.payload };
  });
  if (claimed.decision === 'busy') throw Error('Mail event is already being processed; retry later.');
  if (claimed.decision !== 'claim') return;
  const finish = async patch => db.runTransaction(async tx => {
    if ((await tx.get(ref)).data()?.nonce !== nonce) throw Error('Mail processing lease changed.');
    tx.update(ref, { ...patch, leaseUntil: 0, updatedAt: FieldValue.serverTimestamp() });
  });
  // A thrown database/auth failure retains the lease; platform retries after it expires.
  const current = await prepareMail(kind, id, { read, user });
  if (!current) { await finish({ state: 'skipped', reason: 'no_longer_eligible', payload: FieldValue.delete() }); return; }
  const payload = claimed.payload || current;
  if (payload.to[0] !== current.to[0]) { await finish({ state: 'skipped', reason: 'recipient_changed', payload: FieldValue.delete() }); return; }
  // Persist a stable request so retries with the same idempotency key have identical content.
  if (!claimed.payload) await ref.update({ payload });
  const result = await send(payload, key(), `rf-${ref.id}`);
  if (result.id) {
    await finish({ state: 'sent', providerId: result.id, payload: FieldValue.delete() });
    return; // "sent" means provider accepted, NOT delivered to inbox.
  }
  await finish({ state: result.retry ? 'retry' : 'failed', reason: result.code,
    ...(result.retry ? {} : { payload: FieldValue.delete() }) });
  if (result.retry) throw Error(`Temporary mail provider failure: ${result.code}`);
}
;
}
