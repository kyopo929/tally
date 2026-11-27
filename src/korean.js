/* Korean flashcards: card parsing and spaced-repetition scheduling. Pure functions, no DOM.
   Shown only where /config.js lists features: ['korean'] (api/_cfg.js: the original site by default). */
(function (root) {
  const pad = n => String(n).padStart(2, '0');
  const toISO = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const fromISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDaysISO = (iso, n) => { const d = fromISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
  const diffDays = (a, b) => Math.round((fromISO(a) - fromISO(b)) / 86400000);
  const MAX_IVL = 3650;

  /* One line from the add box or a pasted list:
     "어차피 = anyway | 어차피 늦었으니까 천천히 가자 #Squid Game"
     front = meaning | example #source. "=", a tab, " - " or " — " separate the Korean from the meaning. */
  function parseLine(s) {
    let t = String(s || '').replace(/^\s*ko\s*:\s*/i, '').trim();
    if (!t) return null;
    let src = '';
    const sm = t.match(/(?:^|\s)#\s*([^#|=\t]+)$/);
    if (sm) { src = sm[1].trim(); t = t.slice(0, sm.index).trim(); }
    let ex = '';
    const tab = t.split('\t');
    let front, back;
    if (tab.length > 1) { front = tab[0]; back = tab[1]; ex = tab.slice(2).join(' ').trim(); }
    else {
      const bar = t.indexOf('|');
      if (bar >= 0) { ex = t.slice(bar + 1).trim(); t = t.slice(0, bar).trim(); }
      const m = t.match(/\s*=\s*|\s+[-—–]\s+/);
      if (m) { front = t.slice(0, m.index); back = t.slice(m.index + m[0].length); } else { front = t; back = ''; }
    }
    front = (front || '').trim(); back = (back || '').trim();
    if (!front) return null;
    return { front, back, ex, src };
  }
  function parseBulk(text) {
    return String(text || '').split(/\r?\n/).map(parseLine).filter(c => c && !/^(korean|front|word|한국어)$/i.test(c.front));
  }
  const norm = s => String(s || '').replace(/[\s.,!?~…"'“”‘’()]/g, '').toLowerCase();
  const sameFront = (a, b) => norm(a) === norm(b);

  /* Scheduling, Anki-style. srs = { due, ivl (days, 0 = still learning), ease, reps, lapses }.
     grade: 1 Again, 2 Hard, 3 Good, 4 Easy. Again keeps the card in today's session. */
  function fresh() { return { due: null, ivl: 0, ease: 2.5, reps: 0, lapses: 0 }; }
  function grade(srs, g, today) {
    const s = Object.assign(fresh(), srs || {});
    const isNew = !s.reps && !s.lapses;
    let ivl;
    if (!s.ivl) { // new or relearning after a lapse
      if (g === 1) ivl = 0;
      else if (g === 2) ivl = 1;
      else if (g === 3) ivl = isNew ? 2 : 1;
      else ivl = isNew ? 5 : 3;
    } else if (g === 1) { s.lapses++; s.ease = Math.max(1.3, s.ease - 0.2); ivl = 0; }
    else if (g === 2) { s.ease = Math.max(1.3, s.ease - 0.15); ivl = Math.max(s.ivl + 1, Math.round(s.ivl * 1.2)); }
    else if (g === 3) ivl = Math.max(s.ivl + 1, Math.round(s.ivl * s.ease));
    else { ivl = Math.max(s.ivl + 2, Math.round(s.ivl * s.ease * 1.3)); s.ease += 0.15; }
    s.ivl = Math.min(MAX_IVL, ivl);
    if (g > 1) s.reps++;
    s.ease = Math.round(s.ease * 100) / 100;
    s.due = addDaysISO(today, s.ivl);
    s.last = today;
    return s;
  }
  function ivlLabel(days) {
    if (!days) return 'again today';
    if (days < 30) return days + 'd';
    if (days < 365) return Math.round(days / 30) + 'mo';
    return (Math.round(days / 36.5) / 10) + 'y';
  }
  const isDue = (srs, today) => !!(srs && srs.due && srs.due <= today);
  const isNewCard = srs => !srs || !srs.due;

  /* Days in a row with at least one review, ending today (or yesterday, so the streak isn't lost before you've reviewed today). */
  function streak(log, today) {
    let d = (log[today] && log[today].r) ? today : addDaysISO(today, -1), n = 0;
    while (log[d] && log[d].r) { n++; d = addDaysISO(d, -1); }
    return n;
  }

  /* A pasted YouTube transcript or a subtitle file (.srt / .vtt) → the Korean lines, in order, without timestamps,
     cue numbers, sound tags like [음악] or repeats (auto-generated captions repeat lines). */
  const HANGUL = /[\uAC00-\uD7A3]/;
  function parseTranscript(text) {
    const out = [];
    for (let l of String(text || '').replace(/\r/g, '').split('\n')) {
      l = l.replace(/<[^>]+>/g, '').replace(/\{[^}]*\}/g, '').trim();
      if (!l || /^WEBVTT|^NOTE\b|^(Kind|Language|STYLE|REGION)\b/i.test(l) || /^\d+$/.test(l) || /-->/.test(l)) continue;
      l = l.replace(/^\(?\d{1,2}:\d{2}(?::\d{2})?\)?\s*/, '').replace(/^\d+\s*(seconds?|minutes?|초|분)(,\s*\d+\s*(seconds?|minutes?|초|분))*\s*/i, '');
      l = l.replace(/[\[(（][^\])）]*[\])）]/g, '').replace(/^[-–♪\s]+|[♪\s]+$/g, '').replace(/\s+/g, ' ').trim();
      if (!l || !HANGUL.test(l)) continue;
      if (out.length && out[out.length - 1] === l) continue;
      out.push(l);
    }
    return out;
  }

  const api = { parseLine, parseBulk, parseTranscript, sameFront, fresh, grade, ivlLabel, isDue, isNewCard, streak, addDaysISO, diffDays };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TallyKo = api;
})(typeof window !== 'undefined' ? window : globalThis);
