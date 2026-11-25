const assert = require('assert');
const { parseNews } = require('../api/_news');
let n = 0; const t = (name, fn) => { fn(); n++; };
const xml = `<rss><channel><title>Top stories - Google News</title>
<item><title>Storm hits coast &amp; leaves 10,000 without power - CNN</title><link>https://news.google.com/rss/articles/abc?oc=5</link><pubDate>Wed, 25 Nov 2026 03:00:00 GMT</pubDate><description>&lt;ol&gt;x&lt;/ol&gt;</description><source url="https://www.cnn.com">CNN</source></item>
<item><title><![CDATA[Markets rally as "rates" fall - Reuters]]></title><link>https://news.google.com/rss/articles/def</link><pubDate>bad</pubDate></item>
<item><title>No link here - AP</title><link>javascript:alert(1)</link></item>
</channel></rss>`;
const s = parseNews(xml, 8);
t('two good items', () => assert.strictEqual(s.length, 2));
t('source stripped from title', () => assert.strictEqual(s[0].title, 'Storm hits coast & leaves 10,000 without power'));
t('source kept', () => assert.strictEqual(s[0].source, 'CNN'));
t('date', () => assert.strictEqual(s[0].at, '2026-11-25T03:00:00.000Z'));
t('cdata + fallback source', () => { assert.strictEqual(s[1].title, 'Markets rally as "rates" fall'); assert.strictEqual(s[1].source, 'Reuters'); assert.strictEqual(s[1].at, null); });
t('max', () => assert.strictEqual(parseNews(xml, 1).length, 1));
const { isOriginal } = require('../api/_cfg');
t('original only', () => { assert.ok(isOriginal({ headers: { host: 'tally-ntqo.vercel.app' } })); assert.ok(!isOriginal({ headers: { host: 'friend-tally.vercel.app' } })); });
console.log('news: ' + n + ' passed');
