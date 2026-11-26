/* Quick-add parser + date/recurrence helpers. Pure functions, no DOM. */
(function (root) {
  const WD = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const WD_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WD_RE = '(sun(?:day)?|mon(?:day)?|tue(?:s|sday)?|wed(?:nesday)?|thu(?:r|rs|rsday)?|fri(?:day)?|sat(?:urday)?)';
  const MON_RE = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
  const B = '(?:^|\\s)';       // left boundary
  const E = '(?=\\s|$|[,.;])'; // right boundary
  const PRE = '(?:(?:on|by|due)\\s+)?';

  const wdIndex = s => WD.indexOf(s.slice(0, 3).toLowerCase());
  const monIndex = s => MON.indexOf(s.slice(0, 3).toLowerCase());
  const pad = n => String(n).padStart(2, '0');

  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromISO(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function addMonths(d, n, anchorDay) {
    const day = anchorDay || d.getDate();
    const y = d.getFullYear(), m = d.getMonth() + n;
    const ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
    return new Date(ty, tm, Math.min(day, daysInMonth(ty, tm)));
  }
  function diffDays(a, b) { return Math.round((startOfDay(a) - startOfDay(b)) / 86400000); }

  // Next occurrence of a weekday, never today ("fri" on a Friday = next Friday)
  function nextWeekday(today, idx) {
    let delta = (idx - today.getDay() + 7) % 7;
    if (delta === 0) delta = 7;
    return addDays(today, delta);
  }

  function toLocalDT(d) { return toISO(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function parseLocalDT(s) { const [a, b] = s.split('T'); const d = fromISO(a); const [h, m] = (b || '00:00').split(':').map(Number); d.setHours(h, m); return d; }
  function reminderLabel(dt, now) { const [a, b] = dt.split('T'); return dueLabel(a, now) + ' ' + fmtTime(b); }

  function norm(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

  function findList(name, lists) {
    const n = norm(name);
    if (!n) return null;
    return lists.find(l => norm(l.name) === n) || lists.find(l => norm(l.name).startsWith(n)) || null;
  }

  /* First due date for a recurrence when the user gave no explicit date. */
  function firstOccurrence(recur, today) {
    if (recur.byDay && recur.byDay.length) {
      for (let i = 0; i < 7; i++) { const d = addDays(today, i); if (recur.byDay.includes(d.getDay())) return d; }
    }
    if (recur.freq === 'month' && recur.monthDay) {
      const y = today.getFullYear(), m = today.getMonth();
      const cand = new Date(y, m, Math.min(recur.monthDay, daysInMonth(y, m)));
      return cand >= today ? cand : addMonths(cand, 1, recur.monthDay);
    }
    return today;
  }

  /* Next due date after completing a recurring task. dueISO is the current due date. */
  function nextOccurrence(dueISO, recur, now) {
    const base = dueISO ? fromISO(dueISO) : startOfDay(now || new Date());
    const n = recur.interval || 1;
    let d;
    if (recur.byDay && recur.byDay.length) {
      d = addDays(base, 1);
      for (let i = 0; i < 7 && !recur.byDay.includes(d.getDay()); i++) d = addDays(d, 1);
    } else if (recur.freq === 'day') d = addDays(base, n);
    else if (recur.freq === 'week') d = addDays(base, 7 * n);
    else if (recur.freq === 'month') d = addMonths(base, n, recur.monthDay || recur.anchorDay || base.getDate());
    else if (recur.freq === 'year') d = addMonths(base, 12 * n, recur.anchorDay || base.getDate());
    else d = addDays(base, 1);
    return toISO(d);
  }

  function recurText(r) {
    if (!r) return '';
    const n = r.interval || 1;
    if (r.byDay && r.byDay.length) {
      const s = [...r.byDay].sort().join(',');
      if (s === '1,2,3,4,5') return 'Every weekday';
      if (s === '0,6') return 'Every weekend';
      return 'Every ' + [...r.byDay].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(i => WD_LONG[i].slice(0, 3)).join(', ');
    }
    if (r.freq === 'month' && r.monthDay) return 'Every month on the ' + ordinal(r.monthDay);
    const unit = { day: 'day', week: 'week', month: 'month', year: 'year' }[r.freq];
    return n === 1 ? 'Every ' + unit : 'Every ' + n + ' ' + unit + 's';
  }
  function ordinal(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

  function fmtTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const hh = ((h + 11) % 12) + 1;
    return hh + (m ? ':' + pad(m) : '') + (h < 12 ? 'am' : 'pm');
  }

  function dueLabel(dueISO, now) {
    if (!dueISO) return '';
    const today = startOfDay(now || new Date());
    const d = fromISO(dueISO);
    const diff = diffDays(d, today);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff > 1 && diff < 7) return WD_LONG[d.getDay()];
    const s = WD_LONG[d.getDay()].slice(0, 3) + ', ' + MON_SHORT[d.getMonth()] + ' ' + d.getDate();
    return d.getFullYear() === today.getFullYear() ? s : s + ', ' + d.getFullYear();
  }

  /*
   * parseQuick("Pay rent every month on the 1st 9am #bills", lists)
   * -> { title, due, time, recur, listId, listName, tokens: [{kind,text}] }
   */
  function parseQuick(input, lists, now, opts) {
    now = now || new Date();
    const today = startOfDay(now);
    // [[Name]] links are kept as they are: a name like [[June]] or [[Friday]] is never read as a date
    const links = [];
    let text = ' ' + String(input).replace(/\[\[[^\[\]\n]*\]\]/g, m => '\u27e6' + (links.push(m) - 1) + '\u27e7') + ' ';
    const out = { title: '', due: null, time: null, recur: null, listId: null, listName: null, tags: [], start: null, tokens: [] };

    function take(re, fn) {
      const m = text.match(re);
      if (!m) return false;
      if (fn(m) === false) return false;
      text = text.slice(0, m.index) + ' ' + text.slice(m.index + m[0].length);
      return true;
    }
    const rx = (s) => new RegExp(s, 'i');


    // date range for multi-day events: "dec 20 - dec 31", "jan 5 to jan 9", "fri until next week"
    if (!opts || !opts.noRange) {
      const words = text.trim().split(/\s+/);
      let best = null;
      for (let i = 1; i < words.length - 1 && !best; i++) {
        if (!/^(-|–|—|to|until|till|thru|through)$/i.test(words[i])) continue;
        for (let a = Math.min(3, i); a >= 1 && !best; a--) {
          const left = words.slice(i - a, i).join(' ');
          const L = parseQuick('x ' + left, [], now, { noRange: true });
          if (!(L.due && L.title === 'x' && !L.time && !L.recur && !L.start)) continue;
          for (let b = Math.min(3, words.length - 1 - i); b >= 1; b--) {
            const right = words.slice(i + 1, i + 1 + b).join(' ');
            const R = parseQuick('x ' + right, [], now, { noRange: true });
            if (R.due && R.title === 'x' && !R.time && !R.recur && !R.start) { best = { s: i - a, e: i + b, from: L.due, to: R.due }; break; }
          }
        }
      }
      if (best) {
        const shiftY = (iso, n) => { const d = fromISO(iso); d.setFullYear(d.getFullYear() + n); return toISO(d); };
        let from = best.from, to = best.to;
        if (to < from) to = shiftY(to, 1);
        // A range already under way (e.g. "nov 20 - nov 27" on Nov 23) means this year, not next
        const T = toISO(today);
        if (!/\b\d{4}\b/.test(text) && from > T && shiftY(from, -1) <= T && shiftY(to, -1) >= T) { from = shiftY(from, -1); to = shiftY(to, -1); }
        out.rangeFrom = from; out.end = to;
        let s0 = best.s; if (s0 > 0 && /^from$/i.test(words[s0 - 1])) s0--;
        text = ' ' + words.slice(0, s0).concat(words.slice(best.e + 1)).join(' ') + ' ';
      }
    }

    // start date: "start mon", "starts next week", "from dec 5"
    {
      const m = text.match(/(^|\s)(starts?|starting|from)\s+/i);
      if (m) {
        const after = text.slice(m.index + m[0].length);
        const words = after.split(/\s+/).filter(Boolean);
        for (let n = Math.min(3, words.length); n >= 1; n--) {
          const cand = words.slice(0, n).join(' ');
          const r = parseQuick('x ' + cand, [], now, { noRange: true });
          if (r.due && r.title === 'x' && !r.time && !r.recur && !r.tags.length) {
            out.start = r.due;
            const end = m.index + m[0].length + after.indexOf(cand) + cand.length;
            text = text.slice(0, m.index) + ' ' + text.slice(end);
            break;
          }
        }
      }
    }

    // list: #name
    take(/(^|\s)#([^\s#]+)/, m => {
      const l = findList(m[2], lists || []);
      if (!l) { out.tokens.push({ kind: 'warn', text: 'No list "' + m[2] + '"' }); return false; }
      out.listId = l.id; out.listName = l.name;
    });

    // recurrence
    take(rx(B + '(?:every\\s+weekday|weekdays|every\\s+work\\s*day)' + E), () => { out.recur = { freq: 'week', interval: 1, byDay: [1, 2, 3, 4, 5] }; }) ||
    take(rx(B + '(?:every\\s+weekend|weekends)' + E), () => { out.recur = { freq: 'week', interval: 1, byDay: [0, 6] }; }) ||
    take(rx(B + 'every\\s+(' + WD_RE + '(?:\\s*(?:,|and|&)\\s*' + WD_RE + ')*)' + E), m => {
      const days = m[1].split(/\s*(?:,|and|&)\s*/i).map(wdIndex).filter(i => i >= 0);
      out.recur = { freq: 'week', interval: 1, byDay: [...new Set(days)] };
    }) ||
    take(rx(B + 'every\\s+(?:month\\s+on\\s+the\\s+)?(\\d{1,2})(?:st|nd|rd|th)' + E), m => {
      const d = Number(m[1]); if (d < 1 || d > 31) return false;
      out.recur = { freq: 'month', interval: 1, monthDay: d };
    }) ||
    take(rx(B + '(?:every\\s+(other\\s+|\\d+\\s+)?(day|week|month|year)s?|(daily|weekly|monthly|yearly|annually))' + E), m => {
      if (m[3]) {
        const f = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year', annually: 'year' }[m[3].toLowerCase()];
        out.recur = { freq: f, interval: 1 };
      } else {
        const iv = !m[1] ? 1 : /other/i.test(m[1]) ? 2 : Number(m[1]);
        out.recur = { freq: m[2].toLowerCase(), interval: Math.max(1, iv) };
      }
    });

    // reminder: "remind 5pm", "remind me at 8:30am", "remind 30m before", "remind 1h before"
    take(rx(B + 'remind(?:\\s+me)?\\s+(\\d+)\\s*(m|mins?|minutes?|h|hrs?|hours?)\\s+before' + E), m => {
      out.remindOffset = Number(m[1]) * (/^h/i.test(m[2]) ? 60 : 1);
    }) ||
    take(rx(B + 'remind(?:\\s+me)?(?:\\s+at)?\\s+(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?' + E), m => {
      let h = Number(m[1]); const mi = Number(m[2] || 0);
      if (m[3]) { h = h % 12; if (m[3].toLowerCase() === 'pm') h += 12; } else if (!m[2] && h >= 1 && h <= 6) h += 12;
      if (h > 23 || mi > 59) return false;
      out.remindTime = pad(h) + ':' + pad(mi);
    });

    // time
    take(rx(B + '(?:at\\s+|@\\s*)?(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)' + E), m => {
      let h = Number(m[1]) % 12; if (m[3].toLowerCase() === 'pm') h += 12;
      const mi = Number(m[2] || 0); if (h > 23 || mi > 59) return false;
      out.time = pad(h) + ':' + pad(mi);
    }) ||
    take(rx(B + '(?:at\\s+)?([01]?\\d|2[0-3]):([0-5]\\d)' + E), m => { out.time = pad(Number(m[1])) + ':' + m[2]; }) ||
    take(rx(B + 'at\\s+(\\d{1,2})' + E), m => {
      const h = Number(m[1]); if (h > 23) return false;
      out.time = pad(h >= 1 && h <= 6 ? h + 12 : h) + ':00'; // "at 3" → 3pm
    }) ||
    take(rx(B + '(?:at\\s+)?(noon|midday)' + E), () => { out.time = '12:00'; });

    // date
    let due = null;
    take(rx(B + PRE + '(today|tod)' + E), () => { due = today; }) ||
    take(rx(B + '(tonight)' + E), () => { due = today; if (!out.time) out.time = '20:00'; }) ||
    take(rx(B + PRE + '(tomorrow|tmrw?|tmw)' + E), () => { due = addDays(today, 1); }) ||
    take(rx(B + PRE + '(?:this\\s+)?weekend' + E), () => { due = today.getDay() === 6 ? today : nextWeekday(today, 6); }) ||
    take(rx(B + PRE + 'next\\s+week' + E), () => { due = nextWeekday(today, 1); }) ||
    take(rx(B + PRE + 'next\\s+month' + E), () => { due = new Date(today.getFullYear(), today.getMonth() + 1, 1); }) ||
    take(rx(B + 'in\\s+(a|an|one|\\d+)\\s+(day|week|month|year)s?' + E), m => {
      const n = /^(a|an|one)$/i.test(m[1]) ? 1 : Number(m[1]);
      const u = m[2].toLowerCase();
      due = u === 'day' ? addDays(today, n) : u === 'week' ? addDays(today, 7 * n) : addMonths(today, u === 'month' ? n : 12 * n);
    }) ||
    take(rx(B + '(\\d{4})-(\\d{2})-(\\d{2})' + E), m => { due = new Date(+m[1], +m[2] - 1, +m[3]); }) ||
    take(rx(B + PRE + MON_RE + '\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?' + E), m => {
      due = mkDate(m[3], monIndex(m[1]), Number(m[2]));
      if (!due) return false;
    }) ||
    take(rx(B + PRE + '(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?' + MON_RE + '(?:,?\\s+(\\d{4}))?' + E), m => {
      due = mkDate(m[3], monIndex(m[2]), Number(m[1]));
      if (!due) return false;
    }) ||
    take(rx(B + PRE + '(\\d{1,2})/(\\d{1,2})(?:/(\\d{2,4}))?' + E), m => { // month/day (US)
      let y = m[3]; if (y && y.length === 2) y = '20' + y;
      due = mkDate(y, Number(m[1]) - 1, Number(m[2]));
      if (!due) return false;
    }) ||
    take(rx(B + PRE + '(?:(?:next|this)\\s+)?' + WD_RE + E), m => { due = nextWeekday(today, wdIndex(m[1])); });

    function mkDate(yStr, mon, day) {
      if (mon < 0 || day < 1 || day > 31) return null;
      if (yStr) { const y = Number(yStr); if (day > daysInMonth(y, mon)) return null; return new Date(y, mon, day); }
      let y = today.getFullYear();
      if (day > daysInMonth(y, mon) && !(mon === 1 && day === 29)) return null;
      let d = new Date(y, mon, Math.min(day, daysInMonth(y, mon)));
      if (d < today) d = new Date(y + 1, mon, Math.min(day, daysInMonth(y + 1, mon)));
      return d;
    }

    out.dateTyped = !!(due || out.rangeFrom); // a date was written (not just a time or a repeat)
    if (out.rangeFrom && !due) due = fromISO(out.rangeFrom);
    if (!due && out.recur) due = firstOccurrence(out.recur, today);
    if (!due && out.time) {
      out.dueFromTime = true; // no date typed, only a time
      const [h, mi] = out.time.split(':').map(Number);
      const t = new Date(today); t.setHours(h, mi);
      due = t > now ? today : addDays(today, 1);
    }
    if (due) out.due = toISO(due);
    if (out.recur && due && (out.recur.freq === 'month' || out.recur.freq === 'year') && !out.recur.monthDay) out.recur.anchorDay = due.getDate();

    // resolve reminder to a local 'YYYY-MM-DDTHH:MM'
    out.reminder = null;
    if (out.remindTime) {
      let day = due;
      if (!day) { const [h, mi] = out.remindTime.split(':').map(Number); const t = new Date(today); t.setHours(h, mi); day = t > now ? today : addDays(today, 1); }
      out.reminder = toISO(day) + 'T' + out.remindTime;
    } else if (out.remindOffset != null && due) {
      const [h, mi] = (out.time || '09:00').split(':').map(Number);
      const t = new Date(due); t.setHours(h, mi - out.remindOffset);
      out.reminder = toLocalDT(t);
    }

    out.title = text.replace(/\s+/g, ' ').trim().replace(/^[,.;:\-]+|[,;:\-]+$/g, '').trim();
    if (!out.title) out.title = input.trim();
    out.title = out.title.replace(/\u27e6(\d+)\u27e7/g, (m, i) => links[i] || m);

    if (out.due) out.tokens.unshift({ kind: 'date', text: dueLabel(out.due, now) + (out.end ? ' \u2192 ' + dueLabel(out.end, now) : '') + (out.time && !out.end ? ' ' + fmtTime(out.time) : '') });
    if (out.recur) out.tokens.push({ kind: 'recur', text: recurText(out.recur) });
    if (out.listName) out.tokens.push({ kind: 'list', text: out.listName });
    if (out.start) out.tokens.push({ kind: 'start', text: 'Starts ' + dueLabel(out.start, now) });
    if (out.reminder) out.tokens.push({ kind: 'rem', text: 'Remind ' + reminderLabel(out.reminder, now) });
    else if (out.remindOffset != null) out.tokens.push({ kind: 'warn', text: 'Add a date to use "before"' });
    return out;
  }

  const api = { toLocalDT, parseLocalDT, reminderLabel, parseQuick, nextOccurrence, recurText, dueLabel, fmtTime, toISO, fromISO, addDays, addMonths, startOfDay, diffDays, WD_LONG, MON_SHORT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TallyDates = api;
})(typeof window !== "undefined" ? window : globalThis);
