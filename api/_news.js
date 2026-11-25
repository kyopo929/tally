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
module.exports = { parseNews, parseTrends, pickBreaking };
