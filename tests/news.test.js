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
const { parseTrends, pickBreaking } = require('../api/_news');
const tx = `<rss xmlns:ht="x"><channel><item><title>lakers</title><ht:approx_traffic>500K+</ht:approx_traffic><link>https://trends.google.com/x</link>
<ht:news_item><ht:news_item_title>Lakers beat Suns &amp; more</ht:news_item_title><ht:news_item_url>https://espn.com/a</ht:news_item_url><ht:news_item_source>ESPN</ht:news_item_source></ht:news_item>
<ht:news_item><ht:news_item_title>Second</ht:news_item_title><ht:news_item_url>https://b.com</ht:news_item_url></ht:news_item></item>
<item><title>no news</title></item></channel></rss>`;
const tr = parseTrends(tx, 8);
t('trends', () => { assert.strictEqual(tr.length, 1); assert.deepStrictEqual(tr[0], { term: 'lakers', title: 'Lakers beat Suns & more', source: 'ESPN', url: 'https://espn.com/a', traffic: '500K+' }); });
const now = Date.parse('2026-11-25T04:00:00Z');
const b = pickBreaking([[{ title: 'Old one', at: '2026-11-25T01:00:00Z' }, { title: 'Quake hits Japan', at: '2026-11-25T03:30:00Z' }], [{ title: 'BREAKING: Quake hits Japan', at: '2026-11-25T03:31:00Z' }, { title: 'Newest', at: '2026-11-25T03:50:00Z' }, { title: 'No date', at: null }]], 90, 6, now);
t('breaking: recent, newest first, deduped, prefix dropped', () => assert.deepStrictEqual(b.map(x => x.title), ['Newest', 'Quake hits Japan']));
const { soft, key } = require('../api/_news');
t('soft: shows, teams, sports outlets', () => {
  assert.ok(soft({ title: "'Dancing With the Stars' Season 35 Couples Perform Their Last Dances", source: 'USA Today' }));
  assert.ok(soft({ term: 'aaron rodgers', title: 'Steelers bench Aaron Rodgers for Mason Rudolph', source: 'CBS' }));
  assert.ok(soft({ term: 'drew allar', title: 'Some headline', source: 'Steelers Depot' }));
  assert.ok(soft({ title: 'Mario Kart World Has Been Updated To Version 1.9.0, Here Are The Full Patch Notes', source: 'Nintendo Life' }));
  assert.ok(soft({ term: 'lakers vs suns', title: 'x', source: 'AP' }));
  assert.ok(soft({ term: 'miss international 2026', title: 'Katrina Johnson says it is a dream', source: 'Rappler' }));
  assert.ok(soft({ title: 'Some player story', source: 'AP' }, new Set([key('Some player story')])));
});
t('real news stays', () => {
  for (const x of [{ title: 'US CIA, ODNI suffer cybersecurity breach of some unclassified information', source: 'Reuters' },
    { title: 'Lead azide must be detonated in Iowa, Army says; some residents urged to evacuate', source: 'The Washington Post' },
    { title: 'US court convicts Huawei for fraud', source: 'CNN' }, { term: 'costa rica', title: 'Rope bridges offer sloths a lifeline', source: 'AP' }])
    assert.ok(!soft(x), x.title);
});
const { sameStory, notIn } = require('../api/_news');
t('big moments pass', () => {
  assert.ok(!soft({ title: 'Dodgers win World Series in Game 7 thriller', source: 'ESPN' }));
  assert.ok(!soft({ title: 'Tom Cruise dies at 64', source: 'Variety' }));
  assert.ok(soft({ title: 'Who won Dancing With the Stars? Season 35 winner crowned', source: 'USA Today' }));
});
t('celebrity + foreign-language trends dropped', () => {
  assert.ok(soft({ term: 'stanley tucci', title: 'The 2009 co-star Stanley Tucci wanted to work with again', source: 'X' }));
  assert.ok(soft({ term: 'día de acción de gracias', title: 'Última hora', source: 'CNN' }));
});
t('trend must be in the news sections', () => {
  const { inNews } = require('../api/_news');
  const hard = ['Trump administration officials debate targeting Iran assets via US Treasury sanctions', 'South Omaha children center homicide suspect arrested'];
  assert.ok(inNews({ term: 'us treasury', title: 'Officials weigh Iran move' }, hard));
  assert.ok(inNews({ term: 'lauren becker omaha', title: 'South Omaha children’s center homicide suspect arrested after chase' }, hard));
  assert.ok(!inNews({ term: 'amanda seyfried', title: 'Amanda Seyfried Says Billy Evans Encounter Worsened' }, hard));
});
t('same story across outlets', () => {
  assert.ok(sameStory('Abrego Garcia Voluntarily Leaves U.S., Ending 20-Month Legal Fight', 'Abrego Garcia Will Voluntarily Leave U.S., Ending 20-Month Legal Ordeal'));
  assert.ok(!sameStory('Asian Stocks to Slide as AI Trade Doubts Resurface', 'US court convicts Huawei for fraud'));
  assert.strictEqual(notIn([{ title: "Shenzhou 24: Pakistan's first astronaut goes to space" }, { title: 'Other' }], [{ title: "Shenzhou 24: Pakistan's first astronaut goes to space aboard Chinese rocket" }], x => x.title).length, 1);
});
console.log('news: ' + n + ' passed');
