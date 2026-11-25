// Turns a Google News RSS feed into a short list of headlines: [{ title, source, url, at }].
'use strict';
function decode(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .trim();
}
function tag(xml, name) {
  const m = xml.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + name + '>', 'i'));
  return m ? decode(m[1]) : '';
}
function parseNews(xml, max) {
  const out = [];
  const items = String(xml || '').match(/<item>[\s\S]*?<\/item>/gi) || [];
  for (const it of items) {
    let title = tag(it, 'title'), source = tag(it, 'source');
    const url = tag(it, 'link'), at = Date.parse(tag(it, 'pubDate'));
    if (!title || !/^https:\/\//i.test(url)) continue;
    // Google adds " - Source" to the end of every headline
    if (source && title.endsWith(' - ' + source)) title = title.slice(0, -(source.length + 3)).trim();
    else if (!source) { const i = title.lastIndexOf(' - '); if (i > 20) { source = title.slice(i + 3).trim(); title = title.slice(0, i).trim(); } }
    out.push({ title, source, url, at: isNaN(at) ? null : new Date(at).toISOString() });
    if (out.length >= (max || 8)) break;
  }
  return out;
}
// Google Trends "Trending now" RSS → [{ term, title, source, url, traffic }] (the top news article for each search)
function parseTrends(xml, max) {
  const out = [];
  const items = String(xml || '').match(/<item>[\s\S]*?<\/item>/gi) || [];
  for (const it of items) {
    const term = tag(it, 'title');
    const ni = it.match(/<ht:news_item>[\s\S]*?<\/ht:news_item>/i);
    const url = ni ? tag(ni[0], 'ht:news_item_url') : '';
    if (!term || !/^https:\/\//i.test(url)) continue;
    out.push({ term, title: tag(ni[0], 'ht:news_item_title'), source: tag(ni[0], 'ht:news_item_source'), url, traffic: tag(it, 'ht:approx_traffic') });
    if (out.length >= (max || 8)) break;
  }
  return out;
}
// Breaking = stories from the last `mins` minutes, newest first, no repeats
function pickBreaking(lists, mins, max, now) {
  const seen = new Set(), out = [], cut = (now || Date.now()) - mins * 60000;
  const all = [].concat(...lists).filter(s => s.at && Date.parse(s.at) >= cut).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  for (const s of all) {
    const k = s.title.toLowerCase().replace(/^breaking( news)?[:\s-]+/i, '').slice(0, 60);
    if (seen.has(k)) continue; seen.add(k);
    out.push(Object.assign({}, s, { title: s.title.replace(/^breaking( news)?[:\s-]+/i, '') }));
    if (out.length >= max) break;
  }
  return out;
}
// Sports and entertainment filter ("real news" only)
const SOFT_SOURCES = /espn|sports|bleacher|the athletic|steelers|depot|\bnfl\b|\bnba\b|\bmlb\b|\bnhl\b|cbssports|si\.com|sporting news|on3|247sports|pro football|variety|hollywood|deadline|\bpeople\b|tmz|e! ?news|billboard|us weekly|entertainment|rolling stone|vulture|parade|just jared|page six|soap|gold derby|screen rant|collider|ign\b|gamespot|polygon|kotaku/i;
const SOFT_WORDS = new RegExp('\\b(' + [
  'nfl', 'nba', 'mlb', 'nhl', 'mls', 'ncaa', 'ufc', 'wwe', 'fifa', 'pga', 'nascar', 'f1', 'formula 1',
  'football', 'basketball', 'baseball', 'soccer', 'hockey', 'golf', 'tennis', 'boxing', 'wrestling', 'cricket',
  'quarterback', 'touchdown', 'playoffs?', 'depth chart', 'mock draft', 'super bowl', 'world series', 'stanley cup', 'march madness',
  'coach', 'roster', 'rookie', 'injury report', 'hall of fame', 'heisman', 'week \\d+', 'game \\d', 'vs\\.?',
  'steelers', 'cowboys', 'eagles', 'chiefs', 'packers', 'patriots', 'ravens', '49ers', 'bears', 'lions', 'bills', 'dolphins', 'broncos', 'raiders', 'chargers', 'seahawks', 'commanders', 'falcons', 'saints', 'buccaneers', 'vikings', 'bengals', 'browns', 'texans', 'colts', 'jaguars', 'titans', 'rams', 'steelers',
  'lakers', 'celtics', 'knicks', 'warriors', 'bulls', 'nets', 'mavericks', 'nuggets', 'bucks', 'suns', 'clippers', 'spurs', '76ers', 'sixers', 'timberwolves', 'cavaliers', 'pistons', 'hawks', 'yankees', 'dodgers', 'mets', 'red sox', 'cubs', 'astros', 'braves',
  'dancing with the stars', 'bachelor(ette)?', 'survivor', 'american idol', 'the voice', 'love island', 'big brother', 'reality (tv|show|star)',
  'oscars?', 'grammys?', 'emmys?', 'golden globes?', 'box office', 'celebrit(y|ies)', 'kardashians?', 'taylor swift', 'miss (universe|international|america|world|usa)', 'beauty pageant',
  'season \\d+', 'episode', 'finale', 'premiere', 'trailer', 'album', 'tour dates', 'concert', 'netflix', 'disney\\+', 'hbo', 'marvel', 'star wars', 'video game', 'playstation', 'xbox', 'nintendo',
  'mega millions', 'powerball', 'lottery', 'horoscope', 'wordle', 'connections hint'
].join('|') + ')\\b', 'i');
function soft(x, softTitles) {
  const text = [x.term, x.title].filter(Boolean).join(' ');
  return SOFT_SOURCES.test(x.source || '') || SOFT_WORDS.test(text) || !!(softTitles && x.title && softTitles.has(key(x.title)));
}
function key(t) { return String(t || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 70); }
module.exports = { parseNews, parseTrends, pickBreaking, soft, key };
