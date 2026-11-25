// GET /api/news → for the sidebar on computers:
//   stories:  Google News "Top stories" (US edition)
//   breaking: stories from the last 90 minutes (top stories + Google News U.S. and World sections)
//   trending: Google Trends "Trending now" (US) with the top article for each search
// Only the original site serves it; copies of Tally get 404 and the sidebar box stays hidden.
'use strict';
const { isOriginal } = require('./_cfg');
const { parseNews, parseTrends, pickBreaking } = require('./_news');
const G = 'hl=en-US&gl=US&ceid=US:en';
const TOP = 'https://news.google.com/rss?' + G;
const US = 'https://news.google.com/rss/headlines/section/topic/NATION?' + G;
const WORLD = 'https://news.google.com/rss/headlines/section/topic/WORLD?' + G;
const TRENDS = 'https://trends.google.com/trending/rss?geo=US';

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Tally)' } });
  if (!r.ok) throw new Error('source ' + r.status);
  return r.text();
}
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!isOriginal(req)) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'Not available' })); }
  const [top, us, world, trd] = await Promise.allSettled([get(TOP), get(US), get(WORLD), get(TRENDS)]);
  const all = top.status === 'fulfilled' ? parseNews(top.value, 30) : [];
  const stories = all.slice(0, 8);
  const more = r => r.status === 'fulfilled' ? parseNews(r.value, 40) : [];
  const breaking = pickBreaking([all, more(us), more(world)], 90, 6);
  const trending = trd.status === 'fulfilled' ? parseTrends(trd.value, 8) : [];
  if (!stories.length && !breaking.length && !trending.length) { res.statusCode = 502; return res.end(JSON.stringify({ error: 'News unavailable' })); }
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900'); // Vercel keeps it 5 min
  res.statusCode = 200;
  res.end(JSON.stringify({ fetchedAt: new Date().toISOString(), stories, breaking, trending }));
};
