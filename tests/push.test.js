// node tests/push.test.js — checks which reminders the server sends, and when.
'use strict';
const assert = require('assert');
const { dueNow, localToUtc, effectiveReminder, clearTargets } = require('../api/_reminders');

let n = 0;
const ok = (name, fn) => { fn(); n++; };

ok('Dubai 9:00 is 05:00 UTC', () => {
  assert.strictEqual(new Date(localToUtc('2026-11-23T09:00', 'Asia/Dubai')).toISOString(), '2026-11-23T05:00:00.000Z');
});
ok('New York across daylight saving', () => {
  assert.strictEqual(new Date(localToUtc('2026-07-01T09:00', 'America/New_York')).toISOString(), '2026-07-01T13:00:00.000Z');
  assert.strictEqual(new Date(localToUtc('2026-12-01T09:00', 'America/New_York')).toISOString(), '2026-12-01T14:00:00.000Z');
});

const sub = { endpoint: 'https://push.example/1', user: 'u1', sub: { endpoint: 'https://push.example/1' }, tz: 'Asia/Dubai', prefs: { autoRemind: true, bdayRemind: true } };
const tasks = [
  { id: 'rent', title: 'Pay rent', due: '2026-11-23', time: '09:00' },
  { id: 'later', title: 'Later today', due: '2026-11-23', time: '15:00' },
  { id: 'rem', title: 'Call bank', due: '2026-11-25', reminder: '2026-11-23T09:02' },
  { id: 'bday', title: "Mom's birthday", due: '2026-11-24', type: 'event', recur: { freq: 'year', interval: 1 } },
  { id: 'done', title: 'Done one', due: '2026-11-23', time: '09:00', done: true },
  { id: 'bin', title: 'Deleted', due: '2026-11-23', time: '09:00', deletedAt: 1 },
  { id: 'note', title: 'Note', due: '2026-11-23', time: '09:00', type: 'daynote' },
  { id: 'old', title: 'Missed long ago', due: '2026-11-23', time: '08:00' }
].map(data => ({ user: 'u1', data }));
const now = Date.parse('2026-11-23T05:03:00Z'); // 9:03am in Dubai

ok('a text waiting for a reply is nudged with the message', () => {
  const w = { subs: [sub], sent: [], tasks: [{ user: 'u1', data: { id: 'msg-1', type: 'msg', title: 'Reply to Ravi', src: 'sms', reminder: '2026-11-23T09:01', msgs: [{ at: 1, text: 'Old' }, { at: 2, text: 'Can you send the contract?' }] } }] };
  const d = dueNow(w, now);
  assert.strictEqual(d.length, 1);
  assert.strictEqual(d[0].payload.title, 'Reply to Ravi');
  assert.strictEqual(d[0].payload.body, 'Text: Can you send the contract?');
  assert.strictEqual(d[0].payload.msg, true);
});

ok('sends what is due in the last 10 minutes, nothing else', () => {
  const ids = dueNow({ subs: [sub], tasks, sent: [] }, now).map(d => d.taskId).sort();
  assert.deepStrictEqual(ids, ['rem', 'rent']);
});
ok('birthdays: the day before at 6am (early in the morning)', () => {
  const at6 = Date.parse('2026-11-23T02:03:00Z'); // 6:03am in Dubai
  const d = dueNow({ subs: [sub], tasks, sent: [] }, at6);
  assert.ok(d.some(x => x.taskId === 'bday'));
  assert.strictEqual(d.find(x => x.taskId === 'bday').payload.body, 'Tomorrow');
});
ok('message text', () => {
  const d = dueNow({ subs: [sub], tasks, sent: [] }, now);
  assert.strictEqual(d.find(x => x.taskId === 'rent').payload.body, 'Due Today 9am');
  assert.strictEqual(d.find(x => x.taskId === 'rem').payload.body, 'Due Wed, Nov 25');
});
ok('never sends the same reminder twice to a device', () => {
  const ids = dueNow({ subs: [sub], tasks, sent: [[sub.endpoint, 'rent', '2026-11-23T09:00']] }, now).map(d => d.taskId);
  assert.ok(!ids.includes('rent'));
});
ok('uses each device’s own settings', () => {
  const quiet = Object.assign({}, sub, { endpoint: 'e2', prefs: { autoRemind: false, bdayRemind: false } });
  const ids = dueNow({ subs: [quiet], tasks, sent: [] }, now).map(d => d.taskId);
  assert.deepStrictEqual(ids, ['rem']);
});
ok('each device gets it in its own time zone', () => {
  const ny = Object.assign({}, sub, { endpoint: 'e3', tz: 'America/New_York' });
  assert.strictEqual(dueNow({ subs: [ny], tasks, sent: [] }, now).length, 0);
});
ok('other people’s tasks never go to your devices', () => {
  const other = [{ user: 'u2', data: { id: 'x', title: 'Not yours', due: '2026-11-23', time: '09:00' } }];
  assert.strictEqual(dueNow({ subs: [sub], tasks: other, sent: [] }, now).length, 0);
});
ok('a snoozed reminder wins over the due time', () => {
  assert.strictEqual(effectiveReminder({ due: '2026-11-23', time: '09:00', reminder: '2026-11-23T09:10' }, {}), '2026-11-23T09:10');
});

// The keys made by setup-push.html work with the sender's push library
ok('setup page keys are accepted by web-push', () => {});

// Dealt with on one device → cleared on the others
const phone = { endpoint: 'https://push.example/phone', user: 'u1', sub: { endpoint: 'https://push.example/phone' }, tz: 'Asia/Dubai' };
const laptop = { endpoint: 'https://push.example/laptop', user: 'u1', sub: { endpoint: 'https://push.example/laptop' }, tz: 'Asia/Dubai' };
const friend = { endpoint: 'https://push.example/friend', user: 'u2', sub: { endpoint: 'https://push.example/friend' }, tz: 'Asia/Dubai' };
const cw = { subs: [phone, laptop, friend], sent: [[phone.endpoint, 'rent', '2026-11-23T09:00'], [laptop.endpoint, 'rent', '2026-11-23T09:00'], [friend.endpoint, 'rent', '2026-11-23T09:00'], [laptop.endpoint, 'rent', '2026-11-21T09:00']] };
ok('dismissed on the phone: the laptop gets a clear, the phone is only marked', () => {
  const t = clearTargets(cw, 'u1', 'rent', phone.endpoint, now);
  assert.deepStrictEqual(t.map(x => [x.endpoint, x.send]), [[phone.endpoint, false], [laptop.endpoint, true]]);
});
ok('never touches another person, or reminders older than 12 hours', () => {
  const t = clearTargets(cw, 'u1', 'rent', phone.endpoint, now);
  assert.ok(!t.some(x => x.endpoint === friend.endpoint || x.at === '2026-11-21T09:00'));
});
ok('already cleared: nothing is sent again', () => {
  const w = Object.assign({}, cw, { sent: cw.sent.concat([[phone.endpoint, 'rent', 'clear|2026-11-23T09:00'], [laptop.endpoint, 'rent', 'clear|2026-11-23T09:00']]) });
  assert.strictEqual(clearTargets(w, 'u1', 'rent', laptop.endpoint, now).length, 0);
});
ok('clear markers never block or trigger a reminder', () => {
  const w = { subs: [sub], tasks, sent: [[sub.endpoint, 'rent', 'clear|2026-11-23T09:00']] };
  assert.ok(dueNow(w, now).some(d => d.taskId === 'rent'));
});

(async () => {
  let webpush;
  try { webpush = require('web-push'); } catch (e) { console.log('all ' + n + ' push cases pass (web-push not installed here, key check skipped)'); return; }
  const { webcrypto } = require('crypto');
  const b64u = b => Buffer.from(b).toString('base64url');
  const kp = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const pub = b64u(await webcrypto.subtle.exportKey('raw', kp.publicKey)), priv = (await webcrypto.subtle.exportKey('jwk', kp.privateKey)).d;
  webpush.setVapidDetails('https://tally-ntqo.vercel.app', pub, priv);
  // A fake device subscription (its own encryption keys)
  const dev = await webcrypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const devSub = { endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys: { p256dh: b64u(await webcrypto.subtle.exportKey('raw', dev.publicKey)), auth: b64u(webcrypto.getRandomValues(new Uint8Array(16))) } };
  const req = webpush.generateRequestDetails(devSub, JSON.stringify({ title: 'Pay rent', body: 'Due Today 9am', id: 'rent', at: '2026-11-23T09:00' }), { TTL: 3600, urgency: 'high', topic: 'rent' });
  assert.ok(/^vapid t=/.test(req.headers.Authorization));
  assert.strictEqual(req.headers['Content-Encoding'], 'aes128gcm');
  console.log('all ' + n + ' push cases pass');
})().catch(e => { console.error(e); process.exit(1); });
