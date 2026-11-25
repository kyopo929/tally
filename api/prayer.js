// GET /api/prayer → this month's official Dubai prayer times from IACAD (Islamic Affairs and
// Charitable Activities Department), the same source as iacad.gov.ae/en/prayer-times.
// Returns { days: { 'YYYY-MM-DD': { asr, maghrib, isha } } } in Dubai time (24-hour). Original site only.
'use strict';
const { isOriginal } = require('./_cfg');
const { iacadDays } = require('./_prayer');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!isOriginal(req)) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'Not available' })); }
  try {
    const r = await fetch('https://www.iacad.gov.ae/api/PublicApi/GeIntegrationResult', {
      method: 'POST', body: JSON.stringify({ integrationId: 1 }),
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Tally)', 'Referer': 'https://www.iacad.gov.ae/en/prayer-times' }
    });
    if (!r.ok) throw new Error('IACAD answered ' + r.status);
    const days = iacadDays(await r.json());
    if (!Object.keys(days).length) throw new Error('empty');
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400'); // 6h
    res.statusCode = 200;
    res.end(JSON.stringify({ source: 'IACAD', region: process.env.VERCEL_REGION || '', days }));
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'IACAD unavailable', region: process.env.VERCEL_REGION || '', why: String(e && (e.cause && e.cause.code || e.message) || e).slice(0, 120) }));
  }
};
