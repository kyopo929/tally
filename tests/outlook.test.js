// node tests/outlook.test.js — reading Outlook's published calendar (api/_outlook.js)
'use strict';
const assert = require('assert');
const { occurrences, cleanLink } = require('../api/_outlook');

let n = 0;
const ok = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL: ' + name); throw e; } };
const cal = body => 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n' + body.trim().split('\n').map(x => x.trim()).join('\r\n') + '\r\nEND:VCALENDAR\r\n';
const TZ = `BEGIN:VTIMEZONE
TZID:Arabian Standard Time
BEGIN:STANDARD
DTSTART:16010101T000000
TZOFFSETFROM:+0400
TZOFFSETTO:+0400
END:STANDARD
END:VTIMEZONE`;
const from = Date.parse('2026-11-01T00:00:00Z'), to = Date.parse('2026-12-31T23:59:59Z');
const iso = ms => new Date(ms).toISOString();

ok('a single meeting in Windows time zone naming', () => {
  const o = occurrences(cal(TZ + `
BEGIN:VEVENT
UID:a1
SUMMARY:Ops sync
LOCATION:Room 4
DTSTART;TZID=Arabian Standard Time:20261126T090000
DTEND;TZID=Arabian Standard Time:20261126T093000
END:VEVENT`), from, to, 'Asia/Dubai');
  assert.strictEqual(o.length, 1);
  assert.strictEqual(iso(o[0].start), '2026-11-26T05:00:00.000Z');
  assert.strictEqual(iso(o[0].endAt), '2026-11-26T05:30:00.000Z');
  assert.strictEqual(o[0].loc, 'Room 4');
});
ok('weekly on Mon and Wed, with one skipped and one moved', () => {
  const o = occurrences(cal(TZ + `
BEGIN:VEVENT
UID:w1
SUMMARY:Standup
DTSTART;TZID=Arabian Standard Time:20261102T080000
DTEND;TZID=Arabian Standard Time:20261102T081500
RRULE:FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20261118T040000Z
EXDATE;TZID=Arabian Standard Time:20261104T080000
END:VEVENT
BEGIN:VEVENT
UID:w1
RECURRENCE-ID;TZID=Arabian Standard Time:20261111T080000
SUMMARY:Standup (moved)
DTSTART;TZID=Arabian Standard Time:20261111T100000
DTEND;TZID=Arabian Standard Time:20261111T101500
END:VEVENT`), from, to, 'Asia/Dubai');
  assert.deepStrictEqual(o.map(x => iso(x.start).slice(0, 16)), ['2026-11-02T04:00', '2026-11-09T04:00', '2026-11-11T06:00', '2026-11-16T04:00', '2026-11-18T04:00']);
  assert.strictEqual(o[2].title, 'Standup (moved)');
});
ok('cancelled occurrence is left out', () => {
  const o = occurrences(cal(`
BEGIN:VEVENT
UID:d1
SUMMARY:Daily
DTSTART:20261201T050000Z
DTEND:20261201T053000Z
RRULE:FREQ=DAILY;COUNT=3
END:VEVENT
BEGIN:VEVENT
UID:d1
RECURRENCE-ID:20261202T050000Z
STATUS:CANCELLED
DTSTART:20261202T050000Z
END:VEVENT`), from, to, 'Asia/Dubai');
  assert.deepStrictEqual(o.map(x => iso(x.start).slice(0, 10)), ['2026-12-01', '2026-12-03']);
});
ok('monthly on the second Tuesday, and the last Friday (BYSETPOS)', () => {
  const o = occurrences(cal(`
BEGIN:VEVENT
UID:m1
SUMMARY:Board
DTSTART;TZID=Asia/Dubai:20260714T140000
DTEND;TZID=Asia/Dubai:20260714T150000
RRULE:FREQ=MONTHLY;BYDAY=2TU
END:VEVENT
BEGIN:VEVENT
UID:m2
SUMMARY:Review
DTSTART;TZID=Asia/Dubai:20260731T100000
DTEND;TZID=Asia/Dubai:20260731T110000
RRULE:FREQ=MONTHLY;BYDAY=FR;BYSETPOS=-1
END:VEVENT`), from, to, 'Asia/Dubai');
  const days = t => o.filter(x => x.title === t).map(x => iso(x.start).slice(0, 10));
  assert.deepStrictEqual(days('Board'), ['2026-11-10', '2026-12-08']);
  assert.deepStrictEqual(days('Review'), ['2026-11-27', '2026-12-25']);
});
ok('New York meeting keeps its local time across daylight saving', () => {
  const o = occurrences(cal(`
BEGIN:VEVENT
UID:ny
SUMMARY:US call
DTSTART;TZID=Eastern Standard Time:20261026T090000
DTEND;TZID=Eastern Standard Time:20261026T100000
RRULE:FREQ=WEEKLY;BYDAY=MO
END:VEVENT`), Date.parse('2026-10-25T00:00:00Z'), Date.parse('2026-11-10T00:00:00Z'), 'Asia/Dubai');
  assert.deepStrictEqual(o.map(x => iso(x.start).slice(0, 16)), ['2026-10-26T13:00', '2026-11-02T14:00', '2026-11-09T14:00']);
});
ok('all-day and multi-day', () => {
  const o = occurrences(cal(`
BEGIN:VEVENT
UID:h
SUMMARY:Offsite
DTSTART;VALUE=DATE:20261207
DTEND;VALUE=DATE:20261210
END:VEVENT`), from, to, 'Asia/Dubai');
  assert.strictEqual(o[0].date, '2026-12-07'); assert.strictEqual(o[0].end, '2026-12-09');
});
ok('a daily series started years ago still reaches this month', () => {
  const o = occurrences(cal(`
BEGIN:VEVENT
UID:old
SUMMARY:Check
DTSTART:20150105T050000Z
DTEND:20150105T051000Z
RRULE:FREQ=DAILY
END:VEVENT`), Date.parse('2026-11-26T00:00:00Z'), Date.parse('2026-11-28T23:00:00Z'), 'Asia/Dubai');
  assert.deepStrictEqual(o.map(x => iso(x.start).slice(0, 10)), ['2026-11-26', '2026-11-27', '2026-11-28']);
});
ok('only Outlook and Google calendar links are accepted', () => {
  assert.ok(cleanLink('https://outlook.office365.com/owa/calendar/abc/def/calendar.ics'));
  assert.ok(cleanLink('webcal://outlook.live.com/owa/calendar/x/calendar.ics'));
  assert.strictEqual(cleanLink('https://example.com/calendar.ics'), null);
  assert.strictEqual(cleanLink('http://outlook.office365.com/x.ics'), null);
  assert.strictEqual(cleanLink('https://outlook.office365.com.evil.com/x.ics'), null);
});
console.log('all ' + n + ' outlook cases pass');
