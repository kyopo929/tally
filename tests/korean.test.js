// Tests for the Korean flashcards: reading card lines and scheduling. Run: node tests/korean.test.js
const K = require('../src/korean.js');
let fail = 0;
const eq = (name, got, want) => { const g = JSON.stringify(got), w = JSON.stringify(want); if (g !== w) { fail++; console.log('FAIL', name, '\n  got ', g, '\n  want', w); } };

// reading lines
eq('full line', K.parseLine('ko: 어차피 = anyway | 어차피 늦었으니까 천천히 가자 #Squid Game'), { front: '어차피', back: 'anyway', ex: '어차피 늦었으니까 천천히 가자', src: 'Squid Game' });
eq('no ko: prefix, dash', K.parseLine('막상 - when it comes to it'), { front: '막상', back: 'when it comes to it', ex: '', src: '' });
eq('em dash', K.parseLine('굳이 — not necessarily'), { front: '굳이', back: 'not necessarily', ex: '', src: '' });
eq('front only', K.parseLine('ko: 그럴 줄 알았어'), { front: '그럴 줄 알았어', back: '', ex: '', src: '' });
eq('tabs', K.parseLine('하필\tof all days\t왜 하필 오늘이야'), { front: '하필', back: 'of all days', ex: '왜 하필 오늘이야', src: '' });
eq('source only', K.parseLine('설마 = no way #Running Man ep 3'), { front: '설마', back: 'no way', ex: '', src: 'Running Man ep 3' });
eq('empty', K.parseLine('ko:   '), null);
eq('bulk skips blanks and header', K.parseBulk('Korean\tEnglish\n\n어쩐지\tno wonder\n괜히 = for no reason').map(c => c.front), ['어쩐지', '괜히']);
eq('same front ignores spaces and punctuation', K.sameFront('그럴 줄 알았어!', '그럴줄 알았어'), true);

// scheduling
const T = '2026-11-28';
let s = K.grade(null, 3, T);
eq('new good: 2 days', [s.ivl, s.due, s.reps], [2, '2026-11-30', 1]);
eq('new easy: 5 days', K.grade(null, 4, T).ivl, 5);
eq('new hard: 1 day', K.grade(null, 2, T).ivl, 1);
const a = K.grade(null, 1, T);
eq('new again: stays today', [a.ivl, a.due, a.reps], [0, T, 0]);
s = K.grade(s, 3, '2026-11-30');
eq('review good grows by ease', s.ivl, 5);
s = K.grade(s, 3, '2026-12-05');
eq('review good again', s.ivl, 13);
const l = K.grade(s, 1, '2026-12-18');
eq('lapse: relearn today, ease down', [l.ivl, l.due, l.lapses, l.ease], [0, '2026-12-18', 1, 2.3]);
eq('relearn good: 1 day', K.grade(l, 3, '2026-12-18').ivl, 1);
eq('hard grows a little', K.grade({ due: T, ivl: 10, ease: 2.5, reps: 3, lapses: 0 }, 2, T).ivl, 12);
eq('ease floor', K.grade({ due: T, ivl: 10, ease: 1.35, reps: 3, lapses: 2 }, 1, T).ease, 1.3);
eq('labels', [0, 1, 45, 400].map(K.ivlLabel), ['again today', '1d', '2mo', '1.1y']);
eq('due', [K.isDue({ due: T }, T), K.isDue({ due: '2026-11-29' }, T), K.isDue(null, T)], [true, false, false]);

// streak
eq('streak counts back from today', K.streak({ '2026-11-28': { r: 3 }, '2026-11-27': { r: 1 }, '2026-11-25': { r: 9 } }, T), 2);
eq('streak kept before today’s review', K.streak({ '2026-11-27': { r: 1 }, '2026-11-26': { r: 1 } }, T), 2);
eq('streak broken', K.streak({ '2026-11-25': { r: 1 } }, T), 0);
// word packs: every card complete, no card twice
const PACKS = require('../src/korean-packs.js'), all = PACKS.flatMap(p => p.cards);
eq('packs complete', all.filter(c => !c.front || !c.back || !c.ex).map(c => c.front), []);
eq('packs have no repeats', all.length, new Set(all.map(c => c.front.replace(/\s/g, ''))).size);

// transcripts and subtitle files
eq('youtube transcript', K.parseTranscript('0:01\n[음악]\n0:03\n야 너 진짜 왜 그래?\n0:05\n야 너 진짜 왜 그래?\n1:02:10\n아니 그게 아니라'), ['야 너 진짜 왜 그래?', '아니 그게 아니라']);
eq('timestamp on the same line', K.parseTranscript('0:12 밥 먹었어?\n0:15 (웃음) 아직 안 먹었어'), ['밥 먹었어?', '아직 안 먹었어']);
eq('srt', K.parseTranscript('1\n00:00:01,000 --> 00:00:03,000\n<i>어차피 늦었어</i>\n\n2\n00:00:04,000 --> 00:00:06,000\n- 천천히 가자\nHello'), ['어차피 늦었어', '천천히 가자']);
eq('vtt', K.parseTranscript('WEBVTT\nKind: captions\nLanguage: ko\n\n00:00.000 --> 00:02.000\n♪ 괜찮아 ♪'), ['괜찮아']);

console.log(fail ? fail + ' failed' : 'All Korean tests passed');
process.exit(fail ? 1 : 0);
