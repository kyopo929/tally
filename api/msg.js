// POST /api/msg?t=<your private token>  — your phone (MacroDroid) sends each new text or WhatsApp message here.
// Body: {"src":"sms"|"wa","from":"…","name":"…","text":"…"} (broken JSON, forms and ?query also work, see api/_msg.js).
// One-time codes are dropped. Everything else is filed in Tally by the msg_in function (supabase/messages.sql).
'use strict';
const { readMessage, classify } = require('./_msg');
const { supabaseFor } = require('./_cfg');

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}
// Vercel reads the body before this runs: JSON is parsed for us, text arrives as a string. A message with
// quotes or line breaks makes the JSON invalid, which is why the phone is set up to send it as plain text.
function rawBody(req) {
  try { const b = req.body; if (b !== undefined && b !== null) return Promise.resolve(b); } catch (e) { return Promise.resolve(null); }
  return new Promise(resolve => {
    const parts = []; let n = 0;
    req.on('data', c => { n += c.length; if (n < 64 * 1024) parts.push(c); });
    req.on('end', () => resolve(Buffer.concat(parts)));
    req.on('error', () => resolve(''));
  });
}

module.exports = async function handler(req, res) {
  const { url, key } = supabaseFor(req);
  const q = new URL(req.url, 'http://x').searchParams;
  const token = q.get('t') || '';
  if (req.method !== 'POST' && req.method !== 'GET') return send(res, 405, { error: 'Use POST' });
  if (!/^[A-Za-z0-9]{24,}$/.test(token)) return send(res, 404, { error: 'Not found' });
  if (!url || !key) return send(res, 503, { error: 'Sync isn’t set up for this copy of Tally' });
  const body = await rawBody(req);
  if (body === null) return send(res, 400, { error: 'Couldn\u2019t read the message. In MacroDroid, set the content type to text/plain.' });
  const m = classify(readMessage(body, q));
  if (m.skip) return send(res, 200, { ok: true, skipped: m.skip });
  try {
    const r = await fetch(url + '/rest/v1/rpc/msg_in', {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_token: token, p_src: m.src, p_from: m.from, p_name: m.name, p_text: m.text, p_person: m.person })
    });
    const text = await r.text();
    if (!r.ok) return send(res, /not allowed/.test(text) ? 404 : 502, { error: /not allowed/.test(text) ? 'This link was reset or doesn’t exist' : /msg_in/.test(text) ? 'The texts SQL hasn’t been run in Supabase yet' : 'Couldn’t reach Tally’s database' });
    return send(res, 200, { ok: true, result: JSON.parse(text || '""'), person: m.person });
  } catch (e) {
    return send(res, 502, { error: 'Couldn’t reach Tally’s database' });
  }
};
