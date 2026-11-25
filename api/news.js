// GET /api/news → for the sidebar on computers ("real news": no sports or entertainment):
//   stories:  Google News "Top stories" (US edition)
//   breaking: stories from the last 90 minutes (up to 4 hours when it's quiet) (top stories + Google News U.S., World and Business sections)
//   dubai:    3 newest Dubai stories (Google News UAE edition, last day)
//   trending: Google Trends "Trending now" (US), only searches whose story is also in a Google News news section
// Anything also listed in Google News' Sports or Entertainment sections, from a sports/entertainment
// outlet, or about games, teams, shows or celebrities is left out (api/_news.js `soft`),
// except big moments: a major championship won or a famous person's death (`big`).
// Only the original site serves it; copies of Tally get 404 and the sidebar box stays hidden.
'use strict';
const { isOriginal } = require('./_cfg');
const { parseNews, parseTrends, pickBreaking, soft, key, notIn, inNews, sameStory } = require('./_news');
const G = 'hl=en-US&gl=US&ceid=US:en';
const TOP = 'https://news.google.com/rss?' + G;
const section = t => 'https://news.google.com/rss/headlines/section/topic/' + t + '?' + G;
// Dubai: Google News UAE edition, stories about Dubai from the last day
const DUBAI = 'https://news.google.com/rss/search?q=' + encodeURIComponent('Dubai when:1d') + '&hl=en-AE&gl=AE&ceid=AE:en';
const TRENDS = 'https://trends.google.com/trending/rss?geo=US';

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Tally)' } });
  if (!r.ok) throw new Error('source ' + r.status);
  return r.text();
}
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!isOriginal(req)) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'Not available' })); }
  const urls = [TOP, section('NATION'), section('WORLD'), section('BUSINESS'), section('SPORTS'), section('ENTERTAINMENT'), TRENDS, DUBAI];
  const [top, us, world, biz, sports, ent, trd, dxb] = await Promise.allSettled(urls.map(get));
  const list = (r, n) => r.status === 'fulfilled' ? parseNews(r.value, n || 40) : [];
  const softList = list(sports, 80).concat(list(ent, 80)).map(s => s.title);
  const softTitles = new Set(softList.map(key)); softTitles.list = softList;
  const real = arr => arr.filter(x => !soft(x, softTitles));
  const all = real(list(top, 40));
  const stories = all.slice(0, 8);
  // the ticker skips anything already in Top stories
  const usL = real(list(us)), worldL = real(list(world)), bizL = real(list(biz));
  const latest = mins => notIn(pickBreaking([all.slice(8), usL, worldL, bizL], mins, 12), stories, x => x.title).slice(0, 6);
  let breaking = latest(90); if (breaking.length < 4) breaking = latest(240); // quiet hours: reach back further
  const hard = all.concat(usL, worldL, bizL).map(x => x.title);
  const trending = trd.status === 'fulfilled' ? notIn(real(parseTrends(trd.value, 25)).filter(t => inNews(t, hard)), stories.concat(breaking), x => x.title).slice(0, 8) : [];
  const dubai = notIn(real(list(dxb, 40)).sort((a, b) => Date.parse(b.at || 0) - Date.parse(a.at || 0)), stories.concat(breaking), x => x.title)
    .filter((x, i, arr) => arr.findIndex(y => sameStory(y.title, x.title)) === i).slice(0, 3);
  if (!stories.length && !breaking.length && !trending.length) { res.statusCode = 502; return res.end(JSON.stringify({ error: 'News unavailable' })); }
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900'); // Vercel keeps it 5 min
  res.statusCode = 200;
  res.end(JSON.stringify({ fetchedAt: new Date().toISOString(), stories, breaking, trending, dubai }));
};
