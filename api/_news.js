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
module.exports = { parseNews };
