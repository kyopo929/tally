// GET /api/news → for the sidebar on computers ("real news": no sports or entertainment):
//   stories: Google News "Top stories" (US edition), top 5
//   dubai:   3 top Dubai stories (Google News UAE edition, last day; UAE newsrooms first, no press releases)
// Anything also listed in Google News' Sports or Entertainment sections, from a sports/entertainment
// outlet, or about games, teams, shows or celebrities is left out (api/_news.js `soft`),
// except big moments: a major championship won or a famous person's death (`big`).
// Only the original site serves it; copies of Tally get 404 and the sidebar box stays hidden.
'use strict';
const { isOriginal } = require('./_cfg');
const { parseNews, soft, key, notIn, sameStory } = require('./_news');
const G = 'hl=en-US&gl=US&ceid=US:en';
const TOP = 'https://news.google.com/rss?' + G;
const section = t => 'https://news.google.com/rss/headlines/section/topic/' + t + '?' + G;
const DUBAI = 'https://news.google.com/rss/search?q=' + encodeURIComponent('Dubai when:1d') + '&hl=en-AE&gl=AE&ceid=AE:en';
const UAE = /gulf news|khaleej times|the national|wam|emirates news agency|arabian business|gulf today|emirates 24|dubai media office|gulf business|al arabiya|reuters|bloomberg|ap news|bbc/i;
const PR = /zawya|pr newswire|business wire|globenewswire|press release|accesswire|einpresswire|openpr|newswire/i;

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Tally)' } });
  if (!r.ok) throw new Error('source ' + r.status);
  return r.text();
}
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!isOriginal(req)) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'Not available' })); }
  const [top, sports, ent, dxb] = await Promise.allSettled([TOP, section('SPORTS'), section('ENTERTAINMENT'), DUBAI].map(get));
  const list = (r, n) => r.status === 'fulfilled' ? parseNews(r.value, n || 40) : [];
  const softList = list(sports, 80).concat(list(ent, 80)).map(s => s.title);
  const softTitles = new Set(softList.map(key)); softTitles.list = softList;
  const real = arr => arr.filter(x => !soft(x, softTitles));
  const stories = real(list(top, 40)).slice(0, 15); // the app shows 5; the rest replace stories you hide
  const dxbAll = real(list(dxb, 40)).filter(x => !PR.test(x.source || ''));
  const dubai = notIn(dxbAll.filter(x => UAE.test(x.source || '')).concat(dxbAll.filter(x => !UAE.test(x.source || ''))), stories.slice(0, 5), x => x.title)
    .filter((x, i, arr) => arr.findIndex(y => sameStory(y.title, x.title)) === i).slice(0, 10);
  if (!stories.length) { res.statusCode = 502; return res.end(JSON.stringify({ error: 'News unavailable' })); }
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900'); // Vercel keeps it 5 min
  res.statusCode = 200;
  res.end(JSON.stringify({ fetchedAt: new Date().toISOString(), stories, dubai }));
};
