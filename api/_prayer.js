// IACAD answer → { 'YYYY-MM-DD': { asr, maghrib, isha } } (Dates come as MM/DD/YYYY, times as HH:MM:SS)
'use strict';
function iacadDays(j) {
  const out = {};
  for (const row of (j && j.data) || []) {
    const c = row.Country || row.country || {}, p = (c.Pray || c.pray || [])[0]; if (!p) continue;
    const m = String(p.Date || p.date || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (!m) continue;
    const t = v => String(v || '').slice(0, 5);
    const d = { asr: t(p.Asr || p.asr), maghrib: t(p.Maghrib || p.maghrib), isha: t(p.Isha || p.isha) };
    if (![d.asr, d.maghrib, d.isha].every(x => /^\d\d:\d\d$/.test(x))) continue;
    out[m[3] + '-' + m[1].padStart(2, '0') + '-' + m[2].padStart(2, '0')] = d;
  }
  return out;
}
module.exports = { iacadDays };
