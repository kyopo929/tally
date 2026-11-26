// Reads a published calendar (.ics) from Outlook (or Google) and lists each meeting occurrence in a date window.
// Pure functions, no network. Used by api/outlook.js; tested by tests/outlook.test.js.
'use strict';

const DAY = 86400000;
const WD = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

// Outlook names time zones the Windows way ("Arabian Standard Time"); these are the usual ones.
const WIN_TZ = {
  'Dateline Standard Time': 'Etc/GMT+12', 'UTC-11': 'Etc/GMT+11', 'Hawaiian Standard Time': 'Pacific/Honolulu', 'Alaskan Standard Time': 'America/Anchorage',
  'Pacific Standard Time': 'America/Los_Angeles', 'US Mountain Standard Time': 'America/Phoenix', 'Mountain Standard Time': 'America/Denver',
  'Central Standard Time': 'America/Chicago', 'Central America Standard Time': 'America/Guatemala', 'Canada Central Standard Time': 'America/Regina',
  'Mexico Standard Time': 'America/Mexico_City', 'Central Standard Time (Mexico)': 'America/Mexico_City', 'Eastern Standard Time': 'America/New_York',
  'US Eastern Standard Time': 'America/Indianapolis', 'SA Pacific Standard Time': 'America/Bogota', 'Atlantic Standard Time': 'America/Halifax',
  'Venezuela Standard Time': 'America/Caracas', 'SA Western Standard Time': 'America/La_Paz', 'Pacific SA Standard Time': 'America/Santiago',
  'Newfoundland Standard Time': 'America/St_Johns', 'E. South America Standard Time': 'America/Sao_Paulo', 'Argentina Standard Time': 'America/Buenos_Aires',
  'SA Eastern Standard Time': 'America/Cayenne', 'Greenland Standard Time': 'America/Godthab', 'UTC-02': 'Etc/GMT+2', 'Azores Standard Time': 'Atlantic/Azores',
  'Cape Verde Standard Time': 'Atlantic/Cape_Verde', 'UTC': 'Etc/UTC', 'Coordinated Universal Time': 'Etc/UTC', 'GMT Standard Time': 'Europe/London',
  'Greenwich Standard Time': 'Atlantic/Reykjavik', 'Morocco Standard Time': 'Africa/Casablanca', 'W. Europe Standard Time': 'Europe/Berlin',
  'Central Europe Standard Time': 'Europe/Budapest', 'Romance Standard Time': 'Europe/Paris', 'Central European Standard Time': 'Europe/Warsaw',
  'W. Central Africa Standard Time': 'Africa/Lagos', 'GTB Standard Time': 'Europe/Bucharest', 'Middle East Standard Time': 'Asia/Beirut',
  'Egypt Standard Time': 'Africa/Cairo', 'E. Europe Standard Time': 'Europe/Chisinau', 'South Africa Standard Time': 'Africa/Johannesburg',
  'FLE Standard Time': 'Europe/Kiev', 'Israel Standard Time': 'Asia/Jerusalem', 'Jordan Standard Time': 'Asia/Amman', 'Syria Standard Time': 'Asia/Damascus',
  'Turkey Standard Time': 'Europe/Istanbul', 'Arabic Standard Time': 'Asia/Baghdad', 'Arab Standard Time': 'Asia/Riyadh', 'Kaliningrad Standard Time': 'Europe/Kaliningrad',
  'Russian Standard Time': 'Europe/Moscow', 'E. Africa Standard Time': 'Africa/Nairobi', 'Iran Standard Time': 'Asia/Tehran', 'Arabian Standard Time': 'Asia/Dubai',
  'Azerbaijan Standard Time': 'Asia/Baku', 'Caucasus Standard Time': 'Asia/Yerevan', 'Georgian Standard Time': 'Asia/Tbilisi', 'Mauritius Standard Time': 'Indian/Mauritius',
  'Afghanistan Standard Time': 'Asia/Kabul', 'West Asia Standard Time': 'Asia/Tashkent', 'Pakistan Standard Time': 'Asia/Karachi', 'India Standard Time': 'Asia/Kolkata',
  'Sri Lanka Standard Time': 'Asia/Colombo', 'Nepal Standard Time': 'Asia/Katmandu', 'Central Asia Standard Time': 'Asia/Almaty', 'Bangladesh Standard Time': 'Asia/Dhaka',
  'Myanmar Standard Time': 'Asia/Rangoon', 'SE Asia Standard Time': 'Asia/Bangkok', 'China Standard Time': 'Asia/Shanghai', 'Singapore Standard Time': 'Asia/Singapore',
  'Taipei Standard Time': 'Asia/Taipei', 'W. Australia Standard Time': 'Australia/Perth', 'Tokyo Standard Time': 'Asia/Tokyo', 'Korea Standard Time': 'Asia/Seoul',
  'Cen. Australia Standard Time': 'Australia/Adelaide', 'AUS Central Standard Time': 'Australia/Darwin', 'E. Australia Standard Time': 'Australia/Brisbane',
  'AUS Eastern Standard Time': 'Australia/Sydney', 'West Pacific Standard Time': 'Pacific/Port_Moresby', 'Tasmania Standard Time': 'Australia/Hobart',
  'New Zealand Standard Time': 'Pacific/Auckland', 'Fiji Standard Time': 'Pacific/Fiji', 'Tonga Standard Time': 'Pacific/Tongatapu', 'Philippines Standard Time': 'Asia/Manila'
};

function validTz(tz) { try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch (e) { return false; } }
function offsetIn(ms, tz) {
  const p = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(new Date(ms)).forEach(x => { p[x.type] = x.value; });
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - Math.floor(ms / 1000) * 1000;
}
// A wall-clock time (as if it were UTC) in a zone → the real UTC moment
function wallToUtc(wall, zone) {
  if (zone == null) return wall; // floating or UTC
  if (typeof zone === 'number') return wall - zone; // fixed offset from the file
  let t = wall - offsetIn(wall, zone);
  return wall - offsetIn(t, zone);
}

// "+0400" → milliseconds
function offStr(v) { const m = /^([+-])(\d{2})(\d{2})/.exec(v || ''); return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]) * 60000 : null; }

function unfold(text) { return String(text || '').replace(/\r\n?/g, '\n').replace(/\n[ \t]/g, '').split('\n'); }
function unesc(v) { return v.replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1'); }

// "20261126T090000" → { wall (ms, as UTC), allDay }
function parseWall(v, isDate) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/.exec(v || ''); if (!m) return null;
  const allDay = isDate || !m[4];
  return { wall: Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)), allDay, z: !!m[7] };
}

function parseCalendar(text) {
  const lines = unfold(text);
  const zones = {}; // TZID → IANA name or fixed offset
  const events = [];
  let ev = null, tz = null, tzPart = null, depth = [];
  for (const line of lines) {
    const m = /^([A-Za-z0-9-]+)((?:;[^:]*)?):(.*)$/.exec(line); if (!m) continue;
    const name = m[1].toUpperCase(), params = m[2] || '', val = m[3];
    if (name === 'BEGIN') {
      depth.push(val.toUpperCase());
      if (val === 'VEVENT') ev = { exdates: [] };
      else if (val === 'VTIMEZONE') tz = {};
      else if (tz && (val === 'STANDARD' || val === 'DAYLIGHT')) tzPart = val;
      continue;
    }
    if (name === 'END') {
      depth.pop();
      if (val === 'VEVENT') { if (ev && ev.start) events.push(ev); ev = null; }
      else if (val === 'VTIMEZONE') { if (tz && tz.id) zones[tz.id] = tz; tz = null; }
      else if (val === 'STANDARD' || val === 'DAYLIGHT') tzPart = null;
      continue;
    }
    if (depth.includes('VALARM')) continue;
    if (tz) {
      if (name === 'TZID') tz.id = val.trim();
      else if (name === 'TZOFFSETTO' && tzPart === 'STANDARD') tz.std = offStr(val);
      continue;
    }
    if (!ev) continue;
    const tzid = ((/TZID=("[^"]*"|[^;:]+)/i.exec(params) || [])[1] || '').replace(/^"|"$/g, '') || null;
    const isDate = /VALUE=DATE(?!-)/i.test(params);
    if (name === 'SUMMARY') ev.title = unesc(val).trim();
    else if (name === 'LOCATION') ev.loc = unesc(val).trim();
    else if (name === 'UID') ev.uid = val.trim();
    else if (name === 'RRULE') ev.rrule = val;
    else if (name === 'STATUS') ev.cancelled = /CANCELLED/i.test(val);
    else if (name === 'TRANSP') ev.free = /TRANSPARENT/i.test(val);
    else if (name === 'X-MICROSOFT-CDO-BUSYSTATUS') ev.busy = val.trim().toUpperCase();
    else if (name === 'DURATION') ev.dur = durMs(val);
    else if (name === 'DTSTART' || name === 'DTEND' || name === 'RECURRENCE-ID') {
      const w = parseWall(val, isDate); if (!w) continue;
      w.tzid = w.z ? null : tzid;
      ev[name === 'DTSTART' ? 'start' : name === 'DTEND' ? 'end' : 'rid'] = w;
    } else if (name === 'EXDATE') {
      val.split(',').forEach(x => { const w = parseWall(x.trim(), isDate); if (w) { w.tzid = w.z ? null : tzid; ev.exdates.push(w); } });
    }
  }
  return { events, zones };
}

function durMs(v) {
  const m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/i.exec(v || ''); if (!m) return null;
  return (((+m[2] || 0) * 7 + (+m[3] || 0)) * DAY + (+m[4] || 0) * 3600000 + (+m[5] || 0) * 60000 + (+m[6] || 0) * 1000) * (m[1] === '-' ? -1 : 1);
}

// Which zone a TZID means: an IANA name, a Windows name, or the offset the file itself gives
function zoneFor(tzid, zones, fallback) {
  if (!tzid) return fallback;
  if (WIN_TZ[tzid]) return WIN_TZ[tzid];
  if (validTz(tzid)) return tzid;
  const z = zones[tzid];
  if (z && z.std != null) return z.std;
  return fallback;
}

function parseRule(s) {
  const r = {};
  String(s || '').split(';').forEach(p => { const [k, v] = p.split('='); if (k && v != null) r[k.toUpperCase()] = v; });
  return {
    freq: (r.FREQ || '').toUpperCase(), interval: Math.max(1, +r.INTERVAL || 1), count: r.COUNT ? +r.COUNT : null,
    until: r.UNTIL ? parseWall(r.UNTIL) : null, wkst: WD[(r.WKST || 'MO').toUpperCase()] ?? 1,
    byday: r.BYDAY ? r.BYDAY.split(',').map(x => { const m = /^([+-]?\d+)?([A-Z]{2})$/i.exec(x.trim()); return m ? { n: m[1] ? +m[1] : 0, wd: WD[m[2].toUpperCase()] } : null; }).filter(Boolean) : null,
    bymonthday: r.BYMONTHDAY ? r.BYMONTHDAY.split(',').map(Number) : null,
    bymonth: r.BYMONTH ? r.BYMONTH.split(',').map(Number) : null,
    bysetpos: r.BYSETPOS ? r.BYSETPOS.split(',').map(Number) : null
  };
}
const ymd = ms => { const d = new Date(ms); return [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()]; };
const dayStart = ms => Math.floor(ms / DAY) * DAY;
function monthDays(y, mo, rule, startDay) {
  const len = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
  let out = [];
  if (rule.bymonthday) out = rule.bymonthday.map(d => d < 0 ? len + d + 1 : d).filter(d => d >= 1 && d <= len);
  else if (rule.byday) {
    for (const b of rule.byday) {
      const all = []; for (let d = 1; d <= len; d++) if (new Date(Date.UTC(y, mo, d)).getUTCDay() === b.wd) all.push(d);
      if (!b.n) out.push(...all); else { const x = b.n > 0 ? all[b.n - 1] : all[all.length + b.n]; if (x) out.push(x); }
    }
  } else if (startDay <= len) out = [startDay];
  out = [...new Set(out)].sort((a, b) => a - b);
  if (rule.bysetpos) out = rule.bysetpos.map(p => p > 0 ? out[p - 1] : out[out.length + p]).filter(Boolean);
  return out.map(d => Date.UTC(y, mo, d));
}

// Start times (wall clock, as UTC ms) of each occurrence, from dtstart up to `endWall`
function expand(startWall, rule, endWall, untilWall, fromWall) {
  const out = []; const tod = startWall - dayStart(startWall);
  const [sy, sm, sd] = ymd(startWall);
  const push = days => {
    for (const d of days.sort((a, b) => a - b)) {
      const t = d + tod;
      if (t < startWall) continue;
      if (untilWall != null && t > untilWall) return false;
      if (rule.count != null && out.length >= rule.count) return false;
      if (t > endWall) return false;
      out.push(t);
    }
    return true;
  };
  // Long-running series: start near the window instead of years back (not possible with COUNT, which counts from the start)
  let i0 = 0;
  if (rule.count == null && fromWall != null && fromWall > startWall) {
    const span = fromWall - startWall, mDiff = (new Date(fromWall).getUTCFullYear() - sy) * 12 + new Date(fromWall).getUTCMonth() - sm;
    i0 = Math.max(0, Math.floor(rule.freq === 'DAILY' ? span / (rule.interval * DAY) : rule.freq === 'WEEKLY' ? span / (7 * rule.interval * DAY) : rule.freq === 'MONTHLY' ? mDiff / rule.interval : rule.freq === 'YEARLY' ? mDiff / 12 / rule.interval : 0) - 1);
  }
  for (let i = i0; i < i0 + 3000; i++) {
    let days = [];
    if (rule.freq === 'DAILY') {
      const d = dayStart(startWall) + i * rule.interval * DAY, [, mo] = ymd(d), wd = new Date(d).getUTCDay();
      if ((!rule.byday || rule.byday.some(b => b.wd === wd)) && (!rule.bymonth || rule.bymonth.includes(mo + 1))) days = [d];
      if (d > endWall) break;
    } else if (rule.freq === 'WEEKLY') {
      const s0 = dayStart(startWall), wd0 = new Date(s0).getUTCDay(), wk = s0 - ((wd0 - rule.wkst + 7) % 7) * DAY + i * 7 * rule.interval * DAY;
      if (wk > endWall) break;
      const wds = rule.byday ? rule.byday.map(b => b.wd) : [wd0];
      days = wds.map(w => wk + ((w - rule.wkst + 7) % 7) * DAY);
    } else if (rule.freq === 'MONTHLY') {
      const mi = sm + i * rule.interval, y = sy + Math.floor(mi / 12), mo = ((mi % 12) + 12) % 12;
      if (Date.UTC(y, mo, 1) > endWall) break;
      if (!rule.bymonth || rule.bymonth.includes(mo + 1)) days = monthDays(y, mo, rule, sd);
    } else if (rule.freq === 'YEARLY') {
      const y = sy + i * rule.interval;
      if (Date.UTC(y, 0, 1) > endWall) break;
      const months = rule.bymonth ? rule.bymonth.map(x => x - 1) : [sm];
      const r2 = Object.assign({}, rule, { bysetpos: null });
      for (const mo of months) days.push(...monthDays(y, mo, rule.byday || rule.bymonthday ? r2 : Object.assign({}, r2, { bymonthday: [sd] }), sd));
      if (rule.bysetpos) { days.sort((a, b) => a - b); days = rule.bysetpos.map(p => p > 0 ? days[p - 1] : days[days.length + p]).filter(Boolean); }
    } else { days = i === 0 ? [dayStart(startWall)] : []; if (i > 0) break; }
    if (!push(days)) break;
  }
  return out;
}

// Every meeting that touches [fromMs, toMs]. Times come back as real moments (UTC ms); all-day ones as dates.
// tzFallback: the time zone for times the file gives without one.
function occurrences(text, fromMs, toMs, tzFallback) {
  const { events, zones } = parseCalendar(text);
  const fb = tzFallback && validTz(tzFallback) ? tzFallback : null;
  const toIso = ms => new Date(ms).toISOString().slice(0, 10);
  const zoneOf = w => w.allDay || w.z ? null : zoneFor(w.tzid, zones, fb); // no zone given: the device's own
  const real = w => w.allDay || w.z ? w.wall : wallToUtc(w.wall, zoneOf(w));
  // Changed or cancelled single occurrences of a series (RECURRENCE-ID), keyed by the time they replace
  const overrides = new Map();
  events.filter(e => e.rid).forEach(e => { overrides.set(e.uid + '|' + real(e.rid), e); });
  const out = [];
  const add = (e, startMs, endMs) => {
    if (e.cancelled) return;
    if (endMs < fromMs || startMs > toMs) return;
    const item = { uid: e.uid || '', title: e.title || 'Busy', loc: e.loc || '', free: e.busy === 'FREE' || (e.free && !e.busy) };
    if (e.start.allDay) { item.date = toIso(startMs); const last = toIso(Math.max(startMs, endMs - DAY)); if (last > item.date) item.end = last; }
    else { item.start = startMs; item.endAt = endMs; }
    out.push(item);
  };
  for (const e of events) {
    if (e.rid) continue;
    const s = e.start;
    const zone = zoneOf(s);
    const startReal = real(s);
    const dur = e.end ? real(e.end) - startReal : (e.dur != null ? e.dur : (s.allDay ? DAY : 0));
    if (!e.rrule) { add(e, startReal, startReal + dur); continue; }
    const rule = parseRule(e.rrule);
    // wall-clock window end (a day of slack either side covers any zone)
    const endWall = toMs + 2 * DAY + (typeof zone === 'number' ? zone : 0);
    let untilWall = null;
    if (rule.until) untilWall = rule.until.z && zone != null && !s.allDay ? rule.until.wall + (typeof zone === 'number' ? zone : offsetIn(rule.until.wall, zone)) : rule.until.wall + (rule.until.allDay && !s.allDay ? DAY - 1 : 0);
    const ex = new Set(e.exdates.map(x => x.allDay && !s.allDay ? 'd' + dayStart(x.wall) : real(x)));
    for (const w of expand(s.wall, rule, endWall, untilWall, fromMs - 2 * DAY)) {
      const t = s.allDay ? w : wallToUtc(w, zone);
      if (ex.has(t) || ex.has('d' + dayStart(w))) continue;
      const o = overrides.get(e.uid + '|' + t);
      if (o) {
        if (o.cancelled) continue;
        const os = real(o.start), oe = o.end ? real(o.end) : os + (o.dur != null ? o.dur : dur);
        add(Object.assign({}, e, o, { start: o.start }), os, oe);
        overrides.delete(e.uid + '|' + t);
        continue;
      }
      add(e, t, t + dur);
    }
  }
  // Moved occurrences whose original time fell outside the window
  for (const o of overrides.values()) { if (o.cancelled || !o.start) continue; const os = real(o.start); add(o, os, o.end ? real(o.end) : os); }
  out.sort((a, b) => (a.start || Date.parse(a.date)) - (b.start || Date.parse(b.date)));
  return out;
}

// Only calendar links from Outlook and Google are fetched (so this can't be used to reach anything else)
const HOSTS = ['outlook.office365.com', 'outlook.office.com', 'outlook.live.com', 'calendar.google.com'];
function cleanLink(u) {
  u = String(u || '').trim().replace(/^webcals?:\/\//i, 'https://');
  let url; try { url = new URL(u); } catch (e) { return null; }
  if (url.protocol !== 'https:' || !HOSTS.includes(url.hostname.toLowerCase())) return null;
  return url.toString();
}

module.exports = { occurrences, parseCalendar, parseRule, expand, cleanLink, HOSTS, WIN_TZ };
