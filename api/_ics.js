// Builds an iCalendar (.ics) feed from Tally tasks. Pure function, no network.
'use strict';

const pad = n => String(n).padStart(2, '0');

// Offset (ms) of a time zone at a given UTC instant, using the built-in time zone database.
function tzOffset(utcMs, tz) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(utcMs));
  const g = t => Number(parts.find(p => p.type === t).value);
  return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) - utcMs;
}
// Local wall-clock time in `tz` → UTC timestamp string like 20261205T110000Z
function localToUtcStamp(dateISO, hm, tz) {
  const [y, m, d] = dateISO.split('-').map(Number), [h, mi] = hm.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  let utc = guess - tzOffset(guess, tz);
  utc = guess - tzOffset(utc, tz); // second pass handles DST edges
  return stamp(new Date(utc));
}
function stamp(dt) { return dt.getUTCFullYear() + pad(dt.getUTCMonth() + 1) + pad(dt.getUTCDate()) + 'T' + pad(dt.getUTCHours()) + pad(dt.getUTCMinutes()) + pad(dt.getUTCSeconds()) + 'Z'; }
const dateVal = iso => iso.replace(/-/g, '');
function nextDay(iso) { const [y, m, d] = iso.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, d + 1)); return t.getUTCFullYear() + pad(t.getUTCMonth() + 1) + pad(t.getUTCDate()); }

function esc(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
// Fold lines longer than 75 octets (RFC 5545)
function fold(line) {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;
  const out = []; let cur = '', len = 0, first = true;
  for (const ch of line) {
    const n = Buffer.byteLength(ch, 'utf8'), max = first ? 75 : 74;
    if (len + n > max) { out.push(cur); cur = ''; len = 0; first = false; }
    cur += ch; len += n;
  }
  out.push(cur);
  return out.join('\r\n ');
}

const DAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
function rrule(r) {
  if (!r || !r.freq) return null;
  const freq = { day: 'DAILY', week: 'WEEKLY', month: 'MONTHLY', year: 'YEARLY' }[r.freq];
  if (!freq) return null;
  let s = 'FREQ=' + freq;
  if (r.interval && r.interval > 1) s += ';INTERVAL=' + r.interval;
  if (r.byDay && r.byDay.length) s += ';BYDAY=' + r.byDay.map(i => DAYS[i]).join(',');
  if (r.freq === 'month' && r.monthDay) s += ';BYMONTHDAY=' + (r.monthDay === 31 ? -1 : r.monthDay); // 31st → last day of each month
  return s;
}

/**
 * rows: [{ kind: 'task'|'list'|'group', data }]
 * opts: { tz: 'Asia/Dubai', scope: 'all'|'personal'|'work', name, now: Date }
 */
function buildIcs(rows, opts) {
  const tz = opts.tz || 'UTC', scope = opts.scope || 'all', now = opts.now || new Date();
  const lists = {}, groups = {};
  rows.forEach(r => { if (r.kind === 'list' && r.data) lists[r.data.id] = r.data; if (r.kind === 'group' && r.data) groups[r.data.id] = r.data; });
  const areaOf = l => (l && l.groupId && groups[l.groupId]) ? groups[l.groupId].area : null;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tally//Tasks//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:' + esc(opts.name || 'Tally tasks'), 'X-WR-TIMEZONE:' + tz, 'REFRESH-INTERVAL;VALUE=DURATION:PT1H', 'X-PUBLISHED-TTL:PT1H'];
  const dtstamp = stamp(now);
  for (const r of rows) {
    const t = r.data;
    if (r.kind !== 'task' || !t || !t.due || t.done || t.deletedAt || t.type === 'daynote' || t.type === 'note' || t.type === 'doc' || t.type === 'vault') continue; // skip finished, deleted, and private day notes
    const l = lists[t.listId], area = areaOf(l);
    if (scope !== 'all' && area !== null && area !== scope) continue;
    lines.push('BEGIN:VEVENT', 'UID:' + t.id + '@tally', 'DTSTAMP:' + dtstamp);
    if (t.end && t.end > t.due) { // multi-day, all-day event (e.g. a vacation)
      lines.push('DTSTART;VALUE=DATE:' + dateVal(t.due), 'DTEND;VALUE=DATE:' + nextDay(t.end), 'X-MICROSOFT-CDO-ALLDAYEVENT:TRUE');
    } else if (t.time) {
      const start = localToUtcStamp(t.due, t.time, tz);
      const [h, mi] = t.time.split(':').map(Number);
      const endM = h * 60 + mi + 30;
      const endISO = endM >= 1440 ? (nextDay(t.due).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : t.due;
      const endHM = pad(Math.floor((endM % 1440) / 60)) + ':' + pad(endM % 60);
      lines.push('DTSTART:' + start, 'DTEND:' + localToUtcStamp(endISO, endHM, tz));
    } else {
      lines.push('DTSTART;VALUE=DATE:' + dateVal(t.due), 'DTEND;VALUE=DATE:' + nextDay(t.due), 'X-MICROSOFT-CDO-ALLDAYEVENT:TRUE');
    }
    const rr = rrule(t.recur); if (rr) lines.push('RRULE:' + rr);
    lines.push('SUMMARY:' + esc(String(t.title || '').replace(/\[\[([^\[\]\n]*)\]\]/g, '$1')));
    const desc = [];
    if (l) desc.push('List: ' + l.name + ((t.tags || []).length ? '  ·  ' + t.tags.map(g => '@' + g).join(' ') : ''));
    if (t.steps && t.steps.length) desc.push('Steps:\n' + t.steps.map(s => (s.done ? '[x] ' : '[ ] ') + s.title).join('\n'));
    if (t.notes) desc.push(t.notes);
    if (t.type !== 'event') desc.push('Open Tally to complete or edit.');
    lines.push('DESCRIPTION:' + esc(desc.join('\n\n')));
    const cats = (l ? [l.name] : []).concat((t.tags || []).map(g => '@' + g));
    if (cats.length) lines.push('CATEGORIES:' + cats.map(esc).join(','));
    lines.push('TRANSP:TRANSPARENT', 'END:VEVENT'); // tasks don't block your free/busy time
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

module.exports = { buildIcs, localToUtcStamp, rrule };
