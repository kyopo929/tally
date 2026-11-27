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

  // Everyday words heritage speakers often half-know, plus news and formal words. Optional, added from the Korean page.
  const STARTER = [
    ['어차피', 'anyway, in any case (it will happen regardless)', '어차피 늦었으니까 천천히 가자.'],
    ['오히려', 'rather, on the contrary', '사과했더니 오히려 더 화를 냈어.'],
    ['굳이', 'go out of one’s way to; (not) necessarily', '굳이 그렇게까지 할 필요 없어.'],
    ['차라리', 'would rather; might as well', '이럴 바엔 차라리 혼자 갈게.'],
    ['하필', 'of all (times, people, things)', '왜 하필 오늘 비가 와?'],
    ['막상', 'when it actually comes to it', '막상 해보니까 생각보다 쉽더라.'],
    ['괜히', 'for no reason; pointlessly', '괜히 말했나 봐.'],
    ['일부러', 'on purpose', '일부러 그런 거 아니야.'],
    ['설마', 'surely not, no way', '설마 벌써 다 먹은 거야?'],
    ['어쩐지', 'no wonder', '어쩐지 조용하더라.'],
    ['도대체', 'what on earth, just (what/why)', '도대체 무슨 생각을 하는 거야?'],
    ['겨우', 'barely; only (just)', '겨우 시간 맞춰 도착했어.'],
    ['마침', 'just then, at just the right time', '마침 잘 왔다. 이것 좀 도와줘.'],
    ['아무리', 'no matter how', '아무리 바빠도 밥은 먹어야지.'],
    ['게다가', 'on top of that, besides', '비싸고, 게다가 맛도 없어.'],
    ['여전히', 'still (as before)', '그는 여전히 그 회사에 다닌다.'],
    ['당분간', 'for the time being', '당분간 연락하지 마.'],
    ['어이없다', 'absurd, ridiculous (leaves you speechless)', '진짜 어이없네.'],
    ['서운하다', 'hurt, let down (by someone close)', '생일을 잊어버려서 좀 서운했어.'],
    ['억울하다', 'to feel wronged, unfairly treated', '나만 혼나서 너무 억울해.'],
    ['답답하다', 'frustrated; stuffy, stifling', '말이 안 통해서 답답해.'],
    ['아깝다', 'a waste, such a shame', '이거 버리기 아까워.'],
    ['눈치', 'tact, reading the room', '눈치 좀 챙겨.'],
    ['핑계', 'excuse', '핑계 대지 마.'],
    ['오해', 'misunderstanding', '오해하지 마, 그런 뜻 아니었어.'],
    ['논란', 'controversy', '그 발언이 논란이 되고 있다.'],
    ['의혹', 'suspicion, allegation', '새로운 의혹이 제기됐다.'],
    ['혐의', 'charges, suspicion (of a crime)', '사기 혐의로 조사를 받고 있다.'],
    ['갈등', 'conflict, tension', '두 사람 사이에 갈등이 생겼다.'],
    ['대책', 'measures to deal with something', '정부가 대책을 발표했다.'],
    ['입장', 'position, stance; official statement', '회사 측은 아직 입장을 밝히지 않았다.'],
    ['영향을 미치다', 'to have an effect on', '날씨가 매출에 큰 영향을 미쳤다.'],
    ['책임을 지다', 'to take responsibility', '누가 책임을 질 거예요?'],
    ['결국', 'in the end, eventually', '결국 헤어졌대.']
  ].map(([front, back, ex]) => ({ front, back, ex, src: 'Starter set' }));

  const api = { parseLine, parseBulk, sameFront, fresh, grade, ivlLabel, isDue, isNewCard, streak, addDaysISO, diffDays, STARTER };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TallyKo = api;
})(typeof window !== 'undefined' ? window : globalThis);
