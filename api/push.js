// Reminders when Tally is closed.
//   GET  /api/push?key=1   → the public key devices need to sign up for notifications
//   POST /api/push         → Supabase calls this every minute; sends any reminders due now
//   POST /api/push {dismiss:{id, endpoint?, token?}} → a device dealt with a reminder; clear it on the person's other devices
'use strict';
const webpush = require('web-push');
const { dueNow, clearTargets } = require('./_reminders');

const { supabaseFor } = require('./_cfg');
let SUPABASE_URL = '', SUPABASE_KEY = ''; // set per request (see api/_cfg.js)
const PUB = process.env.VAPID_PUBLIC_KEY || '';
const PRIV = process.env.VAPID_PRIVATE_KEY || '';
const SECRET = process.env.PUSH_SECRET || '';

async function rpc(name, args) {
  const r = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + name, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(args)
  });
  const text = await r.text();
  if (!r.ok) throw new Error(name + ' failed (' + r.status + '): ' + text.slice(0, 200));
  return text ? JSON.parse(text) : null;
}

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return null; } }
  return null;
}
function vapid(req) { webpush.setVapidDetails(process.env.VAPID_SUBJECT || ('https://' + (req.headers['x-forwarded-host'] || req.headers.host || 'localhost')), PUB, PRIV); }

// Who is asking: a device proves it's one of yours with its push address (the service worker), or the app sends your sign-in token
async function whoFor(work, d) {
  const ep = typeof d.endpoint === 'string' ? d.endpoint : '';
  const s = ep && (work.subs || []).find(x => x.endpoint === ep);
  if (s) return s.user;
  if (typeof d.token !== 'string' || !d.token) return null;
  const r = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + d.token } });
  if (!r.ok) return null;
  const u = await r.json().catch(() => null);
  return (u && u.id) || null;
}
async function dismiss(req, res, d) {
  const id = typeof d.id === 'string' ? d.id.slice(0, 100) : '';
  if (!id) return send(res, 400, { error: 'Missing id' });
  try {
    const work = await rpc('push_work', { p_secret: SECRET });
    const user = await whoFor(work, d);
    if (!user) return send(res, 401, { error: 'Not allowed' });
    const targets = clearTargets(work, user, id, typeof d.endpoint === 'string' ? d.endpoint : '', Date.now());
    if (!targets.length) return send(res, 200, { cleared: 0 });
    vapid(req);
    const done = [], gone = [];
    await Promise.all(targets.map(async t => {
      if (t.send) {
        try {
          // Same topic as the reminder: if the reminder hasn't reached that device yet, this replaces it
          await webpush.sendNotification(t.sub, JSON.stringify({ clear: id, at: t.at }), { TTL: 12 * 3600, urgency: 'normal', topic: String(id).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32) || undefined });
        } catch (e) {
          if (e && (e.statusCode === 404 || e.statusCode === 410)) gone.push(t.endpoint);
          return;
        }
      }
      done.push([t.endpoint, id, 'clear|' + t.at]);
    }));
    if (done.length || gone.length) await rpc('push_done', { p_secret: SECRET, p_sent: done, p_gone: gone });
    return send(res, 200, { cleared: done.filter(x => x[0] !== d.endpoint).length });
  } catch (e) {
    return send(res, 500, { error: String(e.message || e) });
  }
}

module.exports = async function handler(req, res) {
  ({ url: SUPABASE_URL, key: SUPABASE_KEY } = supabaseFor(req));
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=300');
    return send(res, 200, { key: PUB || null });
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST' });
  if (!PUB || !PRIV || SECRET.length < 32) return send(res, 503, { error: 'Push keys are not set up in Vercel yet' });
  const body = await readBody(req);
  if (body && body.dismiss) return dismiss(req, res, body.dismiss);
  const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (auth !== SECRET) return send(res, 401, { error: 'Not allowed' });

  try {
    vapid(req);
    const work = await rpc('push_work', { p_secret: SECRET });
    const due = dueNow(work, Date.now());
    const sent = [], gone = new Set(), failed = [];
    await Promise.all(due.map(async d => {
      if (gone.has(d.endpoint)) return;
      try {
        await webpush.sendNotification(d.sub, JSON.stringify(d.payload), { TTL: 3600, urgency: 'high', topic: String(d.taskId).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32) || undefined });
        sent.push([d.endpoint, d.taskId, d.at]);
      } catch (e) {
        if (e && (e.statusCode === 404 || e.statusCode === 410)) gone.add(d.endpoint); // device unsubscribed or app removed
        else failed.push(String((e && (e.statusCode || e.message)) || e)); // tried again next minute while still in the window
      }
    }));
    if (sent.length || gone.size) await rpc('push_done', { p_secret: SECRET, p_sent: sent, p_gone: [...gone] });
    return send(res, 200, { devices: (work.subs || []).length, due: due.length, sent: sent.length, removed: gone.size, failed });
  } catch (e) {
    return send(res, 500, { error: String(e.message || e) });
  }
};
