# Korean word packs

Built by `tools/build_ko_packs.py`. Each file is a list of `[Korean, English, example sentence]`, most common first.

- Meanings and example sentences: 국립국어원 한국어기초사전 (National Institute of Korean Language, Basic Korean Dictionary, https://krdict.korean.go.kr), licensed CC BY-SA 2.0 KR (https://creativecommons.org/licenses/by-sa/2.0/kr/). These files are shared under the same license.
- Order: 국립국어원 한국어 학습용 어휘 목록 (2003) frequency rank, 공공누리 제1유형 (KOGL type 1).
- Conversational only: technical, formal and old-fashioned words are left out (`tools/ko_drop_words.json`; idioms kept: `tools/ko_keep_idioms.json`), chosen with help from how often words appear in film and TV subtitles (FrequencyWords, Korean OpenSubtitles 2018, CC BY-SA 4.0).
