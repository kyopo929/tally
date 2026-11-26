// Which reminders are due right now, worked out the same way the app does it on each device.
'use strict';

const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = n => String(n).padStart(2, '0');

// "2026-11-23" plus n days
function addDaysISO(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.getUTCFullYear() + '-' + pad(t.getUTCMonth() + 1) + '-' + pad(t.getUTCDate());
}

// Wall-clock parts of an instant in a time zone
function partsIn(ms, tz) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const p = {}; f.formatToParts(new Date(ms)).forEach(x => { p[x.type] = x.value; });
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second };
}
function offsetMs(ms, tz) { const p = partsIn(ms, tz); return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000; }

// "2026-11-23T09:00" in tz -> UTC milliseconds
function localToUtc(local, tz) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(local || '');
  if (!m) return NaN;
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let t = guess - offsetMs(guess, tz);
  const o2 = offsetMs(t, tz); // second pass handles daylight-saving changes
  t = guess - o2;
  return t;
}
function todayIn(ms, tz) { const p = partsIn(ms, tz); return p.y + '-' + pad(p.mo) + '-' + pad(p.d); }

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return (((h + 11) % 12) + 1) + (m ? ':' + pad(m) : '') + (h < 12 ? 'am' : 'pm');
}
function dayLabel(iso, today) {
  if (iso === today) return 'Today';
  if (iso === addDaysISO(today, 1)) return 'Tomorrow';
  if (iso === addDaysISO(today, -1)) return 'Yesterday';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return WD[dt.getUTCDay()].slice(0, 3) + ', ' + MON[m - 1] + ' ' + d;
}

const isYearly = t => !!(t.recur && t.recur.freq === 'year' && (t.recur.interval || 1) === 1);

// Mirrors effectiveReminder() in src/app.js; prefs are that device's settings.
function effectiveReminder(t, prefs) {
  if (!t || t.done || t.deletedAt || t.type === 'daynote' || t.holiday) return null;
  if (t.reminder) return t.reminder;
  if (t.renewFor && t.due) return t.due + 'T06:00'; // expiry tasks from Notes (6am heads-up)
  if (t.type === 'event' && isYearly(t) && prefs.bdayRemind !== false && t.due) return addDaysISO(t.due, -1) + 'T06:00';
  if (prefs.autoRemind !== false && t.due && t.time) return t.due + 'T' + t.time;
  return null;
}

const WINDOW_MS = 10 * 60 * 1000; // a reminder missed by more than 10 minutes isn't sent late

// work = { subs, tasks, sent } from push_work(); returns [{ endpoint, sub, taskId, at, payload }]
function dueNow(work, now) {
  const sent = new Set((work.sent || []).map(x => x.join('|')));
  const byUser = new Map();
  (work.tasks || []).forEach(r => { if (!byUser.has(r.user)) byUser.set(r.user, []); byUser.get(r.user).push(r.data); });
  const out = [];
  for (const s of work.subs || []) {
    const tz = validTz(s.tz) ? s.tz : 'UTC', prefs = s.prefs || {};
    const today = todayIn(now, tz);
    for (const t of byUser.get(s.user) || []) {
      const at = effectiveReminder(t, prefs);
      if (!at) continue;
      const when = localToUtc(at, tz);
      if (!(when <= now && when > now - WINDOW_MS)) continue;
      if (sent.has(s.endpoint + '|' + t.id + '|' + at)) continue;
      const isEv = t.type === 'event';
      const body = t.waiting && t.reminder && t.reminder.slice(0, 10) === t.waiting.nudge ? 'Waiting on ' + t.waiting.who + '. Time to follow up.' : t.expires ? expText(t.expires, today) : t.expFor && t.due ? expText(t.due, today) : t.due ? (isEv ? '' : 'Due ') + dayLabel(t.due, today) + (t.time ? ' ' + fmtTime(t.time) : '') : 'Reminder';
      out.push({ endpoint: s.endpoint, sub: s.sub, taskId: t.id, at, payload: { title: String(t.title || '').replace(/\[\[([^\[\]\n]*)\]\]/g, '$1') || 'Reminder', body, id: t.id, at, event: isEv } });
    }
  }
  return out;
}
// A reminder was dealt with on one device (dismissed, tapped, completed, snoozed): which of that person's
// other devices were sent it in the last 12 hours and haven't been cleared yet. The device that reported it
// is marked cleared too (nothing is sent to it). Returns [{ endpoint, sub, taskId, at, send }].
const CLEAR_MS = 12 * 3600 * 1000;
function clearTargets(work, user, taskId, fromEndpoint, now) {
  const subs = new Map((work.subs || []).filter(s => s.user === user).map(s => [s.endpoint, s]));
  const done = new Set();
  (work.sent || []).forEach(([ep, id, at]) => { if (id === taskId && /^clear\|/.test(at)) done.add(ep + '|' + at.slice(6)); });
  const out = [];
  for (const [ep, id, at] of work.sent || []) {
    if (id !== taskId || /^clear\|/.test(at) || done.has(ep + '|' + at)) continue;
    const s = subs.get(ep); if (!s) continue;
    const when = localToUtc(at, validTz(s.tz) ? s.tz : 'UTC');
    if (!(when > now - CLEAR_MS)) continue;
    done.add(ep + '|' + at);
    out.push({ endpoint: ep, sub: s.sub, taskId, at, send: ep !== fromEndpoint });
  }
  return out;
}
function expText(iso, today) {
  const d = Math.round((Date.parse(iso + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000);
  return d < 0 ? 'Expired' : d === 0 ? 'Expires today' : 'Expires in ' + d + ' day' + (d === 1 ? '' : 's');
}
function validTz(tz) { try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return !!tz; } catch (e) { return false; } }

module.exports = { dueNow, clearTargets, effectiveReminder, localToUtc, dayLabel, fmtTime, addDaysISO, WINDOW_MS };
