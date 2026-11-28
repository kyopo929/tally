"""Builds the big Korean word packs in korean/*.json from NIKL's learners' dictionary (한국어기초사전).

Sources (download first, not kept in this repo):
  - https://github.com/spellcheck-ko/korean-dict-nikl-krdict  (the dictionary XML; CC BY-SA 2.0 KR, 국립국어원)
  - https://github.com/julienshim/combined_korean_vocabulary_list results.tsv  (NIKL 2003 frequency rank, KOGL type 1, 국립국어원)
Run: python3 tools/build_ko_packs.py <dir with *.xml> <results.tsv>
Each card is [Korean, English, example sentence]. Packs are ordered most common first (NIKL rank, then the rest).
Conversational only: technical, formal and textbook words listed in tools/ko_drop_words.json are left out, and only the
idioms in tools/ko_keep_idioms.json are kept (picked by hand, helped by how often their words appear in film and TV
subtitles: FrequencyWords' Korean OpenSubtitles 2018 list, CC BY-SA 4.0)."""
import sys, glob, re, csv, json
from lxml import etree

xml_dir, tsv = sys.argv[1], sys.argv[2]
import os
HERE = os.path.dirname(os.path.abspath(__file__))
DROP = set(json.load(open(os.path.join(HERE, 'ko_drop_words.json'), encoding='utf-8')))
KEEP_IDIOMS = set(json.load(open(os.path.join(HERE, 'ko_keep_idioms.json'), encoding='utf-8')))
rank = {}
for r in csv.DictReader(open(tsv, encoding='utf-8'), delimiter='\t'):
    w = re.sub(r'\d+$', '', r['word'])
    if r['rank']: rank[w] = min(rank.get(w, 10**6), int(r['rank']))
    elif r['topik_level']: rank.setdefault(w, 10**5)

def g(e, a):
    f = e.find('feat[@att="%s"]' % a) if e is not None else None
    return f.get('val') if f is not None else ''

entries = []
for f in sorted(glob.glob(xml_dir + '/*.xml')):
    for _, el in etree.iterparse(f, tag='LexicalEntry', recover=True, huge_tree=True):
        unit, lvl, w = g(el, 'lexicalUnit'), g(el, 'vocabularyLevel'), g(el.find('Lemma'), 'writtenForm').strip()
        if w and (unit == '관용구' or (unit == '단어' and lvl in ('초급', '중급', '고급'))):
            senses = []
            for s in el.findall('Sense'):
                en = [e for e in s.findall('Equivalent') if g(e, 'language') == '영어']
                exs = [(g(x, 'type'), [y.get('val') for y in x.findall('feat[@att="example"]')]) for x in s.findall('SenseExample')]
                senses.append({'en': g(en[0], 'lemma') if en else '', 'def': g(en[0], 'definition') if en else '', 'ex': exs})
            entries.append({'w': w, 'unit': unit, 'lvl': lvl, 'pos': g(el, 'partOfSpeech'), 'senses': senses, 'order': len(entries)})
        el.clear()

def clean_en(s):
    s = re.sub(r'\s+', ' ', (s or '').replace(';', ',')).strip(' ,.')
    return s

def meaning(es, idiom):
    out = []
    for e in es:
        for s in e['senses'][:2]:
            m = clean_en(s['def'] if idiom else s['en'])
            if idiom: m = re.sub(r'^((?:\([^)]*\)\s*)?)([A-Z])(?![A-Z])', lambda x: x.group(1) + x.group(2).lower(), m)
            if m and m not in out: out.append(m)
    txt = ' / '.join(out[:3])
    return txt if len(txt) <= 90 else txt[:88].rsplit(' ', 1)[0] + '…'

def example(es, w):
    stem = re.sub(r'(하다|다)$', '', w.split(' ')[0])[:2] or w[:1]
    cands = []
    for e in es:
        for si, s in enumerate(e['senses'][:2]):
            for t, vals in s['ex']:
                for v in vals:
                    v = re.sub(r'\s+', ' ', v or '').strip()
                    if not v or stem not in v: continue
                    score = {'문장': 0, '대화': 1, '구': 3}.get(t, 2) + si * 2 + (0 if 6 <= len(v) <= 42 else 4)
                    cands.append((score, len(v), v))
    return min(cands)[2] if cands else ''

groups = {}
for e in entries:
    key = re.sub(r'\s+', ' ', re.sub(r'[()]', '', e['w'])).strip() if e['unit'] == '관용구' else e['w']
    groups.setdefault((e['unit'] == '관용구', key), []).append(e)

lvl_rank = {'초급': 0, '중급': 1, '고급': 2}
packs = {'beginner': [], 'intermediate': [], 'advanced': [], 'idioms': []}
for (idiom, w), es in groups.items():
    es.sort(key=lambda e: (lvl_rank.get(e['lvl'], 3), e['order']))
    if idiom:
        front = es[0]['w'].strip()
        if front not in KEEP_IDIOMS: continue
        pack = 'idioms'
    else:
        front = w
        if w in DROP: continue
        lv = es[0]['lvl']
        if lv == '고급' and w not in rank: continue  # advanced: only the ones in the NIKL / TOPIK lists (common enough)
        pack = {'초급': 'beginner', '중급': 'intermediate', '고급': 'advanced'}[lv]
        if es[0]['pos'] in ('접사', '어미', '조사'): continue
    m = meaning(es, idiom)
    if not m: continue
    packs[pack].append((rank.get(w, 10**7), es[0]['order'], [front, m, example(es, w)]))

for k, v in packs.items():
    v.sort(key=lambda x: (x[0], x[1]))
    cards = [c for _, _, c in v]
    json.dump(cards, open('korean/%s.json' % k, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(k, len(cards))
