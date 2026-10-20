import test from 'node:test';
import assert from 'node:assert/strict';
import { createDispatcher } from '../dispatcher.js';

function fixture(send) {
  const docs = new Map();
  let queue = Promise.resolve();
  const ref = path => ({ path, update: async patch => docs.set(path, { ...docs.get(path), ...patch }) });
  const db = { doc: ref, runTransaction: callback => {
    const task = queue.then(() => callback({
      get: async r => ({ data: () => docs.get(r.path) }),
      set: (r, value) => docs.set(r.path, { ...docs.get(r.path), ...value }),
      update: (r, value) => docs.set(r.path, { ...docs.get(r.path), ...value })
    }));
    queue = task.catch(() => {}); return task;
  } };
  const app = { uid: 'user1', email: 'test@example.com', status: 'submitted', consent: true };
  const dispatch = createDispatcher({ db, read: async () => app,
    user: async () => ({ email: app.email, emailVerified: true }), key: () => 'fake', send });
  return { dispatch, docs, app };
}
test('replayed and concurrent deliveries submit only once', async () => {
  let calls = 0;
  const f = fixture(async () => { calls++; return { id: 'mail1' }; });
  await Promise.allSettled([f.dispatch('pilot', 'user1', Date.now()), f.dispatch('pilot', 'user1', Date.now())]);
  await f.dispatch('pilot', 'user1', Date.now());
  assert.equal(calls, 1);
  assert.equal([...f.docs.values()][0].state, 'sent');
});
test('transient retry preserves provider request and key; successful retry becomes terminal', async () => {
  const requests = [];
  const f = fixture(async (payload, key, id) => {
    requests.push({ payload, id });
    return requests.length === 1 ? { retry: true, code: 'network' } : { id: 'mail1' };
  });
  await assert.rejects(f.dispatch('pilot', 'user1', Date.now()));
  await f.dispatch('pilot', 'user1', Date.now());
  await f.dispatch('pilot', 'user1', Date.now());
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[0], requests[1]);
});
test('eligibility is rechecked on retry and permanent provider rejection stops', async () => {
  let calls = 0;
  const f = fixture(async () => { calls++; return { retry: true, code: 'network' }; });
  await assert.rejects(f.dispatch('pilot', 'user1', Date.now()));
  f.app.status = 'closed';
  await f.dispatch('pilot', 'user1', Date.now());
  assert.equal(calls, 1);
  assert.equal([...f.docs.values()][0].state, 'skipped');
  const g = fixture(async () => ({ retry: false, code: 'http_403' }));
  await g.dispatch('pilot', 'user1', Date.now());
  await g.dispatch('pilot', 'user1', Date.now());
  assert.equal([...g.docs.values()][0].attempts, 1);
});
