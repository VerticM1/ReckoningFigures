import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareMail, claimDecision, postEmail, WINDOW, BASE } from '../mail.js';
const now = Date.now(), timestamp = n => ({ toMillis: () => n });
function fixture() {
  const records = {
    'staffInvites/invite123': { schoolId: 'school1', schoolName: 'Old name', email: 'teacher@example.com', role: 'teacher', createdBy: 'owner1', state: 'pending', expiresAt: timestamp(now + 100000) },
    'schools/school1': { name: '<School & Co>', status: 'pilot', license: { startsOn: timestamp(now - 1000), endsOn: timestamp(now + 100000) } },
    'platformOwners/owner1': { active: true },
    'pilotApplications/user1': { uid: 'user1', email: 'teacher@example.com', consent: true, status: 'submitted' },
    'schools/school1/members/user1': { role: 'teacher', state: 'active' }
  };
  const account = { email: 'teacher@example.com', emailVerified: true, disabled: false };
  return { records, account, read: async path => records[path], user: async () => account };
}
test('invitation uses saved recipient, live school name, escaped branding and fixed route', async () => {
  const mail = await prepareMail('invite', 'invite123', fixture(), now);
  assert.deepEqual(mail.to, ['teacher@example.com']);
  assert.match(mail.html, /&lt;School &amp; Co&gt;/);
  assert.ok(mail.text.includes(BASE + 'preview/school/staff-join.html?invite=invite123'));
  assert.equal(mail.reply_to, 'schools@reckoningfigures.com');
});
test('revoked, accepted, expired and unauthorized invitations never send', async () => {
  for (const state of ['revoked', 'accepted']) {
    const f = fixture(); f.records['staffInvites/invite123'].state = state;
    assert.equal(await prepareMail('invite', 'invite123', f, now), null);
  }
  const f = fixture(); f.records['staffInvites/invite123'].expiresAt = timestamp(now);
  assert.equal(await prepareMail('invite', 'invite123', f, now), null);
  const g = fixture(); g.records['platformOwners/owner1'].active = false;
  assert.equal(await prepareMail('invite', 'invite123', g, now), null);
  g.records['schools/school1/members/owner1'] = { role: 'administrator', state: 'active' };
  assert.ok(await prepareMail('invite', 'invite123', g, now));
  g.records['staffInvites/invite123'].role = 'administrator';
  assert.equal(await prepareMail('invite', 'invite123', g, now), null);
});
test('inactive license, malformed ids and unknown templates cannot send', async () => {
  const f = fixture(); f.records['schools/school1'].status = 'suspended';
  assert.equal(await prepareMail('invite', 'invite123', f, now), null);
  assert.equal(await prepareMail('invite', '../bad', fixture(), now), null);
  assert.equal(await prepareMail('reset', 'user1', fixture(), now), null);
});
test('pilot acknowledgement requires verified matching account and consent', async () => {
  const f = fixture(); assert.ok(await prepareMail('pilot', 'user1', f, now));
  f.account.emailVerified = false;
  assert.equal(await prepareMail('pilot', 'user1', f, now), null);
  f.account.emailVerified = true; f.account.email = 'other@example.com';
  assert.equal(await prepareMail('pilot', 'user1', f, now), null);
});
test('welcome requires accepted invite, verified recipient and active matching membership', async () => {
  const f = fixture(), invite = f.records['staffInvites/invite123'];
  assert.equal(await prepareMail('welcome', 'invite123', f, now), null);
  Object.assign(invite, { state: 'accepted', acceptedBy: 'user1' });
  assert.ok(await prepareMail('welcome', 'invite123', f, now));
  f.records['schools/school1/members/user1'].state = 'removed';
  assert.equal(await prepareMail('welcome', 'invite123', f, now), null);
});
test('terminal states, concurrent leases, retry count and 20h age enforce bounded deduplication', () => {
  assert.equal(claimDecision(null, now, now), 'claim');
  for (const state of ['sent', 'failed', 'skipped']) assert.equal(claimDecision({ state }, now, now), 'done');
  assert.equal(claimDecision({ leaseUntil: now + 100 }, now, now), 'busy');
  assert.equal(claimDecision({ leaseUntil: now - 1 }, now, now), 'claim');
  assert.equal(claimDecision({ attempts: 8 }, now, now), 'failed');
  assert.equal(claimDecision(null, now - WINDOW, now), 'failed');
  assert.equal(claimDecision(null, NaN, now), 'failed');
});
test('transport sends stable idempotency key and distinguishes permanent/transient errors', async () => {
  const payload = { to: ['test@example.com'] };
  const accepted = await postEmail(payload, 'test-key', 'event1', async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(options.headers['Idempotency-Key'], 'event1');
    assert.deepEqual(JSON.parse(options.body), payload);
    return { ok: true, json: async () => ({ id: 'provider123' }) };
  });
  assert.equal(accepted.id, 'provider123');
  for (const status of [429, 500, 409]) assert.equal((await postEmail(payload, '', '', async () => ({ ok: false, status }))).retry, true);
  for (const status of [400, 401, 403, 422]) assert.equal((await postEmail(payload, '', '', async () => ({ ok: false, status }))).retry, false);
  assert.equal((await postEmail(payload, '', '', async () => { throw Error('timeout'); })).retry, true);
});
