// GET /api/stocks?s=NVDA,SCHB → today's price and previous close for each symbol (Yahoo Finance).
// The symbols come from the app (saved on each computer), not from this code. Original site only.
'use strict';
const { isOriginal } = require('./_cfg');

async function quote(sym) {
  const r = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?range=1d&interval=1d', { headers: { 'User-Agent': 'Mozilla/5.0 (Tally)' } });
  if (!r.ok) throw new Error('source ' + r.status);
  const m = (((await r.json()).chart || {}).result || [])[0];
  const meta = m && m.meta; if (!meta || typeof meta.regularMarketPrice !== 'number') throw new Error('no price');
  return { price: meta.regularMarketPrice, prev: meta.chartPreviousClose || meta.previousClose || null, name: meta.shortName || meta.longName || sym, at: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null, tp: meta.currentTradingPeriod || null };
}
function marketState(q) {
  const p = q && q.tp && q.tp.regular, now = Date.now() / 1000;
  if (p && now >= p.start && now < p.end) return 'US market open';
  const t = q && q.at ? new Date(q.at) : null;
  return t ? 'US market closed · last price ' + t.toLocaleString('en-US', { timeZone: 'Asia/Dubai', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' Dubai time' : 'US market closed';
}
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!isOriginal(req)) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'Not available' })); }
  const syms = [...new Set(String(new URL(req.url, 'http://x').searchParams.get('s') || '').toUpperCase().split(',').filter(x => /^[A-Z0-9.^=-]{1,12}$/.test(x)))].slice(0, 12);
  const got = await Promise.allSettled(syms.map(quote));
  const quotes = {};
  got.forEach((g, i) => { if (g.status === 'fulfilled') { const q = g.value; quotes[syms[i]] = { price: q.price, prev: q.prev, name: q.name, at: q.at, state: marketState(q) }; } });
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  res.statusCode = Object.keys(quotes).length || !syms.length ? 200 : 502;
  res.end(JSON.stringify({ quotes }));
};
