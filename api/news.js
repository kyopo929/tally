// GET /api/news → for the sidebar on computers ("real news": no sports or entertainment):
//   stories:  Google News "Top stories" (US edition)
//   breaking: stories from the last 90 minutes (top stories + Google News U.S., World and Business sections)
//   trending: Google Trends "Trending now" (US) with the top article for each search
// Anything also listed in Google News' Sports or Entertainment sections, from a sports/entertainment
// outlet, or about games, teams, shows or celebrities is left out (api/_news.js `soft`).
// Only the original site serves it; copies of Tally get 404 and the sidebar box stays hidden.
'use strict';
const { isOriginal } = require('./_cfg');
const { parseNews, parseTrends, pickBreaking, soft, key } = require('./_news');
const G = 'hl=en-US&gl=US&ceid=US:en';
const TOP = 'https://news.google.com/rss?' + G;
const section = t => 'https://news.google.com/rss/headlines/section/topic/' + t + '?' + G;
const TRENDS = 'https://trends.google.com/trending/rss?geo=US';

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Tally)' } });
  if (!r.ok) throw new Error('source ' + r.status);
  return r.text();
}
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!isOriginal(req)) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'Not available' })); }
  const urls = [TOP, section('NATION'), section('WORLD'), section('BUSINESS'), section('SPORTS'), section('ENTERTAINMENT'), TRENDS];
  const [top, us, world, biz, sports, ent, trd] = await Promise.allSettled(urls.map(get));
  const list = (r, n) => r.status === 'fulfilled' ? parseNews(r.value, n || 40) : [];
  const softTitles = new Set(list(sports, 80).concat(list(ent, 80)).map(s => key(s.title)));
  const real = arr => arr.filter(x => !soft(x, softTitles));
  const all = real(list(top, 40));
  const stories = all.slice(0, 8);
  const breaking = pickBreaking([all, real(list(us)), real(list(world)), real(list(biz))], 90, 6);
  const trending = trd.status === 'fulfilled' ? real(parseTrends(trd.value, 25)).slice(0, 8) : [];
  if (!stories.length && !breaking.length && !trending.length) { res.statusCode = 502; return res.end(JSON.stringify({ error: 'News unavailable' })); }
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900'); // Vercel keeps it 5 min
  res.statusCode = 200;
  res.end(JSON.stringify({ fetchedAt: new Date().toISOString(), stories, breaking, trending }));
};
