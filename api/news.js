// GET /api/news → Google News "Top stories" (US edition) for the sidebar on computers.
// Only the original site serves it; copies of Tally get 404 and the sidebar box stays hidden.
'use strict';
const { isOriginal } = require('./_cfg');
const { parseNews } = require('./_news');
const SOURCE = 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en';

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!isOriginal(req)) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'Not available' })); }
  try {
    const r = await fetch(SOURCE, { headers: { 'User-Agent': 'Mozilla/5.0 (Tally)' } });
    if (!r.ok) throw new Error('source ' + r.status);
    const stories = parseNews(await r.text(), 8);
    if (!stories.length) throw new Error('empty');
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600'); // Vercel keeps it 15 min
    res.statusCode = 200;
    res.end(JSON.stringify({ fetchedAt: new Date().toISOString(), stories }));
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'News unavailable' }));
  }
};
