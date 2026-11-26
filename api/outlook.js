// Your Outlook meetings, read-only, for Tally's calendar.
//   POST /api/outlook { url, tz } → { items: [...] }  (url: Outlook's "publish calendar" ICS link)
// The link is sent in the body, not the address, so it doesn't end up in logs. Nothing is stored.
'use strict';
const { occurrences, cleanLink, HOSTS } = require('./_outlook');

const DAY = 86400000;
function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const url = cleanLink(body && body.url);
  if (!url) return send(res, 400, { error: 'That isn’t an Outlook calendar link' });
  try {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 15000);
    const r = await fetch(url, { signal: ctl.signal, headers: { Accept: 'text/calendar, */*' } }).finally(() => clearTimeout(timer));
    if (!HOSTS.includes(new URL(r.url || url).hostname.toLowerCase())) return send(res, 400, { error: 'That link went somewhere else' });
    if (!r.ok) return send(res, 502, { error: r.status === 404 ? 'Outlook says this link no longer works' : 'Outlook answered ' + r.status });
    const text = await r.text();
    if (text.length > 8e6) return send(res, 502, { error: 'That calendar is too big' });
    if (!/BEGIN:VCALENDAR/i.test(text)) return send(res, 502, { error: 'That link didn’t return a calendar' });
    const now = Date.now();
    const items = occurrences(text, now - 40 * DAY, now + 200 * DAY, body && body.tz);
    return send(res, 200, { items: items.slice(0, 5000) });
  } catch (e) {
    return send(res, 502, { error: e && e.name === 'AbortError' ? 'Outlook took too long to answer' : 'Couldn’t reach Outlook' });
  }
};
