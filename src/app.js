(function () {
  'use strict';
  const D = window.TallyDates;
  const KEY = 'tally.v1';
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const todayISO = () => D.toISO(new Date());
  const COLORS = ['#2856c7', '#2a9d8f', '#d99100', '#c4372c', '#7b4fc9', '#3d8b37', '#d0559a', '#607089'];

  const I = {
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    up: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M9 15l2 2 4-4"/></svg>',
    flag: '<svg viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
    all: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/></svg>',
    inbox: '<svg viewBox="0 0 24 24"><path d="M3.5 13.5l2.6-7.2A2 2 0 018 5h8a2 2 0 011.9 1.3l2.6 7.2V18a2 2 0 01-2 2h-13a2 2 0 01-2-2z"/><path d="M3.5 13.5h5l1.5 2.5h4l1.5-2.5h5"/></svg>',
    repeat: '<svg viewBox="0 0 24 24"><path d="M17 2.5l3 3-3 3"/><path d="M4 11.5v-1a5 5 0 015-5h11M7 21.5l-3-3 3-3"/><path d="M20 12.5v1a5 5 0 01-5 5H4"/></svg>',
    chev: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
    left: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    dots: '<svg viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18.5" cy="12" r="1"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M9 3.5h6l-1 6 3.5 3.5h-11L10 9.5zM12 13v7.5"/></svg>',
    image: '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8.5 8.5"/></svg>',
    archive: '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="4" rx="1"/><path d="M5 8.5v10a1 1 0 001 1h12a1 1 0 001-1v-10M10 12.5h4"/></svg>',
    notes: '<svg viewBox="0 0 24 24"><rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 8.5h8M8 12.5h8M8 16.5h5"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 017 0v3"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M12 15V3.5M7.5 8L12 3.5 16.5 8"/><path d="M5 12.5v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="8.5" y="8.5" width="11" height="12" rx="2"/><path d="M15.5 8.5V5.5a2 2 0 00-2-2h-7a2 2 0 00-2 2v9a2 2 0 002 2h2"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M12 3.5V15M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/></svg>',
    idcard: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16.2c.7-1.6 1.8-2.3 3.2-2.3s2.5.7 3.2 2.3M14.5 10h4M14.5 13.5h3"/></svg>',
    clip: '<svg viewBox="0 0 24 24"><path d="M20 11.5l-7.8 7.8a5 5 0 01-7.1-7.1l8.5-8.5a3.3 3.3 0 014.7 4.7l-8.5 8.5a1.7 1.7 0 01-2.4-2.4L15 6.9"/></svg>',
    journal: '<svg viewBox="0 0 24 24"><path d="M6 3.5h11a2 2 0 012 2v13a2 2 0 01-2 2H6z"/><path d="M6 3.5v17M9.5 8h6M9.5 11.5h6M9.5 15h4"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    note: '<svg viewBox="0 0 24 24"><path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4M9 12h6M9 16h4"/></svg>',
    steps: '<svg viewBox="0 0 24 24"><path d="M4 7l2 2 3-3M4 15l2 2 3-3M12 8h8M12 16h8"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M13 2.5L4.5 13.5H12l-1 8 8.5-11H12z"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
    tag: '<svg viewBox="0 0 24 24"><path d="M3.5 12.2V4.5a1 1 0 011-1h7.7l8.3 8.3a1 1 0 010 1.4l-7.3 7.3a1 1 0 01-1.4 0z"/><circle cx="8" cy="8" r="1.3"/></svg>',
    done: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M8 12.3l2.7 2.7L16 9.7"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></svg>',
    restore: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 108-8 8.5 8.5 0 00-6 2.5L4 8.5"/><path d="M4 4v4.5h4.5"/></svg>',
    star: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M12 12.3l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z" fill="currentColor" stroke-width="1"/></svg>',
    meet: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19a5.5 5.5 0 0111 0"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M15.6 14.3a4.5 4.5 0 015 4.2"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M3.5 7.5a2 2 0 012-2h4l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2h-13a2 2 0 01-2-2z"/></svg>'
  };

  /* ---------- themes ---------- */
  const THEMES = {
    harbor: { name: 'Harbor', note: 'Slate and cobalt',
      light: { bg: '#e4e9f2', surface: '#ffffff', side: '#f4f7fc', ink: '#121a2b', muted: '#56627a', line: '#d2d9e6', accent: '#1d4ed8', 'accent-soft': '#dbe5fd', hover: '#eef2fa' },
      dark: { bg: '#0d1220', surface: '#161d2e', side: '#121929', ink: '#e8edf7', muted: '#94a0b8', line: '#26304a', accent: '#6d93ff', 'accent-soft': '#1d2c55', hover: '#1c2540' } },
    sage: { name: 'Sage', note: 'Green, calm',
      light: { bg: '#dfe9e2', surface: '#fbfdfb', side: '#eef5f0', ink: '#15231a', muted: '#52685a', line: '#c9d9ce', accent: '#2f7a50', 'accent-soft': '#d4eadb', hover: '#e9f2ec' },
      dark: { bg: '#0e1611', surface: '#162019', side: '#121b15', ink: '#e2ede5', muted: '#8fa596', line: '#24362a', accent: '#5fc28a', 'accent-soft': '#183a26', hover: '#1c2a20' } },
    nordic: { name: 'Nordic', note: 'Frosty blue-gray',
      light: { bg: '#dde4ee', surface: '#fafbfd', side: '#edf1f7', ink: '#232a36', muted: '#59647a', line: '#c8d2e1', accent: '#3f6fa8', 'accent-soft': '#d5e2f2', hover: '#e8edf5' },
      dark: { bg: '#252b36', surface: '#323a49', side: '#2c3340', ink: '#eceff4', muted: '#a7b1c4', line: '#47516a', accent: '#88c0d0', 'accent-soft': '#375066', hover: '#3a4355' } },
    lavender: { name: 'Lavender', note: 'Violet',
      light: { bg: '#e7e3f5', surface: '#fdfcff', side: '#f3f0fb', ink: '#1f1a33', muted: '#625b7c', line: '#d6d0ea', accent: '#5b47c7', 'accent-soft': '#e2dcfa', hover: '#efebfa' },
      dark: { bg: '#120f1d', surface: '#1c1830', side: '#171427', ink: '#ebe7f7', muted: '#a199bf', line: '#302a4a', accent: '#a593ff', 'accent-soft': '#2d2556', hover: '#241f3b' } },
    sand: { name: 'Sand & Teal', note: 'Warm neutral, teal accent',
      light: { bg: '#ece5d8', surface: '#fffdf8', side: '#f6f1e7', ink: '#221e17', muted: '#6c6553', line: '#ddd3c1', accent: '#0f766e', 'accent-soft': '#d3ece8', hover: '#f3ede1' },
      dark: { bg: '#15130f', surface: '#201d18', side: '#1b1814', ink: '#eee9df', muted: '#aaa291', line: '#36312a', accent: '#3cc2b4', 'accent-soft': '#143a36', hover: '#2a261f' } },
    rosewood: { name: 'Rosewood', note: 'Dusty rose',
      light: { bg: '#f1e3e7', surface: '#fffbfc', side: '#f9f0f2', ink: '#2a1a20', muted: '#77606a', line: '#e5d0d7', accent: '#9d3457', 'accent-soft': '#f6dbe4', hover: '#f7ecef' },
      dark: { bg: '#1a1215', surface: '#251a1e', side: '#20161a', ink: '#f2e7ea', muted: '#b39da5', line: '#3d2c32', accent: '#f07ea3', 'accent-soft': '#452131', hover: '#2e2126' } },
    graphite: { name: 'Graphite', note: 'Black and white, no fuss',
      light: { bg: '#e4e4e7', surface: '#ffffff', side: '#f4f4f5', ink: '#18181b', muted: '#5f5f68', line: '#d4d4d8', accent: '#27272a', 'accent-soft': '#e4e4e7', hover: '#f1f1f3' },
      dark: { bg: '#0c0c0d', surface: '#1a1a1c', side: '#141416', ink: '#f0f0f2', muted: '#a1a1aa', line: '#2e2e32', accent: '#e4e4e7', 'accent-soft': '#2e2e32', hover: '#252528' } }
  };
  const POPULAR = {
    github: { name: 'GitHub', note: 'Clean and crisp',
      light: { bg: '#eaeef2', surface: '#ffffff', side: '#f6f8fa', ink: '#1f2328', muted: '#59636e', line: '#d1d9e0', accent: '#0969da', 'accent-soft': '#ddf4ff', hover: '#f3f5f7' },
      dark: { bg: '#010409', surface: '#0d1117', side: '#010409', ink: '#e6edf3', muted: '#9198a1', line: '#30363d', accent: '#4493f8', 'accent-soft': '#12233d', hover: '#151b23' } },
    solarized: { name: 'Solarized', note: 'The classic warm-cool pair',
      light: { bg: '#eee8d5', surface: '#fdf6e3', side: '#f5efdc', ink: '#073642', muted: '#657b83', line: '#e0d9c3', accent: '#268bd2', 'accent-soft': '#dfe9e6', hover: '#f7f0dd' },
      dark: { bg: '#00212b', surface: '#002b36', side: '#012631', ink: '#eee8d5', muted: '#93a1a1', line: '#0d3c48', accent: '#268bd2', 'accent-soft': '#0c3d55', hover: '#073642' } },
    gruvbox: { name: 'Gruvbox', note: 'Retro, earthy, orange',
      light: { bg: '#ebdbb2', surface: '#fbf1c7', side: '#f2e5bc', ink: '#3c3836', muted: '#7c6f64', line: '#d5c4a1', accent: '#af3a03', 'accent-soft': '#f3d9b1', hover: '#f4e8be' },
      dark: { bg: '#1d2021', surface: '#282828', side: '#232323', ink: '#ebdbb2', muted: '#a89984', line: '#3c3836', accent: '#fe8019', 'accent-soft': '#4a3020', hover: '#32302f' } },
    catppuccin: { name: 'Catppuccin', note: 'Soothing pastel (Latte / Mocha)',
      light: { bg: '#dce0e8', surface: '#eff1f5', side: '#e6e9ef', ink: '#4c4f69', muted: '#6c6f85', line: '#ccd0da', accent: '#8839ef', 'accent-soft': '#e4d7fb', hover: '#e6e9ef' },
      dark: { bg: '#11111b', surface: '#1e1e2e', side: '#181825', ink: '#cdd6f4', muted: '#a6adc8', line: '#313244', accent: '#cba6f7', 'accent-soft': '#3a2f52', hover: '#262637' } },
    dracula: { name: 'Dracula', note: 'Dark purple favorite',
      light: { bg: '#ecebf3', surface: '#ffffff', side: '#f6f5fa', ink: '#1f1f2b', muted: '#635d7a', line: '#dad7e6', accent: '#644ac9', 'accent-soft': '#e7e1fb', hover: '#f2f0f8' },
      dark: { bg: '#191a21', surface: '#282a36', side: '#21222c', ink: '#f8f8f2', muted: '#a4a9c7', line: '#44475a', accent: '#bd93f9', 'accent-soft': '#3d3557', hover: '#303241' } },
    tokyo: { name: 'Tokyo Night', note: 'Neon-city blues',
      light: { bg: '#d5d6db', surface: '#e9eaef', side: '#e1e2e7', ink: '#343b58', muted: '#565a6e', line: '#c4c8da', accent: '#2e7de9', 'accent-soft': '#d5def5', hover: '#dfe1e8' },
      dark: { bg: '#16161e', surface: '#1a1b26', side: '#1f2335', ink: '#c0caf5', muted: '#8089b3', line: '#292e42', accent: '#7aa2f7', 'accent-soft': '#283457', hover: '#222436' } },
    rosepine: { name: 'Ros\u00e9 Pine', note: 'Muted, elegant (Dawn / Main)',
      light: { bg: '#f2e9e1', surface: '#fffaf3', side: '#faf4ed', ink: '#575279', muted: '#797593', line: '#dfdad9', accent: '#907aa9', 'accent-soft': '#ece3f1', hover: '#f4ede8' },
      dark: { bg: '#191724', surface: '#1f1d2e', side: '#1a1826', ink: '#e0def4', muted: '#908caa', line: '#2a2837', accent: '#c4a7e7', 'accent-soft': '#352f4d', hover: '#26233a' } },
    everforest: { name: 'Everforest', note: 'Soft forest greens',
      light: { bg: '#efebd4', surface: '#fdf6e3', side: '#f4f0d9', ink: '#5c6a72', muted: '#829181', line: '#e0dcc7', accent: '#3a9474', 'accent-soft': '#dcece0', hover: '#f2eed6' },
      dark: { bg: '#232a2e', surface: '#2d353b', side: '#293136', ink: '#d3c6aa', muted: '#9da9a0', line: '#3d484d', accent: '#a7c080', 'accent-soft': '#3c4841', hover: '#343f44' } }
  };
  Object.keys(POPULAR).forEach(k => { POPULAR[k].popular = true; THEMES[k] = POPULAR[k]; });
  const SEMANTIC = {
    light: { danger: '#c4372c', p1: '#d1372b', p2: '#e07b12', p3: '#2f6fd6', sun: '#d99100', 'sun-soft': '#fdf3dc', 'on-accent': '#ffffff', shadow: '0 1px 2px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.08)' },
    dark: { danger: '#ef6b5f', p1: '#ef6b5f', p2: '#f0a04b', p3: '#7c9cf5', sun: '#f0b43c', 'sun-soft': '#2e2615', 'on-accent': '#10131a', shadow: '0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.35)' }
  };
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function resolvedMode() {
    const m = S.settings.mode || 'system';
    if (m !== 'system') return m;
    const host = document.documentElement.getAttribute('data-theme');
    if (host === 'dark' || host === 'light') return host;
    return mq && mq.matches ? 'dark' : 'light';
  }
  function applyTheme() {
    const th = THEMES[S.settings.theme] || THEMES.harbor, mode = resolvedMode();
    const vars = Object.assign({}, th[mode], SEMANTIC[mode]);
    const st = document.documentElement.style;
    for (const k in vars) st.setProperty('--' + k, vars[k]);
    st.setProperty('color-scheme', mode);
  }

  /* ---------- state ---------- */
  let S, ui = { view: 'calendar', selected: null, calMonth: null, showDone: {}, collapsed: {}, menu: null, editing: null, confirmDelete: false, undo: null, multi: new Set(), lastClick: null, hEdit: null, doneLimit: 200 };

  function seed() {
    // A fresh, empty Tally: Inbox plus empty Personal and Work groups.
    return {
      version: 1,
      settings: { scope: 'all', theme: 'sage', mode: 'system', autoRemind: true },
      groups: [],
      lists: [{ id: 'inbox', name: 'Tasks', groupId: null, color: '#607089', system: true }],
      trash: { tasks: [], lists: [] },
      tasks: []
    };
  }

  // One place for everything: no Personal/Work groups; the default list is just "Tasks".
  function simplify(s) {
    (s.lists || []).forEach(l => { l.groupId = null; if (l.id === 'inbox' && l.name === 'Inbox') l.name = 'Tasks'; });
    ((s.trash && s.trash.lists) || []).forEach(l => { l.groupId = null; });
    s.groups = [];
    if (s.settings) s.settings.scope = 'all';
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const s = JSON.parse(raw); if (s && s.version === 1) { s.trash = s.trash || { tasks: [], lists: [] }; simplify(s); s.settings = Object.assign({ scope: 'all', theme: 'sage', mode: 'system', autoRemind: true }, s.settings); return s; } }
    } catch (e) { }
    return seed();
  }
  let dataVer = 0; // bumped on every save, so caches built from the data know when to rebuild
  function persistLocal() { dataVer++; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }
  function save() { persistLocal(); schedulePush(); if (vault.key) reseal(); }
  function snapshot() { ui.undo = JSON.stringify(S); }

  /* ---------- model helpers ---------- */
  const listById = id => S.lists.find(l => l.id === id);
  const groupById = id => S.groups.find(g => g.id === id);
  const taskById = id => S.tasks.find(t => t.id === id);
  function areaOfList(l) { const g = l && l.groupId && groupById(l.groupId); return g ? g.area : null; }
  function listInScope(l) { const sc = S.settings.scope; return sc === 'all' || areaOfList(l) === null || areaOfList(l) === sc; }
  function taskInScope(t) { return listInScope(listById(t.listId) || listById('inbox')); }
  const isEvent = t => t.type === 'event';
  const isNote = t => t.type === 'daynote';
  const isMeet = t => isNote(t) && typeof t.meet === 'string'; // meeting notes: a journal entry with a meeting name
  const unbr = s => (s || '').replace(/\[\[([^\[\]\n]*)\]\]/g, '$1'); // shows [[Ahmed]] as Ahmed in lists
  const mName = t => (t.meet || '').replace(/\[\[([^\[\]\n]*)\]\]/g, '$1').trim(); // the name without [[ ]], used to group meetings
  const AM = 'T06:00'; // automatic heads-ups (follow-ups, expiries, birthdays): early, before the workday
  const PHONE_MQ = window.matchMedia ? window.matchMedia('(max-width: 600px)') : null;
  const isPhone = () => !!(PHONE_MQ && PHONE_MQ.matches);
  const IS_ANDROID = /Android/i.test(navigator.userAgent || '');
  const open = () => S.tasks.filter(t => !t.done && !t.type && taskInScope(t));
  /* ---------- Public holidays: UAE, US, South Korea (auto-updated daily from /api/holidays, built-in fallback) ---------- */
  const HOL_KEY = 'tally.holidays.v2';
  // Which countries this copy offers (set per copy in api/_cfg.js / the HOLIDAYS setting in Vercel)
  const HOL_ALL = { ae: 'UAE', us: 'US', kr: 'South Korea' }, HOL_PICK = (window.TALLY_CONFIG || {}).holidays;
  const HOL_COUNTRIES = Object.fromEntries(Object.entries(HOL_ALL).filter(([c]) => !Array.isArray(HOL_PICK) || HOL_PICK.includes(c)));
  const HOL_SUFFIX = { ae: '', us: ' (US)', kr: ' (Korea)' };
  function nthWeekday(y, m, wd, n) { const d = new Date(y, m, 1); let c = 0; while (true) { if (d.getDay() === wd && ++c === n) return D.toISO(d); d.setDate(d.getDate() + 1); } }
  function lastWeekday(y, m, wd) { const d = new Date(y, m + 1, 0); while (d.getDay() !== wd) d.setDate(d.getDate() - 1); return D.toISO(d); }
  function usFederal(y) { // US federal holidays by rule (the actual day, not the observed weekday)
    const f = (mm, dd) => y + '-' + String(mm).padStart(2, '0') + '-' + String(dd).padStart(2, '0');
    return [[f(1, 1), 'New Year’s Day'], [nthWeekday(y, 0, 1, 3), 'Martin Luther King Jr. Day'], [nthWeekday(y, 1, 1, 3), 'Presidents’ Day'], [lastWeekday(y, 4, 1), 'Memorial Day'],
      [f(6, 19), 'Juneteenth'], [f(7, 4), 'Independence Day'], [nthWeekday(y, 8, 1, 1), 'Labor Day'], [nthWeekday(y, 9, 1, 2), 'Columbus Day'], [f(11, 11), 'Veterans Day'],
      [nthWeekday(y, 10, 4, 4), 'Thanksgiving Day'], [f(12, 25), 'Christmas Day']].map(([d, n]) => ({ start: d, end: d, name: n }));
  }
  const BUILTIN_HOLIDAYS = {
    ae: [ // Cabinet Resolution 27/2024; Hijri dates are expected until the moon sighting
      { start: '2026-12-02', end: '2026-12-03', name: 'Eid Al Etihad (National Day)' },
      { start: '2027-01-01', end: '2027-01-01', name: 'New Year’s Day' },
      { start: '2027-03-09', end: '2027-03-11', name: 'Eid Al Fitr', expected: true },
      { start: '2027-05-15', end: '2027-05-15', name: 'Arafat Day', expected: true },
      { start: '2027-05-16', end: '2027-05-18', name: 'Eid Al Adha', expected: true },
      { start: '2027-06-06', end: '2027-06-06', name: 'Islamic New Year', expected: true },
      { start: '2027-08-14', end: '2027-08-14', name: 'Prophet Muhammad’s Birthday', expected: true },
      { start: '2027-12-02', end: '2027-12-03', name: 'Eid Al Etihad (National Day)' }],
    us: null, // computed by rule each year
    kr: [ // 2027 almanac (KASA); substitute days included
      { start: '2026-12-25', end: '2026-12-25', name: 'Christmas Day' },
      { start: '2027-01-01', end: '2027-01-01', name: 'New Year’s Day' },
      { start: '2027-02-06', end: '2027-02-09', name: 'Seollal (Lunar New Year)' },
      { start: '2027-03-01', end: '2027-03-01', name: 'Independence Movement Day' },
      { start: '2027-05-05', end: '2027-05-05', name: 'Children’s Day' },
      { start: '2027-05-13', end: '2027-05-13', name: 'Buddha’s Birthday' },
      { start: '2027-06-06', end: '2027-06-06', name: 'Memorial Day' },
      { start: '2027-07-17', end: '2027-07-17', name: 'Constitution Day' }, { start: '2027-07-19', end: '2027-07-19', name: 'Constitution Day (substitute)' },
      { start: '2027-08-15', end: '2027-08-15', name: 'Liberation Day' }, { start: '2027-08-16', end: '2027-08-16', name: 'Liberation Day (substitute)' },
      { start: '2027-09-14', end: '2027-09-16', name: 'Chuseok' },
      { start: '2027-10-03', end: '2027-10-03', name: 'National Foundation Day' }, { start: '2027-10-04', end: '2027-10-04', name: 'National Foundation Day (substitute)' },
      { start: '2027-10-09', end: '2027-10-09', name: 'Hangeul Day' },
      { start: '2027-12-25', end: '2027-12-25', name: 'Christmas Day' }, { start: '2027-12-27', end: '2027-12-27', name: 'Christmas Day (substitute)' }]
  };
  function fallbackHolidays(c) {
    if (c === 'us') { const y = new Date().getFullYear(); return usFederal(y - 1).concat(usFederal(y), usFederal(y + 1)); }
    return BUILTIN_HOLIDAYS[c] || [];
  }
  let holCache = {};
  try { holCache = JSON.parse(localStorage.getItem(HOL_KEY) || '{}') || {}; } catch (e) { }
  const holidayData = c => (holCache[c] && holCache[c].list && holCache[c].list.length) ? holCache[c].list : fallbackHolidays(c);
  function holSettings() {
    const h = Object.assign({ ae: true, us: false, kr: false }, S.settings.hol || {});
    if (S.settings.holidays === false && !S.settings.hol) h.ae = false; // older setting
    return h;
  }
  async function refreshHolidays(force) {
    if (/claude/.test(location.hostname) || location.protocol === 'file:') return;
    const on = holSettings(); let changed = false;
    for (const c of Object.keys(HOL_COUNTRIES)) {
      if (!on[c]) continue;
      if (!force && holCache[c] && Date.now() - holCache[c].at < 20 * 3600000) continue;
      try {
        const r = await fetch('/api/holidays?c=' + c, { cache: 'no-store' }); if (!r.ok) continue;
        const j = await r.json();
        if (j && Array.isArray(j.holidays) && j.holidays.length) { holCache[c] = { at: Date.now(), list: j.holidays }; changed = true; }
      } catch (e) { }
    }
    if (changed) { try { localStorage.setItem(HOL_KEY, JSON.stringify(holCache)); } catch (e) { } renderMain(); if (ui.dayPanel) renderDetail(); }
  }
  const holidayEvents = () => {
    const on = holSettings(), out = [];
    Object.keys(HOL_COUNTRIES).forEach(c => { if (on[c]) holidayData(c).forEach(h => out.push({ id: 'hol:' + c + ':' + h.start, type: 'event', holiday: true, country: c, expected: !!h.expected, title: h.name + HOL_SUFFIX[c], due: h.start, end: h.end > h.start ? h.end : undefined, steps: [], notes: '' })); });
    return out;
  };
  const events = () => S.tasks.filter(t => isEvent(t) && taskInScope(t)).concat(holidayEvents());
  // Dates (YYYY-MM-DD) on which an event happens between a and b, following its repeat.
  function occursIn(t, a, b) {
    const out = []; if (!t.due) return out;
    let d = t.due, n = 0;
    while (d <= b && n++ < 800) { if (d >= a) out.push(d); if (!t.recur) break; d = D.nextOccurrence(d, t.recur); }
    return out;
  }
  // ---- event colors: yearly = red, multi-day = purple, other events = blue (each can be overridden)
  const EVCOLORS = { red: '#d1453b', orange: '#d97706', amber: '#c99000', green: '#2f8f5b', teal: '#0f8b8d', blue: '#2f6fd6', purple: '#7c4dcc', pink: '#c2417f', gray: '#64748b' };
  const TYPE_DEFAULTS = { yearly: 'red', event: 'blue', multi: 'purple', hol: 'green', note: 'amber' };
  const TYPE_LABELS = { yearly: 'Yearly (birthdays)', event: 'Events', multi: 'Multi-day', hol: 'Holidays', note: 'Day notes' };
  const tc = k => EVCOLORS[(S.settings.typeColors || {})[k]] || EVCOLORS[TYPE_DEFAULTS[k]];
  function applyTypeColors() { const st = document.documentElement.style; st.setProperty('--note-c', tc('note')); st.setProperty('--hol-c', tc('hol')); }
  const spanLen = t => (t.end && t.due && t.end > t.due) ? D.diffDays(D.fromISO(t.end), D.fromISO(t.due)) : 0;
  function eventColor(t) {
    if (t.holiday) return tc('hol');
    if (t.color && EVCOLORS[t.color]) return EVCOLORS[t.color];
    if (t.recur && t.recur.freq === 'year') return tc('yearly');
    if (spanLen(t)) return tc('multi');
    return tc('event');
  }
  // Occurrence start dates of an event whose days overlap [a, b]
  function spansIn(t, a, b) { const L = spanLen(t); return occursIn(t, D.toISO(D.addDays(D.fromISO(a), -L)), b).map(s0 => ({ t, s: s0, e: D.toISO(D.addDays(D.fromISO(s0), L)) })); }
  // What happens on a day: one-day events, and multi-day events covering it
  function dayItems(iso) {
    const singles = [], spans = [];
    events().forEach(ev => spansIn(ev, iso, iso).forEach(sp => { if (spanLen(ev)) spans.push(sp); else singles.push(ev); }));
    singles.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    spans.sort((a, b) => a.e.localeCompare(b.e));
    return { singles, spans };
  }
  const eventsOn = iso => dayItems(iso).singles;
  // ---- birthdays & anniversaries: age / years from an optional starting year
  const BDAY_WORDS = /\b(birthday|bday|b-day)\b/i;
  const isYearly = t => !!(t.recur && t.recur.freq === 'year' && (t.recur.interval || 1) === 1);
  function ageLabel(t, occISO) {
    if (!t.since || !isYearly(t)) return '';
    const n = Number((occISO || t.due).slice(0, 4)) - t.since;
    if (n <= 0) return '';
    return BDAY_WORDS.test(t.title) ? 'turns ' + n : n + (n === 1 ? ' year' : ' years');
  }
  // ---- multi-day overlaps (time off): other people away at the same time
  function overlapsWith(t) {
    if (!spanLen(t)) return [];
    const out = [];
    S.tasks.forEach(o => { if (o !== t && isEvent(o) && spanLen(o) && spansIn(o, t.due, t.end).length) out.push(o); });
    return out;
  }
  function overlapToast(t) {
    const ov = overlapsWith(t); if (!ov.length) return false;
    toast('Heads-up: overlaps with ' + ov.slice(0, 2).map(o => o.title + ' (' + D.dueLabel(o.due) + ' – ' + D.dueLabel(o.end) + ')').join(', ') + (ov.length > 2 ? ' and ' + (ov.length - 2) + ' more' : ''), true);
    return true;
  }
  const noteFor = iso => S.tasks.find(t => isNote(t) && t.due === iso);
  const plainLinks = s => (s || '').replace(/\[\[([^\[\]\n]*)\]\]/g, '$1');
  const noteLines = t => (t.notes || t.title || '').split('\n').filter(x => !/^\t/.test(x) && !/^\[( |x|X)\]/.test(x)).map(x => x.replace(/\[\[([^\]]*)\]\]/g, '$1').trim()).filter(Boolean);
  function setDayNote(iso, text) {
    let n = noteFor(iso);
    if (!text.trim()) { if (n) S.tasks = S.tasks.filter(x => x !== n); }
    else {
      if (!n) n = newTask({ type: 'daynote', due: iso, listId: 'inbox', title: '' });
      n.notes = text; n.title = text.trim().split('\n')[0].slice(0, 80);
    }
    save();
  }
  // Keep repeating events pointed at their next occurrence, so a birthday never shows as "overdue".
  function rollEvents() {
    const T = todayISO(); let changed = false;
    S.tasks.forEach(t => {
      if (!isEvent(t) || !t.recur || !t.due) return;
      const L = spanLen(t); let d = t.due, n = 0;
      while (D.toISO(D.addDays(D.fromISO(d), L)) < T && n++ < 800) d = D.nextOccurrence(d, t.recur);
      if (d !== t.due) { const was = t.due; t.due = d; rebaseReminder(t, was, t.time); if (L) t.end = D.toISO(D.addDays(D.fromISO(d), L)); t.remindedFor = null; changed = true; }
    });
    if (changed) save();
  }
  function sortTasks(a) {
    return a.sort((x, y) => (x.due || '9999') .localeCompare(y.due || '9999') || (x.time || '99').localeCompare(y.time || '99') || x.createdAt - y.createdAt);
  }
  const notStarted = t => !!(t.start && t.start > todayISO());
  const isMyDay = t => !notStarted(t) && (t.myDay === todayISO() || (t.due && t.due <= todayISO()) || t.start === todayISO());
  const tagsOf = t => t.tags || [];
  function allTags() { const c = {}; open().forEach(t => tagsOf(t).forEach(g => c[g] = (c[g] || 0) + 1)); return Object.keys(c).sort().map(g => [g, c[g]]); }

  /* ---------- recycle bin ---------- */
  const TRASH_DAYS = 30;
  function trashTask(t, withList) {
    S.tasks = S.tasks.filter(x => x.id !== t.id);
    t.deletedAt = Date.now(); t.deletedWithList = withList || null;
    S.trash.tasks.push(t);
    if (ui.selected === t.id) ui.selected = null;
    if (ui.multi) ui.multi.delete(t.id);
  }
  function trashList(id) {
    const l = listById(id); if (!l || l.system) return;
    S.tasks.filter(t => t.listId === id).forEach(t => trashTask(t, id));
    S.lists = S.lists.filter(x => x.id !== id);
    l.deletedAt = Date.now(); S.trash.lists.push(l);
    if (ui.view === 'list:' + id) ui.view = 'myday';
  }
  function restoreList(id) {
    const l = S.trash.lists.find(x => x.id === id); if (!l) return;
    S.trash.lists = S.trash.lists.filter(x => x.id !== id);
    delete l.deletedAt;
    if (l.groupId && !groupById(l.groupId)) l.groupId = null;
    S.lists.push(l);
    S.trash.tasks.filter(t => t.deletedWithList === id).forEach(t => restoreTask(t.id));
  }
  function restoreTask(id) {
    const t = S.trash.tasks.find(x => x.id === id); if (!t) return;
    S.trash.tasks = S.trash.tasks.filter(x => x.id !== id);
    delete t.deletedAt; delete t.deletedWithList;
    if (!listById(t.listId)) { if (S.trash.lists.some(l => l.id === t.listId)) { const l = S.trash.lists.find(x => x.id === t.listId); S.trash.lists = S.trash.lists.filter(x => x !== l); delete l.deletedAt; S.lists.push(l); } else t.listId = 'inbox'; }
    const l = listById(t.listId); if (t.sectionId && !(l.sections || []).some(x => x.id === t.sectionId)) t.sectionId = null;
    S.tasks.push(t);
  }
  function purgeTrash() {
    const cut = Date.now() - TRASH_DAYS * 86400000;
    const before = S.trash.tasks.length + S.trash.lists.length;
    S.trash.tasks = S.trash.tasks.filter(t => t.deletedAt > cut);
    S.trash.lists = S.trash.lists.filter(l => l.deletedAt > cut);
    if (S.trash.tasks.length + S.trash.lists.length !== before) save();
  }
  function daysLeft(ts) { return Math.max(0, TRASH_DAYS - Math.floor((Date.now() - ts) / 86400000)); }
  function ago(ts) { const d = Math.floor((Date.now() - ts) / 86400000); return d === 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago'; }

  function newTask(o) {
    const t = Object.assign({ id: uid(), title: '', listId: 'inbox', due: null, time: null, recur: null, priority: null, myDay: null, done: false, doneAt: null, notes: '', steps: [], createdAt: Date.now(), projectId: null, reminder: null, remindedFor: null }, o);
    S.tasks.push(t); return t;
  }

  // Marks a task done, or moves a repeating task to its next date. Returns the next date for repeats.
  function finishTask(t) {
    if (t.type) return null;
    if (!t.recur) { t.done = true; t.doneAt = Date.now(); return null; }
    t.completions = (t.completions || []).concat([{ at: Date.now(), due: t.due }]).slice(-60);
    const next = D.nextOccurrence(t.due, t.recur);
    const was = t.due;
    t.due = next;
    if (t.reminder && was) rebaseReminder(t, was, t.time); else t.reminder = null;
    t.remindedFor = null;
    t.myDay = null; t.steps.forEach(x => x.done = false);
    if (t.start && t.start > next) t.start = null;
    return next;
  }
  // Missed a repeating task? Skip moves it to the next date without counting it as done.
  function skipTask(t) {
    if (!t.recur || t.type) return;
    snapshot();
    const keep = t.completions, was = t.due;
    const next = finishTask(t);
    t.completions = keep;
    t.skips = (t.skips || []).concat([{ at: Date.now(), due: was }]).slice(-60);
    save(); render(); toast('Skipped. Next one: ' + D.dueLabel(next) + (t.time ? ' ' + D.fmtTime(t.time) : ''), true);
  }
  // A short, bright two-note "ding" when a task is done (made by the app itself, no sound file). Settings can turn it off.
  let doneCtx = null;
  function playDone() {
    if (S.settings.doneSound === false) return;
    try {
      doneCtx = doneCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (doneCtx.state === 'suspended') doneCtx.resume();
      const t0 = doneCtx.currentTime, out = doneCtx.createGain(); out.gain.value = 0.22; out.connect(doneCtx.destination);
      [[1046.5, 0, 0.16], [1568, 0.075, 0.34]].forEach(([f, at, len]) => { // C6 then G6
        const o = doneCtx.createOscillator(), g = doneCtx.createGain(), o2 = doneCtx.createOscillator(), g2 = doneCtx.createGain();
        o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2; g2.gain.value = 0.18;
        g.gain.setValueAtTime(0.0001, t0 + at); g.gain.exponentialRampToValueAtTime(1, t0 + at + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len);
        o.connect(g); o2.connect(g2); g2.connect(g); g.connect(out); o.start(t0 + at); o2.start(t0 + at); o.stop(t0 + at + len + 0.02); o2.stop(t0 + at + len + 0.02);
      });
    } catch (e) { }
  }
  function completeTask(t) {
    if (t.type) return;
    snapshot();
    if (!t.done) playDone();
    if (t.done) { t.done = false; t.doneAt = null; save(); render(); toast('Marked as not done'); return; }
    if (t.recur) {
      const next = finishTask(t);
      save(); render(); toast('Done. Next one: ' + D.dueLabel(next) + (t.time ? ' ' + D.fmtTime(t.time) : ''), true);
      return;
    }
    finishTask(t);
    save(); render(); toast('Completed \u201c' + trunc(t.title, 40) + '\u201d', true);
  }
  const trunc = (s, n) => s.length > n ? s.slice(0, n - 1) + '…' : s;

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg, undoable) {
    const el = $('#toast');
    el.innerHTML = '<span>' + esc(msg) + '</span>' + (undoable && ui.undo ? '<button type="button" id="undoBtn">Undo</button>' : '');
    el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 4500);
  }

  /* ---------- views ---------- */
  const VIEWS = {
    myday: { title: 'My Day', icon: I.sun, cls: 'ico-sun' },
    upcoming: { title: 'Upcoming', icon: I.up, cls: 'ico-up' },
    calendar: { title: 'Calendar', icon: I.cal, cls: 'ico-cal' },
    all: { title: 'All tasks', icon: I.all, cls: 'ico-all' },
    notes: { title: 'Notes', icon: I.notes, cls: 'ico-notes' },
    docs: { title: 'Important Documents', icon: I.idcard, cls: 'ico-docs' },
    journal: { title: 'Journal', icon: I.journal, cls: 'ico-journal' }
  };
  function viewCount(v) {
    const o = open();
    if (v === 'myday') return o.filter(isMyDay).length;
    if (v === 'upcoming') return o.filter(t => t.due).length;
    if (v === 'all') return o.length;
    if (v === 'notes' || v === 'docs' || v === 'journal') return '';
    if (v === 'trash') return S.trash.tasks.length + S.trash.lists.length;
    return '';
  }

  /* ---------- sidebar boxes: weather, clocks, stocks, prayer, top stories, Dubai (computer only, original site only) ---------- */
  // Settings → Sidebar boxes. Saved on this computer only (not in the code or the synced data).
  const NEWS_KEY = 'tally-news', NEWS_EVERY = 10 * 60000, SIDE_KEY = 'tally-side', HIDE_KEY = 'tally-news-hidden';
  const SIDE_DEFS = [['weather', 'Weather'], ['clocks', 'Clocks'], ['stocks', 'Stocks'], ['prayer', 'Prayer times (Dubai)'], ['news', 'Top stories'], ['dubai', 'Dubai news']];
  const PRAYERS = [['fajr', 'Fajr'], ['sunrise', 'Sunrise'], ['dhuhr', 'Dhuhr'], ['asr', 'Asr'], ['maghrib', 'Maghrib'], ['isha', 'Isha']];
  const SIDE_NAME = Object.fromEntries(SIDE_DEFS);
  const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  function sideCfg() {
    const c = lsGet(SIDE_KEY, {}), def = SIDE_DEFS.map(d => d[0]);
    const order = (c.order || []).filter(v => def.includes(v)); def.forEach(v => { if (!order.includes(v)) order.push(v); });
    let syms = c.syms; if (!syms) { try { syms = (localStorage.getItem('tally-stock-symbols') || '').split(',').filter(Boolean); } catch (e) { syms = []; } } // from the first version
    const existing = c.off || (localStorage.getItem(NEWS_KEY) || localStorage.getItem('tally-stock-symbols') ? ['prayer'] : def); // new: all off
    return { order, off: new Set(existing), syms, unit: c.unit === 'F' ? 'F' : 'C',
      wx: c.wx || { name: 'Dubai', label: 'Dubai, United Arab Emirates', lat: 25.2048, lon: 55.2708 },
      clocks: c.clocks || [{ name: 'Los Angeles', tz: 'America/Los_Angeles' }, { name: 'Dubai', tz: 'Asia/Dubai' }, { name: 'Seoul', tz: 'Asia/Seoul' }],
      nTop: c.nTop || 5, nDubai: c.nDubai || 3, prayers: c.prayers || ['asr', 'maghrib', 'isha'] };
  }
  function setSide(c) { lsSet(SIDE_KEY, { order: c.order, off: [...c.off], syms: c.syms, unit: c.unit, wx: c.wx, clocks: c.clocks, nTop: c.nTop, nDubai: c.nDubai, prayers: c.prayers }); }
  let news = lsGet(NEWS_KEY, null);
  let newsBusy = false;
  const newsHost = () => location.protocol === 'https:' && !/claude/.test(location.hostname);
  const sideOn = () => { const c = sideCfg(); return c.order.filter(v => !c.off.has(v)); };
  function newsShown() { return newsHost() && !isPhone() && !!news && sideOn().length > 0; }
  function agoShort(iso) {
    const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
    if (!iso || isNaN(m)) return '';
    if (m < 1) return 'just now'; if (m < 60) return m + 'm ago';
    const h = Math.round(m / 60); return h < 24 ? h + 'h ago' : Math.round(h / 24) + 'd ago';
  }
  const head = (t, extra) => '<div class="news-head"><span>' + t + '</span>' + (extra || '') + '</div>';
  const t12 = hm => { const [h, m] = hm.split(':').map(Number); return (h % 12 || 12) + ':' + String(m).padStart(2, '0') + (h < 12 ? ' AM' : ' PM'); };
  // what time is it in a place (minutes since midnight there, and its date)
  function zoneNow(tz) {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date()).map(x => [x.type, x.value]));
    return { h: Number(p.hour) % 24, m: Number(p.minute), s: Number(p.second), date: p.year + '-' + p.month + '-' + p.day };
  }

  // Weather (Open-Meteo, no key needed)
  const WX = { 0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Cloudy', 45: 'Fog', 48: 'Fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain', 71: 'Snow', 73: 'Snow', 75: 'Snow', 80: 'Showers', 81: 'Showers', 82: 'Heavy showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm' };
  function wxIcon(code, day) {
    const sun = '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>';
    const moon = '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>';
    const cloud = '<path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.1 11 3.5 3.5 0 0 0 7 18z"/>';
    const drops = '<path d="M9 20.5l-1 2M13 20.5l-1 2M17 20.5l-1 2"/>';
    const p = code <= 1 ? (day ? sun : moon) : code === 2 ? (day ? '<g transform="translate(-3 -3) scale(.75)">' + sun + '</g>' : '<g transform="translate(-3 -3) scale(.75)">' + moon + '</g>') + cloud : code >= 51 ? cloud + drops : cloud;
    return '<svg class="wx-ico" viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';
  }
  function weatherHtml(c) {
    const w = news && news.wx, title = 'Weather · ' + esc(c.wx.name);
    if (!w || w.for !== c.wx.label) return head(title) + '<div class="stock-note">Loading…</div>';
    const T = v => Math.round(c.unit === 'F' ? v * 9 / 5 + 32 : v) + '°';
    return head(title) + '<a class="wx" href="https://www.google.com/search?q=' + encodeURIComponent('weather ' + c.wx.label) + '" target="_blank" rel="noopener noreferrer">' + wxIcon(w.code, w.day) +
      '<span class="wx-t">' + T(w.temp) + '</span><span class="wx-d"><b>' + esc(WX[w.code] || '') + '</b><span>Feels ' + T(w.feels) + ' · H ' + T(w.hi) + ' L ' + T(w.lo) + '</span><span>Humidity ' + Math.round(w.hum) + '%</span></span></a>';
  }
  async function refreshWeather() {
    const p = sideCfg().wx;
    try {
      const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + p.lat + '&longitude=' + p.lon + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto', { cache: 'no-store' });
      const j = r.ok ? await r.json() : null; if (!j || !j.current) return;
      news.wx = { for: p.label, temp: j.current.temperature_2m, feels: j.current.apparent_temperature, hum: j.current.relative_humidity_2m, code: j.current.weather_code, day: !!j.current.is_day, hi: j.daily.temperature_2m_max[0], lo: j.daily.temperature_2m_min[0], at: Date.now() };
    } catch (e) { }
  }
  // City search (Open-Meteo geocoding): name, region, country, coordinates and time zone
  let cityRes = {}, cityTimer = null;
  async function searchCities(q) {
    if (q.trim().length < 2) return [];
    try {
      const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=8&language=en&format=json&name=' + encodeURIComponent(q.trim()));
      const j = r.ok ? await r.json() : null;
      return ((j && j.results) || []).filter(x => x.timezone).map(x => ({ name: x.name, label: [x.name, x.admin1 && x.admin1 !== x.name ? x.admin1 : '', x.country].filter(Boolean).join(', '), lat: x.latitude, lon: x.longitude, tz: x.timezone }));
    } catch (e) { return []; }
  }

  // Analog clocks
  // minutes ahead of UTC right now in a time zone (for ordering clocks from earliest to latest)
  function tzOffset(tz) { const z = zoneNow(tz), [y, mo, d] = z.date.split('-').map(Number); return Math.round((Date.UTC(y, mo - 1, d, z.h, z.m) - Date.now()) / 60000); }
  const LOCAL_TZ = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dubai'; } catch (e) { return 'Asia/Dubai'; } })();
  function clockFace(tz) {
    const z = zoneNow(tz), night = z.h < 6 || z.h >= 18;
    const hand = (deg, len, w) => { const a = (deg - 90) * Math.PI / 180; return '<line x1="20" y1="20" x2="' + (20 + len * Math.cos(a)).toFixed(2) + '" y2="' + (20 + len * Math.sin(a)).toFixed(2) + '" stroke-width="' + w + '" stroke-linecap="round"/>'; };
    let ticks = ''; for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180; const r1 = i % 3 ? 16.5 : 15; ticks += '<line x1="' + (20 + r1 * Math.sin(a)).toFixed(2) + '" y1="' + (20 - r1 * Math.cos(a)).toFixed(2) + '" x2="' + (20 + 18 * Math.sin(a)).toFixed(2) + '" y2="' + (20 - 18 * Math.cos(a)).toFixed(2) + '"/>'; }
    return '<svg class="clock' + (night ? ' night' : '') + '" viewBox="0 0 40 40" aria-hidden="true"><circle class="face" cx="20" cy="20" r="19"/><g class="ticks">' + ticks + '</g><g class="hands">' +
      hand((z.h % 12) * 30 + z.m / 2, 9.5, 2.2) + hand(z.m * 6 + z.s / 10, 14, 1.5) + '</g><circle class="pin" cx="20" cy="20" r="1.6"/></svg>';
  }
  function clocksInner() {
    const home = zoneNow(LOCAL_TZ).date, list = sideCfg().clocks.slice().sort((a, b) => tzOffset(a.tz) - tzOffset(b.tz));
    if (!list.length) return '<div class="stock-note">Choose cities in Settings → Sidebar boxes.</div>';
    return list.map(({ name, tz }) => { const z = zoneNow(tz), dd = z.date === home ? '' : z.date > home ? ' +1' : ' −1';
      return '<div class="clk" title="' + esc(name) + '">' + clockFace(tz) + '<b>' + esc(name) + '</b><span>' + t12(z.h + ':' + z.m) + dd + '</span></div>'; }).join('');
  }
  const clocksHtml = () => head('Clocks') + '<div class="clocks" id="wClocks" style="grid-template-columns:repeat(' + Math.max(1, sideCfg().clocks.length) + ',1fr)">' + clocksInner() + '</div>';

  // Stocks
  function stocksHtml(c) {
    if (!c.syms.length) return head('Stocks') + '<div class="stock-note">Add stocks in Settings → Sidebar boxes.</div>';
    const q = (news && news.quotes) || {};
    let h = head('Stocks') + '<ul class="stock-list">';
    for (const sym of c.syms) {
      const x = q[sym], pct = x && x.prev ? (x.price - x.prev) / x.prev * 100 : null;
      const cls = pct == null ? '' : pct > 0.005 ? ' up' : pct < -0.005 ? ' down' : '';
      h += '<li><a href="https://finance.yahoo.com/quote/' + encodeURIComponent(sym) + '" target="_blank" rel="noopener noreferrer" title="' + esc(x && x.name || sym) + '"><span class="stock-sym">' + esc(sym) + '</span><span class="stock-px">' + (x ? '$' + x.price.toFixed(2) : '…') + '</span><span class="stock-chg' + cls + '">' + (pct == null ? '' : (pct > 0 ? '▲ ' : pct < 0 ? '▼ ' : '') + Math.abs(pct).toFixed(2) + '%') + '</span></a></li>';
    }
    const any = c.syms.map(s => q[s]).find(Boolean);
    return h + '</ul>' + (any && any.state ? '<div class="stock-note">' + esc(any.state) + '</div>' : '');
  }
  async function refreshStocks() {
    const syms = sideCfg().syms; if (!syms.length) return;
    try {
      const r = await fetch('/api/stocks?s=' + encodeURIComponent(syms.join(',')), { cache: 'no-store' });
      const j = r.ok ? await r.json() : null;
      if (j && j.quotes) news.quotes = Object.assign({}, news.quotes, j.quotes);
    } catch (e) { }
  }

  // Prayer times (Dubai)
  function prayerHtml() {
    const c = sideCfg(), p = news && news.prayer, today = zoneNow('Asia/Dubai');
    if (!c.prayers.length) return head('Prayer times · Dubai') + '<div class="stock-note">Choose prayers in Settings → Sidebar boxes.</div>';
    let d = p && p.days && p.days[today.date];
    if (!d || !d.fajr) return head('Prayer times · Dubai') + '<div class="stock-note">' + (p && p.err ? 'Couldn’t load prayer times. Trying again soon.' : 'Loading…') + '</div>';
    const mins = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
    let now = today.h * 60 + today.m, label = '';
    let list = PRAYERS.filter(x => c.prayers.includes(x[0])).map(([k, n]) => [n, d[k]]);
    // after the last one today, show tomorrow's
    if (!list.some(x => mins(x[1]) > now)) {
      const tmr = new Date(Date.UTC(...today.date.split('-').map((v, i) => i === 1 ? v - 1 : +v)) + 86400000).toISOString().slice(0, 10), d2 = p.days[tmr];
      if (d2 && d2.fajr) { d = d2; now -= 1440; label = ' · tomorrow'; list = PRAYERS.filter(x => c.prayers.includes(x[0])).map(([k, n]) => [n, d[k]]); }
    }
    const next = list.find(x => mins(x[1]) > now);
    return head('Prayer times · Dubai' + label) + '<ul class="pray">' + list.map(([n, hm]) => {
      const left = mins(hm) - now, isNext = next && next[0] === n;
      return '<li class="' + (isNext ? 'next' : left <= 0 ? 'past' : '') + '"><span>' + n + '</span><b>' + t12(hm) + '</b>' + (isNext ? '<em>in ' + (left >= 60 ? Math.floor(left / 60) + 'h ' : '') + (left % 60) + 'm</em>' : '<em></em>') + '</li>';
    }).join('') + '</ul>';
  }
  // Aladhan's Dubai method (IACAD blocks outside access). Checked against IACAD's official November 2026 times:
  // Fajr, Dhuhr, Asr and Isha match or are within a minute; Maghrib is a minute early and Sunrise 4 minutes late,
  // so those two are corrected.
  async function refreshPrayer() {
    const today = zoneNow('Asia/Dubai').date, have = news.prayer && news.prayer.days;
    const tmr = new Date(Date.parse(today + 'T12:00:00Z') + 86400000).toISOString().slice(0, 10);
    if (have && have[today] && have[today].fajr && have[tmr] && Date.now() - news.prayer.at < 12 * 3600000) return;
    const days = {};
    const hm = (v, add) => { const [h, mm] = String(v || '').slice(0, 5).split(':').map(Number); const t = h * 60 + mm + (add || 0); return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); };
    try {
      for (const ymd of [today, tmr]) {
        const [y, m] = ymd.split('-'); if (Object.keys(days).some(k => k.startsWith(y + '-' + m))) continue;
        const r = await fetch('https://api.aladhan.com/v1/calendarByCity/' + y + '/' + Number(m) + '?city=Dubai&country=AE&method=16', { cache: 'no-store' });
        const j = r.ok ? await r.json() : null;
        for (const d of (j && j.data) || []) {
          const g = String(d.date && d.date.gregorian && d.date.gregorian.date || '').split('-'); if (g.length !== 3) continue;
          const t = d.timings;
          days[g[2] + '-' + g[1] + '-' + g[0]] = { fajr: hm(t.Fajr), sunrise: hm(t.Sunrise, -4), dhuhr: hm(t.Dhuhr), asr: hm(t.Asr), maghrib: hm(t.Maghrib, 1), isha: hm(t.Isha) };
        }
      }
      news.prayer = days[today] ? { at: Date.now(), days } : Object.assign({}, news.prayer, { err: true });
    } catch (e) { news.prayer = Object.assign({}, news.prayer, { err: true }); }
  }

  // News, with an × to hide a story (it stays hidden; new stories take its place)
  const hidden = () => new Set(lsGet(HIDE_KEY, []));
  function newsList(items, n) {
    const hid = hidden(), shown = (items || []).filter(s => !hid.has(s.url)).slice(0, n);
    if (!shown.length) return '<div class="stock-note">Nothing new right now.</div>';
    return '<ol class="news-list">' + shown.map(s => '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.title) + '</a><span class="news-meta">' + esc(s.source || '') + (s.source && s.at ? ' · ' : '') + (s.at ? agoShort(s.at) : '') + '</span><button type="button" class="news-x" data-newshide="' + esc(s.url) + '" title="Hide this story" aria-label="Hide this story">' + I.x + '</button></li>').join('') + '</ol>';
  }
  const refreshBtn = () => '<button type="button" class="news-ref' + (newsBusy ? ' busy' : '') + '" id="newsRefresh" title="Refresh' + (news && news.at ? ' (updated ' + agoShort(new Date(news.at).toISOString()) + ')' : '') + '" aria-label="Refresh">↻</button>';

  function newsHtml() {
    const c = sideCfg(); let first = true;
    return c.order.filter(v => !c.off.has(v)).map(v => {
      let h = v === 'weather' ? weatherHtml(c) : v === 'clocks' ? clocksHtml() : v === 'stocks' ? stocksHtml(c) : v === 'prayer' ? prayerHtml()
        : v === 'news' ? head('Top stories', refreshBtn()) + newsList(news.stories, c.nTop) : head('Dubai') + newsList(news.dubai, c.nDubai);
      h = '<div class="wbox' + (first ? ' first' : '') + '" data-w="' + v + '">' + h + '</div>'; first = false; return h;
    }).join('');
  }
  function drawNews() { const b = $('#newsBox'); if (b) { if (newsShown()) b.innerHTML = newsHtml(); else renderSide(); } else if (newsShown()) renderSide(); }
  async function refreshNews(force) {
    if (newsBusy || !newsHost() || isPhone()) return;
    const on = sideOn(), c0 = sideCfg(); if (!on.length) return;
    const fresh = news && news.v === 6 && Date.now() - news.at < NEWS_EVERY;
    const missing = !news || (on.includes('weather') && (!news.wx || news.wx.for !== c0.wx.label)) || (on.includes('prayer') && !(news.prayer && news.prayer.days && Object.values(news.prayer.days)[0] && Object.values(news.prayer.days)[0].fajr)) || ((on.includes('news') || on.includes('dubai')) && !(news.stories || []).length);
    if (!force && !missing && fresh) return;
    newsBusy = true; if (news) drawNews();
    const old = news || {};
    news = { v: 6, at: Date.now(), stories: old.stories || [], dubai: old.dubai || [], quotes: old.quotes || {}, wx: old.wx, prayer: old.prayer };
    try {
      await Promise.all([
        (on.includes('news') || on.includes('dubai')) && fetch('/api/news', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => { if (j && (j.stories || []).length) { news.stories = j.stories; news.dubai = j.dubai || []; } }).catch(() => { }),
        on.includes('weather') && refreshWeather(), on.includes('stocks') && refreshStocks(), on.includes('prayer') && refreshPrayer()]);
      lsSet(NEWS_KEY, news);
    } catch (e) { } finally { newsBusy = false; }
    drawNews();
  }

  // Settings → Sidebar boxes
  const cityBox = (kind, ph) => '<div class="cityq"><input class="ctl" data-cityq="' + kind + '" placeholder="' + ph + '" autocomplete="off" aria-label="' + ph + '"><div class="cityres" id="cityRes-' + kind + '"></div></div>';
  function sideSheetHtml() {
    const c = sideCfg(), arrows = (attr, k, n, name) => '<button type="button" class="iconbtn" data-' + attr + '="' + k + ':-1"' + (k === 0 ? ' disabled' : '') + ' aria-label="Move ' + esc(name) + ' up">' + I.chev + '</button><button type="button" class="iconbtn down" data-' + attr + '="' + k + ':1"' + (k === n - 1 ? ' disabled' : '') + ' aria-label="Move ' + esc(name) + ' down">' + I.chev + '</button>';
    const num = (id, val, max) => '<select class="ctl sbnum" id="' + id + '">' + Array.from({ length: max }, (_, k) => '<option' + (k + 1 === val ? ' selected' : '') + '>' + (k + 1) + '</option>').join('') + '</select>';
    const clocks = c.clocks.slice().sort((a, b) => tzOffset(a.tz) - tzOffset(b.tz));
    return '<div class="sheet narrow sbsheet" role="dialog" aria-modal="true" aria-labelledby="sbTitle"><div class="sheet-head"><h2 id="sbTitle">Sidebar boxes</h2><button type="button" class="iconbtn" data-close="1" aria-label="Close">' + I.x + '</button></div><div class="sheet-body">' +
      '<div class="field"><span class="field-label">Show and order</span><p class="hint" style="margin:0 0 6px">Shown under Recently deleted on this computer. Tick a box to show it.</p><div class="pglist">' +
      c.order.map((v, k) => '<div class="pgrow' + (c.off.has(v) ? ' off' : '') + '"><label class="chk"><input type="checkbox" data-sbon="' + v + '"' + (c.off.has(v) ? '' : ' checked') + '> ' + esc(SIDE_NAME[v]) + '</label><span class="spacer"></span>' + arrows('sbmove', k, c.order.length, SIDE_NAME[v]) + '</div>').join('') + '</div></div>' +
      '<div class="field"><span class="field-label">Weather city</span><div class="pglist"><div class="pgrow"><b>' + esc(c.wx.label) + '</b></div></div>' + cityBox('wx', 'Change city: start typing, e.g. London') +
      '<div class="seg" role="group" aria-label="Temperature" style="margin-top:8px">' + [['C', '°C'], ['F', '°F']].map(([k, n]) => '<button type="button" data-sbunit="' + k + '" aria-pressed="' + (c.unit === k) + '">' + n + '</button>').join('') + '</div></div>' +
      '<div class="field"><span class="field-label">Clocks (up to 4, shown earliest to latest)</span><div class="pglist">' + (clocks.length ? clocks.map(k => '<div class="pgrow"><b>' + esc(k.name) + '</b><span class="hint" style="margin:0 0 0 8px">' + t12(zoneNow(k.tz).h + ':' + zoneNow(k.tz).m) + '</span><span class="spacer"></span><button type="button" class="iconbtn" data-clkdel="' + esc(k.tz + '|' + k.name) + '" aria-label="Remove ' + esc(k.name) + '">' + I.x + '</button></div>').join('') : '<p class="hint" style="margin:4px 0">No clocks yet.</p>') + '</div>' +
      (c.clocks.length < 4 ? cityBox('clk', 'Add a city: start typing, e.g. London') : '') + '</div>' +
      '<div class="field"><span class="field-label">Stocks</span><div class="pglist">' + (c.syms.length ? c.syms.map((s, k) => '<div class="pgrow"><b>' + esc(s) + '</b><span class="spacer"></span>' + arrows('stmove', k, c.syms.length, s) + '<button type="button" class="iconbtn" data-stdel="' + k + '" aria-label="Remove ' + esc(s) + '">' + I.x + '</button></div>').join('') : '<p class="hint" style="margin:4px 0">No stocks yet.</p>') + '</div>' +
      '<form class="stock-form" id="stockAdd" style="margin-top:8px"><input id="stockSym" class="ctl" placeholder="Add a symbol, e.g. AAPL" autocomplete="off" aria-label="Stock symbol"><button type="submit" class="chipbtn">Add</button></form></div>' +
      '<div class="field"><span class="field-label">Prayer times to show</span><div class="praychk">' + PRAYERS.map(([k, n]) => '<label class="chk"><input type="checkbox" data-sbpray="' + k + '"' + (c.prayers.includes(k) ? ' checked' : '') + '> ' + n + '</label>').join('') + '</div></div>' +
      '<div class="field"><span class="field-label">How many stories</span><div class="sbnums"><label>Top stories ' + num('sbTop', c.nTop, 15) + '</label><label>Dubai ' + num('sbDubai', c.nDubai, 10) + '</label></div></div>' +
      (lsGet(HIDE_KEY, []).length ? '<button type="button" class="linkbtn" data-sbunhide="1">Show the ' + lsGet(HIDE_KEY, []).length + ' hidden news stories again</button>' : '') +
      '<p class="hint">These settings are just for this computer.</p></div></div>';
  }
  function openSideSheet() { const el = $('#sheet'); el.innerHTML = sideSheetHtml(); el.hidden = false; }
  function bindSide() {
    const el = $('#sheet');
    const redraw = c => { if (c) setSide(c); el.innerHTML = sideSheetHtml(); renderSide(); refreshNews(true); };
    const move = (arr, k, d) => { const j = k + d; if (j < 0 || j >= arr.length) return false; [arr[k], arr[j]] = [arr[j], arr[k]]; return true; };
    el.addEventListener('click', e => {
      if (!$('#sbTitle')) return;
      const c = sideCfg();
      const sm = e.target.closest('[data-sbmove]'); if (sm) { const [k, d] = sm.dataset.sbmove.split(':').map(Number); if (move(c.order, k, d)) redraw(c); return; }
      const tm = e.target.closest('[data-stmove]'); if (tm) { const [k, d] = tm.dataset.stmove.split(':').map(Number); if (move(c.syms, k, d)) redraw(c); return; }
      const sd = e.target.closest('[data-stdel]'); if (sd) { c.syms.splice(Number(sd.dataset.stdel), 1); redraw(c); return; }
      const su = e.target.closest('[data-sbunit]'); if (su) { c.unit = su.dataset.sbunit; redraw(c); return; }
      if (e.target.closest('[data-sbunhide]')) { lsSet(HIDE_KEY, []); redraw(); return; }
      const cd = e.target.closest('[data-clkdel]'); if (cd) { const [tz, name] = cd.dataset.clkdel.split('|'); c.clocks = c.clocks.filter(k => !(k.tz === tz && k.name === name)); redraw(c); return; }
      const cp = e.target.closest('[data-citypick]'); if (cp) { const [kind, k] = cp.dataset.citypick.split(':'); pickCity(c, kind, (cityRes[kind] || [])[Number(k)]); }
    });
    const pickCity = (c, kind, r) => {
      if (!r) return;
      if (kind === 'wx') c.wx = { name: r.name, label: r.label, lat: r.lat, lon: r.lon };
      else if (!c.clocks.some(k => k.tz === r.tz && k.name === r.name)) c.clocks = c.clocks.concat([{ name: r.name, tz: r.tz }]).slice(0, 4);
      cityRes = {}; redraw(c);
      const q = el.querySelector('[data-cityq="' + kind + '"]'); if (q) q.focus();
    };
    el.addEventListener('input', e => {
      const kind = e.target.dataset && e.target.dataset.cityq; if (!kind) return;
      clearTimeout(cityTimer); const q = e.target.value;
      cityTimer = setTimeout(async () => {
        const list = await searchCities(q); cityRes[kind] = list;
        const box = $('#cityRes-' + kind); if (!box) return;
        box.innerHTML = list.map((r, k) => '<button type="button" data-citypick="' + kind + ':' + k + '">' + esc(r.label) + (kind === 'clk' ? '<small>' + t12(zoneNow(r.tz).h + ':' + zoneNow(r.tz).m) + '</small>' : '') + '</button>').join('') || (q.trim().length >= 2 ? '<div class="hint" style="padding:6px 10px">No matches</div>' : '');
      }, 250);
    });
    el.addEventListener('keydown', e => {
      const kind = e.target.dataset && e.target.dataset.cityq; if (!kind || e.key !== 'Enter') return;
      e.preventDefault(); pickCity(sideCfg(), kind, (cityRes[kind] || [])[0]);
    });
    el.addEventListener('change', e => {
      if (!$('#sbTitle')) return;
      const c = sideCfg(), t = e.target;
      if (t.dataset.sbon) { t.checked ? c.off.delete(t.dataset.sbon) : c.off.add(t.dataset.sbon); redraw(c); }
      if (t.dataset.sbpray) { const set = new Set(c.prayers); t.checked ? set.add(t.dataset.sbpray) : set.delete(t.dataset.sbpray); c.prayers = PRAYERS.map(p => p[0]).filter(k => set.has(k)); redraw(c); }
      if (t.id === 'sbTop') { c.nTop = Number(t.value); redraw(c); }
      if (t.id === 'sbDubai') { c.nDubai = Number(t.value); redraw(c); }
    });
    el.addEventListener('submit', e => {
      if (e.target.id !== 'stockAdd') return; e.preventDefault();
      const c = sideCfg(), add = ($('#stockSym').value || '').toUpperCase().split(/[\s,;]+/).filter(x => /^[A-Z0-9.^=-]{1,12}$/.test(x) && !c.syms.includes(x));
      c.syms = c.syms.concat(add).slice(0, 12); redraw(c); const i = $('#stockSym'); if (i) i.focus();
    });
    $('#menu').addEventListener('click', e => { if (e.target.closest('[data-mact="sidebar"]')) { e.stopPropagation(); ui.menu = null; renderMenu(); openSideSheet(); } }, true);
    document.addEventListener('click', e => {
      if (!e.target.closest) return;
      if (e.target.closest('#newsRefresh')) { e.preventDefault(); refreshNews(true); }
      const x = e.target.closest('[data-newshide]');
      if (x) { e.preventDefault(); const list = lsGet(HIDE_KEY, []); list.push(x.dataset.newshide); lsSet(HIDE_KEY, list.slice(-300)); drawNews(); }
    });
    // clocks and the "in 1h 20m" prayer countdown tick along
    setInterval(() => { const k = $('#wClocks'); if (k) k.innerHTML = clocksInner(); const p = document.querySelector('.wbox[data-w="prayer"]'); if (p) { p.innerHTML = prayerHtml(); if (news && news.prayer && !(news.prayer.days || {})[zoneNow('Asia/Dubai').date]) refreshNews(true); } }, 20000);
  }

  /* ---------- sidebar ---------- */
  function renderSide() {
    let h = '<nav class="nav">';
    const overdue = open().filter(t => t.due && t.due < todayISO()).length;
    for (const v of ['myday', 'calendar', 'all', 'notes', 'journal']) {
      const c = viewCount(v);
      h += '<button type="button" class="nav-item" data-view="' + v + '" aria-current="' + (!ui.search && (ui.view === v || (v === 'notes' && paperView(ui.view)) || (v === 'journal' && ui.view === 'jlink'))) + '"><span class="' + VIEWS[v].cls + '">' + VIEWS[v].icon + '</span><span class="label">' + VIEWS[v].title + '</span>' +
        (c !== '' && c ? '<span class="count' + ((v === 'myday' || v === 'all') && overdue ? ' hot' : '') + '">' + c + '</span>' : '') + '</button>';
    }
    const listRow = (l) => {
      if (ui.editing && ui.editing.type === 'list' && ui.editing.id === l.id) return '<input class="nav-input" id="navEdit" value="' + esc(l.name) + '" aria-label="List name">';
      const c = S.tasks.filter(t => !t.done && !t.type && t.listId === l.id).length;
      return '<div class="nav-item" role="button" tabindex="0" data-view="list:' + l.id + '" aria-current="' + (!ui.search && ui.view === 'list:' + l.id) + '">' +
        '<span class="dot" style="background:' + l.color + '"></span>' +
        '<span class="label">' + esc(l.name) + '</span>' + (c ? '<span class="count">' + c + '</span>' : '') +
        (l.system ? '' : '<button type="button" class="dots" data-menu="list:' + l.id + '" aria-label="List options">' + I.dots + '</button>') + '</div>';
    };
    const extra = S.lists.filter(l => !l.system);
    const addingList = ui.editing && ui.editing.type === 'newlist';
    if (extra.length || addingList) {
      h += '<div class="nav-sep"></div><div class="group-head"><span class="glabel">Lists</span></div>';
      S.lists.forEach(l => h += listRow(l));
      if (addingList) h += '<input class="nav-input" id="navEdit" placeholder="List name" aria-label="New list name">';
    }
    h += '<div class="nav-sep"></div>' + (addingList ? '' : '<button type="button" class="nav-add" data-newlist="">' + I.plus + 'New list</button>') +
      '<button type="button" class="nav-item quiet" data-view="done" aria-current="' + (!ui.search && ui.view === 'done') + '"><span class="ico-all">' + I.done + '</span><span class="label">Completed</span></button>' +
      '<button type="button" class="nav-item quiet" data-view="trash" aria-current="' + (!ui.search && ui.view === 'trash') + '"><span class="ico-all">' + I.trash + '</span><span class="label">Recently deleted</span>' + (viewCount('trash') ? '<span class="count">' + viewCount('trash') + '</span>' : '') + '</button></nav>';
    if (newsShown()) h = h.replace('<nav class="nav">', '<nav class="nav has-news">') + '<section class="news" id="newsBox" aria-label="Sidebar boxes">' + newsHtml() + '</section>';
    h += '<div class="side-foot"><div id="syncLine" class="syncline">' + syncLineHtml() + '</div><div class="row"><button type="button" class="chipbtn" id="settingsBtn" data-menu="settings:">Settings</button><button type="button" class="chipbtn" id="copyBackup">Copy backup</button></div></div>';
    $('#sideBody').innerHTML = h;
    updateBadge();
    const ne = $('#navEdit'); if (ne) { ne.focus(); ne.select(); }
  }

  /* ---------- main ---------- */
  function eventRow(t, opts = {}) {
    const occ = opts.occ || t.due, meta = [], L = spanLen(t);
    if (occ && L) meta.push('<span>' + I.cal + esc(D.dueLabel(t.due)) + ' \u2192 ' + esc(D.dueLabel(t.end)) + ' (' + (L + 1) + ' days)</span>');
    else if (occ) meta.push('<span class="' + (occ === todayISO() ? 'today' : '') + '">' + I.cal + esc(D.dueLabel(occ)) + (t.time ? ' ' + D.fmtTime(t.time) : '') + '</span>');
    if (t.holiday) meta.push('<span>' + HOL_COUNTRIES[t.country || 'ae'] + ' public holiday' + (t.expected ? ' \u00b7 expected, may shift with the moon sighting' : '') + '</span>');
    if (t.recur) meta.push('<span>' + I.repeat + esc(D.recurText(t.recur)) + '</span>');
    if (t.reminder) meta.push('<span>' + I.bell + esc(D.reminderLabel(t.reminder)) + '</span>');
    if (t.notes) meta.push('<span>' + I.note + 'Note</span>');
    if (t.holiday) return '<div class="task event holiday"><span class="evicon" style="color:' + eventColor(t) + '">' + I.star + '</span><div class="tbody" data-dayopen="' + (opts.occ || t.due) + '" role="button" tabindex="0"><div class="ttitle">' + esc(unbr(t.title)) + '</div><div class="tmeta">' + meta.join('') + '</div></div></div>';
    return '<div class="task event' + (ui.selected === t.id ? ' sel' : '') + '" data-id="' + t.id + '"' + (occ ? ' data-occ="' + occ + '"' : '') + ' draggable="false">' +
      '<span class="evicon" title="Event" style="color:' + eventColor(t) + '">' + I.star + '</span>' +
      '<div class="tbody" data-act="open" role="button" tabindex="0"><div class="ttitle">' + esc(unbr(t.title)) + (ageLabel(t, occ) ? ' <span class="age">' + esc(ageLabel(t, occ)) + '</span>' : '') + '</div><div class="tmeta">' + meta.join('') + '</div></div>' +
      '<button type="button" class="iconbtn morebtn" data-act="more" aria-label="More actions">' + I.dots + '</button></div>';
  }
  function noteRow(t) {
    return '<div class="task note" data-id="' + t.id + '" draggable="false"><span class="evicon" style="color:' + tc('note') + '">' + (isMeet(t) ? I.meet : I.note) + '</span>' +
      '<div class="tbody" data-jopen="' + t.due + '" role="button" tabindex="0"><div class="ttitle">' + esc(t.title.replace(/\[\[|\]\]/g, '')) + '</div><div class="tmeta"><span>' + (isMeet(t) ? 'Meeting' : 'Journal') + ' \u00b7 ' + esc(D.dueLabel(t.due)) + '</span></div></div></div>';
  }
  function spanPills(spans) {
    if (!spans || !spans.length) return '';
    return '<div class="spanline">' + spans.map(sp => '<button type="button" class="spanpill" ' + (sp.t.holiday ? 'data-dayopen="' + sp.s + '"' : 'data-open="' + sp.t.id + '"') + ' style="--c:' + eventColor(sp.t) + '" title="' + esc(sp.t.title) + ', ' + esc(D.dueLabel(sp.s)) + ' to ' + esc(D.dueLabel(sp.e)) + '">' + esc(sp.t.title) + '<span>until ' + esc(D.dueLabel(sp.e)) + '</span></button>').join('') + '</div>';
  }
  function taskRow(t, opts = {}) {
    if (isNote(t)) return noteRow(t);
    if (isEvent(t)) return eventRow(t, opts);
    const l = listById(t.listId);
    const meta = [];
    if (t.due) {
      const cls = t.due < todayISO() && !t.done ? 'over' : t.due === todayISO() ? 'today' : '';
      meta.push('<span class="' + cls + '">' + I.cal + esc(D.dueLabel(t.due)) + (t.time ? ' ' + D.fmtTime(t.time) : '') + '</span>');
    }
    if (t.recur) meta.push('<span>' + I.repeat + esc(D.recurText(t.recur)) + '</span>');
    if (notStarted(t) && !t.done) meta.push('<span class="later-lbl">' + I.up + 'Starts ' + esc(D.dueLabel(t.start)) + '</span>');
    if (isWaiting(t)) meta.push(waitChip(t));
    if (t.reminder && !t.done && !t.expFor && !(isWaiting(t) && nudgeRem(t))) meta.push('<span>' + I.bell + esc(D.reminderLabel(t.reminder)) + '</span>');
    if (t.myDay === todayISO() && ui.view !== 'myday') meta.push('<span class="myday">' + I.sun + 'My Day</span>');
    if (t.steps.length) meta.push('<button type="button" class="stepfold' + (t.fold ? '' : ' open') + '" data-stepfold="' + t.id + '" title="' + (t.fold ? 'Show steps' : 'Hide steps') + '">' + I.steps + t.steps.filter(s => s.done).length + ' of ' + t.steps.length + I.chev + '</button>');
    if ((t.attachments || []).length) meta.push('<span>' + I.clip + t.attachments.length + '</span>');
    if (t.jFrom) { const src = taskById(t.jFrom); if (src && isNote(src)) meta.push('<span class="jfrom" data-jopen="' + src.due + '" title="Open in the journal">' + I.journal + 'Journal</span>'); else if (src && isPage(src)) meta.push('<span class="jfrom" data-jlink="' + esc(src.title) + '" title="Open the page">' + I.journal + esc(src.title) + '</span>'); }
    if (t.notes) meta.push('<span>' + I.note + 'Note</span>');
    if (opts.showList && l && S.lists.length > 1) meta.push('<span><span class="dot" style="background:' + l.color + ';margin:0;width:8px;height:8px"></span>' + esc(l.name) + '</span>');
    return '<div class="task' + (t.done ? ' done' : '') + (ui.selected === t.id ? ' sel' : '') + (ui.multi.has(t.id) ? ' msel' : '') + (notStarted(t) && !t.done ? ' later' : '') + '" data-id="' + t.id + '" draggable="' + !t.done + '">' +
      '<button type="button" class="check" data-act="toggle" aria-label="' + (t.done ? 'Mark not done' : 'Complete') + ': ' + esc(t.title) + '">' + I.check + '</button>' +
      '<div class="tbody" data-act="open" role="button" tabindex="0"><div class="ttitle">' + linkify(t.title) + '</div>' + (meta.length ? '<div class="tmeta">' + meta.join('') + '</div>' : '') + (!t.done && t.steps.length && !t.fold ? '<div class="isteps">' + t.steps.map(st => '<div class="istep' + (st.done ? ' done' : '') + '"><button type="button" class="check small" data-stepdone="' + t.id + ':' + st.id + '" aria-label="' + (st.done ? 'Mark not done' : 'Complete') + ': ' + esc(st.title) + '">' + I.check + '</button><span>' + esc(st.title) + '</span></div>').join('') + '</div>' : '') + '</div>' +
      (nudgeDue(t) ? '<button type="button" class="skipbtn" data-act="followed" title="You chased them: Tally nudges you again in ' + (t.waiting.every || 3) + ' days">Followed up</button>' : '') +
      (!t.done && t.recur && t.due && t.due < todayISO() ? '<button type="button" class="skipbtn" data-act="skip" title="Didn\u2019t do it? Skip to the next one (' + esc(D.dueLabel(D.nextOccurrence(t.due, t.recur))) + ')">Skip</button>' : '') +
      (t.done ? '' : '<button type="button" class="iconbtn sunbtn' + (t.myDay === todayISO() ? ' on' : '') + '" data-act="myday" aria-label="' + (t.myDay === todayISO() ? 'Remove from My Day' : 'Add to My Day') + '" title="' + (t.myDay === todayISO() ? 'Remove from My Day' : 'Add to My Day') + '">' + I.sun + '</button>') +
      '<button type="button" class="iconbtn morebtn" data-act="more" aria-label="More actions" title="More actions (or right-click)">' + I.dots + '</button></div>';
  }
  function section(title, tasks, opts = {}) {
    if (!tasks.length && !opts.keep && !(opts.spans && opts.spans.length)) return '';
    const key = opts.key;
    const collapsible = !!key;
    const shown = !collapsible || (ui.showDone[key] ?? !!opts.open);
    const head = collapsible
      ? '<div class="section-head"><button type="button" data-done-toggle="' + key + '" aria-expanded="' + !!shown + '">' + I.chev + esc(title) + ' <span class="n">' + tasks.length + '</span></button></div>'
      : '<div class="section-head' + (opts.overdue ? ' overdue' : '') + '">' + esc(title) + ' <span class="n">' + (tasks.length + ((opts.spans || []).length)) + '</span>' + (opts.action || '') + '</div>';
    if (opts.spans && opts.spans.length && !tasks.length) return '<div class="section">' + head + spanPills(opts.spans) + '</div>';
    return '<div class="section">' + head + (opts.spans ? spanPills(opts.spans) : '') + (shown ? '<div class="tasks"' + (opts.reorder ? ' data-reorder="1"' : '') + (opts.sectionId !== undefined ? ' data-section="' + esc(opts.sectionId) + '"' : '') + '>' + tasks.map(t => taskRow(t, isEvent(t) && opts.day ? Object.assign({}, opts, { occ: opts.day }) : opts)).join('') + '</div>' : '') + '</div>';
  }
  function headingSection(sc, tasks, reorder) {
    const head = ui.hEdit === sc.id
      ? '<input class="nav-input" id="hEdit" value="' + esc(sc.name) + '" data-hid="' + sc.id + '" aria-label="Heading name">'
      : '<div class="section-head heading" data-hdrop="' + sc.id + '">' + esc(sc.name) + ' <span class="n">' + tasks.length + '</span><span class="hbtns"><button type="button" class="iconbtn" data-hrename="' + sc.id + '" aria-label="Rename heading" title="Rename">' + I.edit + '</button><button type="button" class="iconbtn" data-hdel="' + sc.id + '" aria-label="Remove heading" title="Remove heading (tasks stay)">' + I.x + '</button></span></div>';
    return '<div class="section">' + head + '<div class="tasks' + (tasks.length ? '' : ' dropzone') + '"' + (reorder ? ' data-reorder="1"' : '') + ' data-section="' + sc.id + '"' + (tasks.length ? '' : ' data-hdrop="' + sc.id + '"') + '>' +
      (tasks.length ? tasks.map(t => taskRow(t)).join('') : '<div class="drophint">Drag tasks here</div>') + '</div></div>';
  }
  function repRow(t, c, skipped) {
    const l = listById(t.listId);
    if (skipped) return '<div class="task done rep skiprow"><span class="check skipcheck">' + I.right + '</span><div class="tbody" data-open="' + t.id + '" role="button" tabindex="0"><div class="ttitle">' + esc(unbr(t.title)) + '</div><div class="tmeta"><span class="skiplbl">Skipped</span><span>' + (c.due ? 'was due ' + esc(D.dueLabel(c.due)) : '') + '</span></div></div></div>';
    return '<div class="task done rep"><span class="check donecheck">' + I.check + '</span><div class="tbody" data-open="' + t.id + '" role="button" tabindex="0"><div class="ttitle">' + esc(unbr(t.title)) + '</div><div class="tmeta"><span>' + I.repeat + 'Repeating' + (c.due ? ', was due ' + esc(D.dueLabel(c.due)) : '') + '</span>' + (l ? '<span><span class="dot" style="background:' + l.color + ';margin:0;width:8px;height:8px"></span>' + esc(l.name) + '</span>' : '') + '</div></div></div>';
  }
  function empty(title, body) { return '<div class="empty"><strong>' + esc(title) + '</strong>' + esc(body) + '</div>'; }

  function renderMain() {
    // don't redraw the journal under your fingers while you type in it
    if ((ui.view === 'journal' || ui.view === 'jlink') && !ui.search && document.activeElement && document.activeElement.matches && document.activeElement.matches('#content .ol-in')) return;
    checkPlainFresh(); syncJournalTicks();
    const v = ui.view, T = todayISO();
    let title, sub = '', html = '', actions = '';
    const o = open();
    if (ui.search) {
      const q = ui.search.toLowerCase();
      const tq = q.replace(/^@/, '');
      const hit = t => !isPaper(t) && t.type !== 'vault' && t.type !== 'page' && taskInScope(t) && (attHit(t, q) || tagsOf(t).some(g => g.includes(tq)) || (q[0] !== '@' && (t.title.toLowerCase().includes(q)) ) || (t.notes || '').toLowerCase().includes(q) || t.steps.some(x => x.title.toLowerCase().includes(q)));
      const found = sortTasks(S.tasks.filter(t => !t.done && hit(t)));
      const doneFound = S.tasks.filter(t => t.done && hit(t)).sort((a, b) => b.doneAt - a.doneAt);
      title = 'Search'; sub = '\u201c' + ui.search + '\u201d';
      const pHit = S.tasks.filter(n => isPage(n) && (n.title + '\n' + n.notes).toLowerCase().includes(q));
      const nHit = S.tasks.filter(n => isPaper(n) && paperText(n).includes(q)).sort((a, b) => (b.editedAt || 0) - (a.editedAt || 0));
      html = section('Open', found, { showList: true }) + (pHit.length ? '<div class="section"><div class="section-head">Pages <span class="n">' + pHit.length + '</span></div><div class="tasks">' + pHit.map(pageRow).join('') + '</div></div>' : '') + (nHit.length ? '<div class="section"><div class="section-head">Notes and documents <span class="n">' + nHit.length + '</span></div><div class="tasks">' + nHit.map(noteRowForSearch).join('') + '</div></div>' : '') + section('Completed', doneFound, { key: 'searchdone', showList: true });
      if (!found.length && !doneFound.length && !nHit.length && !pHit.length) html = empty('No matches', 'Nothing has \u201c' + ui.search + '\u201d in its title, steps or notes.');
    } else if (v === 'myday') {
      title = 'My Day';
      const d = new Date(); sub = D.WD_LONG[d.getDay()] + ', ' + D.MON_SHORT[d.getMonth()] + ' ' + d.getDate();
      const od = o.filter(t => !notStarted(t));
      const over = sortTasks(od.filter(t => t.due && t.due < T));
      const today = sortTasks(od.filter(t => t.due === T));
      const added = sortTasks(od.filter(t => (t.myDay === T || t.start === T) && !(t.due && t.due <= T)));
      const di = dayItems(T);
      html = section('Follow up', sortTasks(o.filter(nudgeDue)), { showList: true }) + section('Today\u2019s events', di.singles, { day: T, spans: di.spans }) + section('Overdue', over, { overdue: true, showList: true, action: '<button type="button" class="sect-act" data-resched="1">Move all to today</button>' }) + section('Due today', today, { showList: true }) + section('Added to My Day or starting today', added, { showList: true });
      const doneToday = S.tasks.filter(t => t.done && taskInScope(t) && t.doneAt && D.toISO(new Date(t.doneAt)) === T);
      const in3 = D.toISO(D.addDays(new Date(), 3));
      const sugg = sortTasks(od.filter(t => t.due && t.due > T && t.due <= in3 && t.myDay !== T && t.start !== T));
      html += section('Suggestions: due in the next 3 days', sugg, { key: 'sugg', open: true, showList: true });
      html += section('Completed today', doneToday, { key: 'myday', showList: true });
      if (!over.length && !today.length && !added.length) html = empty('Nothing planned for today', 'Tap the sun on any task to add it here, or type "today" in the box above.') + html;
    } else if (v === 'upcoming') {
      title = 'Upcoming'; sub = 'Next two weeks';
      const over = sortTasks(o.filter(t => t.due && t.due < T));
      html += section('Overdue', over, { overdue: true, showList: true, action: '<button type="button" class="sect-act" data-resched="1">Move all to today</button>' });
      for (let i = 0; i < 14; i++) {
        const iso = D.toISO(D.addDays(new Date(), i));
        const di = dayItems(iso);
        const ts = di.singles.concat(sortTasks(o.filter(t => t.due === iso)));
        const d = D.fromISO(iso);
        const lbl = (i === 0 ? 'Today · ' : i === 1 ? 'Tomorrow · ' : '') + D.WD_LONG[d.getDay()] + ', ' + D.MON_SHORT[d.getMonth()] + ' ' + d.getDate();
        html += section(lbl, ts, { showList: true, day: iso, spans: di.spans.filter(sp => sp.s === iso || i === 0) });
      }
      const end = D.toISO(D.addDays(new Date(), 13));
      html += section('Later', sortTasks(o.filter(t => t.due && t.due > end)), { showList: true });
      if (!html) html = empty('No dates yet', 'Tasks with a due date show up here.');
    } else if (v === 'all') {
      title = 'All tasks'; sub = o.length + ' open';
      const multi = S.lists.length > 1;
      const iso = n => D.toISO(D.addDays(new Date(), n));
      const T1 = iso(1), T7 = iso(7);
      const byOrder = (a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt);
      const opt = { showList: multi };
      html = section('Overdue', sortTasks(o.filter(t => t.due && t.due < T)), Object.assign({ overdue: true, action: '<button type="button" class="sect-act" data-resched="1">Move all to today</button>' }, opt)) +
        section('Today', dayItems(T).singles.concat(sortTasks(o.filter(t => t.due === T))), Object.assign({ day: T, spans: dayItems(T).spans }, opt)) +
        section('Tomorrow', dayItems(T1).singles.concat(sortTasks(o.filter(t => t.due === T1))), Object.assign({ day: T1, spans: dayItems(T1).spans.filter(sp => sp.s === T1) }, opt)) +
        section('Waiting on others', o.filter(isWaiting).sort((a, b) => (a.waiting.nudge || '').localeCompare(b.waiting.nudge || '')), opt) +
        section('No date', o.filter(t => !t.due && !isWaiting(t)).sort(byOrder), opt) +
        section('Next 7 days', sortTasks(o.filter(t => t.due > T1 && t.due <= T7)), opt) +
        section('Later', sortTasks(o.filter(t => t.due > T7)), opt);
      if (!html) html = empty('All clear', 'Nothing to do. Type a task in the box above to add one.');
      const weekAgo = Date.now() - 7 * 86400000;
      html += section('Completed in the last 7 days', S.tasks.filter(t => t.done && taskInScope(t) && t.doneAt > weekAgo).sort((a, b) => b.doneAt - a.doneAt), { key: 'log', showList: multi });
    } else if (v === 'calendar') {
      title = 'Calendar'; html = renderCalendar();
    } else if (v === 'done') {
      title = 'Completed';
      const entries = [];
      S.tasks.forEach(t => {
        if (!taskInScope(t)) return;
        if (t.done && t.doneAt) entries.push({ t, at: t.doneAt });
        (t.completions || []).forEach(c => entries.push({ t, at: c.at, rep: c }));
        (t.skips || []).forEach(c => entries.push({ t, at: c.at, rep: c, skipped: true }));
      });
      entries.sort((a, b) => b.at - a.at);
      const nSkip = entries.filter(e => e.skipped).length;
      sub = (entries.length - nSkip) + ' completed' + (nSkip ? ', ' + nSkip + ' skipped' : '');
      const lim = ui.doneLimit || 200, byDay = new Map();
      entries.slice(0, lim).forEach(e => { const k = D.toISO(new Date(e.at)); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(e); });
      byDay.forEach((es, k) => {
        const lbl = D.dueLabel(k) + (['Today', 'Yesterday'].includes(D.dueLabel(k)) ? '' : '');
        html += '<div class="section"><div class="section-head">' + esc(lbl) + ' <span class="n">' + es.length + '</span></div><div class="tasks">' +
          es.map(e => e.rep ? repRow(e.t, e.rep, e.skipped) : taskRow(e.t, { showList: true })).join('') + '</div></div>';
      });
      if (entries.length > lim) html += '<div class="more-wrap"><button type="button" class="chipbtn" data-more-done="1">Show older</button></div>';
      if (!entries.length) html = empty('Nothing completed yet', 'Tasks you finish show up here, newest first. Click a checkmark to bring a task back.');
    } else if (v === 'notes' || v === 'notes-archive') {
      ({ title, sub, html, actions } = renderNotes(v === 'notes-archive'));
    } else if (v === 'docs') {
      ({ title, sub, html, actions } = renderDocs());
    } else if (v === 'journal') {
      ({ title, sub, html, actions } = renderJournal());
    } else if (v === 'jlink') {
      ({ title, sub, html, actions } = renderLinkPage(ui.jlink || ''));
    } else if (v === 'trash') {
      title = 'Recently deleted'; sub = 'Removed for good after ' + TRASH_DAYS + ' days';
      const tl = S.trash.lists.slice().sort((a, b) => b.deletedAt - a.deletedAt);
      const tt = S.trash.tasks.filter(t => !(t.deletedWithList && tl.some(l => l.id === t.deletedWithList))).sort((a, b) => b.deletedAt - a.deletedAt);
      const listName = id => (listById(id) || S.trash.lists.find(l => l.id === id) || { name: 'Inbox' }).name;
      if (tl.length) html += '<div class="section"><div class="section-head">Lists <span class="n">' + tl.length + '</span></div><div class="tasks">' + tl.map(l => {
        const n = S.trash.tasks.filter(t => t.deletedWithList === l.id).length;
        return '<div class="task trow"><span class="dot" style="background:' + l.color + ';margin-top:5px"></span><div class="tbody static"><div class="ttitle">' + esc(l.name) + '</div><div class="tmeta"><span>List with ' + n + ' task' + (n === 1 ? '' : 's') + '</span><span>Deleted ' + ago(l.deletedAt) + '</span><span>' + daysLeft(l.deletedAt) + ' days left</span></div></div>' +
          '<button type="button" class="chipbtn" data-restore-list="' + l.id + '">' + I.restore + 'Restore</button><button type="button" class="danger-btn" data-forever-list="' + l.id + '">Delete forever</button></div>';
      }).join('') + '</div></div>';
      if (tt.length) html += '<div class="section"><div class="section-head">Tasks <span class="n">' + tt.length + '</span></div><div class="tasks">' + tt.map(t =>
        '<div class="task trow"><span class="check ghostcheck"></span><div class="tbody static"><div class="ttitle">' + esc(isPaper(t) ? noteTitle(t) : unbr(t.title)) + '</div><div class="tmeta"><span>' + (isPaper(t) ? (isDoc(t) ? 'Document' : 'Note') : 'From ' + esc(listName(t.listId))) + '</span><span>Deleted ' + ago(t.deletedAt) + '</span><span>' + daysLeft(t.deletedAt) + ' days left</span></div></div>' +
        '<button type="button" class="chipbtn" data-restore-task="' + t.id + '">' + I.restore + 'Restore</button><button type="button" class="danger-btn" data-forever-task="' + t.id + '">Delete forever</button></div>').join('') + '</div></div>';
      if (!tl.length && !tt.length) html = empty('Nothing here', 'Deleted tasks and lists wait here for ' + TRASH_DAYS + ' days, in case you change your mind.');
      else actions = '<button type="button" class="chipbtn" data-empty-trash="1">Empty now</button>';
    } else if (v.startsWith('tag:')) {
      const g = v.slice(4);
      title = '@' + g; sub = 'Tag';
      const ts = sortTasks(o.filter(t => tagsOf(t).includes(g)));
      html = section('Open', ts, { showList: true });
      html += section('Completed', S.tasks.filter(t => t.done && taskInScope(t) && tagsOf(t).includes(g)).sort((a, b) => b.doneAt - a.doneAt), { key: 'tagdone', showList: true });
      if (!ts.length) html = empty('No open tasks with @' + g, 'Add @' + g + ' when you type a task, or in a task’s Tags box.') + html;
    } else if (v.startsWith('list:')) {
      const l = listById(v.slice(5));
      if (!l) { ui.view = 'myday'; return renderMain(); }
      title = l.name; const g = groupById(l.groupId); sub = g ? g.name : '';
      const ts = o.filter(t => t.listId === l.id);
      const sort = l.sort || 'default', secs = l.sections || [];
      const byOrder = (a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt);
      const sorter = a => sort === 'due' ? sortTasks(a) : sort === 'alpha' ? a.sort((x, y) => x.title.localeCompare(y.title)) : sort === 'created' ? a.sort((x, y) => y.createdAt - x.createdAt) : sortTasks(a.filter(t => t.due)).concat(a.filter(t => !t.due).sort(byOrder));
      if (!secs.length) {
        if (sort === 'default') {
          const withDate = sortTasks(ts.filter(t => t.due)), noDate = ts.filter(t => !t.due).sort(byOrder);
          html = section('Scheduled', withDate) + section(withDate.length ? 'No date (drag to reorder)' : 'Tasks (drag to reorder)', noDate, { reorder: true });
        } else html = section('Tasks', sorter(ts));
        if (!ts.length) html = empty('This list is empty', 'Type a task above. It will land here.');
      } else {
        const loose = ts.filter(t => !t.sectionId || !secs.some(x => x.id === t.sectionId));
        if (loose.length) html += section('No heading', sorter(loose), { reorder: sort === 'default', sectionId: '' });
        secs.forEach(sc => html += headingSection(sc, sorter(ts.filter(t => t.sectionId === sc.id)), sort === 'default'));
      }
      if (ui.hEdit === 'new') html += '<div class="section"><input class="nav-input" id="hEdit" placeholder="Heading name, e.g. Before the trip" aria-label="New heading name"></div>';
      actions = '<label class="sortpick"><span>Sort</span><select class="ctl" id="listSort" aria-label="Sort this list">' + [['default', 'My order'], ['due', 'Due date'], ['alpha', 'Name'], ['created', 'Newest first']].map(([k, n]) => '<option value="' + k + '"' + (sort === k ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>' +
        '<button type="button" class="chipbtn" data-hadd="1">' + I.plus + 'Add heading</button>';
      const done = S.tasks.filter(t => t.done && t.listId === l.id).sort((a, b) => b.doneAt - a.doneAt);
      html += section('Completed', done, { key: l.id });
    }
    $('#viewTitle').textContent = title;
    $('#viewSub').textContent = sub;
    $('#viewActions').innerHTML = actions;
    const he = $('#hEdit'); if (he) { he.focus(); he.select(); }
    document.title = title + ' · Tally';
    $('#content').innerHTML = html;
    $('#content').classList.toggle('calview', v === 'calendar' && !ui.search);
    const onNotes = (paperView(v) || v === 'journal' || v === 'jlink') && !ui.search; if (v !== 'docs') ui.docSel = null;
    $('#content').classList.toggle('notesview', onNotes); document.body.classList.toggle('onnotes', onNotes);
    if (onNotes) { masonry(); hydrate($('#content')); requestAnimationFrame(() => { if (paperView(ui.view) && !ui.search) { masonry(); } }); }
  }

  function renderCalendar() {
    const base = ui.calMonth || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    ui.calMonth = base;
    const y = base.getFullYear(), m = base.getMonth();
    const first = new Date(y, m, 1);
    const WS = S.settings.weekStart === 1 ? 1 : 0, lead = (first.getDay() - WS + 7) % 7; // first day of the week (0 = Sunday)
    const start = D.addDays(first, -lead);
    const WEEKS = Math.ceil((lead + new Date(y, m + 1, 0).getDate()) / 7); // 4-6 rows, only what the month needs
    const startISO = D.toISO(start), endISO = D.toISO(D.addDays(start, WEEKS * 7 - 1)), T = todayISO();
    const byDay = {}, spans = [];
    const add = (iso, item) => { (byDay[iso] = byDay[iso] || []).push(item); };
    const hide = S.settings.calHide || {};
    for (const ev of events()) { if (ev.holiday && hide.hol) continue; spansIn(ev, startISO, endISO).forEach(sp => { if (spanLen(ev)) { if (!hide.multi || ev.holiday) spans.push(sp); } else if (sp.s >= startISO) add(sp.s, { t: ev, kind: 'event' }); }); }
    for (const t of open()) {
      if (!t.due) continue;
      if (t.due >= startISO && t.due <= endISO) add(t.due, { t, kind: 'task' });
    }
    for (const t of S.tasks) {
      if (t.type || !t.done || !t.due || t.recur || !taskInScope(t) || t.due < startISO || t.due > endISO) continue;
      add(t.due, { t, kind: 'task' });
      if (t.recur) { let d = t.due, n = 0; while (n++ < 80) { d = D.nextOccurrence(d, t.recur); if (d > endISO) break; if (d >= startISO) add(d, { t, kind: 'task', ghost: true }); } }
    }
    S.tasks.forEach(t => { if (t.expires && isPaper(t) && !expTask(t) && t.expires >= startISO && t.expires <= endISO) add(t.expires, { t, kind: 'expiry' }); });
    if (!hide.note) S.tasks.forEach(t => { if (isNote(t) && t.due >= startISO && t.due <= endISO) add(t.due, { t, kind: 'note' }); });
    S.tasks.forEach(t => { if (!t.type && taskInScope(t)) (t.skips || []).forEach(sk => { if (sk.due >= startISO && sk.due <= endISO) add(sk.due, { t, kind: 'skip' }); }); });
    const holDays = new Set();
    if (!hide.hol) holidayEvents().forEach(hv => { let d = hv.due; const e = hv.end || hv.due; while (d <= e) { holDays.add(d); d = D.toISO(D.addDays(D.fromISO(d), 1)); } });
    if (isPhone()) return phoneCalendar({ y, m, start, WEEKS, byDay, spans, holDays, T, WS });
    const MAXLANES = 3;
    const lg = (key, color, label, cls) => '<button type="button" class="lg' + (hide[key] ? ' off' : '') + '" data-legend="' + key + '" aria-pressed="' + !hide[key] + '" title="' + (hide[key] ? 'Show ' : 'Hide ') + label.toLowerCase() + '"><i' + (cls ? ' class="' + cls + '"' : ' style="background:' + color + '"') + '></i>' + label + '</button>';
    let h = '<div class="cal-bar"><button type="button" class="cal-title" data-menu="jump:" title="Jump to a month">' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m] + ' ' + y + I.chev + '</button>' +
      '<button type="button" class="iconbtn" data-cal="-1" aria-label="Previous month">' + I.left + '</button><button type="button" class="chipbtn" data-cal="0">Today</button><button type="button" class="iconbtn" data-cal="1" aria-label="Next month">' + I.right + '</button>' +
      '<span class="cal-legend"><span class="lgs"><i style="background:' + tc('yearly') + '"></i>Yearly</span><span class="lgs"><i style="background:' + tc('event') + '"></i>Event</span>' +
      lg('multi', tc('multi'), 'Multi-day') + lg('note', '', 'Day note', 'lg-note') + (Object.values(holSettings()).some(Boolean) ? lg('hol', tc('hol'), 'Holiday') : '') + '<span class="lgs"><i class="lt"></i>Task</span></span></div>' +
      '<div class="calwrap"><div class="cal-head">' + [0, 1, 2, 3, 4, 5, 6].map(i => '<div class="cal-dow">' + D.WD_LONG[(WS + i) % 7].slice(0, 3) + '</div>').join('') + '</div><div class="cal-weeks">';
    for (let w = 0; w < WEEKS; w++) {
      const ws = D.addDays(start, 7 * w), wsISO = D.toISO(ws), weISO = D.toISO(D.addDays(ws, 6));
      const wk = spans.filter(sp => sp.s <= weISO && sp.e >= wsISO).map(sp => ({ sp, c0: Math.max(0, D.diffDays(D.fromISO(sp.s), ws)), c1: Math.min(6, D.diffDays(D.fromISO(sp.e), ws)) }))
        .sort((a, b) => a.c0 - b.c0 || (b.c1 - b.c0) - (a.c1 - a.c0));
      const laneEnd = [], hidden = [0, 0, 0, 0, 0, 0, 0];
      wk.forEach(x => { let l = laneEnd.findIndex(e => e < x.c0); if (l < 0) { l = laneEnd.length; laneEnd.push(-1); } laneEnd[l] = x.c1; x.lane = l; if (l >= MAXLANES) for (let c = x.c0; c <= x.c1; c++) hidden[c]++; });
      const lanes = Math.min(MAXLANES, laneEnd.length);
      h += '<div class="cal-week" style="--lanes:' + lanes + '"><div class="cal-bars">' + wk.filter(x => x.lane < MAXLANES).map(x =>
        '<button type="button" class="cbar' + (x.sp.s < wsISO ? ' cl' : '') + (x.sp.e > weISO ? ' cr' : '') + '" ' + (x.sp.t.holiday ? 'data-dayopen="' + x.sp.s + '"' : 'data-open="' + x.sp.t.id + '" draggable="true" data-drag="' + x.sp.t.id + '" data-from="' + x.sp.s + '"') + ' style="grid-column:' + (x.c0 + 1) + ' / ' + (x.c1 + 2) + ';grid-row:' + (x.lane + 1) + ';--c:' + eventColor(x.sp.t) + '" title="' + esc(plainLinks(x.sp.t.title)) + ': ' + esc(D.dueLabel(x.sp.s)) + ' to ' + esc(D.dueLabel(x.sp.e)) + (x.sp.t.holiday ? '' : '. Drag to move, drag the right edge to change the end date') + '">' + esc(plainLinks(x.sp.t.title)) + '<span class="brange">' + esc(shortRange(x.sp.s, x.sp.e)) + '</span>' + (!x.sp.t.holiday && x.sp.e <= weISO ? '<span class="grip" draggable="true" data-resize="' + x.sp.t.id + '" title="Drag to change the end date"></span>' : '') + '</button>').join('') + '</div>';
      for (let i = 0; i < 7; i++) {
        const d = D.addDays(ws, i), iso = D.toISO(d);
        const items = (byDay[iso] || []).sort(calOrder);
        h += '<div class="cal-day' + (d.getMonth() !== m ? ' out' : '') + (iso === T ? ' today' : '') + (ui.dayPanel === iso ? ' picked' : '') + (holDays.has(iso) ? ' hol' : '') + '" data-day="' + iso + '"><span class="dnum">' + d.getDate() + '</span><div class="cal-items">' +
          (hidden[i] ? '<span class="hint">+' + hidden[i] + ' more away</span>' : '') +
          items.map(({ t, kind, ghost }) => {
            if (kind === 'skip') return '<button type="button" class="cchip taskchip skipped" data-open="' + t.id + '" title="' + esc(plainLinks(t.title)) + ' (skipped)"><span class="ring"></span><span class="ctext">' + esc(plainLinks(t.title)) + '</span><em>skipped</em></button>';
            if (kind === 'expiry') return '<button type="button" class="cchip expchip" data-openitem="' + t.id + '" title="' + esc(noteTitle(t)) + ' expires">' + I.idcard + '<span class="ctext">' + esc(noteTitle(t)) + ' expires</span></button>';
            if (kind === 'note' && isMeet(t)) return t.evId && items.some(x => x.kind === 'event' && x.t.id === t.evId) ? '' : '<button type="button" class="cchip notechip meetchip" data-dayopen="' + iso + '" title="Meeting notes: ' + esc(mName(t) || 'Meeting') + '">' + I.meet + (t.time ? '<b>' + D.fmtTime(t.time) + '</b> ' : '') + esc(mName(t) || 'Meeting') + '</button>';
            if (kind === 'note') { // each line of a day note is its own entry
              const ls = noteLines(t), MAXL = 5, show = ls.length > MAXL ? ls.slice(0, MAXL - 1) : ls;
              return show.map(l => '<button type="button" class="cchip notechip" data-dayopen="' + iso + '" title="' + esc(t.notes || '') + '">' + I.note + esc(l) + '</button>').join('') + (ls.length > MAXL ? '<button type="button" class="cchip notechip more" data-dayopen="' + iso + '">+' + (ls.length - show.length) + ' more</button>' : '');
            }
            if (kind === 'event') return '<button type="button" class="cchip evchip" ' + (t.holiday ? 'data-dayopen="' + iso + '"' : 'data-open="' + t.id + '" draggable="true" data-drag="' + t.id + '" data-from="' + iso + '"') + ' style="--c:' + eventColor(t) + '" title="' + esc(plainLinks(t.title)) + (ageLabel(t, iso) ? ' (' + esc(ageLabel(t, iso)) + ')' : '') + '">' + (t.time ? D.fmtTime(t.time) + ' ' : '') + esc(plainLinks(t.title)) + (ageLabel(t, iso) ? ' \u00b7 ' + esc(ageLabel(t, iso).replace('turns ', '')) : '') + (items.some(x => x.kind === 'note' && x.t.evId === t.id) ? '<span class="evmeet" title="Has meeting notes">' + I.meet + '</span>' : '') + '</button>';
            return '<button type="button" class="cchip taskchip' + (ghost ? ' ghost' : '') + (t.done ? ' done' : '') + (!ghost && !t.done && iso < T ? ' over' : '') + '" data-open="' + t.id + '"' + (ghost ? '' : ' draggable="true" data-drag="' + t.id + '" data-from="' + iso + '"') + ' title="' + esc(plainLinks(t.title)) + (ghost ? ' (repeats)' : '') + '"><span class="ring"></span><span class="ctext">' + (t.time ? '<b>' + D.fmtTime(t.time) + '</b> ' : '') + esc(plainLinks(t.title)) + '</span></button>';
          }).join('') + '</div></div>';
      }
      h += '</div>';
    }
    h += '</div></div><div class="cal-note">' + I.cal + '<span>Click a day to write a note for it or add an event. Multi-day events show as one bar. Your tasks and events (not day notes) also go to Outlook through Settings → Show tasks in Outlook or Google.</span></div>';
    return h;
  }

  // Phone: a compact month (dots for what's on each day) with the picked day's agenda underneath.
  function phoneCalendar({ y, m, start, WEEKS, byDay, spans, holDays, T, WS }) {
    const inMonth = iso => { const d = D.fromISO(iso); return d.getFullYear() === y && d.getMonth() === m; };
    const pick = ui.calPick && inMonth(ui.calPick) ? ui.calPick : (inMonth(T) ? T : D.toISO(new Date(y, m, 1)));
    ui.calPickShown = pick;
    let h = '<div class="cal-bar pcal-bar"><button type="button" class="cal-title" data-menu="jump:" title="Jump to a month">' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m] + ' ' + y + I.chev + '</button><span class="spacer"></span>' +
      '<button type="button" class="iconbtn" data-cal="-1" aria-label="Previous month">' + I.left + '</button><button type="button" class="chipbtn" data-cal="0">Today</button><button type="button" class="iconbtn" data-cal="1" aria-label="Next month">' + I.right + '</button></div>' +
      '<div class="pcal"><div class="pcal-head">' + [0, 1, 2, 3, 4, 5, 6].map(i => '<span>' + D.WD_LONG[(WS + i) % 7].slice(0, 2) + '</span>').join('') + '</div><div class="pcal-weeks">';
    // Like a phone month view in Google Calendar: short names in each day, multi-day events as labeled bars
    const hide = S.settings.calHide || {}, LANES = 2, MAXCH = 3;
    for (let w = 0; w < WEEKS; w++) {
      const ws = D.addDays(start, 7 * w), wsISO = D.toISO(ws), weISO = D.toISO(D.addDays(ws, 6));
      const wk = spans.filter(sp => sp.s <= weISO && sp.e >= wsISO && !(sp.t.holiday && hide.hol)).map(sp => ({ sp, c0: Math.max(0, D.diffDays(D.fromISO(sp.s), ws)), c1: Math.min(6, D.diffDays(D.fromISO(sp.e), ws)) }))
        .sort((x, z) => x.c0 - z.c0 || (z.c1 - z.c0) - (x.c1 - x.c0));
      const laneEnd = [], hidden = [0, 0, 0, 0, 0, 0, 0];
      wk.forEach(x => { let l = laneEnd.findIndex(e => e < x.c0); if (l < 0) { l = laneEnd.length; laneEnd.push(-1); } laneEnd[l] = x.c1; x.lane = l; if (l >= LANES) for (let c = x.c0; c <= x.c1; c++) hidden[c]++; });
      const lanes = Math.min(LANES, laneEnd.length);
      h += '<div class="pweek" style="--lanes:' + lanes + '"><div class="pbars">' + wk.filter(x => x.lane < LANES).map(x =>
        '<span class="pbar' + (x.sp.s < wsISO ? ' cl' : '') + (x.sp.e > weISO ? ' cr' : '') + '" style="grid-column:' + (x.c0 + 1) + ' / ' + (x.c1 + 2) + ';grid-row:' + (x.lane + 1) + ';--c:' + eventColor(x.sp.t) + '">' + esc(plainLinks(x.sp.t.title)) + '</span>').join('') + '</div>';
      for (let c = 0; c < 7; c++) {
        const d = D.addDays(ws, c), iso = D.toISO(d);
        const items = [].concat(...(byDay[iso] || []).filter(x => x.kind !== 'skip').map((x, k, all) => x.kind === 'note' ? (isMeet(x.t) ? (x.t.evId && all.some(z => z.kind === 'event' && z.t.id === x.t.evId) ? [] : [{ t: x.t, kind: 'note', line: (x.t.time ? D.fmtTime(x.t.time) + ' ' : '') + (mName(x.t) || 'Meeting'), meet: true }]) : noteLines(x.t).map(l => ({ t: x.t, kind: 'note', line: l }))) : [x])).sort(calOrder);
        const chip = ({ t, kind, ghost, line, meet }) => kind === 'note' ? '<span class="pch pnotec' + (meet ? ' pmeet' : '') + '">' + esc(line || 'Note') + '</span>'
          : kind === 'event' || kind === 'expiry' ? '<span class="pch pev" style="--c:' + (kind === 'expiry' ? '#b3261e' : eventColor(t)) + '">' + esc(kind === 'expiry' ? noteTitle(t) : t.title) + '</span>'
          : '<span class="pch ptask' + (t.done ? ' done' : '') + (ghost ? ' ghost' : '') + (!ghost && !t.done && iso < T ? ' over' : '') + '">' + esc(plainLinks(t.title)) + '</span>';
        const extra = (items.length > MAXCH ? items.length - (MAXCH - 1) : 0) + hidden[c];
        const shown = items.slice(0, items.length > MAXCH ? MAXCH - 1 : MAXCH);
        h += '<button type="button" class="pday' + (d.getMonth() !== m ? ' out' : '') + (iso === T ? ' today' : '') + (iso === pick ? ' sel' : '') + (holDays.has(iso) ? ' hol' : '') + '" data-pick="' + iso + '" style="grid-column:' + (c + 1) + '" aria-label="' + esc(D.WD_LONG[d.getDay()] + ', ' + D.MON_SHORT[d.getMonth()] + ' ' + d.getDate()) + (items.length ? ', ' + items.length + ' item' + (items.length === 1 ? '' : 's') : '') + '">' +
          '<span class="pnum">' + d.getDate() + '</span><span class="pchips">' + shown.map(chip).join('') + (extra > 0 ? '<span class="pmore">+' + extra + '</span>' : '') + '</span></button>';
      }
      h += '</div>';
    }
    h += '</div></div>';
    // Agenda for the picked day
    const pd = D.fromISO(pick), di = dayItems(pick), jes = entriesFor(pick).filter(x => x.notes || isMeet(x));
    const tasksDue = S.tasks.filter(t => !t.type && t.due === pick && taskInScope(t)).sort((a, b) => (a.done - b.done) || (a.time || '99').localeCompare(b.time || '99'));
    const ghosts = (byDay[pick] || []).filter(x => x.kind === 'task' && x.ghost).map(x => x.t);
    const skips = (byDay[pick] || []).filter(x => x.kind === 'skip').map(x => x.t);
    const rows = di.spans.filter(sp => !hide.multi || sp.t.holiday).filter(sp => !(sp.t.holiday && hide.hol)).map(sp => eventRow(sp.t, { occ: sp.s })).join('') +
      di.singles.filter(t => !(t.holiday && hide.hol)).map(t => eventRow(t, { occ: pick })).join('') +
      tasksDue.map(t => taskRow(t)).join('') +
      ghosts.map(t => '<div class="task ghostrow" data-id="' + t.id + '"><span class="check ghostcheck"></span><div class="tbody" data-act="open" role="button" tabindex="0"><div class="ttitle">' + esc(unbr(t.title)) + '</div><div class="tmeta"><span>' + I.repeat + 'Repeats' + (t.time ? ' · ' + D.fmtTime(t.time) : '') + '</span></div></div></div>').join('') +
      skips.map(t => '<div class="task skiprow" data-id="' + t.id + '"><span class="check skipcheck"></span><div class="tbody" data-act="open" role="button" tabindex="0"><div class="ttitle">' + esc(unbr(t.title)) + '</div><div class="tmeta"><span class="skiplbl">Skipped</span></div></div></div>').join('');
    h += '<div class="pagenda"><div class="section-head pag-head"><span>' + (pick === T ? 'Today · ' : '') + D.WD_LONG[pd.getDay()] + ', ' + D.MON_SHORT[pd.getMonth()] + ' ' + pd.getDate() + '</span>' +
      '<button type="button" class="sect-act" data-dayopen="' + pick + '">' + (jes.length ? 'Journal' : 'Journal or event') + '</button></div>' +
      (jes.length && !hide.note ? '<div class="pnote" data-jopen="' + pick + '">' + I.journal + '<div class="pnotes">' + jes.map(n => meetHead(n) + (n.notes ? olView(n) : '')).join('<hr class="jsep">') + '</div></div>' : '') +
      (rows ? '<div class="tasks">' + rows + '</div>' : '<p class="hint pempty">Nothing on this day. Type in the box below to add a task, or tap “Note or event”.</p>') + '</div>';
    return h;
  }

  function shortRange(a, b) { const A = D.fromISO(a), B = D.fromISO(b); const f = d => D.MON_SHORT[d.getMonth()] + ' ' + d.getDate(); return f(A) + ' \u2013 ' + (A.getMonth() === B.getMonth() && A.getFullYear() === B.getFullYear() ? B.getDate() : f(B)) + (A.getFullYear() !== B.getFullYear() ? ', ' + B.getFullYear() : ''); }
  function awayPanelHtml() {
    const base = ui.calMonth || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const a = D.toISO(base), b = D.toISO(new Date(base.getFullYear(), base.getMonth() + 1, 0));
    const list = [];
    S.tasks.forEach(t => { if (isEvent(t) && spanLen(t)) spansIn(t, a, b).forEach(sp => list.push(sp)); });
    list.sort((x, y) => x.s.localeCompare(y.s) || x.e.localeCompare(y.e));
    const ov = sp => list.filter(o => o !== sp && o.s <= sp.e && o.e >= sp.s).map(o => o.t.title);
    return '<div class="d-scroll"><div class="d-title"><div class="daytitle">Who’s away in ' + D.MON_SHORT[base.getMonth()] + ' ' + base.getFullYear() + '</div><button type="button" class="iconbtn" data-dact="close" aria-label="Close">' + I.x + '</button></div>' +
      (list.length ? '<div class="tasks">' + list.map(sp => { const o = ov(sp); const n = D.diffDays(D.fromISO(sp.e), D.fromISO(sp.s)) + 1;
        return '<div class="task awayrow" data-id="' + sp.t.id + '"><span class="dot" style="background:' + eventColor(sp.t) + ';margin-top:6px"></span><div class="tbody" data-act="open" role="button" tabindex="0"><div class="ttitle">' + esc(unbr(sp.t.title)) + '</div><div class="tmeta"><span>' + esc(D.dueLabel(sp.s)) + ' – ' + esc(D.dueLabel(sp.e)) + ' · ' + n + ' day' + (n === 1 ? '' : 's') + '</span>' + (o.length ? '<span class="ovl">Overlaps ' + esc(o.join(', ')) + '</span>' : '') + '</div></div></div>'; }).join('') + '</div>'
        : '<p class="hint">No multi-day events this month.</p>') +
      '<p class="hint">Add time off by typing a range, e.g. “Ali vacation dec 20 - dec 31”.</p></div>';
  }
  function dayPanelHtml(iso) {
    const di = dayItems(iso), T = todayISO();
    const tasks = S.tasks.filter(t => !t.type && t.due === iso && taskInScope(t)).sort((a, b) => (a.done - b.done) || (a.time || '99').localeCompare(b.time || '99'));
    const d = D.fromISO(iso);
    return '<div class="d-scroll">' +
      '<div class="d-title"><span class="evicon big" style="color:' + tc('note') + '">' + I.note + '</span><div class="daytitle">' + D.WD_LONG[d.getDay()] + ', ' + D.MON_SHORT[d.getMonth()] + ' ' + d.getDate() + (d.getFullYear() !== new Date().getFullYear() ? ', ' + d.getFullYear() : '') + '</div><button type="button" class="iconbtn" data-dact="close" aria-label="Close">' + I.x + '</button></div>' +
      '<div class="field"><span class="field-label">Journal</span>' + jEntry(iso, true) + '<span class="hint">Saved as you type. Just for you: the journal isn\u2019t sent to Outlook.</span></div>' +
      '<button type="button" class="toggle-row" data-dayadd="1">' + I.star + 'Add an event on this day</button>' +
      ((di.singles.length || di.spans.length) ? '<div class="field"><span class="field-label">Events</span><div class="tasks">' + di.spans.map(sp => eventRow(sp.t, { occ: sp.s })).join('') + di.singles.map(t => eventRow(t, { occ: iso })).join('') + '</div></div>' : '') +
      (tasks.length ? '<div class="field"><span class="field-label">Tasks due' + (iso < T ? '' : '') + '</span><div class="tasks">' + tasks.map(t => taskRow(t)).join('') + '</div></div>' : '') +
      '</div>';
  }

  /* ---------- detail ---------- */
  // Notes and Important Documents open like Google Keep on a computer: a big card in the middle, the rest dimmed.
  function paperModal(on) {
    const el = $('#detail'); el.classList.toggle('paper-modal', on);
    let bg = $('#paperBg');
    if (!bg) { bg = document.createElement('div'); bg.id = 'paperBg'; bg.className = 'paper-bg'; bg.hidden = true; document.body.appendChild(bg); bg.addEventListener('click', () => { ui.selected = null; render(); }); }
    bg.hidden = !on;
  }
  function renderDetail() {
    const el = $('#detail');
    const t = ui.selected && taskById(ui.selected);
    paperModal(!!t && isPaper(t) && !isPhone());
    if (!t) {
      if (ui.dayPanel) { el.hidden = false; el.innerHTML = dayPanelHtml(ui.dayPanel); return; }
      el.hidden = true; return;
    }
    el.hidden = false;
    if (isEvent(t)) { el.innerHTML = eventDetail(t); autosize($('#dTitle')); return; }
    if (isPaper(t)) { const keep = el.dataset.open === t.id; el.dataset.open = t.id; el.innerHTML = isDoc(t) ? docEditor(t) : noteEditor(t); autosize($('#nBody')); hydrate(el); if (!keep && !isPhone() && el.classList.contains('paper-modal')) { const b = $('#nBody'); if (b && !b.hidden && !(t.title || t.body)) b.focus(); } return; }
    const T = todayISO();
    const groupsOpts = (() => {
      let s = '';
      const ungrouped = S.lists.filter(l => !l.groupId);
      ungrouped.forEach(l => s += '<option value="' + l.id + '"' + (l.id === t.listId ? ' selected' : '') + '>' + esc(l.name) + '</option>');
      S.groups.forEach(g => { s += '<optgroup label="' + esc(g.name) + '">'; S.lists.filter(l => l.groupId === g.id).forEach(l => s += '<option value="' + l.id + '"' + (l.id === t.listId ? ' selected' : '') + '>' + esc(l.name) + '</option>'); s += '</optgroup>'; });
      return s;
    })();
    el.innerHTML = '<div class="d-scroll">' +
      '<div class="d-title"><button type="button" class="check" data-dact="toggle" aria-label="Complete">' + I.check + '</button><textarea id="dTitle" rows="1" aria-label="Task title">' + esc(t.title) + '</textarea><button type="button" class="iconbtn" data-dact="close" aria-label="Close details">' + I.x + '</button></div>' +
      '<div class="card steps">' + t.steps.map(s => '<div class="step' + (s.done ? ' done' : '') + '" data-step="' + s.id + '"><button type="button" class="check" data-sact="toggle" aria-label="Complete step">' + I.check + '</button><span>' + esc(s.title) + '</span><button type="button" class="iconbtn" data-sact="del" aria-label="Delete step">' + I.x + '</button></div>').join('') +
      '<input id="dStep" placeholder="+ Add step" aria-label="Add step"></div>' +
      '<button type="button" class="toggle-row' + (t.myDay === T ? ' on' : '') + '" data-dact="myday">' + I.sun + (t.myDay === T ? 'Added to My Day' : 'Add to My Day') + '</button>' +
      '<div class="field"><span class="field-label">Due</span><div class="row2"><input type="date" class="ctl" id="dDue" value="' + (t.due || '') + '" aria-label="Due date"><input type="time" class="ctl" id="dTime" value="' + (t.time || '') + '" aria-label="Time"' + (t.due ? '' : ' disabled') + '></div>' +
      '<div class="presets">' + [['today', 'Today'], ['tomorrow', 'Tomorrow'], ['nextweek', 'Next week'], ['weekend', 'Weekend']].map(([k, n]) => '<button type="button" class="chipbtn' + (t.due && t.due === quickDate(k) ? ' on' : '') + '" data-qdate="' + k + '">' + n + '</button>').join('') + '</div>' +
      (t.due ? '<span class="hint">' + esc(D.dueLabel(t.due)) + (t.time ? ' at ' + D.fmtTime(t.time) : '') + ' · <button type="button" class="example" data-dact="cleardue">Clear date</button></span>' : '') + '</div>' +
      '<div class="field"><label for="dStart">Start date <span class="hint">(hidden from My Day until then)</span></label><input type="date" class="ctl" id="dStart" value="' + (t.start || '') + '">' +
      '<div class="presets">' + [['tomorrow', 'Tomorrow'], ['nextweek', 'Next week'], ['weekend', 'Weekend']].map(([k, n]) => '<button type="button" class="chipbtn' + (t.start && t.start === quickDate(k) ? ' on' : '') + '" data-sdate="' + k + '">' + n + '</button>').join('') + (t.start ? '<button type="button" class="chipbtn" data-sdate="clear">No start date</button>' : '') + '</div></div>' +
      waitingField(t) +
      (isWaiting(t) && nudgeRem(t) ? '' : reminderField(t)) +
      repeatField(t) +
      '<div class="field"><label for="dList">List</label><select class="ctl" id="dList">' + groupsOpts + '</select></div>' +
      (((listById(t.listId) || {}).sections || []).length ? '<div class="field"><label for="dSection">Heading</label><select class="ctl" id="dSection"><option value="">No heading</option>' + listById(t.listId).sections.map(x => '<option value="' + x.id + '"' + (t.sectionId === x.id ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select></div>' : '') +
      '<div class="field"><label for="dNotes">Notes</label><textarea class="ctl" id="dNotes" placeholder="Add a note. Links you paste become clickable below.">' + esc(t.notes) + '</textarea><div class="links" id="dLinks">' + linksHtml(t) + '</div></div>' + attField(t) +
      '</div><div class="d-foot"><span>Created ' + esc(D.dueLabel(D.toISO(new Date(t.createdAt)))) + ' \u00b7 <button type="button" class="linkbtn" data-dact="toevent">Make it an event</button></span><span class="spacer"></span>' +
      (ui.confirmDelete ? '<span>Delete this task?</span><button type="button" class="danger-btn" data-dact="nodel">Keep</button><button type="button" class="danger-btn solid" data-dact="del">Delete</button>' : '<button type="button" class="danger-btn" data-dact="askdel">' + 'Delete' + '</button>') + '</div>';
    autosize($('#dTitle'));
  }
  function eventDetail(t) {
    return '<div class="d-scroll">' +
      '<div class="d-title"><span class="evicon big" title="Event">' + I.star + '</span><textarea id="dTitle" rows="1" aria-label="Event title">' + esc(t.title) + '</textarea><button type="button" class="iconbtn" data-dact="close" aria-label="Close details">' + I.x + '</button></div>' +
      '<div class="evnote">Event: shows on your calendar, no checkbox. <button type="button" class="linkbtn" data-dact="totask">Make it a task instead</button></div>' +
      '<div class="field"><span class="field-label">' + (t.end ? 'Starts' : 'Date') + '</span><div class="row2"><input type="date" class="ctl" id="dDue" value="' + (t.due || '') + '" aria-label="Date"><input type="time" class="ctl" id="dTime" value="' + (t.time || '') + '" aria-label="Time (optional)"' + (t.end ? ' disabled title="Multi-day events are all-day"' : '') + '></div><span class="hint">' + (t.end ? 'Multi-day events are all-day.' : 'Leave the time empty for an all-day event.') + '</span></div>' +
      '<div class="field"><label for="dEnd">Ends <span class="hint">(for multi-day events, like a vacation)</span></label><input type="date" class="ctl" id="dEnd" value="' + (t.end || '') + '" min="' + (t.due || '') + '"><span class="hint">' + (t.end ? (spanLen(t) + 1) + ' days. <button type="button" class="example" data-dact="noend">Make it one day</button>' : 'Leave empty for a one-day event.') + '</span></div>' +
      '<div class="field"><span class="field-label">Color</span><div class="swatches">' + '<button type="button" class="swatch-btn auto' + (!t.color ? ' on' : '') + '" data-evcolor="" title="Automatic">Auto</button>' +
      Object.entries(EVCOLORS).map(([k, c]) => '<button type="button" class="swatch-btn' + (t.color === k ? ' on' : '') + '" data-evcolor="' + k + '" style="background:' + c + '" aria-label="' + k + '" title="' + k[0].toUpperCase() + k.slice(1) + '"></button>').join('') + '</div><span class="hint">Auto uses your colors from Settings (yearly, multi-day, events).</span></div>' +
      repeatField(t) +
      (isYearly(t) ? '<div class="field"><label for="dSince">' + (BDAY_WORDS.test(t.title) ? 'Year born' : 'Since (year)') + ' <span class="hint">(optional)</span></label><input type="number" class="ctl" id="dSince" min="1900" max="' + new Date().getFullYear() + '" placeholder="e.g. 1985" value="' + (t.since || '') + '"><span class="hint">' + (ageLabel(t, t.due) ? 'Shows \u201c' + esc(ageLabel(t, t.due)) + '\u201d on ' + esc(D.dueLabel(t.due)) + '.' : 'Add it to see the age or number of years.') + '</span></div>' : '') +
      (spanLen(t) && overlapsWith(t).length ? '<div class="evnote">Also away during this time: ' + overlapsWith(t).map(o => esc(o.title) + ' (' + esc(D.dueLabel(o.due)) + ' \u2013 ' + esc(D.dueLabel(o.end)) + ')').join(', ') + '</div>' : '') +
      reminderField(t) + meetField(t) +
      '<div class="field"><label for="dNotes">Notes</label><textarea class="ctl" id="dNotes" placeholder="Add a note. Links you paste become clickable below.">' + esc(t.notes) + '</textarea><div class="links" id="dLinks">' + linksHtml(t) + '</div></div>' + attField(t) +
      '</div><div class="d-foot"><span>Event</span><span class="spacer"></span><button type="button" class="danger-btn" data-dact="del">Delete</button></div>';
  }
  // Which day of this event the notes are for: the day it was opened from, else today if it's on today, else its date
  function evOccDay(t) {
    const T = todayISO();
    if (ui.evOcc && (ui.evOcc === t.due || (t.recur && occursIn(t, ui.evOcc, ui.evOcc).length))) return ui.evOcc;
    if (t.recur && occursIn(t, T, T).length) return T;
    return t.due || T;
  }
  function meetField(t) {
    if (!t.due || t.holiday) return '';
    const day = evOccDay(t), m = S.tasks.find(x => isMeet(x) && x.evId === t.id && x.due === day), d = D.fromISO(day);
    const name = m ? mName(m) : t.title, more = S.tasks.filter(x => isMeet(x) && mName(x) && mName(x).toLowerCase() === (name || '').trim().toLowerCase()).length;
    return '<div class="field"><span class="field-label">Meeting notes</span><button type="button" class="toggle-row" data-dact="meetnotes" data-day="' + day + '">' + I.meet + (m ? 'Open meeting notes' : 'Take meeting notes') + ' for ' + D.WD_LONG[d.getDay()].slice(0, 3) + ', ' + D.MON_SHORT[d.getMonth()] + ' ' + d.getDate() + '</button>' +
      (more > (m ? 1 : 0) ? '<button type="button" class="linkbtn" data-jlink="' + esc(name.trim()) + '">All ' + esc(name.trim()) + ' meetings (' + more + ')</button>' : '<span class="hint">Opens in the journal. Bullets, [ ] tasks and [[links]] work as usual.</span>') + '</div>';
  }
  function openMeetNotes(t, day) {
    let m = S.tasks.find(x => isMeet(x) && x.evId === t.id && x.due === day);
    if (!m) { m = newEntry(day, { meet: t.title.trim(), title: t.title.trim(), evId: t.id, time: t.time || null }); save(); }
    ui.selected = null; ui.dayPanel = null; ui.jEdit = day; ui.jNewFor = null; setView('journal'); focusMeet(m.id, false);
  }
  function focusMeet(id, name) {
    setTimeout(() => {
      const it = document.querySelector('#content .jentry.editing .jitem[data-jid="' + id + '"]') || document.querySelector('.jentry.editing .jitem[data-jid="' + id + '"]'); if (!it) return;
      const el = name ? it.querySelector('.jmeet-in') : (() => { const ins = it.querySelectorAll('.ol-line:not(.hid) .ol-in'); return ins[ins.length - 1]; })();
      if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); el.scrollIntoView({ block: 'center' }); }
    }, 40);
  }
  function repeatField(t) {
    const r = t.recur, freq = r ? r.freq : 'none', n = r ? (r.interval || 1) : 1;
    const unit = { day: ['day', 'days'], week: ['week', 'weeks'], month: ['month', 'months'], year: ['year', 'years'] }[freq];
    const special = r && ((r.byDay && r.byDay.length) || r.monthDay);
    return '<div class="field"><label for="dRecur">Repeat</label><div class="repeatrow"><select class="ctl" id="dRecur">' +
      [['none', 'Does not repeat'], ['day', 'Daily'], ['week', 'Weekly'], ['month', 'Monthly'], ['year', 'Yearly']].map(([k, nm]) => '<option value="' + k + '"' + (freq === k ? ' selected' : '') + '>' + nm + '</option>').join('') + '</select>' +
      (r ? '<label class="every" for="dEvery">Every <input type="number" class="ctl" id="dEvery" min="1" max="99" value="' + n + '"> ' + (n === 1 ? unit[0] : unit[1]) + '</label>' : '') + '</div>' +
      (r ? '<span class="hint">' + esc(D.recurText(r)) + (t.due ? ', next on ' + esc(D.dueLabel(t.due)) : '') + (!t.type && t.due ? ' \u00b7 <button type="button" class="example" data-dact="skip">Skip this one</button>' : '') + (special ? '. Set by what you typed; changing the number makes it a plain every-' + (n === 1 ? '' : n + '-') + unit[0] + ' repeat.' : '') + '</span>' : '') + '</div>';
  }
  function linksHtml(t) {
    const wiki = linksIn((t.title || '') + '\n' + (t.notes || '')).slice(0, 8).map(x => '<button type="button" class="jlink" data-jlink="' + esc(x) + '">' + esc(x) + '</button>').join('');
    return wiki + linksHtml0(t);
  }
  function linksHtml0(t) {
    const found = ((t.title || '') + ' ' + (t.notes || '')).match(/\b(?:https?:\/\/|www\.)[^\s<>"']+[^\s<>"'.,;:!?)\]]/gi) || [];
    return [...new Set(found)].slice(0, 8).map(u => { const href = /^https?:/i.test(u) ? u : 'https://' + u; let host = u; try { host = new URL(href).hostname.replace(/^www\./, ''); } catch (e) { } return '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer" title="' + esc(href) + '">' + I.link + esc(host) + '</a>'; }).join('');
  }
  // Reminder presets are kept as a rule (t.remRule) so a repeating task's next one, or a moved date, gets the same reminder.
  const REM_PRESETS = [['due', 'At due time', 1], ['15m', '15 min before', 1], ['1h', '1 hour before', 1], ['morning', 'Morning of, 6am', 0], ['1w', '1 week before', 0], ['1mo', '1 month before', 0]];
  function reminderField(t) {
    const presets = t.due ? REM_PRESETS.filter(p => !p[2] || t.time) : [];
    const auto = !t.reminder && S.settings.autoRemind && t.due && t.time;
    const bdayAuto = !t.reminder && isEvent(t) && isYearly(t) && S.settings.bdayRemind !== false;
    const rd = t.reminder ? t.reminder.slice(0, 10) : '', rt = t.reminder ? t.reminder.slice(11, 16) : '';
    return '<div class="field"><label for="dRemD">Remind me</label><div class="remrow"><input type="date" class="ctl" id="dRemD" value="' + rd + '" aria-label="Reminder date"><input type="time" class="ctl" id="dRemT" value="' + rt + '" aria-label="Reminder time"></div>' +
      '<div class="presets">' + presets.map(([k, n]) => '<button type="button" class="chipbtn' + (t.reminder && t.remRule === k ? ' on' : '') + '" data-rem="' + k + '">' + n + '</button>').join('') +
      (t.reminder ? '<button type="button" class="chipbtn" data-rem="clear">No reminder</button>' : '') + '</div>' +
      (t.reminder && t.recur && t.due ? '<span class="hint">Each next one gets the same reminder' + (t.remRule ? ' (' + esc((REM_PRESETS.find(p => p[0] === t.remRule) || [])[1] || '').toLowerCase() + ')' : '') + '.</span>' : '') +
      (bdayAuto ? '<span class="hint">Automatic reminder the day before at 6am. Change this under Settings.</span>' : auto ? '<span class="hint">Automatic reminder at the due time (' + esc(D.fmtTime(t.time)) + '). Change this under Settings.</span>' : '') + '</div>';
  }
  function ruleReminder(t, k) {
    if (!t.due) return null;
    const at = (iso, hm) => D.parseLocalDT(iso + 'T' + hm), base = t.time || '06:00';
    if (k === 'due') return t.time ? at(t.due, t.time) : null;
    if (k === '15m') return t.time ? new Date(at(t.due, t.time) - 15 * 60000) : null;
    if (k === '1h') return t.time ? new Date(at(t.due, t.time) - 60 * 60000) : null;
    if (k === 'morning') return at(t.due, '06:00');
    if (k === '1w') return at(D.toISO(D.addDays(D.fromISO(t.due), -7)), base);
    if (k === '1mo') { const d = D.fromISO(t.due), m = new Date(d.getFullYear(), d.getMonth() - 1, 1); m.setDate(Math.min(d.getDate(), new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate())); return at(D.toISO(m), base); }
    return null;
  }
  function presetReminder(t, k) {
    const d = ruleReminder(t, k);
    t.reminder = d ? D.toLocalDT(d) : null; t.remRule = d ? k : null; t.remindedFor = null;
  }
  // The due date (or time) changed: keep the reminder the same distance before it.
  function rebaseReminder(t, oldDue, oldTime) {
    if (!t.reminder) return;
    if (!t.due) { t.reminder = null; t.remRule = null; return; }
    if (t.remRule) { const d = ruleReminder(t, t.remRule); if (d) { t.reminder = D.toLocalDT(d); t.remindedFor = null; return; } }
    if (!oldDue) return;
    const offset = D.parseLocalDT(t.reminder) - D.parseLocalDT(oldDue + 'T' + (oldTime || t.time || '00:00'));
    t.reminder = D.toLocalDT(new Date(D.parseLocalDT(t.due + 'T' + (t.time || '00:00')).getTime() + offset)); t.remindedFor = null;
  }

  /* ---------- reminders engine ---------- */
  function effectiveReminder(t) {
    if (t.done) return null;
    if (t.reminder) return t.reminder;
    if (t.renewFor && t.due) return t.due + AM; // renewal/expiry tasks: a heads-up that morning, no time on the task
    if (isEvent(t) && isYearly(t) && !t.holiday && S.settings.bdayRemind !== false && t.due) return D.toISO(D.addDays(D.fromISO(t.due), -1)) + AM;
    if (S.settings.autoRemind && t.due && t.time) return t.due + 'T' + t.time;
    return null;
  }
  function notifSupported() { return typeof Notification !== 'undefined'; }
  const OSN = IS_ANDROID ? 'Phone' : 'Windows';
  function notifStatus() {
    if (!notifSupported()) return OSN + ' notifications: not available here';
    if (Notification.permission === 'granted') return OSN + ' notifications: on' + (wp.state === 'on' ? ', even when Tally is closed' : wp.state === 'nosync' || (wp.state === 'off' && !syncReady()) ? ' while Tally is open (turn on sync to get them when it\u2019s closed)' : wp.state === 'noserver' ? ' while Tally is open' : '');
    if (Notification.permission === 'denied') return OSN + ' notifications are blocked: how to fix';
    return 'Turn on ' + OSN.toLowerCase() + ' notifications';
  }
  function askNotif() {
    if (notifSupported() && Notification.permission === 'denied') { ui.menu = null; renderMenu(); openNotifHelp(); return; }
    if (notifSupported() && Notification.permission === 'granted') { pushRefresh(true).then(() => { renderMenu(); toast(wp.state === 'on' ? 'Notifications are on, even when Tally is closed' : 'Notifications are already on'); }); return; }
    if (!notifSupported()) { toast('This preview can\u2019t send notifications. Reminders pop up inside the app instead.'); return; }
    try { Notification.requestPermission().then(p => { renderMenu(); if (p === 'granted') pushRefresh(true).then(() => renderMenu()); }, () => renderMenu()); } catch (e) { toast('This preview can\u2019t send notifications. Reminders pop up inside the app instead.'); }
  }

  /* ---------- reminders when Tally is closed (web push) ---------- */
  // The server (api/push.js, run every minute by Supabase) sends each device its reminders using that device's time zone and settings.
  const wp = { state: 'unknown', key: null, busy: null };
  const PUSH_SIG = 'tally.pushsig';
  function pushSupported() { return 'serviceWorker' in navigator && 'PushManager' in window && notifSupported() && location.protocol === 'https:' && !/claude|claudeusercontent/.test(location.hostname); }
  async function pushKey() {
    if (wp.key !== null) return wp.key;
    try { const r = await fetch('/api/push?key=1', { cache: 'no-store' }); const j = await r.json(); wp.key = (j && j.key) || ''; } catch (e) { wp.key = ''; }
    return wp.key;
  }
  function b64url(str) { const p = '='.repeat((4 - str.length % 4) % 4); const b = atob((str + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, c => c.charCodeAt(0)); }
  function deviceName() { const ua = navigator.userAgent || ''; return /Android/i.test(ua) ? 'Android phone' : /Windows/i.test(ua) ? 'Windows computer' : /Mac/i.test(ua) ? 'Mac' : /iPhone|iPad/i.test(ua) ? 'iPhone or iPad' : 'Device'; }
  // Sign this device up (if allowed) and keep its time zone and reminder settings current on the server
  function pushRefresh(subscribe) {
    if (wp.busy) return wp.busy.then(() => pushRefresh(subscribe));
    wp.busy = (async () => {
      if (!pushSupported()) { wp.state = 'unsupported'; return; }
      try {
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (!sub && subscribe && Notification.permission === 'granted' && syncReady()) {
          const key = await pushKey();
          if (!key) { wp.state = 'noserver'; return; }
          sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64url(key) });
        }
        if (!sub) { wp.state = 'off'; return; }
        if (!syncReady()) { wp.state = 'nosync'; return; }
        const j = sub.toJSON();
        const row = { endpoint: j.endpoint, sub: j, tz: myTz(), prefs: { autoRemind: !!S.settings.autoRemind, bdayRemind: S.settings.bdayRemind !== false }, device: deviceName() };
        const sig = sync.user.id + '|' + JSON.stringify(row);
        if (localStorage.getItem(PUSH_SIG) !== sig) {
          const { error } = await sync.client.from('push_subs').upsert(Object.assign({ updated_at: new Date().toISOString() }, row), { onConflict: 'endpoint' });
          if (error) throw error;
          try { localStorage.setItem(PUSH_SIG, sig); } catch (e) { }
        }
        wp.state = 'on';
      } catch (e) { wp.state = 'error'; wp.err = e.message || String(e); }
    })().finally(() => { wp.busy = null; if (ui.menu && ui.menu.key === 'settings:') renderMenu(); });
    return wp.busy;
  }
  async function pushForget() {
    try {
      if (!pushSupported()) return;
      const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription();
      if (!sub) return;
      if (sync.client && sync.user) await sync.client.from('push_subs').delete().eq('endpoint', sub.endpoint);
      await sub.unsubscribe();
    } catch (e) { }
    try { localStorage.removeItem(PUSH_SIG); } catch (e) { }
    wp.state = 'off';
  }
  // Reminders a push already showed while Tally was closed (written by sw.js)
  let pushedLog = new Set();
  async function loadPushed() {
    try { if (!('caches' in window)) return; const c = await caches.open('tally-push-log'), r = await c.match('/__pushed'); pushedLog = new Set(r ? await r.json() : []); } catch (e) { }
  }
  function openNotifHelp() {
    const el = $('#sheet');
    el.innerHTML = '<div class="sheet narrow" role="dialog" aria-modal="true" aria-labelledby="nhTitle"><div class="sheet-head"><h2 id="nhTitle">Turn notifications back on</h2><button type="button" class="iconbtn" data-close="1" aria-label="Close">' + I.x + '</button></div><div class="sheet-body">' +
      '<p>Chrome has notifications switched off for Tally, usually because a permission pop-up was dismissed or blocked once. Tally isn’t allowed to switch it back on itself, so it takes three clicks:</p>' +
      (IS_ANDROID ? '<ol class="howto"><li>On your home screen, touch and hold the <b>Tally</b> icon, then tap <b>App info</b> (the ⓘ).</li><li>Tap <b>Notifications</b> and switch them <b>on</b>.</li><li>Come back to Tally, swipe it closed and open it again.</li></ol>' +
        '<p>Still nothing? Check that <b>Do not disturb</b> is off, and in your phone’s <b>Settings → Apps → Chrome → Notifications</b> that Chrome is allowed too.</p>'
      : '<ol class="howto"><li>In the Tally window, click the <b>⋮</b> (three dots) at the very top right.</li><li>Click <b>App info</b>, then <b>Site settings</b> (or <b>Permissions</b>).</li><li>Set <b>Notifications</b> to <b>Allow</b>, then press <b>Ctrl + R</b> here.</li></ol>' +
        '<p>Still nothing? Check Windows too: <b>Start → Settings → System → Notifications</b>. Make sure notifications are on, <b>Google Chrome</b> is on, and <b>Do not disturb</b> is off.</p>') +
      '<p class="hint">Until then, reminders still pop up inside Tally while it’s open.</p></div></div>';
    el.hidden = false;
  }
  const alarmQueue = [];
  function checkReminders() {
    const nowDT = D.toLocalDT(new Date());
    const oldest = D.toLocalDT(new Date(Date.now() - 12 * 3600000)); // skip reminders missed by more than 12h
    let changed = false;
    for (const t of S.tasks) {
      const r = effectiveReminder(t);
      if (!r || t.remindedFor === r || r > nowDT) continue;
      t.remindedFor = r; changed = true; if (t.expFor && t.due) t.reminder = expTaskStages(t).find(s => s > r) || null;
      if (r < oldest || pushedLog.has(t.id + '|' + r)) continue;
      alarmQueue.push(t.id); fireNotification(t);
    }
    if (changed) { save(); renderAlarm(); }
  }
  function fireNotification(t) {
    try {
      if (notifSupported() && Notification.permission === 'granted') {
        const body = isWaiting(t) && nudgeRem(t) ? 'Waiting on ' + t.waiting.who + ' since ' + shortDate(t.waiting.since) + '. Time to follow up.' : t.expFor && t.due ? (t.due === todayISO() ? 'Expires today' : 'Expires ' + D.dueLabel(t.due) + ' (' + D.diffDays(D.fromISO(t.due), D.fromISO(todayISO())) + ' days)') : (t.due ? (isEvent(t) ? '' : 'Due ') + D.dueLabel(t.due) + (t.time ? ' ' + D.fmtTime(t.time) : '') : 'Reminder') + (S.lists.length > 1 ? ' · ' + ((listById(t.listId) || {}).name || '') : '');
        const plain = () => { const n = new Notification(plainLinks(t.title), { body, tag: t.id }); n.onclick = () => { window.focus(); ui.selected = t.id; render(); }; };
        // Phones only allow notifications through the service worker; the same tag means a push for this reminder is replaced, not doubled
        if (pushSupported() && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(reg => reg.showNotification(plainLinks(t.title), { body, tag: t.id, icon: 'icons/icon-192.png?v=2', badge: 'icons/badge-96.png', data: { id: t.id } })).catch(() => { try { plain(); } catch (e) { } });
        else plain();
      }
    } catch (e) { }
    try { // soft two-note chime
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [660, 880].forEach((f, i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; o.connect(g); g.connect(ctx.destination); const st = ctx.currentTime + i * 0.18; g.gain.setValueAtTime(0.0001, st); g.gain.exponentialRampToValueAtTime(0.08, st + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, st + 0.35); o.start(st); o.stop(st + 0.4); });
    } catch (e) { }
  }
  function renderAlarm() {
    const el = $('#alarm');
    while (alarmQueue.length && !taskById(alarmQueue[0])) alarmQueue.shift();
    const t = alarmQueue.length && taskById(alarmQueue[0]);
    if (!t) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = '<div class="when">' + I.bell + 'Reminder' + (alarmQueue.length > 1 ? ' · ' + alarmQueue.length + ' waiting' : '') + '</div><div class="t">' + esc(t.title) + '</div>' +
      (t.due ? '<div class="when">' + I.cal + 'Due ' + esc(D.dueLabel(t.due)) + (t.time ? ' ' + D.fmtTime(t.time) : '') + '</div>' : '') +
      '<div class="row">' + (isEvent(t) ? '' : '<button type="button" class="chipbtn" data-al="done">Complete</button>') + '<button type="button" class="chipbtn" data-al="10">Snooze 10 min</button><button type="button" class="chipbtn" data-al="60">1 hour</button><button type="button" class="chipbtn" data-al="open">Open</button><button type="button" class="chipbtn" data-al="dismiss">Dismiss</button></div>';
  }

  function autosize(ta) { if (!ta) return; ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }

  /* ---------- menu ---------- */
  function renderMenu() {
    const el = $('#menu');
    if (!ui.menu) { el.hidden = true; return; }
    const [type, id] = ui.menu.key.split(':');
    let h = '';
    el.classList.toggle('wide', type === 'settings');
    if (type === 'jump') {
      const base = ui.calMonth || new Date(); const yy = ui.menu.year || base.getFullYear();
      h += '<div class="jump-year"><button type="button" class="iconbtn" data-jyear="-1" aria-label="Previous year">' + I.left + '</button><strong>' + yy + '</strong><button type="button" class="iconbtn" data-jyear="1" aria-label="Next year">' + I.right + '</button></div>' +
        '<div class="jump-months">' + D.MON_SHORT.map((mn, i) => '<button type="button" data-jmonth="' + i + '" class="' + (yy === base.getFullYear() && i === base.getMonth() ? 'on' : '') + '">' + mn + '</button>').join('') + '</div>';
    } else if (type === 'settings') {
      const mode = S.settings.mode || 'system';
      const opt = ([k, th]) => {
        const c = th[resolvedMode()];
        return '<button type="button" class="theme-opt" data-theme-pick="' + k + '" aria-pressed="' + (S.settings.theme === k) + '"><span class="swatch"><i style="background:' + c.bg + '"></i><i style="background:' + c.surface + '"></i><i style="background:' + c.accent + '"></i></span><span>' + esc(th.name) + '<small>' + esc(th.note) + '</small></span></button>';
      };
      const all = Object.entries(THEMES);
      h += '<div class="mlabel">Tally themes</div><div class="themes">' + all.filter(([, th]) => !th.popular).map(opt).join('') + '</div>' +
        '<div class="mlabel">Popular color schemes</div><div class="themes">' + all.filter(([, th]) => th.popular).map(opt).join('') + '</div><div class="mlabel">Light or dark</div><div class="seg" role="group" aria-label="Light or dark">' +
        [['system', IS_ANDROID ? 'Match phone' : 'Match Windows'], ['light', 'Light'], ['dark', 'Dark']].map(([k, n]) => '<button type="button" data-mode="' + k + '" aria-pressed="' + (mode === k) + '">' + n + '</button>').join('') + '</div>' +
        '<div class="mlabel">Week starts on</div><div class="seg" role="group" aria-label="Week starts on">' + [[0, 'Sunday'], [1, 'Monday']].map(([k, n]) => '<button type="button" data-wstart="' + k + '" aria-pressed="' + ((S.settings.weekStart === 1 ? 1 : 0) === k) + '">' + n + '</button>').join('') + '</div>' +
        '<div class="mlabel">Public holidays (updated automatically)</div>' + Object.entries(HOL_COUNTRIES).map(([c, n]) => '<button type="button" data-holc="' + c + '">' + I.cal + n + ': ' + (holSettings()[c] ? '<b>shown</b>' : 'hidden (click to show)') + '</button>').join('') +
        '<div class="mlabel">Calendar colors</div><div class="typecolors">' + Object.keys(TYPE_DEFAULTS).map(k => '<div class="tcrow"><span>' + TYPE_LABELS[k] + '</span><span class="tcsw">' + Object.entries(EVCOLORS).map(([cn, cv]) => '<button type="button" class="tcdot' + (tc(k) === cv ? ' on' : '') + '" data-tcolor="' + k + ':' + cn + '" style="background:' + cv + '" aria-label="' + TYPE_LABELS[k] + ' ' + cn + '" title="' + cn + '"></button>').join('') + '</span></div>').join('') + '</div>' +
        '<div class="mlabel">Reminders</div><button type="button" data-mact="autorem">' + I.bell + (S.settings.autoRemind ? 'On: remind at a task’s due time' : 'Off: only remind when I set one') + '</button>' +
        '<button type="button" data-mact="bdayrem">' + I.bell + (S.settings.bdayRemind === false ? 'Birthdays & anniversaries: no automatic reminder' : 'Birthdays & anniversaries: remind the day before, 9am') + '</button>' +
        '<button type="button" data-mact="notif">' + I.bell + esc(notifStatus()) + '</button>' +
        '<button type="button" data-mact="donesound">' + I.check + (S.settings.doneSound === false ? 'Sound when a task is done: off' : 'Sound when a task is done: on') + '</button>' +
        '<div class="mlabel">Your data</div>' + (syncAvailable() ? (sync.user ? '<button type="button" data-mact="signout">' + I.x + 'Sign out of sync (' + esc(sync.user.email || '') + ')</button>' : '<button type="button" data-mact="signin">' + I.repeat + 'Turn on sync\u2026</button>') : '') +
        '<button type="button" data-mact="feed">' + I.cal + 'Show tasks in Outlook or Google\u2026</button>' +
        (newsHost() && !isPhone() ? '<button type="button" data-mact="sidebar">' + I.menu + 'Sidebar boxes (weather, stocks, clocks, news)\u2026</button>' : '') + '<button type="button" data-mact="pages">' + I.menu + 'Pages & swiping\u2026</button><button type="button" data-mact="backups">' + I.restore + 'Automatic backups\u2026</button><button type="button" data-mact="restore">' + I.inbox + 'Restore from a backup\u2026</button>';
    } else if (type === 'task') {
      const t = taskById(id); if (!t) { ui.menu = null; el.hidden = true; return; }
      const md = t.myDay === todayISO();
      if (isEvent(t)) {
        h += '<div class="mlabel">' + esc(trunc(t.title, 34)) + '</div><button type="button" data-tact="totask">' + I.check + 'Make it a task</button><button type="button" data-tact="dup">' + I.steps + 'Duplicate</button><button type="button" class="danger" data-tact="del">' + I.trash + 'Delete event</button>';
      } else
      h += '<div class="mlabel">' + esc(trunc(t.title, 34)) + '</div>' +
        '<button type="button" data-tact="today">' + I.sun + 'Due today</button><button type="button" data-tact="tomorrow">' + I.cal + 'Due tomorrow</button>' +
        '<button type="button" data-tact="nextweek">' + I.cal + 'Due next week</button><button type="button" data-tact="weekend">' + I.cal + 'Due this weekend</button>' +
        (t.due ? '<button type="button" data-tact="nodate">' + I.x + 'Remove due date</button>' : '') +
        (t.recur && t.due ? '<button type="button" data-tact="skip">' + I.right + 'Skip this one (next: ' + esc(D.dueLabel(D.nextOccurrence(t.due, t.recur))) + ')</button>' : '') +
        '<div class="msep"></div><button type="button" data-tact="myday">' + I.sun + (md ? 'Remove from My Day' : 'Add to My Day') + '</button>' +
        '<div class="mlabel">Move to list</div><select class="ctl" id="mTaskList" aria-label="Move to list">' + listOptions(t.listId) + '</select>' +
        (((listById(t.listId) || {}).sections || []).length ? '<div class="mlabel">Heading</div><select class="ctl" id="mTaskSection" aria-label="Move to heading"><option value="">No heading</option>' + listById(t.listId).sections.map(x => '<option value="' + x.id + '"' + (t.sectionId === x.id ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select>' : '') +
        '<button type="button" data-tact="dup">' + I.steps + 'Duplicate</button><button type="button" class="danger" data-tact="del">' + I.trash + 'Delete task</button>';
    } else if (type === 'list') {
      const l = listById(id); if (!l) { ui.menu = null; el.hidden = true; return; }
      const n = S.tasks.filter(t => t.listId === id).length;
      h += '<button type="button" data-mact="rename">' + I.edit + 'Rename list</button><div class="mlabel">Color</div><div style="display:flex;gap:6px;padding:4px 10px 8px">' +
        COLORS.map(c => '<button type="button" data-color="' + c + '" aria-label="Color ' + c + '" style="width:18px;height:18px;padding:0;border-radius:5px;background:' + c + ';outline:' + (l.color === c ? '2px solid var(--ink)' : 'none') + ';outline-offset:1px"></button>').join('') + '</div>' +
        (ui.menu.confirm ? '<button type="button" class="danger" data-mact="delete">' + I.trash + 'Click again: delete list' + (n ? ' and ' + n + ' task' + (n > 1 ? 's' : '') : '') + '</button>' : '<button type="button" class="danger" data-mact="askdelete">' + I.trash + 'Delete list</button>');
    } else {
      const g = groupById(id); if (!g) { ui.menu = null; el.hidden = true; return; }
      h += '<button type="button" data-mact="rename">' + I.edit + 'Rename group</button><div class="mlabel">Belongs to</div><select class="ctl" id="mArea" aria-label="Personal or work"><option value="personal"' + (g.area === 'personal' ? ' selected' : '') + '>Personal</option><option value="work"' + (g.area === 'work' ? ' selected' : '') + '>Work</option></select>' +
        (ui.menu.confirm ? '<button type="button" class="danger" data-mact="delete">' + I.trash + 'Delete group? Its lists are kept</button>' : '<button type="button" class="danger" data-mact="askdelete">' + I.trash + 'Delete group</button>');
    }
    el.innerHTML = h; el.hidden = false;
    const r = ui.menu.rect;
    el.style.left = Math.max(8, Math.min(r.left, window.innerWidth - el.offsetWidth - 8)) + 'px';
    el.style.top = Math.max(8, Math.min(r.bottom + 4, window.innerHeight - el.offsetHeight - 8)) + 'px';
  }

  function listOptions(sel) {
    let s = '';
    S.lists.filter(l => !l.groupId).forEach(l => s += '<option value="' + l.id + '"' + (l.id === sel ? ' selected' : '') + '>' + esc(l.name) + '</option>');
    return s;
  }
  function quickDate(k) {
    const t = new Date();
    if (k === 'today') return D.toISO(t);
    if (k === 'tomorrow') return D.toISO(D.addDays(t, 1));
    if (k === 'nextweek') return D.toISO(D.addDays(t, ((8 - t.getDay()) % 7) || 7));
    if (k === 'weekend') return D.toISO(t.getDay() === 6 ? t : D.addDays(t, (6 - t.getDay() + 7) % 7 || 7));
    return null;
  }
  function updateBadge() {
    try {
      if (!('setAppBadge' in navigator)) return;
      const T = todayISO(), n = S.tasks.filter(t => !t.done && !t.type && !notStarted(t) && t.due && t.due <= T).length;
      if (n) navigator.setAppBadge(n).catch(() => { }); else navigator.clearAppBadge().catch(() => { });
    } catch (e) { }
  }
  function render() { renderSide(); renderMain(); renderDetail(); renderMenu(); }
  // On a phone, an open panel, drawer or sheet gets a history entry so the Back button closes it
  let backArmed = false;
  function panelOpen() { return !$('#detail').hidden || document.querySelector('.app').classList.contains('nav-open') || !$('#sheet').hidden || !$('#menu').hidden; }
  function syncBack() {
    if (!isPhone()) return;
    const open = panelOpen();
    if (open && !backArmed) { backArmed = true; try { history.pushState({ tallyPanel: 1 }, ''); } catch (e) { } }
    else if (!open && backArmed) { backArmed = false; try { if (history.state && history.state.tallyPanel) history.back(); } catch (e) { } }
  }

  /* ---------- quick add ---------- */
  const EVENT_WORDS = /\b(birthday|bday|b-day|anniversary)\b/i;
  function setQaEvent(on, day) {
    ui.qaEvent = !!on; ui.qaDate = on ? (day || null) : null;
    const b = $('#qaMode'); b.setAttribute('aria-pressed', String(ui.qaEvent));
    $('#qa').placeholder = ui.qaEvent ? 'Add an event' + (ui.qaDate ? ' on ' + D.dueLabel(ui.qaDate) : '') + (isPhone() ? '' : ', e.g. Dinner with Sam 7pm') : (isPhone() ? 'Add a task' : 'Add a task, e.g. dentist fri 3pm');
    updatePreview(); $('#qa').focus();
  }
  function quickParse(v) {
    const p = D.parseQuick(v, S.lists);
    // On the phone calendar, a task typed without a date lands on the day you picked
    if (ui.view === 'calendar' && !ui.search && isPhone() && ui.calPickShown && !ui.qaDate && (!p.due || p.dueFromTime) && !p.end) {
      p.due = ui.calPickShown; p.tokens = p.tokens.filter(x => x.kind !== 'date'); p.tokens.unshift({ kind: 'date', text: D.dueLabel(p.due) + (p.time ? ' ' + D.fmtTime(p.time) : '') });
    }
    const auto = EVENT_WORDS.test(v);
    p.isEvent = ui.qaEvent || auto || !!p.end;
    if (p.isEvent) {
      if (ui.qaDate && (!p.due || p.dueFromTime)) { p.due = ui.qaDate; p.tokens = p.tokens.filter(x => x.kind !== 'date'); }
      if (!p.due) p.due = todayISO();
      if (auto && !p.recur) { p.recur = { freq: 'year', interval: 1, anchorDay: D.fromISO(p.due).getDate() }; p.autoYear = true; }
      const thisYear = new Date().getFullYear();
      if (p.recur && p.recur.freq === 'year' && Number(p.due.slice(0, 4)) < thisYear) {
        p.since = Number(p.due.slice(0, 4));
        let d = p.due; while (d < todayISO()) d = D.nextOccurrence(d, p.recur);
        p.due = d; p.tokens = p.tokens.filter(x => x.kind !== 'date');
        p.tokens.unshift({ kind: 'date', text: D.dueLabel(p.due) });
        const age = Number(p.due.slice(0, 4)) - p.since;
        p.tokens.push({ kind: 'recur', text: (BDAY_WORDS.test(v) ? 'Turns ' : '') + age + (BDAY_WORDS.test(v) ? '' : ' years') });
      }
      p.tokens = p.tokens.filter(x => x.kind !== 'list' && x.kind !== 'start');
      if (!p.tokens.some(x => x.kind === 'date')) p.tokens.unshift({ kind: 'date', text: D.dueLabel(p.due) + (p.time ? ' ' + D.fmtTime(p.time) : '') });
      if (p.autoYear) p.tokens.push({ kind: 'recur', text: 'Every year' });
      p.tokens.unshift({ kind: 'event', text: 'Event' });
    }
    return p;
  }
  function updatePreview() {
    const v = $('#qa').value.trim(), el = $('#qaPreview');
    el.classList.toggle('idle', !v && !ui.qaEvent);
    if (!v && ui.qaEvent) { el.innerHTML = 'Adding an <b>event</b>' + (ui.qaDate ? ' on ' + esc(D.dueLabel(ui.qaDate)) : '') + '. It shows on your calendar without a checkbox. <button type="button" class="example" id="qaTaskMode">Add a task instead</button>'; return; }
    if (!v) {
      el.innerHTML = 'Try <button type="button" class="example" data-ex="Pay rent every month on the 1st 9am">Pay rent every month on the 1st 9am</button> or <button type="button" class="example" data-ex="Call mom tomorrow 6pm">Call mom tomorrow 6pm</button>';
      return;
    }
    const p = quickParse(v);
    const icon = { date: I.cal, recur: I.repeat, list: I.folder, warn: I.x, rem: I.bell, tag: I.tag, start: I.up, event: I.star };
    const defaultList = currentDefaultList();
    const toks = p.tokens.slice();
    if (!p.listId && !p.isEvent && S.lists.length > 1) toks.push({ kind: 'list', text: defaultList.name });
    el.innerHTML = '<span class="tok list" style="background:transparent;padding-left:0">' + esc(trunc(p.title, 60)) + '</span>' + toks.map(t => '<span class="tok ' + t.kind + '">' + icon[t.kind] + esc(t.text) + '</span>').join('') + '<span class="hint">Enter to add</span>';
  }
  function currentDefaultList() {
    if (ui.view.startsWith('list:')) { const l = listById(ui.view.slice(5)); if (l) return l; }
    return listById('inbox');
  }
  function addFromQuick() {
    const inp = $('#qa'), v0 = inp.value.trim();
    if (!v0) return;
    const wt = parseWaiting(v0), v = wt ? wt.rest : v0;
    const p = quickParse(v);
    const listId = p.isEvent ? 'inbox' : (p.listId || currentDefaultList().id);
    const t = newTask({ title: p.title, listId, due: p.due, recur: p.recur, reminder: p.reminder || null, tags: p.tags.length ? p.tags : undefined, start: p.isEvent ? null : (p.start || null), myDay: !p.isEvent && ui.view === 'myday' && !p.due ? todayISO() : null, type: p.isEvent ? 'event' : undefined, since: p.since || undefined, end: p.isEvent && p.end ? p.end : undefined, time: p.end ? null : p.time });
    if (wt && !p.isEvent) setWaiting(t, wt.who, 3);
    snapshot(); // allow undo of the add
    ui.undo = JSON.stringify(Object.assign({}, S, { tasks: S.tasks.filter(x => x.id !== t.id) }));
    save(); inp.value = ''; updatePreview(); render();
    const l = listById(listId);
    if (p.isEvent) { if (ui.qaDate) setQaEvent(false); if (spanLen(t) && overlapToast(t)) return; toast('Event added \u00b7 ' + D.dueLabel(t.due) + (t.end ? ' to ' + D.dueLabel(t.end) : '') + (t.recur ? ', ' + D.recurText(t.recur).toLowerCase() : ''), true); return; }
    toast('Added to ' + l.name + (t.due ? ' · ' + D.dueLabel(t.due) + (t.time ? ' ' + D.fmtTime(t.time) : '') : ''), true);
  }

  /* ---------- events ---------- */
  function commitHeading(inp) {
    const id = ui.hEdit; ui.hEdit = null;
    const name = (inp.value || '').trim(), l = listById(ui.view.slice(5));
    if (l && name) {
      l.sections = l.sections || [];
      if (id === 'new') l.sections.push({ id: uid(), name }); else { const sc = l.sections.find(x => x.id === id); if (sc) sc.name = name; }
      save();
    }
    render();
  }
  function multiClick(id, range) {
    if (!ui.multi.size && ui.selected) ui.multi.add(ui.selected);
    if (range && ui.lastClick) {
      const ids = [...document.querySelectorAll('#content .task[data-id]')].map(r => r.dataset.id);
      const a = ids.indexOf(ui.lastClick), b = ids.indexOf(id);
      if (a >= 0 && b >= 0) ids.slice(Math.min(a, b), Math.max(a, b) + 1).forEach(x => ui.multi.add(x)); else ui.multi.add(id);
    } else if (ui.multi.has(id)) ui.multi.delete(id); else ui.multi.add(id);
    ui.lastClick = id; ui.selected = null;
    renderMain(); renderDetail(); renderMultibar();
  }
  function renderMultibar() {
    const el = $('#multibar');
    [...ui.multi].forEach(id => { if (!taskById(id)) ui.multi.delete(id); });
    if (!ui.multi.size) { el.hidden = true; document.querySelectorAll('#content .task.msel').forEach(r => r.classList.remove('msel')); return; }
    el.hidden = false;
    el.innerHTML = '<strong>' + ui.multi.size + ' selected</strong>' +
      '<button type="button" data-mb="complete">' + I.check + 'Complete</button><button type="button" data-mb="today">Today</button><button type="button" data-mb="tomorrow">Tomorrow</button><button type="button" data-mb="nextweek">Next week</button><button type="button" data-mb="nodate">No date</button><button type="button" data-mb="myday">' + I.sun + 'My Day</button>' +
      '<select class="ctl" id="mbList" aria-label="Move selected to list"><option value="">Move to…</option>' + listOptions('') + '</select>' +
      '<button type="button" data-mb="delete" class="danger">' + I.trash + 'Delete</button><button type="button" data-mb="clear" aria-label="Clear selection">' + I.x + '</button>';
  }
  function multiAction(k, val) {
    const ts = [...ui.multi].map(taskById).filter(Boolean); if (!ts.length) return;
    snapshot(); const n = ts.length;
    if (k === 'complete') { if (ts.some(t => !t.done && !t.type)) playDone(); ts.forEach(t => { if (!t.done && !t.type) finishTask(t); }); }
    if (['today', 'tomorrow', 'nextweek'].includes(k)) ts.forEach(t => t.due = quickDate(k));
    if (k === 'nodate') ts.forEach(t => { t.due = null; t.time = null; t.recur = null; });
    if (k === 'myday') ts.forEach(t => t.myDay = todayISO());
    if (k === 'move') ts.forEach(t => { t.listId = val; t.sectionId = null; });
    if (k === 'delete') ts.forEach(t => trashTask(t));
    ui.multi.clear(); save(); render(); renderMultibar();
    toast({ complete: 'Completed ', today: 'Moved to today: ', tomorrow: 'Moved to tomorrow: ', nextweek: 'Moved to next week: ', nodate: 'Dates removed: ', myday: 'Added to My Day: ', move: 'Moved: ', delete: 'Moved to Recently deleted: ' }[k] + n + ' task' + (n === 1 ? '' : 's'), true);
  }
  function clearDropMarks() { document.querySelectorAll('.drop-before,.drop-target').forEach(x => x.classList.remove('drop-before', 'drop-target')); }
  function openTaskMenu(id, rect) { ui.menu = { key: 'task:' + id, rect }; renderMenu(); }
  function setView(v) { if (document.activeElement && document.activeElement.matches && document.activeElement.matches('.ol-in')) document.activeElement.blur(); const sel = ui.selected && taskById(ui.selected); if (sel && isPaper(sel) !== paperView(v)) ui.selected = null; ui.view = v; ui.dayPanel = null; ui.awayPanel = false; if (ui.search) { ui.search = ''; $('#search').value = ''; } ui.menu = null; document.querySelector('.app').classList.remove('nav-open'); render(); }

  function bind() {
    $('#qa').addEventListener('input', updatePreview);
    $('#qa').addEventListener('keydown', e => { if (sug && sug.inp === e.target) return; // the [[ list takes the keys
      if (e.key === 'Enter') { e.preventDefault(); addFromQuick(); } if (e.key === 'Escape') { e.target.value = ''; updatePreview(); e.target.blur(); } });
    $('#qaMode').addEventListener('click', () => setQaEvent(!ui.qaEvent));
    $('#qaPreview').addEventListener('click', e => { if (e.target.id === 'qaTaskMode') { setQaEvent(false); return; } });
    $('#qaPreview').addEventListener('click', e => { if (e.target.closest('[data-help]')) { openSheet(); return; } const b = e.target.closest('[data-ex]'); if (b) { $('#qa').value = b.dataset.ex; updatePreview(); $('#qa').focus(); } });
    $('#search').addEventListener('input', e => { ui.search = e.target.value.trim(); ui.selected = null; renderSide(); renderMain(); renderDetail(); });
    $('#search').addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); e.target.value = ''; ui.search = ''; e.target.blur(); render(); } });
    $('#menuToggle').addEventListener('click', () => { document.querySelector('.app').classList.toggle('nav-open'); syncBack(); });
    $('#scrim').addEventListener('click', () => { document.querySelector('.app').classList.remove('nav-open'); syncBack(); });
    if (PHONE_MQ) { const onMq = () => render(); if (PHONE_MQ.addEventListener) PHONE_MQ.addEventListener('change', onMq); else if (PHONE_MQ.addListener) PHONE_MQ.addListener(onMq); }
    // Swipe left/right on the phone calendar to change months
    let sw = null;
    // …and anywhere else on the phone to move between My Day, Calendar, All tasks, Notes and Important Documents
    const SWIPE_VIEWS = () => swipeOrder().list; // your order from Settings → Pages & swiping
    $('#content').addEventListener('touchstart', e => {
      sw = null;
      if (ui.search || !isPhone() || e.touches.length !== 1) return;
      if (e.target.closest('input, textarea, select, .ntabs, .lb-body')) return;
      const months = ui.view === 'calendar' && !!e.target.closest('.pcal');
      if (!months && SWIPE_VIEWS().indexOf(ui.view === 'notes-archive' ? 'notes' : ui.view) < 0) return;
      sw = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now(), months };
    }, { passive: true });
    $('#content').addEventListener('touchend', e => {
      if (!sw) return; const tch = e.changedTouches[0], dx = tch.clientX - sw.x, dy = tch.clientY - sw.y; const quick = Date.now() - sw.t < 700, months = sw.months; sw = null;
      if (!quick || Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
      if (!months) {
        if (!$('#detail').hidden || !$('#menu').hidden || !$('#sheet').hidden) return;
        const i = SWIPE_VIEWS().indexOf(ui.view === 'notes-archive' ? 'notes' : ui.view), j = i + (dx < 0 ? 1 : -1);
        if (j < 0 || j >= SWIPE_VIEWS().length) return;
        setView(SWIPE_VIEWS()[j]);
        const c = $('#content'); c.classList.remove('swl', 'swr'); void c.offsetWidth; c.classList.add(dx < 0 ? 'swl' : 'swr'); c.scrollTop = 0;
        return;
      }
      const b = ui.calMonth; ui.calMonth = new Date(b.getFullYear(), b.getMonth() + (dx < 0 ? 1 : -1), 1); ui.calPick = null; renderMain(); updatePreview();
    }, { passive: true });
    try { const mo = new MutationObserver(() => syncBack()); ['#detail', '#sheet', '#menu'].forEach(sel => mo.observe($(sel), { attributes: true, attributeFilter: ['hidden'] })); mo.observe(document.querySelector('.app'), { attributes: true, attributeFilter: ['class'] }); } catch (e) { }
    // Android Back closes the open panel instead of leaving the app
    window.addEventListener('popstate', () => {
      backArmed = false;
      const app = document.querySelector('.app');
      let closed = false;
      if (app.classList.contains('nav-open')) { app.classList.remove('nav-open'); closed = true; }
      if (!$('#sheet').hidden && !ui.sheetLocked) { closeSheet(); closed = true; }
      if (ui.menu) { ui.menu = null; renderMenu(); closed = true; }
      if (ui.selected || ui.dayPanel || ui.awayPanel) { ui.selected = null; ui.dayPanel = null; ui.awayPanel = false; ui.confirmDelete = false; renderMain(); renderDetail(); closed = true; }
      if (closed) syncBack();
    });

    document.addEventListener('keydown', e => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#qa').focus(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); $('#search').focus(); $('#search').select(); }
      else if (!typing && e.key === '/') { e.preventDefault(); $('#search').focus(); }
      else if (!typing && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && ui.undo) { e.preventDefault(); $('#toast').hidden = true; doUndo(); }
      else if (!typing && !e.ctrlKey && !e.metaKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'j' || e.key === 'k')) {
        const rows = [...document.querySelectorAll('#content .task')]; if (!rows.length) return;
        e.preventDefault();
        let i = rows.findIndex(r => r.dataset.id === ui.selected);
        i = i < 0 ? 0 : Math.max(0, Math.min(rows.length - 1, i + (e.key === 'ArrowDown' || e.key === 'j' ? 1 : -1)));
        ui.selected = rows[i].dataset.id; ui.confirmDelete = false; renderMain(); renderDetail();
        const sel = document.querySelector('#content .task.sel'); if (sel) sel.scrollIntoView({ block: 'nearest' });
      }
      else if (!typing && (e.key === ' ' || e.key === 'x') && ui.selected && !e.target.closest('button,[role="button"]')) { e.preventDefault(); const t = taskById(ui.selected); if (t) completeTask(t); }
      else if (!typing && e.key === 'Delete' && ui.selected) { const t = taskById(ui.selected); if (t) { snapshot(); trashTask(t); save(); render(); toast('Moved to Recently deleted', true); } }
      else if (!typing && (e.key === 'q' || e.key === 'n')) { e.preventDefault(); $('#qa').focus(); }
      else if (!typing && e.key === '?') { e.preventDefault(); openSheet(); }
      else if (e.key === 'Escape' && !$('#sheet').hidden) { if (!ui.sheetLocked) closeSheet(); }
      else if (e.key === 'Escape' && ui.multi.size) { ui.multi.clear(); renderMultibar(); }
      else if (!typing && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); document.querySelectorAll('#content .task[data-id]').forEach(r => ui.multi.add(r.dataset.id)); ui.selected = null; renderMain(); renderDetail(); renderMultibar(); }
      else if (!typing && e.key === 'Delete' && ui.multi.size) { multiAction('delete'); }
      else if (e.key === 'Escape') { if (ui.menu) { ui.menu = null; renderMenu(); } else if (ui.editing) { ui.editing = null; renderSide(); } else if (ui.selected || ui.dayPanel) { ui.selected = null; ui.dayPanel = null; ui.confirmDelete = false; render(); } }
    });

    // sidebar
    $('#sideBody').addEventListener('click', e => {
      const sc = e.target.closest('[data-scope]'); if (sc) { S.settings.scope = sc.dataset.scope; save(); if (ui.view.startsWith('list:') && !listInScope(listById(ui.view.slice(5)))) ui.view = 'myday'; render(); return; }
      const mb = e.target.closest('[data-menu]'); if (mb) { e.stopPropagation(); ui.menu = ui.menu && ui.menu.key === mb.dataset.menu ? null : { key: mb.dataset.menu, rect: mb.getBoundingClientRect() }; renderMenu(); return; }
      const gt = e.target.closest('[data-gtoggle]'); if (gt) { ui.collapsed[gt.dataset.gtoggle] = !ui.collapsed[gt.dataset.gtoggle]; renderSide(); return; }
      const nl = e.target.closest('[data-newlist]'); if (nl) { ui.editing = { type: 'newlist', groupId: nl.dataset.newlist || null }; if (nl.dataset.newlist) ui.collapsed[nl.dataset.newlist] = false; renderSide(); return; }
      if (e.target.closest('#newGroup')) { ui.editing = { type: 'newgroup' }; renderSide(); return; }
      if (e.target.closest('#syncSignIn')) { openSignIn(); return; }
      if (e.target.closest('#syncRetry')) { if (syncReady()) refreshPull(); else { const u = sync.user; sync.user = null; onSignedIn(u); } return; }
      if (e.target.closest('#copyBackup')) {
        const txt = JSON.stringify(S, null, 2);
        try { navigator.clipboard.writeText(txt).then(() => toast('Backup copied to clipboard'), () => toast('Your browser blocked the clipboard here')); } catch (err) { toast('Your browser blocked the clipboard here'); }
        return;
      }
      const nv = e.target.closest('[data-view]'); if (nv) setView(nv.dataset.view);
    });
    $('#sideBody').addEventListener('keydown', e => {
      if (e.target.id === 'navEdit') {
        if (e.key === 'Enter') commitNavEdit(e.target.value);
        return;
      }
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.nav-item[data-view]')) { e.preventDefault(); setView(e.target.dataset.view); }
    });
    $('#sideBody').addEventListener('focusout', e => { if (e.target.id === 'navEdit') setTimeout(() => { if (ui.editing) commitNavEdit(e.target.value); }, 0); });

    // menu
    // Click anywhere outside an open menu (Settings included) closes it; changes there are already saved
    document.addEventListener('pointerdown', e => { if (ui.menu && !e.target.closest('#menu') && !e.target.closest('[data-menu]')) { ui.menu = null; renderMenu(); } }, true);
    document.addEventListener('click', e => { if (ui.menu && e.target.isConnected && !e.target.closest('#menu') && !e.target.closest('[data-menu]')) { ui.menu = null; renderMenu(); } });
    $('#menu').addEventListener('click', e => {
      if (!ui.menu) return;
      const [type, id] = ui.menu.key.split(':');
      const jy = e.target.closest('[data-jyear]'); if (jy) { ui.menu.year = (ui.menu.year || (ui.calMonth || new Date()).getFullYear()) + Number(jy.dataset.jyear); renderMenu(); return; }
      const jm = e.target.closest('[data-jmonth]'); if (jm) { ui.calMonth = new Date(ui.menu.year || (ui.calMonth || new Date()).getFullYear(), Number(jm.dataset.jmonth), 1); ui.menu = null; renderMenu(); renderMain(); if (ui.awayPanel) renderDetail(); return; }
      const tp = e.target.closest('[data-theme-pick]'); if (tp) { S.settings.theme = tp.dataset.themePick; save(); applyTheme(); renderMenu(); return; }
      const md = e.target.closest('[data-mode]'); if (md) { S.settings.mode = md.dataset.mode; save(); applyTheme(); renderMenu(); return; }
      const ma = e.target.closest('[data-mact]');
      const ws = e.target.closest('[data-wstart]'); if (ws) { S.settings.weekStart = Number(ws.dataset.wstart); save(); renderMenu(); renderMain(); return; }
      const hc = e.target.closest('[data-holc]'); if (hc) { const h = holSettings(); h[hc.dataset.holc] = !h[hc.dataset.holc]; S.settings.hol = h; delete S.settings.holidays; save(); renderMenu(); renderMain(); if (h[hc.dataset.holc]) refreshHolidays(true); return; }
      const tcb = e.target.closest('[data-tcolor]'); if (tcb) { const [k, cn] = tcb.dataset.tcolor.split(':'); S.settings.typeColors = Object.assign({}, S.settings.typeColors, { [k]: cn }); save(); applyTypeColors(); renderMenu(); renderMain(); return; }
      if (ma && ma.dataset.mact === 'bdayrem') { S.settings.bdayRemind = S.settings.bdayRemind === false ? true : false; save(); renderMenu(); pushRefresh(false); return; }
      if (ma && ma.dataset.mact === 'donesound') { S.settings.doneSound = S.settings.doneSound === false; save(); renderMenu(); if (S.settings.doneSound) playDone(); return; }
      if (ma && ma.dataset.mact === 'autorem') { S.settings.autoRemind = !S.settings.autoRemind; save(); renderMenu(); pushRefresh(false); return; }
      if (ma && ma.dataset.mact === 'notif') { askNotif(); return; }
      if (ma && ma.dataset.mact === 'signin') { ui.menu = null; renderMenu(); openSignIn(); return; }
      if (ma && ma.dataset.mact === 'signout') { ui.menu = null; renderMenu(); signOut(); return; }
      if (ma && ma.dataset.mact === 'fresh') {
        if (!ui.menu.fresh) { ui.menu.fresh = true; renderMenu(); return; }
        snapshot();
        S.lists.filter(l => !l.system).map(l => l.id).forEach(trashList);
        S.tasks.slice().forEach(t => trashTask(t));
        ui.view = 'myday'; ui.selected = null; ui.menu = null; save(); render();
        toast('All clear. Everything is in Recently deleted for ' + TRASH_DAYS + ' days.', true); return;
      }
      if (ma && ma.dataset.mact === 'feed') { ui.menu = null; renderMenu(); openFeed(); return; }
      if (ma && ma.dataset.mact === 'restore') { ui.menu = null; renderMenu(); openRestore(); return; }
      const ta = e.target.closest('[data-tact]');
      if (ta && type === 'task') {
        const t = taskById(id); const k = ta.dataset.tact; snapshot();
        if (['today', 'tomorrow', 'nextweek', 'weekend'].includes(k)) { const wd = t.due; t.due = quickDate(k); rebaseReminder(t, wd, t.time); toast('Due ' + D.dueLabel(t.due), true); }
        if (k === 'nodate') { t.due = null; t.time = null; t.recur = null; toast('Due date removed', true); }
        if (k === 'myday') t.myDay = t.myDay === todayISO() ? null : todayISO();
        if (k === 'totask') { delete t.type; toast('Now a task', true); }
        if (k === 'skip') { ui.menu = null; renderMenu(); skipTask(t); return; }
        if (k === 'dup') { const c2 = JSON.parse(JSON.stringify(t)); c2.id = uid(); c2.createdAt = Date.now(); c2.order = (t.order ?? t.createdAt) + 0.5; c2.steps.forEach(x => x.id = uid()); c2.remindedFor = null; S.tasks.push(c2); toast('Duplicated', true); }
        if (k === 'del') { trashTask(t); toast('Moved to Recently deleted', true); }
        ui.menu = null; save(); render(); return;
      }
      const c = e.target.closest('[data-color]'); if (c) { listById(id).color = c.dataset.color; save(); render(); return; }
      const a = e.target.closest('[data-mact]'); if (!a) return;
      const act = a.dataset.mact;
      if (act === 'rename') { ui.editing = { type, id }; ui.menu = null; if (type === 'list') { const l = listById(id); if (l.groupId) ui.collapsed[l.groupId] = false; } render(); }
      if (act === 'askdelete') { ui.menu.confirm = true; renderMenu(); }
      if (act === 'delete') {
        snapshot();
        if (type === 'list') trashList(id);
        else { S.lists.forEach(l => { if (l.groupId === id) l.groupId = null; }); S.groups = S.groups.filter(g => g.id !== id); }
        if (ui.selected && !taskById(ui.selected)) ui.selected = null;
        ui.menu = null; save(); render(); toast(type === 'list' ? 'List moved to Recently deleted' : 'Group deleted. Its lists were kept.', true);
      }
    });
    $('#menu').addEventListener('change', e => {
      if (!ui.menu) return;
      const [, id] = ui.menu.key.split(':');
      if (e.target.id === 'mGroup') { listById(id).groupId = e.target.value || null; save(); render(); }
      if (e.target.id === 'jDate' && e.target.value) { const d = D.fromISO(e.target.value); ui.calMonth = new Date(d.getFullYear(), d.getMonth(), 1); ui.dayPanel = e.target.value; ui.awayPanel = false; ui.selected = null; ui.menu = null; renderMenu(); renderMain(); renderDetail(); return; }
      if (e.target.id === 'mTaskSection') { snapshot(); taskById(id).sectionId = e.target.value || null; ui.menu = null; save(); render(); return; }
      if (e.target.id === 'mTaskList') { snapshot(); taskById(id).sectionId = null; taskById(id).listId = e.target.value; ui.menu = null; save(); render(); toast('Moved to ' + listById(e.target.value).name, true); return; }
      if (e.target.id === 'mArea') { groupById(id).area = e.target.value; save(); render(); }
    });

    // main list
    const content = $('#content');
    content.addEventListener('click', e => {
      const dt = e.target.closest('[data-done-toggle]'); if (dt) { const kk = dt.dataset.doneToggle; ui.showDone[kk] = dt.getAttribute('aria-expanded') !== 'true'; renderMain(); return; }
      const cal = e.target.closest('[data-cal]'); if (cal) { const n = Number(cal.dataset.cal); const b = ui.calMonth; ui.calMonth = n === 0 ? null : new Date(b.getFullYear(), b.getMonth() + n, 1); ui.calPick = null; renderMain(); updatePreview(); return; }
      const pk = e.target.closest('[data-pick]'); if (pk) { ui.calPick = pk.dataset.pick; const d = D.fromISO(ui.calPick); if (d.getMonth() !== ui.calMonth.getMonth()) ui.calMonth = new Date(d.getFullYear(), d.getMonth(), 1); renderMain(); updatePreview(); return; }
      const lgb = e.target.closest('[data-legend]'); if (lgb) { const hd = S.settings.calHide = Object.assign({}, S.settings.calHide); hd[lgb.dataset.legend] = !hd[lgb.dataset.legend]; save(); renderMain(); return; }
      const jmb = e.target.closest('[data-menu="jump:"]'); if (jmb) { e.stopPropagation(); ui.menu = ui.menu && ui.menu.key === 'jump:' ? null : { key: 'jump:', rect: jmb.getBoundingClientRect() }; renderMenu(); return; }
      const dop = e.target.closest('[data-dayopen]');
      if (dop) { const iso = dop.dataset.dayopen; ui.selected = null; ui.dayPanel = iso; if (ui.view !== 'calendar' || ui.search) { if (ui.search) { ui.search = ''; $('#search').value = ''; } ui.view = 'calendar'; ui.calMonth = new Date(D.fromISO(iso).getFullYear(), D.fromISO(iso).getMonth(), 1); } render(); return; }
      const dayCell = e.target.closest('.cal-day[data-day]');
      if (dayCell && !e.target.closest('.cchip, .cbar')) { ui.selected = null; ui.awayPanel = false; ui.dayPanel = dayCell.dataset.day; renderMain(); renderDetail(); const ta = document.querySelector('#detail .ol-in'); if (ta) ta.focus(); return; }
      const oc = e.target.closest('[data-open]'); if (oc) { ui.evOcc = oc.dataset.from || null; ui.dayPanel = null; ui.awayPanel = false; ui.selected = oc.dataset.open; ui.confirmDelete = false; renderDetail(); return; }
      const tv = e.target.closest('[data-tagview]'); if (tv) { e.stopPropagation(); setView('tag:' + tv.dataset.tagview); return; }
      if (e.target.closest('[data-more-done]')) { ui.doneLimit = (ui.doneLimit || 200) + 300; renderMain(); return; }
      const rl = e.target.closest('[data-restore-list]'); if (rl) { snapshot(); restoreList(rl.dataset.restoreList); save(); render(); toast('List restored', true); return; }
      const rt = e.target.closest('[data-restore-task]'); if (rt) { snapshot(); restoreTask(rt.dataset.restoreTask); save(); render(); toast('Task restored', true); return; }
      const fl = e.target.closest('[data-forever-list], [data-forever-task]');
      if (fl) {
        if (!fl.dataset.sure) { fl.dataset.sure = '1'; fl.textContent = 'Click again to delete forever'; return; }
        snapshot();
        if (fl.dataset.foreverList) { const id = fl.dataset.foreverList; S.trash.lists = S.trash.lists.filter(l => l.id !== id); S.trash.tasks = S.trash.tasks.filter(t => t.deletedWithList !== id); }
        else S.trash.tasks = S.trash.tasks.filter(t => t.id !== fl.dataset.foreverTask);
        save(); render(); toast('Deleted forever', true); return;
      }
      const hr = e.target.closest('[data-hrename]'); if (hr) { ui.hEdit = hr.dataset.hrename; renderMain(); return; }
      const hdel = e.target.closest('[data-hdel]');
      if (hdel) { const l = listById(ui.view.slice(5)); snapshot(); l.sections = (l.sections || []).filter(x => x.id !== hdel.dataset.hdel); S.tasks.forEach(t => { if (t.sectionId === hdel.dataset.hdel) t.sectionId = null; }); save(); render(); toast('Heading removed. Its tasks are kept.', true); return; }
      const rowEl = e.target.closest('.task[data-id]');
      if (rowEl && (e.ctrlKey || e.metaKey || e.shiftKey) && !e.target.closest('.check')) { e.preventDefault(); multiClick(rowEl.dataset.id, e.shiftKey); return; }
      if (rowEl && ui.multi.size && !e.target.closest('[data-act="more"]')) { ui.multi.clear(); renderMultibar(); }
      if (e.target.closest('[data-resched]')) { snapshot(); const T = todayISO(); let n = 0; open().forEach(t => { if (t.due && t.due < T) { t.due = T; n++; } }); save(); render(); toast(n + ' task' + (n === 1 ? '' : 's') + ' moved to today', true); return; }
      const row = e.target.closest('.task'); if (!row) return;
      const t = taskById(row.dataset.id); const act = e.target.closest('[data-act]'); if (!act) return;
      if (act.dataset.act === 'more') { e.stopPropagation(); openTaskMenu(t.id, act.getBoundingClientRect()); return; }
      if (act.dataset.act === 'toggle') completeTask(t);
      else if (act.dataset.act === 'skip') skipTask(t);
      else if (act.dataset.act === 'followed') { snapshot(); followedUp(t); save(); render(); toast('Nice. Next nudge ' + D.dueLabel(t.waiting.nudge) + '.', true); }
      else if (act.dataset.act === 'myday') { t.myDay = t.myDay === todayISO() ? null : todayISO(); save(); render(); }
      else if (act.dataset.act === 'open') { ui.evOcc = (act.closest('[data-occ]') || { dataset: {} }).dataset.occ || null; ui.selected = ui.selected === t.id ? null : t.id; ui.confirmDelete = false; renderMain(); renderDetail(); }
    });
    content.addEventListener('keydown', e => { if (e.target.id === 'hEdit') { if (e.key === 'Enter') commitHeading(e.target); if (e.key === 'Escape') { e.stopPropagation(); ui.hEdit = null; renderMain(); } } });
    content.addEventListener('focusout', e => { if (e.target.id === 'hEdit') setTimeout(() => { if (ui.hEdit) commitHeading(e.target); }, 0); });
    $('#viewActions').addEventListener('click', e => {
      if (e.target.closest('[data-hadd]')) { ui.hEdit = 'new'; renderMain(); return; }
      const et = e.target.closest('[data-empty-trash]');
      if (et) {
        if (!et.dataset.sure) { et.dataset.sure = '1'; et.textContent = 'Click again to empty'; et.classList.add('danger-btn'); return; }
        snapshot(); S.trash = { tasks: [], lists: [] }; save(); render(); toast('Recently deleted emptied', true);
      }
    });
    $('#viewActions').addEventListener('change', e => { if (e.target.id === 'listSort') { const l = listById(ui.view.slice(5)); l.sort = e.target.value === 'default' ? undefined : e.target.value; save(); renderMain(); } });
    let wheelAcc = 0, wheelAt = 0;
    content.addEventListener('wheel', e => {
      if (ui.view !== 'calendar' || ui.search || !e.target.closest('.calwrap')) return;
      e.preventDefault();
      wheelAcc -= e.deltaY; // scroll up = later months, down = earlier
      const now = Date.now();
      if (Math.abs(wheelAcc) < 40 || now - wheelAt < 350) return;
      const b = ui.calMonth || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      ui.calMonth = new Date(b.getFullYear(), b.getMonth() + (wheelAcc > 0 ? 1 : -1), 1);
      wheelAcc = 0; wheelAt = now; renderMain();
    }, { passive: false });
    content.addEventListener('contextmenu', e => {
      const row = e.target.closest('.task'); if (!row) return;
      e.preventDefault(); openTaskMenu(row.dataset.id, { left: e.clientX, bottom: e.clientY });
    });
    // drag and drop: onto a sidebar list to move, or within an undated list section to reorder
    // Calendar: drag a chip or bar to another day; drag a bar's right edge to change its end date
    content.addEventListener('dragstart', e => {
      const rs = e.target.closest('[data-resize]'), dg = !rs && e.target.closest('[data-drag]');
      if (!rs && !dg) return;
      e.stopPropagation();
      ui.calDrag = rs ? { id: rs.dataset.resize, mode: 'resize' } : { id: dg.dataset.drag, mode: 'move', from: dg.dataset.from };
      (rs ? rs.closest('.cbar') : dg).classList.add('dragging');
      try { e.dataTransfer.setData('text/plain', ui.calDrag.id); e.dataTransfer.effectAllowed = 'move'; } catch (err) { }
    }, true);
    content.addEventListener('dragover', e => {
      if (!ui.calDrag) return;
      const cell = e.target.closest('.cal-day[data-day]'); if (!cell) return;
      e.preventDefault(); document.querySelectorAll('.cal-day.drop-target').forEach(x => x !== cell && x.classList.remove('drop-target')); cell.classList.add('drop-target');
    }, true);
    content.addEventListener('drop', e => {
      if (!ui.calDrag) return;
      const cell = e.target.closest('.cal-day[data-day]'); const cd = ui.calDrag; ui.calDrag = null;
      if (!cell) return;
      e.preventDefault(); e.stopPropagation();
      const t = taskById(cd.id), iso = cell.dataset.day; if (!t) return;
      snapshot();
      if (cd.mode === 'resize') {
        if (iso <= t.due) delete t.end; else { t.end = iso; t.time = null; }
        save(); render(); if (!overlapToast(t)) toast(t.end ? t.title + ': now until ' + D.dueLabel(t.end) : t.title + ': now one day', true); return;
      }
      const delta = D.diffDays(D.fromISO(iso), D.fromISO(cd.from || t.due)); if (!delta) { render(); return; }
      const L = spanLen(t);
      const wasDue = t.due; t.due = D.toISO(D.addDays(D.fromISO(t.due), delta)); rebaseReminder(t, wasDue, t.time);
      if (L) t.end = D.toISO(D.addDays(D.fromISO(t.due), L));
      if (t.recur && (t.recur.freq === 'month' || t.recur.freq === 'year')) { const nd = D.fromISO(t.due).getDate(); t.recur = Object.assign({}, t.recur, { anchorDay: nd }); if (t.recur.monthDay) t.recur.monthDay = nd; }
      if (t.recur && t.recur.byDay) { const r = Object.assign({}, t.recur); delete r.byDay; t.recur = r; }
      t.remindedFor = null;
      save(); render();
      if (!(L && overlapToast(t))) toast('Moved to ' + D.dueLabel(t.due) + (t.recur && !t.type ? '. Later repeats move with it.' : ''), true);
    }, true);
    content.addEventListener('dragend', () => { if (ui.calDrag) { ui.calDrag = null; } document.querySelectorAll('.cal-day.drop-target, .dragging').forEach(x => x.classList.remove('drop-target', 'dragging')); }, true);
    content.addEventListener('dragstart', e => {
      const row = e.target.closest('.task[draggable="true"]'); if (!row) return;
      ui.drag = row.dataset.id; row.classList.add('dragging');
      try { e.dataTransfer.setData('text/plain', row.dataset.id); e.dataTransfer.effectAllowed = 'move'; } catch (err) { }
    });
    content.addEventListener('dragend', () => { ui.drag = null; document.querySelectorAll('.dragging,.drop-target,.drop-before').forEach(x => x.classList.remove('dragging', 'drop-target', 'drop-before')); });
    content.addEventListener('dragover', e => {
      const dragged = ui.drag && taskById(ui.drag); if (!dragged) return;
      const hd = e.target.closest('[data-hdrop]');
      if (hd && !e.target.closest('.task')) { e.preventDefault(); clearDropMarks(); hd.classList.add('drop-target'); return; }
      const row = e.target.closest('.task'); const cont = row && row.closest('[data-reorder], [data-section]');
      if (!row || !cont || row.dataset.id === ui.drag) return;
      const target = taskById(row.dataset.id); if (!target || dragged.listId !== target.listId) return;
      if (dragged.due && cont.dataset.section === undefined) return; // dated tasks sort by date
      e.preventDefault(); clearDropMarks(); row.classList.add('drop-before');
    });
    content.addEventListener('drop', e => {
      const dragged = ui.drag && taskById(ui.drag); if (!dragged) return;
      const hd = e.target.closest('[data-hdrop]');
      if (hd && !e.target.closest('.task')) { e.preventDefault(); snapshot(); dragged.sectionId = hd.dataset.hdrop || null; ui.drag = null; save(); render(); return; }
      const row = e.target.closest('.task'); const cont = row && row.closest('[data-reorder], [data-section]'); if (!row || !cont) return;
      e.preventDefault(); snapshot();
      if (cont.dataset.section !== undefined) dragged.sectionId = cont.dataset.section || null;
      if (cont.dataset.reorder) {
        const ids = [...cont.querySelectorAll('.task')].map(x => x.dataset.id).filter(id => id !== ui.drag);
        ids.splice(ids.indexOf(row.dataset.id), 0, ui.drag);
        ids.forEach((id, i) => { const t = taskById(id); if (t) t.order = i; });
      }
      ui.drag = null; save(); render();
    });
    $('#sideBody').addEventListener('dragover', e => {
      const li = e.target.closest('.nav-item[data-view^="list:"]'); if (!li || !ui.drag) return;
      e.preventDefault(); document.querySelectorAll('.drop-target').forEach(x => x.classList.remove('drop-target')); li.classList.add('drop-target');
    });
    $('#sideBody').addEventListener('dragleave', e => { const li = e.target.closest('.nav-item'); if (li) li.classList.remove('drop-target'); });
    $('#sideBody').addEventListener('drop', e => {
      const li = e.target.closest('.nav-item[data-view^="list:"]'); if (!li || !ui.drag) return;
      e.preventDefault(); const t = taskById(ui.drag), lid = li.dataset.view.slice(5);
      if (t && t.listId !== lid) { snapshot(); t.listId = lid; save(); render(); toast('Moved to ' + listById(lid).name, true); }
      ui.drag = null;
    });
    content.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-act="open"]')) { e.preventDefault(); e.target.click(); } });

    // detail
    const det = $('#detail');
    det.addEventListener('click', e => {
      const t = taskById(ui.selected);
      const dopen = e.target.closest('[data-open]'); if (dopen && !t) { ui.selected = dopen.dataset.open; render(); return; }
      if (!t) {
        if (e.target.closest('[data-dact="close"]')) { ui.dayPanel = null; ui.awayPanel = false; render(); return; }
        if (e.target.closest('[data-dayadd]')) { setQaEvent(true, ui.dayPanel); return; }
        const row = e.target.closest('.task[data-id]');
        if (row && e.target.closest('[data-act="toggle"]')) { completeTask(taskById(row.dataset.id)); return; }
        if (row) { ui.evOcc = row.dataset.occ || null; ui.selected = row.dataset.id; render(); }
        return;
      }
      const ec = e.target.closest('[data-evcolor]'); if (ec) { if (ec.dataset.evcolor) t.color = ec.dataset.evcolor; else delete t.color; save(); render(); return; }
      if (e.target.closest('[data-dact="noend"]')) { delete t.end; save(); render(); return; }
      const a = e.target.closest('[data-dact]');
      if (a) {
        const k = a.dataset.dact;
        if (k === 'close') { ui.selected = null; render(); }
        if (k === 'skip') { skipTask(t); return; }
        if (k === 'toevent') { snapshot(); t.type = 'event'; t.listId = 'inbox'; t.start = null; t.myDay = null; if (!t.due) t.due = todayISO(); save(); render(); toast('Now an event', true); }
        if (k === 'totask') { snapshot(); delete t.type; save(); render(); toast('Now a task', true); }
        if (k === 'meetnotes') { openMeetNotes(t, a.dataset.day); return; }
        if (k === 'toggle') completeTask(t);
        if (k === 'myday') { t.myDay = t.myDay === todayISO() ? null : todayISO(); save(); render(); }
        if (k === 'cleardue') { t.due = null; t.time = null; t.recur = null; save(); render(); }

        if (k === 'nodel') { ui.confirmDelete = false; renderDetail(); }
        if (k === 'del' || k === 'askdel') { snapshot(); trashTask(t); ui.confirmDelete = false; save(); render(); toast('Moved to Recently deleted', true); }
        return;
      }
      const sd = e.target.closest('[data-sdate]'); if (sd) { t.start = sd.dataset.sdate === 'clear' ? null : quickDate(sd.dataset.sdate); save(); render(); return; }
      const qd = e.target.closest('[data-qdate]'); if (qd) { const wd = t.due; t.due = quickDate(qd.dataset.qdate); rebaseReminder(t, wd, t.time); save(); render(); return; }
      const rb = e.target.closest('[data-rem]'); if (rb) { if (rb.dataset.rem === 'clear') { t.reminder = null; t.remRule = null; t.remindedFor = null; } else presetReminder(t, rb.dataset.rem); save(); render(); return; }
      const st = e.target.closest('[data-sact]');
      if (st) {
        const sid = st.closest('[data-step]').dataset.step;
        if (st.dataset.sact === 'toggle') { const s = t.steps.find(x => x.id === sid); s.done = !s.done; }
        else t.steps = t.steps.filter(x => x.id !== sid);
        save(); render();
      }
    });
    det.addEventListener('input', e => {
      if (e.target.id === 'dayNote' && ui.dayPanel) { setDayNote(ui.dayPanel, e.target.value); renderMain(); return; }
      const t = taskById(ui.selected); if (!t) return;
      if (e.target.id === 'dTitle') { t.title = e.target.value.replace(/\n/g, ' '); autosize(e.target); save(); renderMain(); }
      if (e.target.id === 'dNotes') { t.notes = e.target.value; save(); renderMain(); $('#dLinks').innerHTML = linksHtml(t); }
      if (e.target.id === 'dRecurText') {
        const v = e.target.value.trim(); const hint = $('#dRecurHint');
        if (!v) { hint.textContent = 'Press Enter to apply.'; return; }
        const p = D.parseQuick('x ' + (/^every|daily|weekly|monthly|yearly|weekdays/i.test(v) ? v : 'every ' + v), []);
        hint.textContent = p.recur ? D.recurText(p.recur) + '. Press Enter to apply.' : 'Not recognized yet. Try "every 2 weeks" or "every mon and thu".';
      }
    });
    det.addEventListener('keydown', e => {
      const t = taskById(ui.selected); if (!t) return;
      if (e.target.id === 'dTitle' && e.key === 'Enter' && !(sug && sug.inp === e.target)) { e.preventDefault(); e.target.blur(); }
      if (e.target.id === 'dStep' && e.key === 'Enter' && e.target.value.trim()) { t.steps.push({ id: uid(), title: e.target.value.trim(), done: false }); save(); render(); $('#dStep').focus(); }
      if (e.target.id === 'dRecurText' && e.key === 'Enter') {
        const v = e.target.value.trim(); if (!v) return;
        const p = D.parseQuick('x ' + (/^every|daily|weekly|monthly|yearly|weekdays/i.test(v) ? v : 'every ' + v), []);
        if (p.recur) { t.recur = p.recur; if (!t.due) t.due = p.due; save(); render(); }
      }
    });
    det.addEventListener('change', e => {
      const t = taskById(ui.selected); if (!t) return;
      if (e.target.id === 'dDue' && isEvent(t) && !e.target.value) { e.target.value = t.due; return; }
      if (e.target.id === 'dSince') { const y = parseInt(e.target.value, 10); if (y >= 1900 && y <= new Date().getFullYear()) t.since = y; else delete t.since; save(); render(); }
      if (e.target.id === 'dEnd') { const v = e.target.value; if (v && v > t.due) { t.end = v; t.time = null; } else delete t.end; save(); render(); overlapToast(t); }
      if (e.target.id === 'dDue') { const L = spanLen(t), wd = t.due; t.due = e.target.value || null; rebaseReminder(t, wd, t.time); if (!t.due) { t.time = null; t.recur = null; delete t.end; } else if (L) t.end = D.toISO(D.addDays(D.fromISO(t.due), L)); save(); render(); }
      if (e.target.id === 'dEvery' && t.recur) {
        const n = Math.max(1, Math.min(99, parseInt(e.target.value, 10) || 1));
        if (n !== (t.recur.interval || 1)) { const due = t.due ? D.fromISO(t.due) : new Date(); t.recur = { freq: t.recur.freq, interval: n, anchorDay: (t.recur.monthDay || due.getDate()) }; }
        save(); render();
      }
      if (e.target.id === 'dTime') { const wt = t.time; t.time = e.target.value || null; if (t.remRule && ['due', '15m', '1h'].includes(t.remRule) && !t.time) { t.remRule = null; } else rebaseReminder(t, t.due, wt); save(); render(); }
      if (e.target.id === 'dRemD') { const v = e.target.value; t.reminder = v ? v + 'T' + (t.reminder ? t.reminder.slice(11, 16) : '06:00') : null; t.remRule = null; t.remindedFor = null; save(); render(); }
      if (e.target.id === 'dRemT') { const v = e.target.value || '06:00'; t.reminder = (t.reminder ? t.reminder.slice(0, 10) : (t.due || todayISO())) + 'T' + v; t.remRule = null; t.remindedFor = null; save(); render(); }
      if (e.target.id === 'dList') { t.listId = e.target.value; t.sectionId = null; save(); render(); }
      if (e.target.id === 'dSection') { t.sectionId = e.target.value || null; save(); render(); }
      if (e.target.id === 'dStart') { t.start = e.target.value || null; save(); render(); }
      if (e.target.id === 'dTags') { const tg = [...new Set(e.target.value.split(/[,\s]+/).map(x => x.replace(/^[@#]/, '').toLowerCase().replace(/[^\w-]/g, '')).filter(Boolean))]; t.tags = tg.length ? tg : undefined; save(); render(); }
      if (e.target.id === 'dRecur') {
        const k = e.target.value; const due = t.due ? D.fromISO(t.due) : new Date();
        const n = t.recur ? (t.recur.interval || 1) : 1;
        t.recur = k === 'none' ? null : { freq: k, interval: n, anchorDay: due.getDate() };
        if (t.recur && !t.due) t.due = todayISO();
        save(); render();
      }
    });

    $('#multibar').addEventListener('click', e => { const b = e.target.closest('[data-mb]'); if (!b) return; if (b.dataset.mb === 'clear') { ui.multi.clear(); renderMultibar(); return; } multiAction(b.dataset.mb); });
    $('#multibar').addEventListener('change', e => { if (e.target.id === 'mbList' && e.target.value) multiAction('move', e.target.value); });
    $('#toast').addEventListener('click', e => {
      if (e.target.id === 'undoBtn' && ui.undo) { doUndo(); $('#toast').hidden = true; }
    });

    // refresh "today" at midnight / when the window regains focus
    window.addEventListener('focus', () => { render(); checkReminders(); });
    window.addEventListener('storage', e => { if (e.key === KEY && e.newValue) { try { S = JSON.parse(e.newValue); refreshAfterRemote(); } catch (err) { } } if (e.key === SYNC_KEY) loadSyncMeta(); });

    $('#alarm').addEventListener('click', e => {
      const b = e.target.closest('[data-al]'); if (!b) return;
      const t = taskById(alarmQueue[0]); const k = b.dataset.al;
      alarmQueue.shift();
      if (t) {
        if (k === 'done') completeTask(t);
        else if (k === 'open') { ui.selected = t.id; render(); }
        else if (k !== 'dismiss') { const d = new Date(Date.now() + Number(k) * 60000); d.setSeconds(0, 0); t.reminder = D.toLocalDT(d); t.remindedFor = null; save(); render(); toast('Snoozed until ' + D.fmtTime(t.reminder.slice(11))); }
      }
      renderAlarm();
    });

    $('#helpBtn').addEventListener('click', openSheet);
    $('#sheet').addEventListener('click', e => {
      if ((e.target.id === 'sheet' && !ui.sheetLocked) || e.target.closest('[data-close]')) { closeSheet(); return; }
      if (e.target.id === 'rsGo') {
        const msg = $('#rsMsg');
        try {
          const data = JSON.parse($('#rsText').value);
          if (!data || data.version !== 1 || !Array.isArray(data.tasks) || !Array.isArray(data.lists)) throw new Error('shape');
          snapshot(); S = data; S.settings = Object.assign({ scope: 'all', theme: 'sage', mode: 'system', autoRemind: true }, S.settings);
          ui.selected = null; ui.view = 'myday'; save(); applyTheme(); render(); closeSheet(); toast('Backup restored: ' + S.tasks.length + ' tasks', true);
        } catch (err) { msg.textContent = 'That doesn\u2019t look like a Tally backup. Copy it again with \u201cCopy backup\u201d and paste the whole thing.'; }
        return;
      }
      const tr = e.target.closest('[data-try]'); if (tr) { closeSheet(); $('#qa').value = tr.dataset.try; updatePreview(); $('#qa').focus(); }
    });

    if (mq && mq.addEventListener) mq.addEventListener('change', () => { applyTheme(); renderMenu(); });
    new MutationObserver(() => applyTheme()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function doUndo() { S = JSON.parse(ui.undo); ui.undo = null; if (ui.selected && !taskById(ui.selected)) ui.selected = null; save(); applyTheme(); render(); toast('Undone'); }
  function commitNavEdit(val) {
    const ed = ui.editing; ui.editing = null;
    const name = (val || '').trim();
    if (ed && name) {
      if (ed.type === 'list') listById(ed.id).name = name;
      if (ed.type === 'group') groupById(ed.id).name = name;
      if (ed.type === 'newlist') { const l = { id: uid(), name, groupId: ed.groupId, color: COLORS[S.lists.length % COLORS.length] }; S.lists.push(l); ui.view = 'list:' + l.id; }
      if (ed.type === 'newgroup') { const sc = S.settings.scope; S.groups.push({ id: uid(), name, area: sc === 'work' ? 'work' : 'personal' }); }
      save();
    }
    render();
  }

  /* ---------- examples sheet ---------- */
  const QUICK = [
    ['today, tomorrow, tonight', 'The date (tonight means 8pm)', 'Call the bank tomorrow'],
    ['fri, monday, next week, weekend', 'The next one of that day, next Monday, the coming Saturday', 'Team lunch thursday'],
    ['in 3 days, in 2 weeks', 'Counted from today', 'Follow up with Sara in 3 days'],
    ['dec 5, 5 dec, 12/5', 'A date. 12/5 means December 5.', 'Dentist dec 5'],
    ['9am, 6:30pm, 14:00, at 3, noon', 'A time (at 3 means 3pm)', 'Gym tomorrow 7am'],
    ['daily, weekly, monthly, yearly', 'Repeats', 'Take vitamins daily'],
    ['every 3 days, every other week, every 3 months', 'Repeats every few days, weeks or months', 'Water plants every 3 days'],
    ['every mon, every mon,\u2009wed and fri', 'Repeats on certain weekdays', 'Gym every mon, wed and fri 7am'],
    ['every weekday, every weekend', 'Monday to Friday, or Saturday and Sunday', 'Standup every weekday 9:30am'],
    ['every 15th', 'A day of the month', 'Pay rent every 1st 9am'],
    ['remind 5pm, remind 30m before', 'Sets a reminder', 'Call bank tomorrow 10am remind 30m before'],
    ['#Bills', 'Puts it in that list. The first few letters are enough.', 'Electricity bill #bills'],
    ['start mon, starts next week, from dec 1', 'Start date: hidden from My Day until then', 'Plan the party start next week due dec 20'],
    ['birthday, bday, anniversary', 'Becomes a yearly event (no checkbox). Or switch the box to Event.', 'Mom\u2019s birthday mar 12'],
    ['dec 20 - dec 31', 'A date range makes a multi-day event, like a vacation', 'Ali vacation dec 20 - dec 31'],
    ['waiting on Ravi: …, wf Ravi …', 'Waiting on someone: Tally reminds you to follow up', 'waiting on Ravi: signed contract']
  ];
  const hasLists = () => S.lists.some(l => !l.system);
  // Things you type while writing (not in the add box)
  const WRITING = [
    ['<code>[ ]</code> or <code>[]</code> at the start of a line', '<b>Journal:</b> the line becomes a real task with a checkbox. Dates, times and repeats in it work like the add box (<i>[ ] call bank fri 10am</i>). Ticking it in the journal or in your lists ticks both.<br><b>Notes:</b> a simple checkbox (not a task). Or use the Checkbox button.'],
    ['<code>[[Name]]</code>', 'Links a person or thing, like <i>[[Aidan]]</i> or <i>[[BK Parts]]</i>. Click a link to open its page: facts about it on top, then every mention. Works in the journal, notes, task names and task notes.'],
    ['<em>(after the first time)</em>', 'Once a name has been in [[ ]], writing it later with a capital letter links it by itself. Turn that off for a name with the Auto-link switch on its page.'],
    ['Select words, then <code>[</code>', 'Turns the selected words into a [[link]].'],
    ['<code>[[</code> then a few letters', 'Shows names you\u2019ve used before. Pick one, or keep typing a new name.'],
    ['<code>waiting on Ravi: signed contract</code>', 'A task you\u2019re waiting on someone for (also <i>waiting for</i>, <i>wf</i>). Tally nudges you to follow up after 3 days. Works in the add box and in journal <code>[ ]</code> lines.'],
    ['<code>•</code> or <code>-</code> then a space', '<b>Notes:</b> a bullet. Enter starts the next one; Enter on an empty one moves it out a level, or ends the list.'],
    ['<code>Tab</code> <code>Shift Tab</code>', 'Moves a line in or out a level (sub-bullets).'],
    ['<em>(Meeting button)</em>', '<b>Journal:</b> starts meeting notes with a name, kept together on that meeting\u2019s page.'],
    ['<em>(Notes: photos and PDFs)</em>', 'IDs, visas, passports and licenses are read automatically; each one\u2019s expiry date becomes a task on your calendar.']
  ];
  const SHEET = [
    ['Dates', [
      ['today, tod', 'Today', 'Call the bank today'], ['tomorrow, tmr', 'Tomorrow', 'Pay parking ticket tomorrow'], ['tonight', 'Today at 8pm', 'Read chapter 3 tonight'],
      ['mon, tue … sun, monday', 'The next one of that day. On a Friday, "fri" means next Friday.', 'Team lunch thursday'], ['next week', 'Next Monday', 'Plan Q1 goals next week'], ['next month', '1st of next month', 'Review budget next month'],
      ['weekend, this weekend', 'Coming Saturday', 'Clean the car weekend'], ['in 3 days, in 2 weeks, in a month', 'Counted from today', 'Follow up with Sara in 3 days'],
      ['dec 5, 5 dec, december 5th', 'That date. Past dates roll to next year.', 'Dentist dec 5'], ['12/5, 12/5/27', 'Month/day, so December 5', 'Submit form 12/5'], ['2027-03-31', 'Exact date', 'Tax return 2027-03-31'], ['on, by, due', 'Optional, allowed before a date', 'Send invoice by friday']]],
    ['Times', [
      ['9am, 6:30pm', 'Sets a time', 'Gym tomorrow 7am'], ['14:00', '24-hour clock', 'Client call fri 14:00'], ['at 3', '1 to 6 means pm, so 3pm', 'Pick up kids at 3'], ['noon', '12pm', 'Lunch with Omar noon'],
      ['(time only)', 'Today if still ahead, otherwise tomorrow', 'Call mom 6pm']]],
    ['Repeats', [
      ['daily, every day', 'Every day', 'Take vitamins daily'], ['every 3 days', 'Every few days', 'Water plants every 3 days'], ['weekly, every week', 'Same weekday each week', 'Weekly report every week'],
      ['every other week', 'Every 2 weeks', 'Change bed sheets every other week'], ['every fri', 'One weekday', 'Timesheet every fri 4pm'], ['every mon,\u2009wed and fri', 'Several weekdays', 'Gym every mon, wed and fri 7am'],
      ['every weekday', 'Monday to Friday', 'Standup every weekday 9:30am'], ['every weekend', 'Saturday and Sunday', 'Long walk every weekend'],
      ['monthly, every month', 'Same date each month', 'Phone bill monthly'], ['every 1st, every 15th', 'A day of the month', 'Pay rent every 1st 9am'], ['every 3 months', 'Any number', 'Replace AC filter every 3 months'],
      ['yearly, every year, annually', 'Same date each year', 'Car registration mar 12 every year']]],
    ['Reminders', [
      ['remind 5pm, remind me at 8:30am', 'On the due date at that time (or today/tomorrow if no date)', 'Report fri remind me at 8am'],
      ['remind 30m before, remind 1h before', 'Before the due time (needs a date)', 'Call bank tomorrow 10am remind 30m before'],
      ['(automatic)', 'Tasks with a time remind you at that time. Turn off in Settings.', 'Dentist dec 5 3pm']]],
    ['Lists', [
      ['#Bills', 'Puts it in that list, if you\u2019ve made one. The start of the name is enough (#bi).', 'Electricity bill #bills']]],
    ['Events', [
      ['birthday, bday, anniversary', 'Turns it into an event that repeats every year', 'Mom\u2019s birthday mar 12'],
      ['(Event switch)', 'Click Event in the add box, then type: anything you add is an event, not a task', 'Dinner with Sam fri 7pm'],
      ['dec 20 - dec 31, jan 5 to jan 9', 'A date range makes a multi-day event, like a vacation. Shown as one bar in the Calendar.', 'Ali vacation dec 20 - dec 31'],
      ['(Calendar)', 'Click a day in Calendar to write a note for that day or add an event on it', 'Dentist checkup dec 9 10am']]],
    ['Start dates', [
      ['start mon, starts next week, from dec 1', 'The task stays out of My Day until that date. Good for things you can’t do yet.', 'Renew passport start feb 1 due mar 1']]]
  ];
  function keysHtml(k) { return k.split(/, /).map(x => x.startsWith('(') ? '<em>' + esc(x) + '</em>' : '<code>' + esc(x) + '</code>').join(' '); }
  function rowsHtml(rows) { return '<table>' + rows.map(([k, d, ex]) => '<tr><td>' + keysHtml(k) + '</td><td>' + esc(d) + '<br><button type="button" class="try example" data-try="' + esc(ex) + '">Try: ' + esc(ex) + '</button></td></tr>').join('') + '</table>'; }
  function openSheet() {
    const el = $('#sheet');
    el.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle"><div class="sheet-head"><h2 id="sheetTitle">Examples: what you can type</h2><button type="button" class="iconbtn" data-close="1" aria-label="Close">' + I.x + '</button></div><div class="sheet-body">' +
      '<p>Type a task, then add any of these anywhere in the line, in any order. They’re taken out of the title, and the tags under the box show what was understood. Click a "Try" line to fill it in.</p>' +
      (() => { const ex = 'Pay rent every 1st 9am' + (hasLists() ? ' #bills' : '') + ' remind 1h before'; return '<p class="combo">Mix them: <button type="button" class="example" data-try="' + ex + '">' + ex + '</button></p>'; })() +
      '<h3>Quick reference</h3>' + rowsHtml(QUICK.filter(r => hasLists() || !r[0].startsWith('#'))) +
      '<h3 class="big">All the details</h3>' +
      SHEET.filter(([h]) => hasLists() || h !== 'Lists').map(([h, rows]) => '<h3>' + h + '</h3>' + rowsHtml(rows)).join('') +
      '<h3 class="big">Writing in the journal and notes</h3><table>' + WRITING.map(([k, d]) => '<tr><td>' + k + '</td><td>' + d + '</td></tr>').join('') + '</table>' +
      '<h3>Keyboard</h3><table><tr><td><code>Ctrl K</code> <code>Q</code></td><td>Jump to the add box</td></tr><tr><td><code>Ctrl O</code></td><td>Jump to anything: a day, a person or page, a note, a task</td></tr><tr><td><code>/</code></td><td>Search</td></tr><tr><td><code>Tab</code> <code>Shift Tab</code></td><td>In the journal and notes: move a line in or out a level</td></tr><tr><td><code>?</code></td><td>Open these examples</td></tr><tr><td><code>Ctrl</code> + click, <code>Shift</code> + click</td><td>Select several tasks, then act on them together</td></tr><tr><td><code>Ctrl A</code></td><td>Select every task on screen</td></tr><tr><td><code>Delete</code></td><td>Move selected task(s) to Recently deleted</td></tr><tr><td><code>Esc</code></td><td>Close panels or clear a selection</td></tr></table></div></div>';
    el.hidden = false;
    $('[data-close]', el).focus();
  }
  function closeSheet() { $('#sheet').hidden = true; }
  function openRestore() {
    const el = $('#sheet');
    el.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="rsTitle"><div class="sheet-head"><h2 id="rsTitle">Restore from a backup</h2><button type="button" class="iconbtn" data-close="1" aria-label="Close">' + I.x + '</button></div><div class="sheet-body">' +
      '<p>Paste a backup you copied with \u201cCopy backup\u201d. This replaces everything currently in Tally. You can undo right after.</p>' +
      '<textarea class="ctl" id="rsText" rows="10" placeholder="Paste backup here" style="font:12px ui-monospace,Consolas,monospace"></textarea>' +
      '<div style="display:flex;gap:8px;align-items:center;margin-top:10px"><button type="button" class="chipbtn solid" id="rsGo">Restore</button><span class="hint" id="rsMsg"></span></div></div></div>';
    el.hidden = false; $('#rsText').focus();
  }


  /* ---------- sync (Supabase) ---------- */
  const CFG = window.TALLY_CONFIG || {};
  const SYNC_KEY = 'tally.sync.v1';
  const sync = { client: null, user: null, state: 'off', detail: '', channel: null, timer: null, busy: false, meta: { uid: null, shadow: {}, lastPull: null } };
  function syncAvailable() { return !!(window.supabase && window.supabase.createClient && CFG.supabaseUrl && CFG.supabaseKey && !/claude/.test(location.hostname)); }
  function loadSyncMeta() { try { const m = JSON.parse(localStorage.getItem(SYNC_KEY) || 'null'); if (m && m.shadow) sync.meta = m; } catch (e) { } }
  function saveSyncMeta() { try { localStorage.setItem(SYNC_KEY, JSON.stringify(sync.meta)); } catch (e) { } }
  const ser = o => JSON.stringify(o, (k, v) => k === 'remindedFor' ? undefined : v);
  function itemsOf(st) {
    const m = {}, tr = st.trash || { tasks: [], lists: [] };
    st.groups.forEach(g => m['group:' + g.id] = g);
    st.lists.concat(tr.lists).forEach(l => m['list:' + l.id] = l);
    st.tasks.concat(tr.tasks).forEach(t => m['task:' + t.id] = t);
    return m;
  }
  function pendingChanges() {
    const cur = itemsOf(S), sh = sync.meta.shadow, out = [];
    for (const k in cur) { const j = ser(cur[k]); if (sh[k] !== j) out.push({ k, j }); }
    for (const k in sh) if (!(k in cur) && sh[k] !== '~') out.push({ k, deleted: true });
    return out;
  }
  function setSync(state, detail) { sync.state = state; sync.detail = detail || ''; if (state === 'synced') setTimeout(uploadPending, 500); const el = $('#syncLine'); if (el) el.innerHTML = syncLineHtml(); }
  function syncLineHtml() {
    if (!syncAvailable()) return '<span class="sdot off"></span>' + (/claude/.test(location.hostname) ? 'Preview copy. Sync works in the installed app.' : 'Sync isn’t set up yet. Tasks stay on this computer.');
    if (!sync.user) return '<span class="sdot off"></span>Not syncing. <button type="button" class="linkbtn" id="syncSignIn">Turn on sync</button>';
    const who = esc(sync.user.email || 'you');
    if (sync.state === 'syncing') return '<span class="sdot busy"></span>Syncing…';
    if (sync.state === 'offline') return '<span class="sdot warn"></span>Offline. Changes will sync when you’re back online.';
    if (sync.state === 'error') return '<span class="sdot err"></span>Sync problem: ' + esc(sync.detail) + ' <button type="button" class="linkbtn" id="syncRetry">Retry</button>';
    return '<span class="sdot ok"></span>Synced as ' + who;
  }
  function schedulePush() { if (!sync.user) return; clearTimeout(sync.timer); sync.timer = setTimeout(push, 700); }
  const syncReady = () => !!(sync.client && sync.user && sync.meta.uid === sync.user.id); // first-time setup finished
  async function push() {
    if (!syncReady()) return;
    if (sync.busy) { schedulePush(); return; }
    const ch = pendingChanges();
    if (!ch.length) { if (sync.state !== 'error') setSync('synced'); return; }
    if (!navigator.onLine) { setSync('offline'); return; }
    sync.busy = true; setSync('syncing');
    try {
      for (let i = 0; i < ch.length; i += 400) {
        const part = ch.slice(i, i + 400);
        const rows = part.map(c => ({ user_id: sync.user.id, id: c.k, kind: c.k.slice(0, c.k.indexOf(':')), data: c.deleted ? null : JSON.parse(c.j), deleted: !!c.deleted }));
        const { error } = await sync.client.from('items').upsert(rows, { onConflict: 'user_id,id' });
        if (error) throw error;
        part.forEach(c => { sync.meta.shadow[c.k] = c.deleted ? '~' : c.j; });
        saveSyncMeta();
      }
      setSync('synced');
    } catch (err) { setSync(navigator.onLine ? 'error' : 'offline', err.message || String(err)); }
    finally { sync.busy = false; }
  }
  async function pullRows(since) {
    let all = [], from = 0;
    for (;;) {
      let q = sync.client.from('items').select('id,kind,data,deleted,server_updated').order('server_updated', { ascending: true }).range(from, from + 999);
      if (since) q = q.gte('server_updated', since);
      const { data, error } = await q; if (error) throw error;
      all = all.concat(data); if (data.length < 1000) break; from += 1000;
    }
    return all;
  }
  function applyRemote(rows) {
    if (!rows.length) return;
    const pend = new Set(pendingChanges().map(c => c.k));
    let changed = false;
    for (const r of rows) {
      if (r.server_updated && (!sync.meta.lastPull || r.server_updated > sync.meta.lastPull)) sync.meta.lastPull = r.server_updated;
      const k = r.id, j = r.deleted ? '~' : ser(r.data);
      if (sync.meta.shadow[k] === j) continue;
      if (pend.has(k)) continue; // this computer has a newer unsent edit; it will win when pushed
      const kind = k.slice(0, k.indexOf(':')), id = k.slice(k.indexOf(':') + 1);
      const live = kind === 'task' ? S.tasks : kind === 'list' ? S.lists : kind === 'group' ? S.groups : null;
      if (!live) continue;
      const bin = kind === 'task' ? S.trash.tasks : kind === 'list' ? S.trash.lists : null;
      let prev = live.find(x => x.id === id) || (bin && bin.find(x => x.id === id));
      const li = live.findIndex(x => x.id === id); if (li >= 0) live.splice(li, 1);
      if (bin) { const bi = bin.findIndex(x => x.id === id); if (bi >= 0) bin.splice(bi, 1); }
      if (!r.deleted) { const obj = r.data; if (kind === 'task' && prev) obj.remindedFor = prev.remindedFor; ((obj.deletedAt && bin) ? bin : live).push(obj); }
      changed = true;
      sync.meta.shadow[k] = j;
    }
    saveSyncMeta();
    if (changed) { persistLocal(); refreshAfterRemote(); }
  }
  function refreshAfterRemote() {
    rollEvents();
    if (!S.lists.some(l => l.id === 'inbox')) S.lists.unshift({ id: 'inbox', name: 'Tasks', groupId: null, color: '#607089', system: true });
    if (ui.selected && !taskById(ui.selected)) ui.selected = null;
    if (ui.view.startsWith('list:') && !listById(ui.view.slice(5))) ui.view = 'myday';
    renderSide(); renderMain(); renderMenu();
    if (!document.activeElement || !document.activeElement.closest('#detail')) renderDetail();
  }
  async function refreshPull() {
    if (!syncReady() || sync.busy) return;
    try { applyRemote(await pullRows(sync.meta.lastPull)); await push(); }
    catch (err) { setSync(navigator.onLine ? 'error' : 'offline', err.message || String(err)); }
  }
  function askChoice(title, body, options) {
    return new Promise(resolve => {
      const el = $('#sheet'); ui.sheetLocked = true;
      el.innerHTML = '<div class="sheet narrow" role="dialog" aria-modal="true" aria-labelledby="chTitle"><div class="sheet-head"><h2 id="chTitle">' + esc(title) + '</h2></div><div class="sheet-body"><p>' + body + '</p><div class="choices">' +
        options.map(([k, label, note]) => '<button type="button" class="choice" data-choice="' + k + '"><strong>' + esc(label) + '</strong><span>' + esc(note) + '</span></button>').join('') + '</div></div></div>';
      el.hidden = false;
      el.querySelectorAll('[data-choice]').forEach(b => b.onclick = () => { ui.sheetLocked = false; el.hidden = true; resolve(b.dataset.choice); });
      el.querySelector('[data-choice]').focus();
    });
  }
  async function onSignedIn(user) {
    if (sync.user && sync.user.id === user.id) return;
    sync.user = user; setSync('syncing'); renderSide();
    try {
      if (sync.meta.uid !== user.id) {
        // first time this computer syncs with this account
        const remote = await pullRows(null);
        const live = remote.filter(r => !r.deleted && r.kind === 'task').length;
        const localN = S.tasks.length;
        let choice;
        if (live) choice = await askChoice('Your synced tasks', 'Your account already has <b>' + live + '</b> task' + (live === 1 ? '' : 's') + '. This computer has <b>' + localN + '</b> (including any sample tasks).',
          [['replace', 'Use my synced tasks', 'Recommended. This computer switches to what’s in your account.'], ['merge', 'Combine both', 'Adds this computer’s tasks to your account too.']]);
        else choice = await askChoice('Start syncing', 'Your account is empty. This computer has <b>' + localN + '</b> task' + (localN === 1 ? '' : 's') + '.',
          [['upload', 'Upload this computer’s tasks', 'Use this if you’ve been adding real tasks here.'], ['empty', 'Start with an empty list', 'Clears the sample tasks. Good for a fresh start.']]);
        loadSyncMeta();
        if (sync.meta.uid === user.id) { // another Tally window on this computer already finished setup
          try { S = JSON.parse(localStorage.getItem(KEY)) || S; } catch (e) { }
          refreshAfterRemote(); await refreshPull(); subscribeLive(); setSync('synced'); return;
        }
        snapshot();
        sync.meta = { uid: user.id, shadow: {}, lastPull: null };
        if (choice === 'replace' || choice === 'empty') { S.trash = { tasks: [], lists: [] }; S.tasks = []; S.lists = S.lists.filter(l => l.id === 'inbox'); S.groups = []; if (choice === 'replace') sync.meta.shadow = {}; }
        if (choice === 'replace') { S.lists = []; }
        applyRemote(remote);
        refreshAfterRemote(); persistLocal(); saveSyncMeta();
        await push();
        ui.undo = null;
        toast(choice === 'replace' ? 'Synced. You’re using your account’s tasks.' : 'Sync is on.');
      } else {
        await refreshPull();
      }
      subscribeLive();
      setSync('synced');
      pushRefresh(true);
    } catch (err) { setSync('error', err.message || String(err)); }
  }
  function subscribeLive() {
    if (sync.channel) { try { sync.client.removeChannel(sync.channel); } catch (e) { } }
    sync.channel = sync.client.channel('items-' + sync.user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: 'user_id=eq.' + sync.user.id }, p => { if (p.new && p.new.id) applyRemote([p.new]); })
      .subscribe();
  }
  async function signOut() {
    await pushForget();
    try { await sync.client.auth.signOut(); } catch (e) { }
    if (sync.channel) { try { sync.client.removeChannel(sync.channel); } catch (e) { } }
    sync.user = null; sync.channel = null; setSync('off'); renderSide(); renderMenu();
    toast('Signed out. Your tasks stay on this computer.');
  }
  function openSignIn() {
    const el = $('#sheet');
    el.innerHTML = '<div class="sheet narrow" role="dialog" aria-modal="true" aria-labelledby="siTitle"><div class="sheet-head"><h2 id="siTitle">Turn on sync</h2><button type="button" class="iconbtn" data-close="1" aria-label="Close">' + I.x + '</button></div><div class="sheet-body">' +
      '<p>Sign in with your email on each computer. Your tasks then stay the same everywhere. No password needed.</p>' +
      '<div class="field"><label for="siEmail">Email</label><input class="ctl" type="email" id="siEmail" autocomplete="email" placeholder="you@example.com"></div>' +
      '<div style="display:flex;gap:8px;align-items:center;margin-top:10px"><button type="button" class="chipbtn solid" id="siSend">Email me a sign-in link</button><span class="hint" id="siMsg"></span></div>' +
      '<div id="siStep2" hidden><div class="steps-note"><b>Next:</b><ol><li>Open the email from Supabase and click <b>Sign in</b>.</li><li>A Tally tab opens in your browser. Answer the question it asks, then close that tab.</li><li>Come back to this window. It signs in by itself within a few seconds.</li></ol></div>' +
      '<button type="button" class="linkbtn" id="siHaveCode">Got a 6-digit code instead?</button><div id="siCodeBox" hidden><div class="field"><label for="siCode">Code</label><input class="ctl" id="siCode" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="123456"></div>' +
      '<div style="display:flex;gap:8px;align-items:center;margin-top:10px"><button type="button" class="chipbtn solid" id="siVerify">Sign in</button><span class="hint" id="siMsg2"></span></div></div></div></div></div>';
    el.hidden = false; $('#siEmail').focus();
    const send = async () => {
      const email = $('#siEmail').value.trim(), msg = $('#siMsg');
      if (!/^\S+@\S+\.\S+$/.test(email)) { msg.textContent = 'Enter a full email address.'; return; }
      msg.textContent = 'Sending…';
      const { error } = await sync.client.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: true } });
      if (error) { msg.textContent = error.message; return; }
      msg.textContent = 'Sent to ' + email + '.'; $('#siStep2').hidden = false; waitForLinkSignIn();
    };
    const verify = async () => {
      const email = $('#siEmail').value.trim(), token = $('#siCode').value.replace(/\s/g, ''), msg = $('#siMsg2');
      if (!token) { msg.textContent = 'Enter the code from the email.'; return; }
      msg.textContent = 'Checking…';
      const { data, error } = await sync.client.auth.verifyOtp({ email, token, type: 'email' });
      if (error) { msg.textContent = error.message.includes('expired') || error.message.includes('invalid') ? 'That code didn’t work. Check it or send a new one.' : error.message; return; }
      closeSheet(); if (data && data.user) onSignedIn(data.user);
    };
    $('#siSend').onclick = send; $('#siEmail').onkeydown = e => { if (e.key === 'Enter') send(); };
    $('#siHaveCode').onclick = () => { $('#siCodeBox').hidden = false; $('#siCode').focus(); };
    $('#siVerify').onclick = verify; $('#siCode').onkeydown = e => { if (e.key === 'Enter') verify(); };
  }
  // The email link signs in a browser tab; this window shares its storage, so check for the session.
  async function checkForSession() {
    if (!sync.client || sync.user) return;
    try { const { data } = await sync.client.auth.getSession(); if (data && data.session) { if (!$('#sheet').hidden && $('#siEmail')) closeSheet(); onSignedIn(data.session.user); } } catch (e) { }
  }
  let linkPoll = null;
  function waitForLinkSignIn() { clearInterval(linkPoll); let n = 0; linkPoll = setInterval(() => { if (sync.user || ++n > 200) { clearInterval(linkPoll); return; } checkForSession(); }, 3000); }
  async function startSync() {
    loadSyncMeta();
    if (!syncAvailable()) { setSync('off'); return; }
    try {
      sync.client = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      sync.client.auth.onAuthStateChange((ev, session) => {
        if (session && session.user) setTimeout(() => onSignedIn(session.user), 0);
      });
      const { data } = await sync.client.auth.getSession();
      if (data && data.session) onSignedIn(data.session.user); else setSync('off');
    } catch (err) { setSync('error', err.message || String(err)); }
    window.addEventListener('online', () => refreshPull());
    window.addEventListener('offline', () => setSync('offline'));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { checkForSession(); refreshPull(); } });
    window.addEventListener('focus', checkForSession);
    window.addEventListener('storage', e => { if (e.key && e.key.startsWith('sb-')) checkForSession(); });
    setInterval(refreshPull, 60000);
  }

  /* ---------- calendar link (.ics feed) ---------- */
  function newToken() { const a = new Uint8Array(24); crypto.getRandomValues(a); const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; return Array.from(a, b => c[b % 62]).join('') + Array.from(crypto.getRandomValues(new Uint8Array(8)), b => c[b % 62]).join(''); }
  const myTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } };
  async function getFeedToken(reset) {
    const tbl = () => sync.client.from('feed_tokens');
    const { data, error } = await tbl().select('token,tz').maybeSingle();
    if (error) throw error;
    if (!data) { const token = newToken(); const r = await tbl().insert({ user_id: sync.user.id, token, tz: myTz() }); if (r.error) throw r.error; return token; }
    if (reset || data.tz !== myTz()) {
      const token = reset ? newToken() : data.token;
      const r = await tbl().update({ token, tz: myTz() }).eq('user_id', sync.user.id); if (r.error) throw r.error; return token;
    }
    return data.token;
  }
  function feedUrl(token, scope) { return location.origin + '/feed/' + token + (scope && scope !== 'all' ? '-' + scope : '') + '.ics'; }
  async function openFeed() {
    const el = $('#sheet');
    const shell = inner => '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="fdTitle"><div class="sheet-head"><h2 id="fdTitle">Show tasks in Outlook or Google Calendar</h2><button type="button" class="iconbtn" data-close="1" aria-label="Close">' + I.x + '</button></div><div class="sheet-body">' + inner + '</div></div>';
    if (!syncAvailable() || !syncReady()) {
      el.innerHTML = shell('<p>Your calendar link reads from your synced tasks, so turn on sync first (bottom left of the window). Then come back here.</p>');
      el.hidden = false; return;
    }
    el.innerHTML = shell('<p>Getting your private link…</p>'); el.hidden = false;
    let token;
    try { token = await getFeedToken(false); }
    catch (err) { el.innerHTML = shell('<p>Couldn’t get your calendar link: ' + esc(err.message || String(err)) + '</p><p class="hint">If it says the table or function doesn’t exist, the calendar SQL hasn’t been run in Supabase yet.</p>'); return; }
    let scope = 'all';
    const draw = () => {
      el.innerHTML = shell(
        '<p>Your tasks with a due date appear as events, including repeats. It’s a read-only copy: complete and edit tasks in Tally. Calendar apps check for changes every few hours.</p>' +

        '<div class="field" style="margin-top:12px"><label for="fdUrl">Your private calendar link</label><div style="display:flex;gap:8px"><input class="ctl" id="fdUrl" readonly value="' + esc(feedUrl(token, scope)) + '"><button type="button" class="chipbtn solid" id="fdCopy">Copy</button></div>' +
        '<span class="hint">Anyone with this link can see these tasks. Don’t share it.</span></div>' +
        '<h3>Add it to Outlook</h3><ol class="howto"><li>Open Outlook on the web and go to <b>Calendar</b>.</li><li>Click <b>Add calendar → Subscribe from web</b>.</li><li>Paste the link, name it <b>Tally</b>, pick a color, and click <b>Import</b>.</li></ol>' +
        '<h3>Add it to Google Calendar</h3><ol class="howto"><li>Next to <b>Other calendars</b>, click <b>+ → From URL</b>.</li><li>Paste the link and click <b>Add calendar</b>.</li></ol>' +
        '<h3>Stop sharing</h3><p style="margin-top:0"><button type="button" class="linkbtn" id="fdReset">Make a new link</button> — the old one stops working right away. You’d then re-add the new link in your calendar app.</p><span class="hint" id="fdMsg"></span>');
      el.querySelectorAll('[data-fscope]').forEach(b => b.onclick = () => { scope = b.dataset.fscope; draw(); });
      $('#fdCopy').onclick = () => { const v = $('#fdUrl').value; try { navigator.clipboard.writeText(v).then(() => toast('Calendar link copied'), () => { $('#fdUrl').select(); toast('Press Ctrl+C to copy'); }); } catch (e) { $('#fdUrl').select(); toast('Press Ctrl+C to copy'); } };
      $('#fdUrl').onclick = e => e.target.select();
      $('#fdReset').onclick = async () => {
        if (!$('#fdReset').dataset.sure) { $('#fdReset').dataset.sure = '1'; $('#fdReset').textContent = 'Click again to confirm: make a new link'; return; }
        try { token = await getFeedToken(true); draw(); toast('New link made. The old one no longer works.'); } catch (err) { $('#fdMsg').textContent = err.message || String(err); }
      };
    };
    draw();
  }

  /* ====================== Notes, Documents and files (photos & PDFs on anything) ====================== */
  const isKNote = t => t.type === 'note';
  const isDoc = t => t.type === 'doc';
  const isPaper = t => !!t && (t.type === 'note' || t.type === 'doc');
  const paperView = v => v.startsWith('notes') || v === 'docs';
  const touchNote = n => { n.editedAt = Date.now(); };

  // ---- locked items: body, checklist and number are scrambled with a passphrase (AES-GCM) before they're saved or synced
  const SEALED = ['body', 'items', 'number'];
  const vault = { key: null, plain: {}, json: {}, sealedAs: {}, timer: null, hiddenAt: 0, again: false, busy: false };
  const vaultItem = () => S.tasks.find(t => t.type === 'vault');
  const shut = t => !!(t && t.locked && !vault.plain[t.id]);
  // A view of an item where locked fields read/write the unlocked copy kept in memory
  function E(t) {
    if (!t || !t.locked) return t;
    const p = vault.plain[t.id]; if (!p) return t;
    return new Proxy(t, { get: (o, k) => SEALED.includes(k) ? p[k] : o[k], set: (o, k, v) => { if (SEALED.includes(k)) p[k] = v; else o[k] = v; return true; } });
  }
  const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s); };
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  async function deriveKey(pass, salt) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function encBytes(u8, key) { const iv = crypto.getRandomValues(new Uint8Array(12)); const c = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key || vault.key, u8)); const out = new Uint8Array(12 + c.length); out.set(iv); out.set(c, 12); return out; }
  async function decBytes(u8, key) { return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u8.subarray(0, 12) }, key || vault.key, u8.subarray(12))); }
  const encStr = async (s, key) => b64(await encBytes(new TextEncoder().encode(s), key));
  const decStr = async (s, key) => new TextDecoder().decode(await decBytes(unb64(s), key));
  const allItems = () => S.tasks.concat(S.trash.tasks);

  async function openPlain() {
    for (const t of allItems()) {
      if (!t.locked || !t.sealed || (vault.plain[t.id] && vault.sealedAs[t.id] === t.sealed)) continue;
      try { const j = await decStr(t.sealed); vault.plain[t.id] = JSON.parse(j); vault.json[t.id] = j; vault.sealedAs[t.id] = t.sealed; } catch (e) { }
    }
  }
  // Re-scramble unlocked copies that changed (called from save())
  async function reseal() {
    if (!vault.key) return;
    if (vault.busy) { vault.again = true; return; }
    vault.busy = true; let ch = false;
    try {
      for (const t of allItems()) {
        const p = vault.plain[t.id]; if (!t.locked || !p) continue;
        const j = JSON.stringify(p); if (vault.json[t.id] === j) continue;
        t.sealed = await encStr(j); vault.json[t.id] = j; vault.sealedAs[t.id] = t.sealed; ch = true;
      }
    } finally { vault.busy = false; }
    if (ch) { persistLocal(); schedulePush(); }
    if (vault.again) { vault.again = false; reseal(); }
  }
  // Another computer changed a locked item while it's open here
  let plainChecking = false;
  function checkPlainFresh() {
    if (!vault.key || plainChecking) return;
    if (!allItems().some(t => t.locked && t.sealed && vault.sealedAs[t.id] !== t.sealed)) return;
    plainChecking = true; openPlain().then(() => { plainChecking = false; render(); });
  }
  function lockVault(quiet) {
    if (!vault.key) return;
    vault.key = null; vault.plain = {}; vault.json = {}; vault.sealedAs = {};
    Object.keys(urlCache).forEach(k => { if (encUrls.has(k)) { URL.revokeObjectURL(urlCache[k]); delete urlCache[k]; } }); encUrls.clear();
    if (!$('#lightbox').hidden) { const n = taskById($('#lightbox').dataset.note); if (n && n.locked) $('#lightbox').hidden = true; }
    render(); if (!quiet) toast('Locked items are locked again');
  }
  function armAutoLock() { clearTimeout(vault.timer); if (vault.key) vault.timer = setTimeout(() => lockVault(), 10 * 60000); }
  function needVault() { return vault.key ? Promise.resolve(true) : new Promise(res => openVaultSheet(res)); }
  function openVaultSheet(done) {
    const setup = !vaultItem(), el = $('#sheet');
    ui.vaultDone = done || null;
    el.innerHTML = '<div class="sheet narrow" role="dialog" aria-modal="true" aria-labelledby="vTitle"><div class="sheet-head"><h2 id="vTitle">' + (setup ? 'Choose a passphrase for locked items' : 'Unlock locked items') + '</h2><button type="button" class="iconbtn" data-close="1" aria-label="Close">' + I.x + '</button></div><div class="sheet-body">' +
      (setup ? '<p>Locked notes and documents are scrambled on this computer before they sync, so nobody can read them without this passphrase, not even the database. Locked items stay locked on every computer and open with the same passphrase.</p><p><b>Write it down somewhere safe.</b> If you forget it, locked items can’t be recovered.</p>'
        : '<p>Enter your passphrase. Items lock again after 10 minutes without use.</p>') +
      '<input type="password" class="ctl" id="vPass" autocomplete="' + (setup ? 'new-password' : 'current-password') + '" placeholder="Passphrase" aria-label="Passphrase">' +
      (setup ? '<input type="password" class="ctl" id="vPass2" autocomplete="new-password" placeholder="Type it again" aria-label="Type the passphrase again" style="margin-top:8px">' : '') +
      '<div style="display:flex;gap:8px;align-items:center;margin-top:12px"><button type="button" class="chipbtn solid" id="vGo">' + (setup ? 'Set passphrase' : 'Unlock') + '</button><span class="hint" id="vMsg"></span></div></div></div>';
    el.hidden = false; setTimeout(() => $('#vPass') && $('#vPass').focus(), 30);
  }
  async function vaultSubmit() {
    const v = vaultItem(), p1 = $('#vPass').value, msg = $('#vMsg');
    if (!v) {
      if (p1.length < 6) { msg.textContent = 'Use at least 6 characters.'; return; }
      if (p1 !== $('#vPass2').value) { msg.textContent = 'The two don’t match.'; return; }
      msg.textContent = 'Setting up…';
      const salt = crypto.getRandomValues(new Uint8Array(16)), key = await deriveKey(p1, salt);
      vault.key = key; newTask({ id: 'vault', type: 'vault', salt: b64(salt), check: await encStr('tally-vault-ok', key) }); save();
    } else {
      msg.textContent = 'Checking…';
      const key = await deriveKey(p1, unb64(v.salt));
      try { if (await decStr(v.check, key) !== 'tally-vault-ok') throw 0; } catch (e) { msg.textContent = 'That passphrase isn’t right.'; $('#vPass').select(); return; }
      vault.key = key;
    }
    await openPlain(); armAutoLock(); closeSheet();
    const d = ui.vaultDone; ui.vaultDone = null; render(); if (d) d(true);
  }
  async function encryptStored(key) { const b = await fget(key); if (!b) return false; await fput(key, new Blob([await encBytes(new Uint8Array(await b.arrayBuffer()))])); return true; }
  async function decryptStored(key, type) { const b = await fget(key); if (!b) return false; await fput(key, new Blob([await decBytes(new Uint8Array(await b.arrayBuffer()))], { type })); return true; }
  async function lockItem(raw) {
    if (!(await needVault())) return;
    raw = taskById(raw.id) || raw;
    const p = { body: raw.body, items: raw.items, number: raw.number, texts: {} };
    (raw.attachments || []).forEach(a => { if (a.text) p.texts[a.id] = a.text; });
    for (const a of raw.attachments || []) {
      if (a.enc) continue;
      for (const key of [a.id, a.id + '_t']) { if (!(await fget(key))) { const b = await blobFor(a, key !== a.id, true); if (b) await fput(key, b); } }
      if (await encryptStored(a.id)) { if (a.thumb) await encryptStored(a.id + '_t'); a.enc = true; a.up = false; a.upT = false; [a.id, a.id + '_t'].forEach(k => { if (urlCache[k]) encUrls.add(k); }); }
    }
    const j = JSON.stringify(p); raw.sealed = await encStr(j);
    SEALED.forEach(k => delete raw[k]); (raw.attachments || []).forEach(a => delete a.text);
    raw.locked = true; vault.plain[raw.id] = p; vault.json[raw.id] = j; vault.sealedAs[raw.id] = raw.sealed;
    touchNote(raw); save(); render(); uploadPending(); toast('Locked. It opens with your passphrase.');
  }
  async function unlockItem(raw) {
    if (!(await needVault())) return;
    const p = vault.plain[raw.id]; if (!p) return;
    for (const a of raw.attachments || []) {
      if (!a.enc) continue;
      for (const key of [a.id, a.id + '_t']) { if (!(await fget(key))) { const b = await blobFor(a, key !== a.id, true); if (b) await fput(key, b); } }
      if (await decryptStored(a.id, a.mime)) { if (a.thumb) await decryptStored(a.id + '_t', 'image/jpeg'); a.enc = false; a.up = false; a.upT = false; }
      if (p.texts && p.texts[a.id]) a.text = p.texts[a.id];
    }
    SEALED.forEach(k => { if (p[k] !== undefined) raw[k] = p[k]; });
    delete raw.sealed; delete raw.locked; delete vault.plain[raw.id];
    [].concat(raw.attachments || []).forEach(a => [a.id, a.id + '_t'].forEach(k => encUrls.delete(k)));
    touchNote(raw); save(); render(); uploadPending(); toast('No longer locked');
  }

  // ---- local file store (IndexedDB): originals + previews; synced to Supabase Storage when signed in
  let fdbP = null;
  function fdb() {
    if (!fdbP) fdbP = new Promise((res, rej) => { const r = indexedDB.open('tally-files', 1); r.onupgradeneeded = () => r.result.createObjectStore('files'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    return fdbP;
  }
  async function fput(k, blob) { const db = await fdb(); return new Promise((res, rej) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put(blob, k); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
  async function fget(k) { const db = await fdb(); return new Promise(res => { const r = db.transaction('files').objectStore('files').get(k); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); }); }
  async function fdel(k) { try { const db = await fdb(); db.transaction('files', 'readwrite').objectStore('files').delete(k); } catch (e) { } }
  const urlCache = {}, encUrls = new Set();
  // raw = true returns the stored bytes as they are (scrambled for locked items)
  async function blobFor(a, thumb, raw) {
    const key = a.id + (thumb ? '_t' : '');
    let b = await fget(key);
    if (!b && syncReady()) {
      try { const { data } = await sync.client.storage.from('attachments').download(sync.user.id + '/' + key); if (data) { b = data; fput(key, b); } } catch (e) { }
    }
    if (!b && thumb) return raw ? null : blobFor(a, false);
    if (b && a.enc && !raw) {
      if (!vault.key) return null;
      try { b = new Blob([await decBytes(new Uint8Array(await b.arrayBuffer()))], { type: thumb ? 'image/jpeg' : a.mime }); } catch (e) { return null; }
    }
    return b;
  }
  async function urlFor(a, thumb) {
    const key = a.id + (thumb ? '_t' : '');
    if (urlCache[key]) return urlCache[key];
    const b = await blobFor(a, thumb); if (!b) return null;
    if (a.enc) encUrls.add(key);
    return (urlCache[key] = URL.createObjectURL(b));
  }
  function hydrate(root) {
    (root || document).querySelectorAll('img[data-att]:not([data-done])').forEach(async img => {
      img.dataset.done = '1';
      const n = taskById(img.dataset.note); const a = n && (n.attachments || []).find(x => x.id === img.dataset.att);
      if (!a) return;
      const u = await urlFor(a, img.dataset.thumb === '1');
      if (u) img.src = u; else { const w = img.closest('.attwrap, .ncell'); if (w) w.classList.add('missing'); }
    });
  }

  // ---- making previews
  function loadImage(blob) { return new Promise((res, rej) => { const u = URL.createObjectURL(blob); const im = new Image(); im.onload = () => { res(im); setTimeout(() => URL.revokeObjectURL(u), 1000); }; im.onerror = rej; im.src = u; }); }
  function canvasBlob(src, w, h, max, q, type) {
    const s = Math.min(1, max / Math.max(w, h)), c = document.createElement('canvas');
    c.width = Math.round(w * s); c.height = Math.round(h * s);
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(src, 0, 0, c.width, c.height);
    return new Promise(res => c.toBlob(b => res(b), type || 'image/jpeg', q));
  }
  let pdfLib = null;
  async function loadPdf() {
    if (!pdfLib) { pdfLib = await import(new URL('vendor/pdf.min.mjs', location.href).href); pdfLib.GlobalWorkerOptions.workerSrc = new URL('vendor/pdf.worker.min.mjs', location.href).href; }
    return pdfLib;
  }
  async function pdfPageCanvas(doc, n, size) {
    const page = await doc.getPage(n); const vp0 = page.getViewport({ scale: 1 }); const vp = page.getViewport({ scale: size / Math.max(vp0.width, vp0.height) });
    const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: g, viewport: vp }).promise;
    return c;
  }
  async function pdfThumb(blob) {
    try {
      const lib = await loadPdf();
      const doc = await lib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
      const c = await pdfPageCanvas(doc, 1, 1000);
      const pages = doc.numPages; doc.destroy && doc.destroy();
      return { thumb: await new Promise(res => c.toBlob(b => res(b), 'image/jpeg', .82)), pages };
    } catch (e) { return { thumb: null, pages: null }; }
  }
  // Add photos/PDFs to any item (note, document, task, event). Large photos are resized to 2400px so they sync quickly.
  async function addFiles(n, files, quiet) {
    n = taskById(n.id) || n;
    let added = 0, skipped = 0;
    for (const f of files) {
      const mime = f.type || (/\.pdf$/i.test(f.name) ? 'application/pdf' : /\.(jpe?g)$/i.test(f.name) ? 'image/jpeg' : /\.png$/i.test(f.name) ? 'image/png' : '');
      if (!/^image\//.test(mime) && mime !== 'application/pdf') { skipped++; continue; }
      if (f.size > 40 * 1048576) { skipped++; continue; }
      const a = { id: uid(), name: f.name || (mime === 'application/pdf' ? 'Document.pdf' : 'Photo.jpg'), mime, size: f.size };
      try {
        let full = f, thumb = null;
        if (mime === 'application/pdf') {
          const r = await pdfThumb(f); thumb = r.thumb; if (r.pages) a.pages = r.pages;
        } else {
          const im = await loadImage(f); a.w = im.naturalWidth; a.h = im.naturalHeight;
          const MAXD = n.type === 'daynote' ? 1600 : 2400; // journal photos are kept smaller
          if ((Math.max(a.w, a.h) > MAXD || f.size > (n.type === 'daynote' ? 1 : 3) * 1048576) && mime !== 'image/gif') { full = await canvasBlob(im, a.w, a.h, MAXD, n.type === 'daynote' ? .8 : .86) || f; a.mime = 'image/jpeg'; a.name = a.name.replace(/\.(png|jpe?g|webp|heic)$/i, '') + '.jpg'; }
          thumb = await canvasBlob(im, a.w, a.h, 800, .82);
        }
        a.size = full.size;
        if (n.locked && vault.key) {
          await fput(a.id, new Blob([await encBytes(new Uint8Array(await full.arrayBuffer()))]));
          if (thumb) await fput(a.id + '_t', new Blob([await encBytes(new Uint8Array(await thumb.arrayBuffer()))]));
          a.enc = true; a.ocr = true;
        } else { await fput(a.id, full); if (thumb) await fput(a.id + '_t', thumb); }
        if (thumb) a.thumb = true;
        n.attachments = (n.attachments || []).concat([a]); added++;
      } catch (e) { skipped++; }
    }
    touchNote(n); save();
    if (!quiet && skipped) toast(added + ' added. ' + skipped + ' skipped (only photos and PDFs up to 40 MB).');
    uploadPending(); setTimeout(runOcr, 3000);
    return added;
  }
  const unfocusOl = () => { const a = document.activeElement; if (a && a.matches && a.matches('.ol-in')) a.blur(); };
  async function addFilesUI(n, files) {
    toast('Adding ' + files.length + ' file' + (files.length === 1 ? '' : 's') + '…');
    const k = await addFiles(n, files); unfocusOl(); render(); if (k) toast(k + ' file' + (k === 1 ? '' : 's') + ' added', true);
  }

  // ---- upload pending files to Supabase Storage (needs the storage setup once)
  let uploading = false, uploadErr = '';
  async function uploadPending() {
    if (uploading || !syncReady()) return;
    uploading = true;
    try {
      for (const n of allItems()) {
        for (const a of n.attachments || []) {
          for (const [key, flag] of [[a.id, 'up'], [a.id + '_t', 'upT']]) {
            if (a[flag] || (flag === 'upT' && !a.thumb)) continue;
            const b = await fget(key); if (!b) continue;
            const { error } = await sync.client.storage.from('attachments').upload(sync.user.id + '/' + key, b, { upsert: true, contentType: a.enc ? 'application/octet-stream' : flag === 'upT' ? 'image/jpeg' : a.mime });
            if (error) { uploadErr = error.message || String(error); throw error; }
            a[flag] = true; uploadErr = ''; save();
          }
        }
      }
    } catch (e) { } finally { uploading = false; if (paperView(ui.view)) renderMain(); }
  }
  const pendingUploads = () => S.tasks.reduce((s, n) => s + (n.attachments || []).filter(a => !a.up).length, 0);
  // Remove stored files nothing points to any more (after permanent delete or removing a file).
  async function gcFiles() {
    const keep = new Set();
    allItems().forEach(n => (n.attachments || []).forEach(a => { keep.add(a.id); keep.add(a.id + '_t'); }));
    try {
      const db = await fdb();
      const keys = await new Promise(res => { const r = db.transaction('files').objectStore('files').getAllKeys(); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); });
      keys.filter(k => !keep.has(k)).forEach(fdel);
    } catch (e) { }
    if (!syncReady() || !sync.meta.lastPull) return;
    try {
      const { data } = await sync.client.storage.from('attachments').list(sync.user.id, { limit: 1000 });
      const old = Date.now() - 30 * 86400000; // grace period, so a restored backup still finds its files
      const gone = (data || []).filter(o => o.id && !keep.has(o.name) && new Date(o.created_at || 0).getTime() < old).map(o => sync.user.id + '/' + o.name);
      if (gone.length) await sync.client.storage.from('attachments').remove(gone);
    } catch (e) { }
  }

  // ---- file tiles (used in notes, documents, tasks and events)
  function attGrid(t) {
    const all = t.attachments || []; if (!all.length) return '';
    const live = all.filter(a => !a.arch), old = all.filter(a => a.arch);
    return tiles(t, live, false) + (old.length ? '<details class="attarch"' + (ui.showArchFiles === t.id ? ' open' : '') + '><summary data-archsum="' + t.id + '">Archived files (' + old.length + ')</summary>' + tiles(t, old, true) + '</details>' : '');
  }
  function tiles(t, atts, arch) {
    if (!atts.length) return '';
    return '<div class="attgrid">' + atts.map(a => '<div class="attwrap' + (a.mime === 'application/pdf' ? ' pdf' : '') + '"><button type="button" class="attopen" data-attopen="' + a.id + '" title="Open ' + esc(a.name) + '"><img alt="' + esc(a.name) + '" data-att="' + a.id + '" data-note="' + t.id + '" data-thumb="' + (isDoc(t) && a.mime !== 'application/pdf' ? '0' : '1') + '">' + (a.mime === 'application/pdf' ? '<span class="pdftag">PDF' + (a.pages ? ' · ' + a.pages + ' p' : '') + '</span>' : '') + '</button><span class="attname">' + esc(a.name) + '</span><span class="attbtns"><button type="button" class="attact" data-attarch="' + a.id + '" aria-label="' + (arch ? 'Bring back ' : 'Archive ') + esc(a.name) + '" title="' + (arch ? 'Bring back' : 'Archive (keep it, but out of the way)') + '">' + (arch ? I.restore : I.archive) + '</button><button type="button" class="attact" data-attdel="' + a.id + '" aria-label="Remove ' + esc(a.name) + '" title="Delete">' + I.x + '</button></span></div>').join('') + '</div>';
  }
  const dropZone = small => '<div class="ndrop' + (small ? ' small' : '') + '" data-ndropzone="1">' + I.image + '<span>Drop photos or PDFs here, paste with Ctrl+V, or <button type="button" class="linkbtn" data-pickfiles="1">choose files</button></span></div>';
  // For the task and event panels
  function attField(t) { return '<div class="field"><span class="field-label">Files</span>' + attGrid(t) + dropZone(true) + '</div>'; }
  async function removeAttachment(raw, attId) { unfocusOl(); snapshot(); raw.attachments = (raw.attachments || []).filter(a => a.id !== attId); touchNote(raw); save(); render(); toast('Removed', true); }

  // ---- expiry dates (documents and notes): one task "<name> expires" on the date, with a heads-up some time before
  // Whose and which: "Sam's passport", "car registration"
  function docName(item) { const v = E(item), t = noteTitle(item), h = (v.holder || '').trim(); return h && !t.toLowerCase().includes(h.toLowerCase()) ? h + '\u2019s ' + t : t; }
  // Linked task: once ticked off or deleted it stays that way, until the expiry date changes
  function linked(id, forDate, curFor) {
    if (!id) return { t: null, keep: false };
    const t = taskById(id);
    if (t && !t.done) return { t, keep: true };
    if (curFor === forDate && (t || S.trash.tasks.some(x => x.id === id))) return { t: null, keep: true };
    return { t: null, keep: false };
  }
  const LEADS = [[120, '4 months before'], [90, '3 months before'], [60, '2 months before'], [30, '1 month before'], [14, '2 weeks before'], [7, '1 week before'], [0, 'On the day only']];
  const leadOf = item => item.lead ?? 60;
  // Heads-ups for an expiry task (at 6am, not shown on the task): the chosen lead time, 1 week before, and the day itself
  const expTaskStages = t => [...new Set([t.lead ?? 60, 7, 0])].filter(d => d <= (t.lead ?? 60)).sort((a, b) => b - a).map(d => D.toISO(D.addDays(D.fromISO(t.due), -d)) + AM);
  function expTask(item) { const t = item.expTaskId && taskById(item.expTaskId); return t && !t.done ? t : null; }
  function placeExpTask(item) {
    const cur = expTask(item);
    if (!item.expires || item.expires < todayISO()) { if (cur) trashTask(cur); return; }
    const L = linked(item.expTaskId, item.expires, item.expTaskFor); if (!L.t && L.keep) return;
    let t = L.t; if (!t) { t = newTask({ renewFor: item.id, expFor: item.id }); item.expTaskId = t.id; }
    item.expTaskFor = item.expires;
    if (t.due !== item.expires || t.lead !== leadOf(item)) { t.due = item.expires; t.lead = leadOf(item); t.remindedFor = null; }
    const now = D.toLocalDT(new Date());
    t.reminder = expTaskStages(t).find(s => s > (t.remindedFor && t.remindedFor > now ? t.remindedFor : now)) || null;
    t.time = null; t.title = docName(item) + ' expires';
  }
  const retitleTasks = item => { if (item.expires) placeExpTask(item); };
  function setLead(item, days) { item.lead = days; placeExpTask(item); }
  function setExpiry(raw, iso) {
    raw.expires = iso || null;
    delete raw.reminder; delete raw.remindedFor; delete raw.renew;
    placeExpTask(raw);
  }
  const fmtLong = iso => { const d = D.fromISO(iso); return D.MON_SHORT[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); };
  function expInfo(iso) {
    if (!iso) return null;
    const d = D.diffDays(D.fromISO(iso), D.fromISO(todayISO()));
    if (d < 0) return { cls: 'expired', text: 'Expired ' + fmtLong(iso) };
    if (d === 0) return { cls: 'expired', text: 'Expires today' };
    if (d <= 60) return { cls: 'soon', text: 'Expires in ' + d + ' day' + (d === 1 ? '' : 's') };
    return { cls: '', text: 'Expires ' + fmtLong(iso) };
  }
  function renewRow(t) {
    const et = expTask(t); if (!et) return '';
    return '<div class="renewrow"><span>' + I.bell + 'Remind me</span><select class="ctl" id="nLead" aria-label="When to remind you">' + LEADS.map(([d, n]) => '<option value="' + d + '"' + (leadOf(t) === d ? ' selected' : '') + '>' + n + '</option>').join('') + '</select>' +
      '<button type="button" class="linkbtn" data-openitem="' + et.id + '" title="Open the task">Open task</button></div>';
  }
  // Notes have no expiry date field. A license, visa or passport found in a note's photos or PDFs still gets its
  // "… expires" task (on the calendar and in tasks); the note just says what was found, with a way to undo it.
  function noteExpLine(raw) {
    const n = E(raw), rows = [];
    const row = (date, what, from, btn) => { const x = expInfo(date); return '<div class="nexp' + (x ? ' ' + x.cls : '') + '">' + I.cal + '<span><b>' + esc(what) + '</b>' + (from ? ' <span class="nexp-from">(' + esc(from) + ')</span>' : '') + ': ' + (x ? esc(x.text) : '') + '. ' + btn + '</span></div>'; };
    if (n.expires) rows.push(row(n.expires, docName(raw), '', '<button type="button" class="example" data-ndact="clearexp">Remove</button>'));
    (raw.expDocs || []).filter(e => !e.no).forEach(e => rows.push(row(e.date, expDocName(raw, e), e.k === 'note' ? 'from the note text' : e.file, '<button type="button" class="example" data-ndact="expno:' + esc(e.k) + '">Not right? Remove</button>')));
    if (!rows.length) return '';
    return '<div class="nexps"><div class="nexp-head">Expiry dates found · each one is on your calendar and tasks, with reminders</div>' + rows.join('') + '</div>';
  }
  function expField(t) {
    const x = expInfo(t.expires);
    return '<div class="field expfield"><label for="nExp">Expiry date</label><div class="row2"><input type="date" class="ctl" id="nExp" value="' + (t.expires || '') + '">' + (t.expires ? '<button type="button" class="chipbtn" data-ndact="clearexp">Clear</button>' : '') + '</div>' +
      (x ? '<span class="hint exphint ' + x.cls + '">' + esc(x.text) + (t.expAuto ? ' \u00b7 found in the photo, change it if it\u2019s wrong' : '') + '</span>' + renewRow(t) : '<span class="hint">Optional. You’ll get reminders before it expires, and it shows on the calendar.</span>') + '</div>';
  }

  // ---- spotting expiry dates in photo text and notes (passports, Emirates ID, visas, licenses, car registration)
  const MONS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  function mkISO(y, mo, d) { if (y < 100) y += 2000; if (!(mo >= 1 && mo <= 12 && d >= 1 && d <= 31 && y >= 2000 && y <= 2100)) return null; const dt = new Date(y, mo - 1, d); return dt.getMonth() === mo - 1 ? D.toISO(dt) : null; }
  // Reads a date at the start of s. Numbers like 05/03/2027 are day-first on UAE documents (dayFirst), month-first in your own typing.
  function readDate(s, dayFirst) {
    let m;
    if ((m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})(?!\d)/))) return mkISO(+m[1], +m[2], +m[3]);
    if ((m = s.match(/^(\d{1,2})\s?[-\/.]\s?(\d{1,2})\s?[-\/.]\s?(\d{4}|\d{2})(?!\d)/))) {
      const a = +m[1], b = +m[2];
      const [d, mo] = a > 12 ? [a, b] : b > 12 ? [b, a] : dayFirst ? [a, b] : [b, a];
      return mkISO(+m[3], mo, d);
    }
    if ((m = s.match(/^(\d{1,2})\s*[-\/.]?\s*([a-z]{3,9})\.?(?:\s*\/\s*[a-z]{3,9}\.?)?\s*[-\/.,]?\s*(\d{4}|\d{2})(?!\d)/i))) { const mo = MONS[m[2].slice(0, 3).toLowerCase()]; return mo ? mkISO(+m[3], mo, +m[1]) : null; }
    if ((m = s.match(/^([a-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})(?!\d)/i))) { const mo = MONS[m[1].slice(0, 3).toLowerCase()]; return mo ? mkISO(+m[3], mo, +m[2]) : null; }
    return null;
  }
  const EXP_WORDS = /(date\s+of\s+expiry|expiry\s+date|expiration\s+date|date\s+of\s+expiration|expiration|expiry|expires?|exp\.?(?=[\s:.])|valid\s+(?:until|till|thru|through|to)|validity)/gi;
  function expiryDatesIn(text, dayFirst) {
    const out = []; if (!text) return out;
    let m; EXP_WORDS.lastIndex = 0;
    while ((m = EXP_WORDS.exec(text))) {
      // Every date just after the word; the latest is the expiry (cards often print "Issue Date  Expiry Date"
      // with both dates on the line below, so the first date there is the issue date)
      const win = text.slice(m.index + m[0].length, m.index + m[0].length + 70), got = [];
      for (let i = 0; i < win.length; i++) {
        if (i && /[a-z0-9]/i.test(win[i - 1])) continue; // start at a word boundary
        const d = readDate(win.slice(i), dayFirst); if (d) got.push(d);
      }
      if (got.length) out.push(got.sort().pop());
    }
    // Passport machine-readable line: ...<birth YYMMDD><check><sex><expiry YYMMDD><check>
    const mrz = text.toUpperCase().replace(/[ \t]/g, '').match(/[A-Z0-9<]{9}\d[A-Z<]{3}\d{6}\d[MF<](\d{2})(\d{2})(\d{2})\d/);
    if (mrz) { const d = mkISO(2000 + +mrz[1], +mrz[2], +mrz[3]); if (d) out.push(d); }
    return out;
  }
  const KINDS = [[/passport|passeport|reisepass|여권|^P<[A-Z<]{3}/im, 'Passport'], [/establishment\s*card|immigration\s*(establishment\s*)?card|est(ablishment)?\.?\s*card\s*no/i, 'Establishment card'], [/labou?r\s*card|work\s*permit/i, 'Labour card'], [/ejari|tenancy\s*contract/i, 'Tenancy contract'], [/emirates\s*id|identity\s*card|resident\s*identity|بطاقة الهوية/i, 'Emirates ID'], [/driving\s*licen[cs]e|driver'?s?\s*licen[cs]e/i, 'Driver’s license'], [/trade\s*licen[cs]e|economic\s*licen[cs]e/i, 'Trade license'], [/vehicle|registration|mulkiya|traffic\s*plate/i, 'Car registration'], [/residen(ce|t)\s*(visa|permit)|entry\s*permit|\bvisa\b/i, 'Visa'], [/insurance/i, 'Insurance']];
  const guessKind = text => { for (const [re, name] of KINDS) if (re.test(text)) return name; return ''; };
  const KIND_NAMES = KINDS.map(k => k[1]);
  const COUNTRY = { USA: 'US', KOR: 'Korean', ARE: 'UAE', GBR: 'UK', IND: 'Indian', PHL: 'Philippine', PAK: 'Pakistani', CAN: 'Canadian', AUS: 'Australian', NZL: 'New Zealand', JPN: 'Japanese', CHN: 'Chinese', FRA: 'French', DEU: 'German', D: 'German', ITA: 'Italian', ESP: 'Spanish', IRL: 'Irish', EGY: 'Egyptian', JOR: 'Jordanian', LBN: 'Lebanese', SAU: 'Saudi', LKA: 'Sri Lankan', NPL: 'Nepali', BGD: 'Bangladeshi', IDN: 'Indonesian', RUS: 'Russian', ZAF: 'South African' };
  const COUNTRY_WORDS = [[/united\s+states\s+of\s+america/i, 'US'], [/republic\s+of\s+korea|대한민국/i, 'Korean'], [/united\s+kingdom/i, 'UK'], [/republic\s+of\s+india/i, 'Indian'], [/philippines/i, 'Philippine'], [/canada/i, 'Canadian'], [/united\s+arab\s+emirates/i, 'UAE']];
  const CAR_MODELS = ['LAND CRUISER', 'PRADO', 'FORTUNER', 'INNOVA', 'CAMRY', 'COROLLA', 'HILUX', 'RAV4', 'YARIS', 'HIACE', 'PATROL', 'SUNNY', 'ALTIMA', 'X-TRAIL', 'PAJERO', 'TUCSON', 'SANTA FE', 'ELANTRA', 'SONATA', 'PALISADE', 'SPORTAGE', 'SORENTO', 'EXPLORER', 'TAHOE', 'WRANGLER', 'CIVIC', 'ACCORD', 'CR-V'];
  const CAR_MAKES = 'TOYOTA|LEXUS|NISSAN|INFINITI|HONDA|MITSUBISHI|MAZDA|SUBARU|SUZUKI|HYUNDAI|KIA|GENESIS|FORD|CHEVROLET|GMC|CADILLAC|JEEP|DODGE|BMW|MERCEDES-BENZ|MERCEDES|AUDI|VOLKSWAGEN|PORSCHE|LAND ROVER|RANGE ROVER|VOLVO|TESLA|GEELY|CHERY|JETOUR';
  // A real first name: letters only, 2-15 long, no "<<<" filler misread as KKK/LLL
  function plausibleName(w) {
    if (!w || !/^[A-Za-z][A-Za-z'\-]{1,14}$/.test(w)) return false;
    if (/^(issue[ds]?|issuing|expiry|expires?|expiration|date|place|number|no|nos|licen[cs]e|type|status|address|company|trade|legal|card|id|owner|manager|holder|name|names|surname|given|nationality|sex|gender|birth|valid|validity|from|to|of|the|and|for|by|in|on|at|activity|activities|category|class|code|ref|reference|registration|certificate|authority|branch|unit|emirate|emirates|state|country|republic|kingdom|united|federal|government|ministry|department|office|page|signature|photo|mobile|phone|tel|email|fax|po|box|zone|free|dubai|uae)$/i.test(w)) return false; // label words a scan can be misread as a name
    if (/(.)\1\1/i.test(w)) return false;
    const kl = (w.match(/[KL]/gi) || []).length; return !(w.length > 6 && kl / w.length > 0.6);
  }
  const nameCase = s => s.toLowerCase().replace(/(^|[\s\-])[a-z]/g, c => c.toUpperCase());
  function carName(up) {
    const m = up.match(new RegExp('\\b(' + CAR_MAKES + ')\\b[\\s:]+([A-Z0-9][A-Z0-9\\-]{1,12})'));
    if (m && /\d/.test(m[2])) return nameCase(m[1]) + ' ' + m[2]; // Genesis G70
    const known = CAR_MODELS.find(x => up.includes(x)); if (known) return nameCase(known);
    if (m && !/^(MODEL|COLOR|COLOUR|TYPE|YEAR)$/.test(m[2])) return nameCase(m[2]);
    const mk = up.match(new RegExp('\\b(' + CAR_MAKES + ')\\b')); return mk ? nameCase(mk[1]) : '';
  }
  // What a document is and whose it is: "passport" + "Sam", "car registration", "Emirates ID" + "Sam"
  function describeDoc(text) {
    const kind = guessKind(text), out = { kind, title: kind, holder: '' };
    if (!kind) return out;
    const up = text.toUpperCase(), flat = up.replace(/[ \t]/g, '');
    const firstName = re => { const m = text.match(re); const w = m && m[1].trim().split(/\s+/)[0]; return plausibleName(w) && !/^(name|surname|given|nationality|sex|date)$/i.test(w) ? nameCase(w) : ''; };
    if (kind === 'Passport') {
      const m = flat.match(/P[<A-Z]([A-Z]{3}|D<<)([A-Z]+(?:<[A-Z]+)*)<<([A-Z]+)/);
      let c = m && COUNTRY[m[1].replace(/</g, '')];
      if (!c) { const w = COUNTRY_WORDS.find(([re]) => re.test(text)); c = w && w[1]; }
      if (c) out.title = c + ' passport';
      // The coded line pads names with <<<<, which the reader often turns into letters (JINO<<< → JINOS, JINOKKK).
      // So the printed name wins; the coded line is only used when it matches a word printed on the page.
      const printedText = text.split('\n').filter(l => !/<<|[A-Z0-9<]{25,}/.test(l.replace(/\s/g, ''))).join('\n');
      const printed = firstName(/given\s*names?[^\n]*\n\s*([^\n]+)/i) || firstName(/given\s*names?\s*[:\/]?\s*([A-Za-z][^\n]{1,40})/i);
      let g = m ? m[3].replace(/[KL<]{3,}.*$/, '') : '';
      if (g) {
        const G = g.toUpperCase(), words = printedText.toUpperCase().match(/\b[A-Z]{2,15}\b/g) || [];
        if (printed && G.startsWith(printed.toUpperCase())) g = printed;
        else if (!words.includes(G)) { const w = words.filter(x => G.startsWith(x) && x.length >= Math.max(2, G.length - 2)).sort((a, b) => b.length - a.length)[0]; g = w || g; }
      }
      out.holder = g && plausibleName(g) ? nameCase(g) : printed;
      const l2 = flat.match(/[A-Z0-9<]{9}\d[A-Z<]{3}(\d{6})\d[MF<]\d{6}\d/); if (l2) out.dob = l2[1];
    } else if (kind === 'Car registration' || kind === 'Insurance') {
      const car = carName(up); if (car) out.title = car + (kind === 'Insurance' ? ' insurance' : ' registration');
    } else if (kind === 'Establishment card' || kind === 'Trade license') {
      // a company, not a person: use its full name ("Acme Trading LLC")
      const m = text.match(/(?:establishment|company|trade)\s*name\s*[:.\-]?\s*([A-Za-z0-9][^\n]{1,60})/i) || text.match(/\bname\s*[:.\-]?\s*([A-Za-z0-9][^\n]{1,60})/i);
      const co = m ? m[1].replace(/\s{2,}.*$/, '').trim() : '';
      if (co && /[A-Za-z]{2}/.test(co)) out.holder = nameCase(co).replace(/\b(Llc|Fze|Fzco|Fzc|Fz-llc|Dmcc|Plc|Ltd)\b/g, w => w.toUpperCase()).slice(0, 40);
    } else {
      out.holder = firstName(/\bname\s*[:.\-]?\s*([A-Za-z][^\n]{1,40})/i);
    }
    return out;
  }
  function detectExpiry(t) {
    const v = E(t), atts = (t.attachments || []).filter(a => !a.arch);
    const dates = [].concat(...atts.map(a => expiryDatesIn(a.text || '', true)), expiryDatesIn([v.title, v.body].filter(Boolean).join('\n'), false));
    const T = todayISO(), future = dates.filter(d => d >= T).sort();
    const past = dates.filter(d => d < T && d >= String(+T.slice(0, 4) - 10) + T.slice(4)).sort();
    return { date: future[0] || past[past.length - 1] || null, desc: describeDoc(atts.map(a => a.text || '').join('\n') + '\n' + (v.title || '') + '\n' + (v.body || '')) };
  }
  // Fills in expiry dates nobody set by hand; the renewal task and calendar follow from setExpiry
  // Your own name isn't put in front of your documents ("Passport", not "Jino's passport"). Tally knows it from
  // names you cleared from "Belongs to", and from the email you sync with (jino_kim@… → Jino).
  const myNames = () => { const out = (S.settings.meNames || []).map(x => x.toLowerCase()); const em = sync && sync.user && sync.user.email; if (em) { const first = em.split('@')[0].split(/[._\-+0-9]+/).filter(x => x.length >= 2)[0]; if (first) out.push(first.toLowerCase()); } return out; };
  const isMe = name => !!name && myNames().includes(name.trim().split(/\s+/)[0].toLowerCase());
  // ---- Notes: every photo or PDF (and the note's own text) is read on its own, so a note holding a passport,
  // a visa and an establishment card gets three "… expires" tasks, each named after its own document.
  // Entries live in note.expDocs: { k: file id or 'note', file, date, title, holder, taskId, taskFor, no }.
  function noteSources(t) {
    const v = E(t), out = (t.attachments || []).filter(a => !a.arch && a.text).map(a => ({ k: a.id, file: a.name || 'file', text: a.text, dayFirst: true }));
    const own = [v.title, v.body].filter(Boolean).join('\n'); if (own.trim()) out.push({ k: 'note', file: '', text: own, dayFirst: false });
    return out;
  }
  function pickExpiry(dates) {
    const T = todayISO(), future = dates.filter(d => d >= T).sort();
    const past = dates.filter(d => d < T && d >= String(+T.slice(0, 4) - 10) + T.slice(4)).sort();
    return future[0] || past[past.length - 1] || null;
  }
  function expDocName(note, e) {
    // one document in a note you titled: your title; several: what each one is (Visa, Emirates ID…)
    const many = (note.expDocs || []).filter(x => !x.no).length > 1, own = E(note).title;
    const base = (!many && own) ? own : (e.title || noteTitle(note)), h = (e.holder || '').trim();
    return h && !base.toLowerCase().includes(h.toLowerCase()) ? h + '\u2019s ' + base : base;
  }
  function placeDocTask(note, e, dup) {
    const cur = e.taskId && taskById(e.taskId), live = cur && !cur.done ? cur : null;
    if (dup || e.no || !e.date || e.date < todayISO()) { if (live) trashTask(live); if (dup) { e.taskId = null; e.taskFor = null; } return; }
    const L = linked(e.taskId, e.date, e.taskFor); if (!L.t && L.keep) return;
    let t = L.t; if (!t) { t = newTask({ renewFor: note.id, expFor: note.id, expKey: e.k }); e.taskId = t.id; }
    e.taskFor = e.date;
    if (t.due !== e.date || t.lead === undefined) { t.due = e.date; t.lead = t.lead ?? 60; t.remindedFor = null; }
    const now = D.toLocalDT(new Date());
    t.reminder = expTaskStages(t).find(x => x > (t.remindedFor && t.remindedFor > now ? t.remindedFor : now)) || null;
    t.time = null; t.title = expDocName(note, e) + ' expires';
  }
  function scanNoteDocs(t) {
    const list = t.expDocs || (t.expDocs = []), found = [], seen = new Set();
    for (const src of noteSources(t)) {
      const date = pickExpiry(expiryDatesIn(src.text, src.dayFirst)); if (!date) continue;
      const d = describeDoc(src.text); let hold = d.holder; if (isMe(hold)) hold = '';
      seen.add(src.k);
      let e = list.find(x => x.k === src.k);
      if (!e) { e = { k: src.k, file: src.file, date, title: d.kind ? d.title : '', holder: hold }; list.push(e); found.push({ name: expDocName(t, e), date }); }
      else if (!e.no && (e.date !== date || (d.kind && e.title !== d.title) || (hold && e.holder !== hold))) { e.date = date; if (d.kind) e.title = d.title; if (hold) e.holder = hold; e.file = src.file; found.push({ name: expDocName(t, e), date }); }
    }
    list.forEach(e => { if (e.holder && isMe(e.holder)) e.holder = ''; }); // your own name isn't shown
    // a file that was deleted or archived takes its task with it
    for (const e of list.slice()) if (!seen.has(e.k)) { const x = e.taskId && taskById(e.taskId); if (x && !x.done) trashTask(x); list.splice(list.indexOf(e), 1); }
    // From before: one expiry date for the whole note. Its task carries on as the matching document's task.
    if (t.expAuto && t.expires) {
      const m = list.find(e => e.date === t.expires && !e.taskId);
      if (m) { m.taskId = t.expTaskId; m.taskFor = t.expTaskFor; } else { const old = expTask(t); if (old) trashTask(old); }
      t.expires = null; t.expTaskId = null; t.expTaskFor = null; t.expAuto = false;
    }
    // the same document photographed twice (front and back) gets one task
    list.forEach((e, i) => placeDocTask(t, e, !e.no && list.slice(0, i).some(o => !o.no && o.date === e.date && expDocName(t, o) === expDocName(t, e))));
    if (list.length) t.expDocs = list; else delete t.expDocs;
    return found;
  }
  function autoExpiryScan() {
    const found = [], backOnly = []; let moved = 0, fixed = 0;
    const foundNotes = [];
    for (const t of S.tasks.slice()) if (t.type === 'note' && !t.archived && !shut(t) && !t.expNo && (!t.expires || t.expAuto)) foundNotes.push(...scanNoteDocs(t));
    for (let pass = 0; pass < 2; pass++) for (const t of S.tasks) { // second pass: names borrowed from a twin passport
      if (!isDoc(t) || t.archived || shut(t) || t.expNo || (t.expires && !t.expAuto)) continue; // notes too: a passport or visa photo in a note still gets its expiry task
      if (t.expAuto && t.titleAuto === undefined && KIND_NAMES.includes(t.title)) t.titleAuto = true; // named by an earlier version
      if (t.holderAuto && t.holder && isMe(t.holder)) { t.holder = ''; t.holderAuto = false; retitleTasks(t); fixed++; }
      if (t.holderAuto && t.holder && !plausibleName(t.holder)) { t.holder = ''; t.holderAuto = false; retitleTasks(t); fixed++; } // a misread name from before
      if (isDoc(t) && t.keepId && t.expAuto && !t.docByHand && !t.movedBack) { t.type = 'note'; t.movedBack = true; moved++; backOnly.push(t); } // an earlier version moved these on its own; the user moves them by hand
      const r = detectExpiry(t); if (!r.date) continue;
      const d = r.desc; let changed = false;
      if (d.kind && d.title && (!t.title || t.titleAuto) && d.title !== t.title) { t.title = d.title; t.titleAuto = true; changed = true; }
      if (d.dob && t.dob !== d.dob) { t.dob = d.dob; changed = true; }
      // No readable first name? Another passport with the same birth date is the same person
      const twin = !d.holder && t.dob && S.tasks.find(x => x !== t && isPaper(x) && x.dob === t.dob && (x.holder || '').trim());
      let hold = d.holder || (twin ? twin.holder.trim() : ''); if (isMe(hold)) hold = '';
      if (hold && (!t.holder ? !t.holderAuto || twin : t.holderAuto) && hold !== t.holder) { t.holder = hold; t.holderAuto = true; changed = true; }
      if (r.date === t.expires && !changed && (t.expTaskId || r.date < todayISO())) continue;
      setExpiry(t, r.date); t.expAuto = true; if (!found.includes(t)) found.push(t);
    }
    if (foundNotes.length) { save(); render(); toast((foundNotes.length === 1 ? 'Found ' + foundNotes[0].name + ': expires ' + fmtLong(foundNotes[0].date) : 'Found ' + foundNotes.length + ' expiry dates') + '. Tasks added.', true); }
    if ((fixed || moved) && !found.length) { save(); render(); }
    if (moved && !found.length) toast(moved + ' note' + (moved === 1 ? ' was' : 's were') + ' put back in Notes. Move them to Important Documents yourself if you want.', true);
    if (found.length) { save(); render(); toast((found.length === 1 ? 'Found ' + docName(found[0]) + ': expires ' + fmtLong(found[0].expires) : 'Found ' + found.length + ' expiry dates') + '. Tasks added' + (moved ? '. Notes moved to Important Documents earlier were put back in Notes' : '') + '.', true); }
    return found.length + foundNotes.length;
  }

  // ---- names and search
  function noteTitle(n) {
    const v = E(n);
    return (v.title || (shut(n) ? '' : ((v.body || '').trim().split('\n')[0] || (v.items && v.items[0] && v.items[0].text))) || ((v.attachments || [])[0] || {}).name || (isDoc(n) ? 'Untitled document' : 'Untitled note')).slice(0, 80);
  }
  function paperText(n) {
    const v = E(n), p = vault.plain[n.id];
    return [v.title, v.holder, shut(n) ? '' : v.body, shut(n) ? '' : v.number].concat(shut(n) ? [] : (v.items || []).map(i => i.text), (v.attachments || []).map(a => a.name + ' ' + (a.text || (p && p.texts && p.texts[a.id]) || ''))).join('\n').toLowerCase();
  }
  const attHit = (t, q) => (t.attachments || []).some(a => (a.name + ' ' + (a.text || '')).toLowerCase().includes(q));

  // ---- cards
  function collage(n) {
    const atts = (n.attachments || []).filter(a => !a.arch); if (!atts.length) return '';
    if (shut(n) && atts.some(a => a.enc)) return '<div class="nlocked">' + I.lock + '<span>' + atts.length + ' file' + (atts.length === 1 ? '' : 's') + '</span></div>';
    const shown = atts.slice(0, 6), extra = atts.length - shown.length, k = shown.length;
    const rows = { 1: [1], 2: [2], 3: [3], 4: [2, 2], 5: [3, 2], 6: [3, 3] }[k];
    const whole = isDoc(n) && k === 1; // a single document picture: show the whole page, not a crop
    const ar = a => whole && a.w && a.h ? a.w / a.h : a.mime === 'application/pdf' ? 0.78 : (a.w && a.h ? Math.min(2.2, Math.max(k === 1 ? 0.8 : 0.6, a.w / a.h)) : 1.33);
    let i = 0, h = '<div class="ncollage' + (whole ? ' whole' : '') + '">';
    rows.forEach(r => {
      h += '<div class="nrow">';
      for (let c = 0; c < r; c++, i++) {
        const a = shown[i], pdf = a.mime === 'application/pdf', last = i === k - 1 && extra > 0;
        h += '<div class="ncell' + (pdf ? ' pdf' : '') + '" style="flex:' + Math.round(ar(a) * 1000) + ' 1 0;aspect-ratio:' + ar(a).toFixed(3) + ';--ar:' + ar(a).toFixed(3) + '"><img alt="" data-att="' + a.id + '" data-note="' + n.id + '" data-thumb="' + (isDoc(n) && !pdf ? '0' : '1') + '">' + (pdf ? '<span class="pdftag">PDF</span>' : '') + (last ? '<span class="moreover">+' + extra + '</span>' : '') + '</div>';
      }
      h += '</div>';
    });
    return h + '</div>';
  }

  // ---- checkboxes and bullets inside a text note ("[ ] " / "[x] " / "• " at the start of a line)
  const NCHK = /^(\s*)\[( |x|X)\]\s?/, NBUL = /^(\s*)[•\-*]\s+/;
  const hasRich = t => /^\s*(\[( |x|X)\]|[•\-*]\s)/m.test(t || '');
  // Indent levels: 4 spaces (or a tab) per level, from Tab / Shift+Tab in the note
  const nLvl = ws => Math.min(4, Math.floor(ws.replace(/\t/g, '    ').length / 4));
  function richBody(text, id) {
    return '<div class="nrich">' + (text || '').split('\n').map((l, i) => {
      let m;
      if ((m = l.match(NCHK))) { const done = m[2] !== ' '; return '<div class="nr-l chk' + (done ? ' done' : '') + '" style="--ind:' + nLvl(m[1]) + '"><button type="button" class="nbox' + (done ? ' on' : '') + '" data-nchk="' + id + ':' + i + '" aria-label="' + (done ? 'Uncheck' : 'Check') + '">' + I.check + '</button><span>' + linkify(l.slice(m[0].length)) + '</span></div>'; }
      if ((m = l.match(NBUL))) return '<div class="nr-l bul" style="--ind:' + nLvl(m[1]) + '"><span class="nbul l' + (nLvl(m[1]) % 3) + '"></span><span>' + linkify(l.slice(m[0].length)) + '</span></div>';
      const ws = l.match(/^\s*/)[0];
      return '<div class="nr-l"' + (l.trim() && nLvl(ws) ? ' style="--ind:' + nLvl(ws) + '"' : '') + '>' + (l.trim() ? linkify(l.slice(ws.length)) : '&nbsp;') + '</div>';
    }).join('') + '</div>';
  }
  const noteTools = () => '<div class="ntools"><button type="button" class="chipbtn" data-nins="chk" title="Checkbox on this line">' + I.check + 'Checkbox</button><button type="button" class="chipbtn" data-nins="bul" title="Bullet on this line"><span class="nbul"></span>Bullet</button></div>';
  function noteCard(raw) {
    const n = E(raw), items = n.items || [], s = shut(raw);
    return '<div class="ncard' + (n.pinned ? ' pinned' : '') + (ui.selected === n.id ? ' sel' : '') + '" data-note="' + n.id + '" tabindex="0" role="button" aria-label="' + esc(noteTitle(raw)) + '">' +
      collage(raw) +
      ((n.title || n.body || items.length || s) ? '<div class="nbody">' +
        (n.title ? '<div class="ntitle">' + esc(n.title) + '</div>' : '') +
        (s ? '<div class="nlockline">' + I.lock + 'Locked</div>'
          : n.kind === 'list' ? '<ul class="nlist">' + items.filter(i => !i.done).slice(0, 6).map(i => '<li><span class="box"></span>' + esc(i.text) + '</li>').join('') + (items.filter(i => i.done).length ? '<li class="donecount">+ ' + items.filter(i => i.done).length + ' checked</li>' : '') + '</ul>'
            : (n.body ? (hasRich(n.body) ? richBody(n.body.split('\n').slice(0, 14).join('\n'), n.id) : '<div class="ntext">' + linkify(n.body.slice(0, 400)) + '</div>') : '')) +
        (n.expires ? '<div class="expbadge ' + expInfo(n.expires).cls + '">' + esc(expInfo(n.expires).text) + '</div>' : '') + '</div>' : '') +
      '<button type="button" class="npin" data-npin="' + n.id + '" aria-label="' + (n.pinned ? 'Unpin' : 'Pin') + '" title="' + (n.pinned ? 'Unpin' : 'Pin to top') + '">' + I.pin + '</button></div>';
  }
  function docCard(raw) {
    const d = E(raw), x = expInfo(d.expires), sel = ui.docSel && ui.docSel.has(d.id);
    return '<div class="ncard dcard' + (ui.selected === d.id ? ' sel' : '') + (sel ? ' picked' : '') + '" data-note="' + d.id + '" tabindex="0" role="button" aria-label="' + esc(noteTitle(raw)) + '">' +
      ((d.attachments || []).some(a => !a.arch) ? collage(raw) : '<div class="dempty">' + I.idcard + '</div>') +
      '<div class="nbody"><div class="ntitle">' + (raw.locked ? '<span class="lockmini">' + I.lock + '</span>' : '') + esc(noteTitle(raw)) + '</div>' +
      (d.holder ? '<div class="dholder">' + esc(d.holder) + '</div>' : '') +
      (x ? '<div class="expbadge ' + x.cls + '">' + esc(x.text) + '</div>' : '') + '</div>' +
      (ui.docSel ? '<span class="dpick" aria-hidden="true">' + I.check + '</span>' : '<button type="button" class="npin dshare" data-dshare="' + d.id + '" aria-label="Share ' + esc(noteTitle(raw)) + '" title="Share">' + I.share + '</button>') + '</div>';
  }

  // ---- views
  function renderNotes(arch) {
    const all = S.tasks.filter(arch ? isPaper : isKNote);
    const ns = all.filter(n => !!n.archived === arch).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.editedAt || b.createdAt) - (a.editedAt || a.createdAt));
    const nArch = all.filter(n => n.archived).length;
    let html = noteTabs();
    if (!arch) html += '<div class="ncapture"><input id="nNew" placeholder="Take a note… (Enter saves it as the title)" autocomplete="off" aria-label="Take a note"><button type="button" class="iconbtn" data-nnew="list" title="New checklist" aria-label="New checklist">' + I.steps + '</button><button type="button" class="iconbtn" data-nnew="files" title="New note with photos or PDFs" aria-label="New note with photos or PDFs">' + I.image + '</button></div>' +
      '<p class="hint ndrophint">Drop photos or PDFs anywhere here to make a note, or onto a note to add them.</p>';
    html += syncHint();
    const pinned = ns.filter(n => n.pinned), rest = ns.filter(n => !n.pinned);
    if (pinned.length && rest.length) html += '<div class="nlabel">Pinned</div><div class="ngrid">' + pinned.map(n => isDoc(n) ? docCard(n) : noteCard(n)).join('') + '</div><div class="nlabel">Others</div>';
    html += '<div class="ngrid">' + (pinned.length && rest.length ? rest : ns).map(n => isDoc(n) ? docCard(n) : noteCard(n)).join('') + '</div>';
    if (!arch) html = expiredBanner() + html;
    if (!ns.length) html += empty(arch ? 'Nothing archived' : 'No notes yet', arch ? 'Archive a note to tuck it away here.' : 'Type above, or drop a photo or PDF here.');
    const actions = lockBtn();
    return { title: 'Notes', sub: ns.length + ' note' + (ns.length === 1 ? '' : 's'), html, actions };
  }
  // Expired and not archived: always shown at the top of Notes until you archive it or enter the new date
  const expiredItems = () => S.tasks.filter(t => isPaper(t) && !t.archived && t.expires && t.expires < todayISO()).sort((a, b) => a.expires.localeCompare(b.expires));
  function expiredBanner() {
    const xs = expiredItems(); if (!xs.length) return '';
    return '<div class="expbanner" role="status"><div class="expbhead">' + I.bell + '<b>' + xs.length + ' expired</b><span>Renewed? Open it and add the new photo and date. Otherwise archive it.</span></div>' +
      xs.map(t => '<div class="expbrow"><button type="button" class="linkbtn" data-opennote="' + t.id + '">' + esc(docName(t)) + '</button><span class="hint">expired ' + esc(fmtLong(t.expires)) + '</span><span class="spacer"></span><button type="button" class="chipbtn" data-exparch="' + t.id + '">' + I.archive + 'Archive</button></div>').join('') + '</div>';
  }
  function expiredNotice() {
    const n = expiredItems().length, key = 'tally.expnotice';
    if (!n || localStorage.getItem(key) === todayISO()) return;
    localStorage.setItem(key, todayISO());
    toast(n + ' document' + (n === 1 ? ' has' : 's have') + ' expired. See the top of Notes.');
  }
  function syncHint() {
    let h = '';
    const pend = pendingUploads();
    if (pend && syncReady()) h += '<p class="hint">' + pend + ' file' + (pend === 1 ? '' : 's') + ' waiting to sync' + (uploadErr ? ': ' + esc(uploadErr) + (/bucket/i.test(uploadErr) ? ' (run the photo storage setup in Supabase)' : '') : '…') + '</p>';
    if (ocr.busy && ocr.left) h += '<p class="hint">Reading the text in ' + ocr.left + ' photo' + (ocr.left === 1 ? '' : 's') + ' so search can find it…</p>';
    return h;
  }
  const lockBtn = () => vault.key ? '<button type="button" class="chipbtn" data-vlock="1" title="Lock items again now">' + I.lock + 'Lock now</button>' : '';
  function noteTabs() {
    const nArch = S.tasks.filter(n => isPaper(n) && n.archived).length, nDocs = S.tasks.filter(n => isDoc(n) && !n.archived).length;
    const tab = (v, label, n) => '<button type="button" role="tab" class="ntab" data-nview="' + v + '" aria-selected="' + (ui.view === v) + '">' + label + (n ? ' <span class="cnt">' + n + '</span>' : '') + '</button>';
    return '<div class="ntabs" role="tablist">' + tab('notes', 'Notes') + tab('docs', I.idcard + 'Important Documents', nDocs) + tab('notes-archive', I.archive + 'Archive', nArch) + '</div>';
  }
  function renderDocs() {
    const ds = S.tasks.filter(n => isDoc(n) && !n.archived);
    let html = noteTabs() + expiredBanner() + '<div class="ncapture"><input id="dNew" placeholder="Add a document, e.g. Passport (Enter)" autocomplete="off" aria-label="Add a document"><button type="button" class="iconbtn" data-dnew="files" title="New document from photos or PDFs" aria-label="New document from photos or PDFs">' + I.image + '</button></div>' +
      '<p class="hint ndrophint">Drop a scan or photo here to add a document. Click ' + I.share + ' on a card to send it by WhatsApp or email.</p>' + syncHint();
    if (ui.docSel) html += '<div class="selbar"><span>' + ui.docSel.size + ' selected</span><span class="spacer"></span><button type="button" class="chipbtn solid" data-dsharesel="1"' + (ui.docSel.size ? '' : ' disabled') + '>' + I.share + 'Share</button><button type="button" class="chipbtn" data-dselcancel="1">Cancel</button></div>';
    // one grid, A to Z: no groups by who it belongs to (the name still shows on the card)
    if (ds.length) html += '<div class="ngrid">' + ds.slice().sort((a, b) => noteTitle(a).localeCompare(noteTitle(b))).map(docCard).join('') + '</div>';
    if (!ds.length) html += empty('No important documents yet', 'Add your passport, Emirates ID, visa, driver’s license or trade license, with a photo or PDF of each. Then they’re one click away when someone asks for a copy.');
    const soon = ds.filter(d => { const x = expInfo(d.expires); return x && x.cls; }).length;
    const actions = (ds.length ? '<button type="button" class="chipbtn" data-dselect="1">' + I.share + 'Share several</button>' : '') + lockBtn();
    return { title: 'Notes', sub: ds.length + ' important document' + (ds.length === 1 ? '' : 's') + (soon ? ' · ' + soon + ' expiring or expired' : ''), html, actions };
  }
  function noteRowForSearch(raw) {
    const n = E(raw);
    return '<div class="task knote" data-id="' + n.id + '"><span class="evicon">' + (isDoc(raw) ? I.idcard : I.note) + '</span><div class="tbody" data-opennote="' + n.id + '" role="button" tabindex="0"><div class="ttitle">' + esc(noteTitle(raw)) + '</div><div class="tmeta"><span>' + (isDoc(raw) ? 'Important document' : 'Note') + (n.archived ? ' (archived)' : '') + '</span>' + ((n.attachments || []).length ? '<span>' + I.image + (n.attachments.length) + '</span>' : '') + '</div></div></div>';
  }

  // ---- editors (right panel)
  function lockedPanel(raw) {
    return '<div class="d-scroll noteedit" data-notepanel="' + raw.id + '"><div class="d-title"><span class="ntitle-in">' + esc(noteTitle(raw)) + '</span><button type="button" class="iconbtn" data-ndact="close" aria-label="Close">' + I.x + '</button></div>' +
      '<div class="lockedbox">' + I.lock + '<p>This ' + (isDoc(raw) ? 'document' : 'note') + ' is locked.</p><button type="button" class="chipbtn solid" data-vunlock="1">Unlock with passphrase</button></div></div>';
  }
  function noteEditor(raw) {
    if (shut(raw)) return lockedPanel(raw);
    const n = E(raw), items = n.items || [];
    const itemRow = i => '<div class="nitem' + (i.done ? ' done' : '') + '" data-nitemrow="' + i.id + '"><button type="button" class="check small" data-nitemdone="' + i.id + '" aria-label="' + (i.done ? 'Uncheck' : 'Check') + '">' + I.check + '</button><input class="nitext" data-nitem="' + i.id + '" value="' + esc(i.text) + '" aria-label="List item"><button type="button" class="iconbtn" data-nitemdel="' + i.id + '" aria-label="Delete item">' + I.x + '</button></div>';
    return '<div class="d-scroll noteedit" data-notepanel="' + n.id + '">' +
      '<div class="d-title"><input id="nTitle" class="ntitle-in" placeholder="Title" value="' + esc(n.title || '') + '" aria-label="Note title"><button type="button" class="iconbtn' + (n.pinned ? ' on' : '') + '" data-ndact="pin" title="' + (n.pinned ? 'Unpin' : 'Pin to top') + '">' + I.pin + '</button><button type="button" class="iconbtn" data-ndact="close" aria-label="Close">' + I.x + '</button></div>' +
      (raw.locked ? '<div class="lockednote">' + I.lock + 'Locked · scrambled before it syncs</div>' : '') +
      (n.kind === 'list'
        ? '<div class="nitems">' + items.filter(i => !i.done).map(itemRow).join('') + '<input id="nNewItem" class="nitext add" placeholder="+ List item" aria-label="Add list item">' + (items.some(i => i.done) ? '<div class="nlabel">' + items.filter(i => i.done).length + ' checked</div>' + items.filter(i => i.done).map(itemRow).join('') : '') + '</div>'
        : noteTools() + (hasRich(n.body) && ui.nRaw !== n.id ? '<div class="nrich-wrap" data-nraw="1" title="Click to edit">' + richBody(n.body, n.id) + '</div><textarea id="nBody" class="ctl nbody-in" hidden aria-label="Note">' + esc(n.body || '') + '</textarea>' : '<textarea id="nBody" class="ctl nbody-in" placeholder="Note" aria-label="Note">' + esc(n.body || '') + '</textarea>')) +
      '<div class="links" id="dLinks">' + linksHtml({ title: n.title, notes: n.kind === 'list' ? items.map(i => i.text).join(' ') : n.body }) + '</div>' +
      attGrid(n) + dropZone() + noteExpLine(raw) +
      
      '</div><div class="d-foot nfoot"><button type="button" class="chipbtn" data-ndact="archive">' + I.archive + (n.archived ? 'Unarchive' : 'Archive') + '</button><button type="button" class="chipbtn" data-ndact="lock">' + I.lock + (raw.locked ? 'Unlock' : 'Lock') + '</button><button type="button" class="chipbtn" data-ndact="move">Move to Important Documents</button><span class="spacer"></span><button type="button" class="danger-btn" data-ndact="del">Delete</button></div>';
  }
  function docEditor(raw) {
    if (shut(raw)) return lockedPanel(raw);
    const d = E(raw), hasFiles = (d.attachments || []).some(a => !a.arch), hasImg = (d.attachments || []).some(a => !a.arch && /^image\//.test(a.mime));
    const holders = [...new Set(S.tasks.filter(isDoc).map(x => (x.holder || '').trim()).filter(Boolean))];
    return '<div class="d-scroll noteedit docedit" data-notepanel="' + d.id + '">' +
      '<div class="d-title"><input id="nTitle" class="ntitle-in" placeholder="Document name, e.g. Passport" value="' + esc(d.title || '') + '" aria-label="Document name"><button type="button" class="iconbtn" data-ndact="close" aria-label="Close">' + I.x + '</button></div>' +
      (raw.locked ? '<div class="lockednote">' + I.lock + 'Locked · scrambled before it syncs</div>' : '') +
      '<div class="sharebar"><button type="button" class="chipbtn solid" data-dact2="share"' + (hasFiles ? '' : ' disabled') + '>' + I.share + 'Share</button><button type="button" class="chipbtn" data-dact2="copy"' + (hasImg ? '' : ' disabled') + ' title="Copy the picture, then paste it into WhatsApp or an email">' + I.copy + 'Copy picture</button><button type="button" class="chipbtn" data-dact2="download"' + (hasFiles ? '' : ' disabled') + '>' + I.download + 'Download</button><button type="button" class="chipbtn" data-dact2="details" title="Copy the name, number and expiry as text">' + I.copy + 'Copy details</button></div>' +
      attGrid(d) + dropZone() +
      '<div class="field"><label for="dHolder">Belongs to</label><input class="ctl" id="dHolder" list="dHolders" placeholder="Leave empty if it’s yours" value="' + esc(d.holder || '') + '"><datalist id="dHolders">' + holders.map(h => '<option value="' + esc(h) + '">').join('') + '</datalist></div>' +
      '<div class="field"><label for="dNumber">Number</label><div class="row2"><input class="ctl" id="dNumber" placeholder="e.g. 784-1990-1234567-1" value="' + esc(d.number || '') + '" autocomplete="off"><button type="button" class="chipbtn" data-dact2="copynum"' + (d.number ? '' : ' disabled') + '>Copy</button></div></div>' +
      expField(d) +
      '<div class="field"><label for="nBody">Notes</label>' + noteTools() + '<textarea id="nBody" class="ctl" placeholder="Issue date, where to renew, anything else">' + esc(d.body || '') + '</textarea></div>' +
      '</div><div class="d-foot nfoot"><button type="button" class="chipbtn" data-ndact="archive">' + I.archive + (d.archived ? 'Unarchive' : 'Archive') + '</button><button type="button" class="chipbtn" data-ndact="lock">' + I.lock + (raw.locked ? 'Unlock' : 'Lock') + '</button><button type="button" class="chipbtn" data-ndact="move">Move to Notes</button><span class="spacer"></span><button type="button" class="danger-btn" data-ndact="del">Delete</button></div>';
  }
  function newNote(o) { return newTask(Object.assign({ type: 'note', title: '', body: '', kind: 'text', listId: 'inbox', attachments: [], editedAt: Date.now() }, o)); }
  function newDoc(o) { return newTask(Object.assign({ type: 'doc', title: '', body: '', holder: '', number: '', expires: null, listId: 'inbox', attachments: [], editedAt: Date.now() }, o)); }
  function openNote(id) {
    const n = taskById(id); ui.selected = id; ui.dayPanel = null;
    const want = n && n.archived ? 'notes-archive' : n && isDoc(n) ? 'docs' : 'notes';
    if (!paperView(ui.view) || ui.search || ui.view !== want) ui.view = want;
    if (ui.search) { ui.search = ''; $('#search').value = ''; }
    render();
  }

  // ---- sharing and copying documents
  function downloadBlob(b, name) { const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
  const safeName = s => (s || 'Document').replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'Document';
  async function filesOf(items) {
    const files = [];
    for (const raw of items) {
      const atts = (raw.attachments || []).filter(a => !a.arch);
      for (let i = 0; i < atts.length; i++) {
        const a = atts[i], b = await blobFor(a, false); if (!b) continue;
        const ext = (a.name.match(/\.[a-z0-9]{2,4}$/i) || [a.mime === 'application/pdf' ? '.pdf' : a.mime === 'image/png' ? '.png' : '.jpg'])[0];
        files.push(new File([b], safeName(noteTitle(raw)) + (atts.length > 1 ? ' ' + (i + 1) : '') + ext, { type: a.mime }));
      }
    }
    return files;
  }
  async function shareItems(items) {
    if (items.some(shut) && !(await needVault())) return;
    const files = await filesOf(items);
    if (!files.length) { toast('Nothing to send yet: add a photo or PDF first.'); return; }
    const title = items.map(noteTitle).join(', ');
    if (navigator.canShare && navigator.canShare({ files })) {
      try { await navigator.share({ files, title }); }
      catch (e) {
        if (e.name === 'NotAllowedError') { ui.shareReady = { files, title }; openShareReady(); }
        else if (e.name !== 'AbortError') toast('Couldn’t open sharing: ' + e.message);
      }
      return;
    }
    files.forEach(f => downloadBlob(f, f.name));
    toast('Sharing isn’t available here, so the files were downloaded. Attach them to your email or WhatsApp.');
  }
  function openShareReady() {
    const el = $('#sheet'), r = ui.shareReady;
    el.innerHTML = '<div class="sheet narrow" role="dialog" aria-modal="true"><div class="sheet-head"><h2>Ready to send</h2><button type="button" class="iconbtn" data-close="1" aria-label="Close">' + I.x + '</button></div><div class="sheet-body"><p>' + r.files.length + ' file' + (r.files.length === 1 ? '' : 's') + ': ' + esc(r.title) + '</p><button type="button" class="chipbtn solid" id="shareNow">' + I.share + 'Share</button></div></div>';
    el.hidden = false;
  }
  async function copyPicture(raw) {
    const a = (raw.attachments || []).find(x => !x.arch && /^image\//.test(x.mime)); if (!a) return;
    try {
      const b = await blobFor(a, false); const im = await loadImage(b);
      const png = await canvasBlob(im, im.naturalWidth, im.naturalHeight, 2400, 1, 'image/png');
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
      toast('Picture copied. Paste it into WhatsApp or an email with Ctrl+V.');
    } catch (e) { toast('Couldn’t copy the picture here. Use Share or Download instead.'); }
  }
  function detailsText(raw) {
    const d = E(raw), x = expInfo(d.expires);
    return [noteTitle(raw) + (d.holder ? ' (' + d.holder + ')' : ''), d.number ? 'Number: ' + d.number : '', d.expires ? 'Expiry: ' + fmtLong(d.expires) : ''].filter(Boolean).join('\n');
  }
  async function copyText(s, msg) { try { await navigator.clipboard.writeText(s); toast(msg || 'Copied'); } catch (e) { toast('Couldn’t copy here'); } }

  // ---- lightbox for photos and PDFs
  async function openLightbox(n, a) {
    const el = $('#lightbox'); const u = await urlFor(a, false);
    if (!u) { toast(a.enc && !vault.key ? 'Unlock first to open this file.' : 'That file isn’t on this computer yet and couldn’t be downloaded.'); return; }
    const atts = (n.attachments || []), i = atts.indexOf(a);
    el.innerHTML = '<div class="lb-bar"><span>' + esc(a.name) + '</span><span class="spacer"></span>' + (atts.length > 1 ? '<button type="button" class="iconbtn" data-lb="' + ((i - 1 + atts.length) % atts.length) + '" aria-label="Previous">' + I.left + '</button><button type="button" class="iconbtn" data-lb="' + ((i + 1) % atts.length) + '" aria-label="Next">' + I.right + '</button>' : '') + '<a class="chipbtn" href="' + u + '" download="' + esc(a.name) + '">Download</a><button type="button" class="iconbtn" data-lbclose="1" aria-label="Close">' + I.x + '</button></div>' +
      '<div class="lb-body" data-lbclose="1">' + (a.mime === 'application/pdf' ? '<iframe src="' + u + '" title="' + esc(a.name) + '"></iframe>' : '<img src="' + u + '" alt="' + esc(a.name) + '">') + '</div>';
    el.hidden = false; el.dataset.note = n.id;
  }

  // ---- Keep-style staggered columns: each card goes into the shortest column, in order
  function masonry() {
    document.querySelectorAll('#content .ngrid').forEach(g => {
      const cards = [...g.querySelectorAll('.ncard')]; if (!cards.length) return;
      const w = g.clientWidth || 800, n = Math.max(1, Math.floor((w + 12) / 232));
      if (g.classList.contains('masonry') && g.children.length === n) return;
      g.innerHTML = ''; g.classList.add('masonry');
      const cols = Array.from({ length: n }, () => { const c = document.createElement('div'); c.className = 'ncol'; g.appendChild(c); return c; });
      cards.forEach(c => { cols.reduce((a, b) => b.offsetHeight < a.offsetHeight ? b : a).appendChild(c); });
    });
  }
  let mTimer; window.addEventListener('resize', () => { clearTimeout(mTimer); mTimer = setTimeout(() => { if (paperView(ui.view) && !ui.search) renderMain(); }, 150); });
  // ---- shared from another app on the phone (Android share sheet → Tally)
  async function takeShared() {
    try {
      const c = await caches.open('tally-share'); const m = await c.match('/__share/meta'); if (!m) return;
      const meta = await m.json(); const files = [];
      for (let i = 0; i < meta.n; i++) { const r = await c.match('/__share/' + i); if (r) files.push(new File([await r.blob()], decodeURIComponent(r.headers.get('X-Name') || 'file'), { type: r.headers.get('Content-Type') || '' })); }
      await caches.delete('tally-share');
      const body = [meta.title, meta.text, meta.url].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join('\n');
      snapshot(); const n = newNote({ body }); save();
      ui.view = 'notes'; ui.selected = n.id; render();
      if (files.length) await addFiles(n, files, true);
      render(); toast('Saved to Notes. Tap “Move to Important Documents” if it’s an ID or license.', true);
    } catch (e) { }
  }

  // ---- reading the text in photos and PDFs, so search finds it (runs quietly on computers, one file at a time)
  const ocr = { worker: null, busy: false, left: 0, skip: new Set() };
  const absUrl = p => new URL(p, location.href).href;
  function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('load ' + src)); document.head.appendChild(s); }); }
  async function ocrImage(blob) {
    if (!window.Tesseract) await loadScript('vendor/ocr/tesseract.min.js');
    if (!ocr.worker) ocr.worker = await window.Tesseract.createWorker('eng', 1, { workerPath: absUrl('vendor/ocr/worker.min.js'), corePath: absUrl('vendor/ocr/'), langPath: absUrl('vendor/ocr/lang'), gzip: false });
    const { data } = await ocr.worker.recognize(blob);
    return data.text || '';
  }
  async function pdfText(blob) {
    const lib = await loadPdf();
    const doc = await lib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
    let text = '';
    for (let p = 1; p <= Math.min(doc.numPages, 5); p++) { const tc = await (await doc.getPage(p)).getTextContent(); text += tc.items.map(i => i.str).join(' ') + '\n'; }
    if (text.replace(/\s/g, '').length < 20) { // a scan: read page 1 as a picture
      const c = await pdfPageCanvas(doc, 1, 2000);
      text = await ocrImage(await new Promise(res => c.toBlob(res, 'image/png')));
    }
    doc.destroy && doc.destroy();
    return text;
  }
  const ocrQueue = () => { const q = []; S.tasks.forEach(t => (t.attachments || []).forEach(a => { if (!a.ocr && !a.enc && !t.locked && !ocr.skip.has(a.id)) q.push([t.id, a.id]); })); return q; };
  async function runOcr() {
    if (ocr.busy || IS_ANDROID || document.hidden) return;
    const q = ocrQueue(); ocr.left = q.length;
    if (!q.length) { if (ocr.worker) { ocr.worker.terminate(); ocr.worker = null; } return; }
    ocr.busy = true;
    const [tid, aid] = q[0];
    try {
      const t = taskById(tid), a = t && (t.attachments || []).find(x => x.id === aid);
      const b = a && await blobFor(a, false);
      if (!b) { ocr.skip.add(aid); }
      else {
        const text = (a.mime === 'application/pdf' ? await pdfText(b) : await ocrImage(b)).replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim().slice(0, t && t.type === 'daynote' ? 1000 : 3000);
        const t2 = taskById(tid), a2 = t2 && !t2.locked && (t2.attachments || []).find(x => x.id === aid);
        if (a2) { a2.text = text; a2.ocr = true; persistLocal(); schedulePush(); autoExpiryScan(); }
      }
    } catch (e) { ocr.skip.add(aid); }
    finally { ocr.busy = false; ocr.left = Math.max(0, ocr.left - 1); if (paperView(ui.view) && !document.activeElement.closest('#detail')) { const el = $('#content'); const st = el.scrollTop; renderMain(); el.scrollTop = st; } setTimeout(runOcr, 800); }
  }

  // ---- automatic weekly backup, kept in your private storage (last 8)
  const BK_KEY = 'tally.backup.last';
  const bkDir = () => sync.user.id + '/backups';
  async function listBackups() {
    const { data, error } = await sync.client.storage.from('attachments').list(bkDir(), { limit: 100 });
    if (error) throw error;
    return (data || []).filter(o => /^\d{4}-\d\d-\d\d\.json$/.test(o.name)).sort((a, b) => b.name.localeCompare(a.name));
  }
  async function weeklyBackup(force) {
    if (!syncReady()) return false;
    const last = Number(localStorage.getItem(BK_KEY) || 0);
    if (!force && Date.now() - last < 7 * 86400000) return false;
    try {
      const files = await listBackups();
      const newest = files[0] ? D.fromISO(files[0].name.slice(0, 10)).getTime() : 0;
      if (!force && newest && Date.now() - newest < 7 * 86400000) { localStorage.setItem(BK_KEY, String(newest)); return false; }
      const name = todayISO() + '.json';
      const { error } = await sync.client.storage.from('attachments').upload(bkDir() + '/' + name, new Blob([JSON.stringify(S)], { type: 'application/json' }), { upsert: true, contentType: 'application/json' });
      if (error) throw error;
      localStorage.setItem(BK_KEY, String(Date.now()));
      const old = files.filter(o => o.name !== name).slice(7).map(o => bkDir() + '/' + o.name);
      if (old.length) await sync.client.storage.from('attachments').remove(old);
      return true;
    } catch (e) { return false; }
  }
  async function openBackups() {
    const el = $('#sheet');
    const head = '<div class="sheet narrow" role="dialog" aria-modal="true" aria-labelledby="bkTitle"><div class="sheet-head"><h2 id="bkTitle">Backups</h2><button type="button" class="iconbtn" data-close="1" aria-label="Close">' + I.x + '</button></div><div class="sheet-body">';
    if (!syncReady()) { el.innerHTML = head + '<p>Automatic backups need sync. Turn on sync first; until then use “Copy backup”.</p></div></div>'; el.hidden = false; return; }
    el.innerHTML = head + '<p>Once a week Tally saves a full copy of your tasks, notes and documents to your private storage. The last 8 are kept. Photos and PDFs aren’t copied again; they stay in storage for 30 days after you delete them, so a restore can still show them.</p><div id="bkList" class="hint">Loading…</div><div style="margin-top:12px"><button type="button" class="chipbtn" id="bkNow">Back up now</button></div></div></div>';
    el.hidden = false;
    try {
      const files = await listBackups();
      $('#bkList').outerHTML = files.length ? '<div class="bklist">' + files.map(o => '<div class="bkrow"><span>' + esc(fmtLong(o.name.slice(0, 10))) + (o.metadata && o.metadata.size ? ' <span class="hint">' + Math.max(1, Math.round(o.metadata.size / 1024)) + ' KB</span>' : '') + '</span><button type="button" class="chipbtn" data-bkrestore="' + esc(o.name) + '">Restore</button></div>').join('') + '</div>' : '<p class="hint" id="bkList">No backups yet. The first one is made automatically within an hour, or click Back up now.</p>';
    } catch (e) { $('#bkList').textContent = 'Couldn’t read backups: ' + (e.message || e) + (/bucket/i.test(e.message || '') ? ' (run the photo storage setup in Supabase)' : ''); }
  }
  async function restoreBackup(name, btn) {
    if (!btn.dataset.sure) { btn.dataset.sure = '1'; btn.textContent = 'Click again to replace everything'; return; }
    try {
      const { data, error } = await sync.client.storage.from('attachments').download(bkDir() + '/' + name); if (error) throw error;
      const d = JSON.parse(await data.text());
      if (!d || d.version !== 1 || !Array.isArray(d.tasks) || !Array.isArray(d.lists)) throw new Error('not a Tally backup');
      snapshot(); S = d; S.trash = S.trash || { tasks: [], lists: [] }; S.groups = S.groups || [];
      ui.selected = null; vault.plain = {}; vault.json = {}; vault.sealedAs = {}; if (vault.key) openPlain();
      save(); applyTheme(); render(); closeSheet(); toast('Restored the backup from ' + fmtLong(name.slice(0, 10)), true);
    } catch (e) { toast('Couldn’t restore: ' + (e.message || e)); }
  }

  // ---- events (bound once)
  function bindNotes() {
    const content = $('#content'), det = $('#detail');
    const selRaw = () => { const t = ui.selected && taskById(ui.selected); return t || null; };
    content.addEventListener('keydown', e => {
      if (e.target.id === 'nNew' && e.key === 'Enter' && e.target.value.trim()) {
        const v = e.target.value.trim(); snapshot(); newNote({ title: v }); save(); e.target.value = ''; renderMain(); $('#nNew').focus(); toast('Note saved', true);
      }
      if (e.target.id === 'dNew' && e.key === 'Enter' && e.target.value.trim()) {
        const v = e.target.value.trim(); snapshot(); const d = newDoc({ title: v }); save(); e.target.value = ''; openNote(d.id); toast('Now add a photo or PDF of it', true);
      }
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.ncard')) { e.preventDefault(); cardClick(e.target.dataset.note); }
    });
    function cardClick(id) {
      if (ui.docSel) { ui.docSel.has(id) ? ui.docSel.delete(id) : ui.docSel.add(id); renderMain(); return; }
      openNote(id);
    }
    // sub-steps shown under tasks: tick them right in the list (runs before the row opens the task)
    content.addEventListener('click', e => {
      const sd = e.target.closest('[data-stepdone]');
      if (sd) { e.stopPropagation(); const [tid, sid] = sd.dataset.stepdone.split(':'); const t = taskById(tid); const s = t && t.steps.find(x => x.id === sid); if (s) { s.done = !s.done; save(); render(); } return; }
      const sf = e.target.closest('[data-stepfold]');
      if (sf) { e.stopPropagation(); const t = taskById(sf.dataset.stepfold); if (t) { t.fold = !t.fold; save(); renderMain(); } }
    }, true);
    content.addEventListener('click', e => {
      const oi = e.target.closest('[data-openitem]'); if (oi) { ui.selected = oi.dataset.openitem; ui.dayPanel = null; render(); return; }
      if (e.target.closest('[data-vunlock]')) { needVault(); return; }
      const xa = e.target.closest('[data-exparch]'); if (xa) { snapshot(); const t = taskById(xa.dataset.exparch); t.archived = true; t.pinned = false; save(); render(); toast('Archived ' + docName(t), true); return; }
      const ds = e.target.closest('[data-dshare]'); if (ds) { e.stopPropagation(); shareItems([taskById(ds.dataset.dshare)]); return; }
      if (e.target.closest('[data-dsharesel]')) { shareItems([...ui.docSel].map(taskById).filter(Boolean)); return; }
      if (e.target.closest('[data-dselcancel]')) { ui.docSel = null; renderMain(); return; }
      const pn = e.target.closest('[data-npin]'); if (pn) { e.stopPropagation(); const n = taskById(pn.dataset.npin); n.pinned = !n.pinned; save(); renderMain(); return; }
      const nn = e.target.closest('[data-nnew]');
      if (nn) {
        if (nn.dataset.nnew === 'list') { snapshot(); const n = newNote({ kind: 'list', items: [] }); save(); openNote(n.id); setTimeout(() => $('#nNewItem') && $('#nNewItem').focus(), 30); }
        else pickFiles(null, 'note');
        return;
      }
      if (e.target.closest('[data-dnew]')) { pickFiles(null, 'doc'); return; }
      const nv = e.target.closest('.ntab[data-nview]'); if (nv) { setView(nv.dataset.nview); return; }
      const on = e.target.closest('[data-opennote]'); if (on) { openNote(on.dataset.opennote); return; }
      const card = e.target.closest('.ncard[data-note]'); if (card) { cardClick(card.dataset.note); return; }
    });
    $('#viewActions').addEventListener('click', e => {
      const nv = e.target.closest('[data-nview]'); if (nv) { setView(nv.dataset.nview); return; }
      if (e.target.closest('[data-vlock]')) lockVault();
      if (e.target.closest('[data-dselect]')) { ui.docSel = new Set(); ui.selected = null; render(); }
    });
    // right panel: files on any item, plus the note/document editors
    det.addEventListener('click', async e => {
      const raw = selRaw(); if (!raw) return;
      const ao = e.target.closest('[data-attopen]'); if (ao) { openLightbox(raw, raw.attachments.find(a => a.id === ao.dataset.attopen)); return; }
      const ad = e.target.closest('[data-attdel]'); if (ad) { removeAttachment(raw, ad.dataset.attdel); return; }
      const aa = e.target.closest('[data-attarch]'); if (aa) { snapshot(); const a = raw.attachments.find(x => x.id === aa.dataset.attarch); a.arch = !a.arch; if (!a.arch) delete a.arch; touchNote(raw); save(); if (raw.expAuto) autoExpiryScan(); render(); toast(a.arch ? 'File archived' : 'File brought back', true); return; }
      const sm = e.target.closest('[data-archsum]'); if (sm) { ui.showArchFiles = ui.showArchFiles === sm.dataset.archsum ? null : sm.dataset.archsum; }
      if (e.target.closest('[data-pickfiles]')) { pickFiles(raw); return; }
      if (e.target.closest('[data-vunlock]')) { needVault(); return; }
      const oi = e.target.closest('[data-openitem]'); if (oi) { ui.selected = oi.dataset.openitem; render(); return; }
      if (!isPaper(raw)) return;
      const n = E(raw);
      const k = e.target.closest('[data-ndact]');
      if (k) {
        const a = k.dataset.ndact;
        if (a === 'close') { ui.selected = null; render(); }
        if (a === 'pin') { raw.pinned = !raw.pinned; touchNote(raw); save(); render(); }
        if (a === 'archive') { snapshot(); raw.archived = !raw.archived; raw.pinned = raw.archived ? false : raw.pinned; touchNote(raw); ui.selected = null; save(); render(); toast(raw.archived ? 'Archived' : 'Brought back from the archive', true); }
        if (a === 'lock') { raw.locked ? unlockItem(raw) : lockItem(raw); }
        if (a === 'move') {
          snapshot();
          if (isKNote(raw)) { if (n.kind === 'list') { n.body = (n.items || []).map(i => (i.done ? '[x] ' : '') + i.text).join('\n'); n.items = undefined; } raw.kind = 'text'; raw.type = 'doc'; raw.docByHand = true; raw.archived = false; raw.pinned = false; ui.view = 'docs'; }
          else { raw.type = 'note'; raw.kind = 'text'; ui.view = 'notes'; }
          touchNote(raw); save(); render(); toast(isDoc(raw) ? 'Moved to Important Documents' : 'Moved to Notes', true);
        }
        if (a.startsWith('expno:')) { const e = (raw.expDocs || []).find(x => x.k === a.slice(6)); if (e) { e.no = true; placeDocTask(raw, e); } touchNote(raw); save(); render(); return; }
        if (a === 'clearexp') { raw.expAuto = false; raw.expNo = true; setExpiry(raw, null); touchNote(raw); save(); render(); }
        if (a === 'del') { snapshot(); trashTask(raw); save(); render(); toast((isDoc(raw) ? 'Document' : 'Note') + ' moved to Recently deleted', true); }
        return;
      }
      const d2 = e.target.closest('[data-dact2]');
      if (d2) {
        const a = d2.dataset.dact2;
        if (a === 'share') shareItems([raw]);
        if (a === 'copy') copyPicture(raw);
        if (a === 'download') { (await filesOf([raw])).forEach(f => downloadBlob(f, f.name)); }
        if (a === 'details') copyText(detailsText(raw), 'Details copied');
        if (a === 'copynum') copyText(n.number || '', 'Number copied');
        return;
      }
      const it = e.target.closest('[data-nitemdone]'); if (it) { const x = n.items.find(i => i.id === it.dataset.nitemdone); x.done = !x.done; touchNote(raw); save(); renderDetail(); renderMain(); return; }
      const idl = e.target.closest('[data-nitemdel]'); if (idl) { n.items = n.items.filter(i => i.id !== idl.dataset.nitemdel); touchNote(raw); save(); renderDetail(); renderMain(); return; }
    });
    det.addEventListener('input', e => {
      const raw = selRaw(); if (!raw || !isPaper(raw)) return; const n = E(raw);
      if (e.target.id === 'nTitle') { raw.title = e.target.value; raw.titleAuto = false; retitleTasks(raw); touchNote(raw); save(); renderMain(); }
      if (e.target.id === 'nBody') { n.body = e.target.value; touchNote(raw); save(); renderMain(); autosize(e.target); const l = $('#dLinks'); if (l) l.innerHTML = linksHtml({ notes: n.body, title: raw.title }); }
      if (e.target.id === 'dHolder') { if (raw.holderAuto && raw.holder) ui.autoHolder = { id: raw.id, name: raw.holder.trim() }; if (!e.target.value.trim() && ui.autoHolder && ui.autoHolder.id === raw.id) { const m = S.settings.meNames || (S.settings.meNames = []); if (!isMe(ui.autoHolder.name)) m.push(ui.autoHolder.name); ui.autoHolder = null; } raw.holder = e.target.value; raw.holderAuto = false; retitleTasks(raw); touchNote(raw); save(); }
      if (e.target.id === 'dNumber') { n.number = e.target.value; touchNote(raw); save(); }
      if (e.target.dataset.nitem) { const x = n.items.find(i => i.id === e.target.dataset.nitem); if (x) { x.text = e.target.value; touchNote(raw); save(); renderMain(); } }
    });
    det.addEventListener('change', e => {
      const raw = selRaw(); if (!raw || !isPaper(raw)) return;
      if (e.target.id === 'nExp') { raw.expAuto = false; raw.expNo = !e.target.value; setExpiry(raw, e.target.value || null); touchNote(raw); save(); render(); }
      if (e.target.id === 'nLead') { setLead(raw, Number(e.target.value)); touchNote(raw); save(); render(); }
      if (e.target.id === 'dHolder') renderMain();
    });
    det.addEventListener('keydown', e => {
      const raw = selRaw(); if (!raw || !isPaper(raw)) return; const n = E(raw);
      if (e.target.id === 'nNewItem' && e.key === 'Enter' && e.target.value.trim()) { n.items = (n.items || []).concat([{ id: uid(), text: e.target.value.trim(), done: false }]); touchNote(raw); save(); renderDetail(); renderMain(); $('#nNewItem').focus(); }
      if (e.target.dataset.nitem && e.key === 'Enter') { e.preventDefault(); const idx = n.items.findIndex(i => i.id === e.target.dataset.nitem); const ni = { id: uid(), text: '', done: false }; n.items.splice(idx + 1, 0, ni); save(); renderDetail(); const inp = det.querySelector('[data-nitem="' + ni.id + '"]'); inp && inp.focus(); }
      if (e.target.dataset.nitem && e.key === 'Backspace' && !e.target.value) { e.preventDefault(); const idx = n.items.findIndex(i => i.id === e.target.dataset.nitem); n.items.splice(idx, 1); save(); renderDetail(); renderMain(); const prev = det.querySelectorAll('[data-nitem]')[Math.max(0, idx - 1)]; prev ? prev.focus() : $('#nNewItem').focus(); }
    });
    // drag & drop files: onto the open panel or a card adds them; elsewhere on Notes/Documents makes a new one
    const hasFiles = e => e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files');
    const dropTarget = e => {
      if (!$('#sheet').hidden) return null;
      const inPanel = e.target.closest('#detail') && selRaw();
      if (inPanel) return { item: selRaw() };
      const card = e.target.closest('.ncard[data-note]');
      if (card) return { item: taskById(card.dataset.note) };
      const ji = e.target.closest('.jitem[data-jid]');
      if (ji) return { jid: ji.dataset.jid };
      const je = e.target.closest('.jentry[data-jiso]');
      if (je) return { jiso: je.dataset.jiso };
      if (paperView(ui.view) && !ui.search) return { make: ui.view === 'docs' ? 'doc' : 'note' };
      return null;
    };
    document.addEventListener('dragover', e => {
      if (!hasFiles(e)) return; const tg = dropTarget(e); if (!tg) return;
      e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
      document.querySelectorAll('.ncard.over, .ndrop.over').forEach(x => x.classList.remove('over'));
      const c = e.target.closest('.ncard'); if (c) c.classList.add('over');
      if (e.target.closest('#detail')) { const dz = det.querySelector('.ndrop'); if (dz) dz.classList.add('over'); }
      document.body.classList.add('filedrag');
    });
    document.addEventListener('dragleave', e => { if (!e.relatedTarget) { document.body.classList.remove('filedrag'); document.querySelectorAll('.ncard.over, .ndrop.over').forEach(x => x.classList.remove('over')); } });
    document.addEventListener('drop', async e => {
      if (!hasFiles(e)) return; const tg = dropTarget(e); if (!tg) return;
      e.preventDefault(); document.body.classList.remove('filedrag'); document.querySelectorAll('.ncard.over, .ndrop.over').forEach(x => x.classList.remove('over'));
      const files = [...e.dataTransfer.files]; if (!files.length) return;
      let n = tg.item || (tg.jid ? (tg.jid.startsWith('new:') ? newEntry(tg.jid.slice(4)) : taskById(tg.jid)) : tg.jiso ? ensureDayNote(tg.jiso) : null);
      if (n && shut(n)) { if (!(await needVault())) return; }
      snapshot();
      if (!n) { n = tg.make === 'doc' ? newDoc({ title: files[0].name.replace(/\.[a-z0-9]+$/i, '') }) : newNote({}); ui.selected = n.id; }
      addFilesUI(n, files);
    });
    document.addEventListener('paste', e => {
      const n = selRaw(); if (!n || shut(n)) return;
      const files = [...(e.clipboardData && e.clipboardData.files || [])]; if (!files.length) return;
      e.preventDefault(); addFilesUI(n, files);
    });
    $('#lightbox').addEventListener('click', e => {
      if (e.target.closest('[data-lbclose]') && !e.target.closest('img, iframe')) { $('#lightbox').hidden = true; return; }
      const nx = e.target.closest('[data-lb]'); if (nx) { const n = taskById($('#lightbox').dataset.note); openLightbox(n, n.attachments[Number(nx.dataset.lb)]); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#lightbox').hidden) { e.stopPropagation(); $('#lightbox').hidden = true; } }, true);
    $('#filePick').addEventListener('change', e => {
      const files = [...e.target.files]; e.target.value = ''; if (!files.length) return;
      let n = ui.pickFor ? taskById(ui.pickFor) : null;
      snapshot(); if (!n) { n = ui.pickMake === 'doc' ? newDoc({ title: files[0].name.replace(/\.[a-z0-9]+$/i, '') }) : newNote({}); ui.selected = n.id; }
      addFilesUI(n, files);
    });
    $('#sheet').addEventListener('click', e => {
      if (e.target.id === 'vGo') vaultSubmit();
      if (e.target.id === 'bkNow') { e.target.disabled = true; e.target.textContent = 'Backing up…'; weeklyBackup(true).then(ok => { toast(ok ? 'Backup saved' : 'Backup didn’t work. Is sync on?'); openBackups(); }); }
      const br = e.target.closest('[data-bkrestore]'); if (br) restoreBackup(br.dataset.bkrestore, br);
      if (e.target.closest('#shareNow') && ui.shareReady) { const r = ui.shareReady; ui.shareReady = null; closeSheet(); navigator.share({ files: r.files, title: r.title }).catch(() => { }); }
    });
    $('#sheet').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.target.id === 'vPass' || e.target.id === 'vPass2')) vaultSubmit(); });
    $('#menu').addEventListener('click', e => { if (e.target.closest('[data-mact="backups"]')) { e.stopPropagation(); ui.menu = null; renderMenu(); openBackups(); } }, true);
    // auto-lock after 10 minutes without use, or 5 minutes in the background
    ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if (vault.key) armAutoLock(); }, true));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) vault.hiddenAt = Date.now();
      else { if (vault.key && vault.hiddenAt && Date.now() - vault.hiddenAt > 5 * 60000) lockVault(true); setTimeout(runOcr, 2000); }
    });
  }

  // checkboxes/bullets in notes: tick, edit, insert, keep the list going on Enter
  function bindNoteLists() {
    const lineAt = (v, pos) => { const a = v.lastIndexOf('\n', pos - 1) + 1, b = v.indexOf('\n', pos); return { a, b: b < 0 ? v.length : b }; };
    const fire = ta => ta.dispatchEvent(new Event('input', { bubbles: true }));
    document.addEventListener('mousedown', e => { if (e.target.closest('[data-nins]')) e.preventDefault(); });
    document.addEventListener('click', e => {
      const ck = e.target.closest('[data-nchk]');
      if (ck) {
        e.stopPropagation(); e.preventDefault();
        const [id, i] = ck.dataset.nchk.split(':'), raw = taskById(id); if (!raw || shut(raw)) return;
        const n = E(raw), ls = (n.body || '').split('\n'), m = ls[+i] && ls[+i].match(NCHK); if (!m) return;
        ls[+i] = m[1] + (m[2] === ' ' ? '[x] ' : '[ ] ') + ls[+i].slice(m[0].length);
        n.body = ls.join('\n'); touchNote(raw); save(); render(); return;
      }
      if (e.target.closest('[data-nraw]') && !e.target.closest('.jlink, a')) { ui.nRaw = ui.selected; renderDetail(); const ta = $('#nBody'); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); autosize(ta); } return; }
      const ins = e.target.closest('[data-nins]');
      if (ins) {
        let ta = $('#nBody'); if (!ta) return;
        const pre = ins.dataset.nins === 'chk' ? '[ ] ' : '• ';
        if (ta.hidden || document.activeElement !== ta) { // add a new line at the end
          if (ta.hidden) { ui.nRaw = ui.selected; renderDetail(); ta = $('#nBody'); }
          ta.focus(); const v = ta.value; ta.value = v + (v && !v.endsWith('\n') ? '\n' : '') + pre; ta.setSelectionRange(ta.value.length, ta.value.length); fire(ta); return;
        }
        const v = ta.value, pos = ta.selectionStart, { a } = lineAt(v, pos), line = v.slice(a);
        const m = line.match(NCHK) || line.match(NBUL), same = m && (pre === '[ ] ' ? NCHK.test(line) : NBUL.test(line));
        const cut = m ? m[0].length - m[1].length : 0, ind = m ? m[1].length : 0;
        const add = same ? '' : pre;
        ta.setRangeText(add, a + ind, a + ind + cut, 'end');
        const c = Math.max(a, pos + add.length - cut); ta.setSelectionRange(c, c); fire(ta);
      }
    }, true);
    // Tab / Shift+Tab: indent or outdent the line (or every selected line) by one level (4 spaces)
    document.addEventListener('keydown', e => {
      if (e.target.id !== 'nBody' || e.key !== 'Tab' || e.ctrlKey || e.altKey || e.metaKey || (sug && sug.inp === e.target)) return;
      e.preventDefault();
      const ta = e.target, v = ta.value, s0 = ta.selectionStart, s1 = ta.selectionEnd;
      const a = v.lastIndexOf('\n', s0 - 1) + 1, bi = v.indexOf('\n', Math.max(s1 - (s1 > s0 && v[s1 - 1] === '\n' ? 1 : 0), s0)), b = bi < 0 ? v.length : bi;
      const lines = v.slice(a, b).split('\n'); let d0 = 0, dAll = 0;
      const out = lines.map((l, k) => {
        if (!e.shiftKey) { if (nLvl(l.match(/^\s*/)[0]) >= 4) return l; if (k === 0) d0 = 4; dAll += 4; return '    ' + l; }
        const cut = (l.match(/^( {1,4}|\t)/) || [''])[0].length; if (k === 0) d0 = -cut; dAll -= cut; return l.slice(cut);
      });
      ta.setRangeText(out.join('\n'), a, b, 'preserve');
      if (s0 === s1) { const c = Math.max(a, s0 + d0); ta.setSelectionRange(c, c); } else ta.setSelectionRange(Math.max(a, s0 + d0), s1 + dAll);
      fire(ta); autosize(ta);
    });
    document.addEventListener('keydown', e => {
      if (e.target.id !== 'nBody' || e.key !== 'Enter' || e.shiftKey || (sug && sug.inp === e.target)) return;
      const ta = e.target, v = ta.value, pos = ta.selectionStart, { a } = lineAt(v, pos), line = v.slice(a, pos);
      const m = line.match(NCHK) || line.match(NBUL); if (!m) return;
      e.preventDefault();
      if (!line.slice(m[0].length).trim()) { // empty item: a sub-item moves out a level; a top item ends the list
        if (m[1]) { const cut = (m[1].match(/( {1,4}|\t)$/) || [''])[0].length; ta.setRangeText(line.slice(0, m[1].length - cut) + line.slice(m[1].length), a, pos, 'end'); fire(ta); return; }
        ta.setRangeText('', a, pos, 'end'); fire(ta); return;
      }
      const next = NCHK.test(line) ? m[1] + '[ ] ' : m[1] + '• ';
      ta.setRangeText('\n' + next, pos, ta.selectionEnd, 'end'); fire(ta); autosize(ta);
    });
    document.addEventListener('focusout', e => {
      if (e.target.id !== 'nBody') return;
      setTimeout(() => { if (document.activeElement && document.activeElement.id === 'nBody') return; const raw = ui.selected && taskById(ui.selected); const was = ui.nRaw; ui.nRaw = null; if (raw && isKNote(raw) && raw.kind !== 'list' && (was || hasRich(E(raw).body))) { const a = document.activeElement, id = a && a.id; renderDetail(); if (id && $('#' + id)) $('#' + id).focus(); } }, 120);
    });
  }
  function pickFiles(n, make) { ui.pickFor = n ? n.id : null; ui.pickMake = make || 'note'; $('#filePick').click(); }



  /* ====================== Journal: separate entries per day, each an outline with its own photos ====================== */
  // An entry is a day note: one line per bullet, a tab per indent level, "[ ] "/"[x] " for a task line. [[Name]] links things.
  const TASK_RE = /^\[( |x|X)\]\s?/;
  const parseOutline = text => { const ls = (text || '').split('\n').map(l => { const m = l.match(/^(\t*)(.*)$/); const tm = m[2].match(TASK_RE); return tm ? { lvl: m[1].length, text: m[2].slice(tm[0].length), task: true, done: tm[1] !== ' ' } : { lvl: m[1].length, text: m[2] }; }); return ls.length ? ls : [{ lvl: 0, text: '' }]; };
  const serializeOutline = lines => lines.map(l => '\t'.repeat(l.lvl) + (l.task ? (l.done ? '[x] ' : '[ ] ') : '') + l.text).join('\n').replace(/\s+$/, '');
  const entriesFor = iso => S.tasks.filter(t => isNote(t) && t.due === iso).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const newEntry = (iso, o) => newTask(Object.assign({ type: 'daynote', due: iso, listId: 'inbox', title: '', notes: '' }, o));
  function ensureDayNote(iso) { const es = entriesFor(iso); return es[es.length - 1] || newEntry(iso); }
  const isPage = t => t.type === 'page';
  const pageFor = name => S.tasks.find(t => isPage(t) && t.title.toLowerCase() === name.trim().toLowerCase());
  const LINK_RE = /\[\[([^\[\]\n]{1,60})\]\]/g;
  const linksIn = text => [...new Set([...(text || '').matchAll(LINK_RE)].map(m => m[1].trim()).filter(Boolean))];
  const jlinkBtn = x => '<button type="button" class="jlink" data-jlink="' + esc(x) + '">' + esc(x) + '</button>';
  // Auto-links: a name you've put in [[ ]] once (or that has a page) shows as a link wherever it's written later.
  // Only capitalized whole words ("Will", never "will"); a lone first name is skipped when two linked names share it
  // ("Tim" when there's [[Tim Khan]] and [[Tim Ross]]); each page can turn it off (page.noAuto).
  let autoCache = { ver: -1, re: null, names: null };
  function autoLinkRe() {
    if (autoCache.ver === dataVer && autoCache.names) return autoCache.re;
    const seen = new Map(), off = new Set();
    const add = x => { x = (x || '').trim(); if (x && x.length >= 2 && /^[A-Z0-9]/.test(x) && /[A-Za-z]/.test(x) && !seen.has(x.toLowerCase())) seen.set(x.toLowerCase(), x); };
    S.tasks.forEach(t => {
      if (isPage(t)) { if (t.noAuto) off.add(t.title.trim().toLowerCase()); else add(t.title); }
      [t.title, t.notes, t.meet, isPaper(t) && !shut(t) ? E(t).body : ''].forEach(v => { if (v && v.includes('[[')) linksIn(v).forEach(add); });
    });
    let names = [...seen.values()].filter(x => !off.has(x.toLowerCase()));
    names = names.filter(x => x.includes(' ') || names.filter(y => y.startsWith(x + ' ')).length < 2);
    names.sort((a, b) => b.length - a.length);
    const re = names.length ? new RegExp('(^|[^A-Za-z0-9_])(' + names.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![A-Za-z0-9_])', 'g') : null;
    autoCache = { ver: dataVer, re, names };
    return re;
  }
  function autoLinkText(t) { // t: plain (not escaped) text without [[ ]]
    const re = autoLinkRe(); if (!re) return esc(t);
    let out = '', last = 0, m; re.lastIndex = 0;
    while ((m = re.exec(t))) { const at = m.index + m[1].length; out += esc(t.slice(last, at)) + jlinkBtn(m[2]); last = at + m[2].length; }
    return out + esc(t.slice(last));
  }
  const linkify = s => {
    s = String(s ?? ''); let out = '', last = 0; const re = /\[\[([^\[\]\n]{1,60})\]\]|\b(?:https?:\/\/|www\.)\S+/g; let m;
    while ((m = re.exec(s))) { out += autoLinkText(s.slice(last, m.index)) + (m[1] ? jlinkBtn(m[1].trim()) : esc(m[0])); last = m.index + m[0].length; }
    return out + autoLinkText(s.slice(last));
  };
  const entryTitle = lines => (lines.find(l => l.text.trim()) || { text: '' }).text.trim().slice(0, 80);
  const tKey = s => s.trim().replace(/\s+/g, ' ').toLowerCase();
  const kids = (ls, i) => !!(ls[i + 1] && ls[i + 1].lvl > ls[i].lvl);
  const foldKey = l => tKey(l.text);
  // Which lines are hidden by a folded parent
  function hiddenSet(ls, folds) {
    const out = new Set(), f = new Set(folds || []);
    ls.forEach((l, i) => { if (out.has(i) || !f.has(foldKey(l)) || !kids(ls, i)) return; for (let j = i + 1; j < ls.length && ls[j].lvl > l.lvl; j++) out.add(j); });
    return out;
  }
  const linkedTask = (n, l) => n && l.task ? S.tasks.find(t => t.jFrom === n.id && t.jKey === tKey(l.text)) : null;
  function taskChip(t) { if (!t || !t.due) return ''; const over = !t.done && t.due < todayISO(); return '<span class="jtchip' + (over ? ' over' : '') + '">' + I.cal + esc(D.dueLabel(t.due)) + (t.time ? ' ' + D.fmtTime(t.time) : '') + (t.recur ? ' ' + I.repeat : '') + '</span>'; }
  function lineHtml(l, i, ph, o) {
    o = o || {};
    const dot = o.hasKids ? '<button type="button" class="ol-dot fold' + (o.folded ? ' folded' : '') + '" data-olfold="' + i + '" title="' + (o.folded ? 'Show details' : 'Hide details') + '" aria-label="' + (o.folded ? 'Show details' : 'Hide details') + '"></button>' : '<span class="ol-dot"></span>';
    const box = l.task ? '<button type="button" class="check small jt' + (l.done ? ' on' : '') + '" data-jtick="' + i + '" aria-label="' + (l.done ? 'Mark not done' : 'Done') + '">' + I.check + '</button>' : '';
    return '<div class="ol-line' + (o.hidden ? ' hid' : '') + (l.task ? ' istask' + (l.done ? ' isdone' : '') : '') + '" data-lvl="' + l.lvl + '"' + (l.task ? ' data-task="1"' + (l.done ? ' data-done="1"' : '') : '') + ' style="--lvl:' + l.lvl + '">' + dot + box + '<input class="ol-in" data-oli="' + i + '" value="' + esc(l.text) + '"' + (ph ? ' placeholder="' + ph + '"' : '') + ' autocomplete="off" autocapitalize="sentences" enterkeyhint="enter" spellcheck="true" aria-label="Journal line">' + (o.chip || '') + '</div>';
  }
  function linesHtml(n, lines, ph) {
    const hid = hiddenSet(lines, n && n.folds), f = new Set((n && n.folds) || []);
    return lines.map((l, i) => lineHtml(l, i, i === 0 && lines.length === 1 && !l.text ? ph : '', { hasKids: kids(lines, i), folded: f.has(foldKey(l)) && kids(lines, i), hidden: hid.has(i), chip: l.task ? taskChip(linkedTask(n, l)) : '' })).join('');
  }
  function olEditor(id, iso, lines, ph, page) { const n = taskById(id); return '<div class="ol" data-olid="' + id + '" data-oliso="' + iso + '"' + (page ? ' data-olpage="' + esc(page) + '"' : '') + '>' + linesHtml(n, lines, ph) + '</div>'; }
  function olView(n) {
    const ls = parseOutline(n.notes), hid = hiddenSet(ls, n.folds), f = new Set(n.folds || []);
    return '<div class="ol ro" data-olid="' + n.id + '">' + ls.map((l, i) => {
      if (!l.text.trim() || hid.has(i)) return '';
      const k = kids(ls, i), t = linkedTask(n, l), done = t ? !!t.done : l.done;
      return '<div class="ol-line' + (l.task ? ' istask' + (done ? ' isdone' : '') : '') + '" style="--lvl:' + l.lvl + '">' + (k ? '<button type="button" class="ol-dot fold' + (f.has(foldKey(l)) ? ' folded' : '') + '" data-olfold="' + i + '" aria-label="Show or hide details"></button>' : '<span class="ol-dot"></span>') +
        (l.task ? '<button type="button" class="check small jt' + (done ? ' on' : '') + '" data-jtick="' + i + '" aria-label="' + (done ? 'Mark not done' : 'Done') + '">' + I.check + '</button>' : '') + '<span class="ol-txt">' + linkify(l.text) + '</span>' + (l.task ? taskChip(t) : '') + '</div>';
    }).join('') + '</div>';
  }
  const tools = (iso, opts) => '<div class="ol-tools">' + (isPhone() ? '<button type="button" class="chipbtn" data-olind="-1" aria-label="Move left a level">' + I.left + '</button><button type="button" class="chipbtn" data-olind="1" aria-label="Move right a level">' + I.right + '</button>' : '') + '<button type="button" class="chipbtn" data-oltask="1" title="Make this line a task (or type [ ] first)">' + I.check + 'Task</button><button type="button" class="chipbtn" data-ollink="1" title="Link a person or thing">' + I.link + 'Link</button>' +
    (opts && opts.page ? '' : '<button type="button" class="chipbtn" data-jnew="' + iso + '" title="Start a separate entry">' + I.plus + 'New entry</button><button type="button" class="chipbtn" data-jmeet="' + iso + '" title="Start notes for a meeting">' + I.meet + 'Meeting</button>' + (opts && opts.split ? '<button type="button" class="chipbtn" data-jsplit="1" title="Make each top-level bullet its own entry">Split</button>' : '')) + '</div>';
  // A meeting entry starts with its name; the name opens the page with every meeting of that name
  const meetNames = () => [...new Set(S.tasks.filter(t => isMeet(t) && mName(t)).map(t => mName(t)))];
  const isMeetName = name => S.tasks.some(t => isMeet(t) && mName(t).toLowerCase() === (name || '').trim().toLowerCase());
  // "8pm Ops sync", "Ops sync 8pm", "Ops sync at 2:30pm", "14:00 Ops sync" → name + time
  function splitMeetTime(n, inp) {
    const T = '(noon|(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)|(\\d{1,2}):(\\d{2}))';
    const m = n.meet.match(new RegExp('^(?:at\\s+|@\\s*)?' + T + '\\s+', 'i')) || n.meet.match(new RegExp('\\s+(?:at\\s+|@\\s*)?' + T + '$', 'i')); if (!m) return;
    let h, mi = 0;
    if (/^noon$/i.test(m[1])) h = 12; else if (m[4]) { h = +m[2] % 12 + (/pm/i.test(m[4]) ? 12 : 0); mi = +(m[3] || 0); } else { h = +m[5]; mi = +m[6]; }
    if (h > 23 || mi > 59) return;
    n.meet = (n.meet.slice(0, m.index) + ' ' + n.meet.slice(m.index + m[0].length)).trim(); n.time = String(h).padStart(2, '0') + ':' + String(mi).padStart(2, '0'); n.title = mName(n) || n.title;
    if (inp) { inp.value = n.meet; const c = inp.closest('.jmeet').querySelector('.jmeet-clock'); if (c) { c.classList.add('on'); c.querySelector('input').value = n.time; } }
  }
  function meetHead(n, editing) {
    if (!n || !isMeet(n)) return '';
    const time = n.time ? '<span class="jmeet-time">' + D.fmtTime(n.time) + '</span>' : '';
    if (editing) return '<div class="jmeet">' + I.meet + '<input class="jmeet-in" data-jmeetname="' + n.id + '" value="' + esc(n.meet) + '" placeholder="Meeting name and time, e.g. Ops sync 10am" list="meetNames" autocomplete="off" aria-label="Meeting name">' +
      '<label class="jmeet-clock' + (n.time ? ' on' : '') + '" title="Meeting time">' + I.clock + '<input type="time" class="jmeet-tin" data-jmeettime="' + n.id + '" value="' + (n.time || '') + '" aria-label="Meeting time"></label>' +
      (mName(n) ? '<button type="button" class="jlink jmeet-all" data-jlink="' + esc(mName(n)) + '" title="Every ' + esc(mName(n)) + ' meeting">All</button>' : '') + '</div>';
    return '<div class="jmeet">' + I.meet + time + (mName(n) ? '<button type="button" class="jlink" data-jlink="' + esc(mName(n)) + '">' + esc(mName(n)) + '</button>' : '<span>Meeting</span>') + '</div>';
  }
  // One day: its entries (separate, each with its own photos) + the tools when editing
  function jEntry(iso, editing) {
    const es = entriesFor(iso), d = D.fromISO(iso), T = todayISO();
    const items = es.map(n => ({ id: n.id, n }));
    if (editing && (!items.length || ui.jNewFor === iso)) items.push({ id: 'new:' + iso, n: null });
    const links = [...new Set([].concat(...es.map(n => linksIn((n.meet || '') + '\n' + n.notes))))];
    return '<div class="jentry' + (editing ? ' editing' : '') + '" data-jiso="' + iso + '"><div class="jhead"><button type="button" class="jdate" data-jedit="' + iso + '">' + D.WD_LONG[d.getDay()] + ', ' + D.MON_SHORT[d.getMonth()] + ' ' + d.getDate() + (d.getFullYear() !== new Date().getFullYear() ? ', ' + d.getFullYear() : '') + '</button>' + (iso === T ? '<span class="jtoday">Today</span>' : iso > T ? '<span class="jtoday jfuture">' + (D.diffDays(d, D.fromISO(T)) === 1 ? 'Tomorrow' : 'In ' + D.diffDays(d, D.fromISO(T)) + ' days') + '</span>' : '') + '</div>' +
      items.map(({ id, n }, k) => '<div class="jitem' + (n && isMeet(n) ? ' ismeet' : '') + (k === items.length - 1 ? ' jlast' : '') + '" data-jid="' + id + '">' + meetHead(n, editing) +
        (editing ? '<button type="button" class="jcam" data-jphoto="' + id + '" title="Add a photo to this entry" aria-label="Add a photo to this entry">' + I.image + '</button>' + (n ? '<button type="button" class="jcam jdel" data-jdel="' + id + '" title="Delete this entry" aria-label="Delete this entry">' + I.trash + '</button>' : '') + olEditor(id, iso, n && n.notes ? parseOutline(n.notes) : [{ lvl: 0, text: '' }], n && isMeet(n) ? 'Notes, decisions, [ ] to-dos, [[people]]' : k === 0 && !es.length ? 'What happened? [ ] = task' : 'New entry')
          : (n.notes ? '<div class="jbody" data-jedit="' + iso + '">' + olView(n) + '</div>' : isMeet(n) ? '<div class="jbody hint" data-jedit="' + iso + '">No notes yet</div>' : '')) +
        (n ? attGrid(n) : '') + '</div>').join('') +
      (editing ? tools(iso, { split: es.some(n => parseOutline(n.notes).filter(l => l.lvl === 0 && l.text.trim()).length > 1) }) : '') +
      (links.length && editing ? '<div class="jlinks">' + I.link + links.map(x => '<button type="button" class="jlink" data-jlink="' + esc(x) + '">' + esc(x) + '</button>').join('') + '</div>' : '') + '</div>';
  }
  // Small month calendar for the Journal's side panel: dots on days with entries; any day (past or future) opens it
  function jMiniCal(ed) {
    const T = todayISO(), base = ui.jMonth || D.fromISO(ed), y = base.getFullYear(), m = base.getMonth();
    const has = new Set(S.tasks.filter(isNote).map(t => t.due));
    const WS = S.settings.weekStart === 1 ? 1 : 0, first = new Date(y, m, 1), lead = (first.getDay() - WS + 7) % 7, n = new Date(y, m + 1, 0).getDate();
    let h = '<div class="jcal"><div class="jcal-head"><button type="button" class="iconbtn" data-jmonth="-1" aria-label="Previous month">' + I.left + '</button><b>' + D.MON_SHORT[m] + ' ' + y + '</b><button type="button" class="iconbtn" data-jmonth="1" aria-label="Next month">' + I.right + '</button></div><div class="jcal-grid">';
    for (let k = 0; k < 7; k++) h += '<span class="jcal-wd">' + 'SMTWTFS'[(k + WS) % 7] + '</span>';
    for (let k = 0; k < lead; k++) h += '<span></span>';
    for (let dd = 1; dd <= n; dd++) {
      const iso = D.toISO(new Date(y, m, dd));
      h += '<button type="button" class="jcal-d' + (iso === T ? ' today' : '') + (iso === ed ? ' sel' : '') + (has.has(iso) ? ' has' : '') + (iso > T ? ' fut' : '') + '" data-jopen="' + iso + '" title="' + esc(D.dueLabel(iso)) + '">' + dd + '</button>';
    }
    return h + '</div></div>';
  }
  function renderJournal() {
    const T = todayISO(), ed = ui.jEdit || T, tmr = D.toISO(D.addDays(D.fromISO(T), 1));
    const notes = S.tasks.filter(isNote);
    let days = [...new Set([T, ed].concat(notes.map(t => t.due)))].sort().reverse();
    const lim = ui.jLimit || 30, more = days.length > lim;
    if (more) days = days.slice(0, lim).concat(days.slice(lim).includes(ed) ? [ed] : []);
    const ahead = [...new Set(notes.filter(t => t.due > T).map(t => t.due))].sort();
    const firstLine = iso => { const n = entriesFor(iso)[0]; if (!n) return ''; if (isMeet(n)) return mName(n) || 'Meeting'; const l = parseOutline(n.notes).find(x => x.text.trim()); return l ? plainLinks(l.text).replace(/^\[[ x]\]\s*/, '') : ''; };
    const side = '<aside class="jside">' + jMiniCal(ed) +
      '<button type="button" class="chipbtn jplan" data-jopen="' + tmr + '">' + I.plus + 'Plan tomorrow</button>' +
      '<div class="jside-head">Coming up</div>' + (ahead.length ? '<div class="jahead">' + ahead.map(iso => { const d = D.fromISO(iso); return '<button type="button" class="jahead-row" data-jopen="' + iso + '"><b>' + D.WD_LONG[d.getDay()].slice(0, 3) + ', ' + D.MON_SHORT[d.getMonth()] + ' ' + d.getDate() + '</b><span>' + esc(firstLine(iso)) + '</span></button>'; }).join('') + '</div>' : '<p class="hint jside-none">Nothing planned yet. Pick a day above, or Plan tomorrow, and write in it the same way.</p>') +
      '<p class="hint jside-none">Ctrl+O jumps to anything.</p></aside>';
    const html = '<datalist id="meetNames">' + meetNames().map(x => '<option value="' + esc(x) + '">').join('') + '</datalist><div class="jlayout"><div class="jmain"><div class="jtop"><button type="button" class="chipbtn jtmr" data-jopen="' + tmr + '">' + I.plus + 'Tomorrow</button><label class="hint" for="jDate">Go to a day</label><input type="date" class="ctl" id="jDate" value="' + ed + '"></div>' +
      days.map(iso => jEntry(iso, iso === ed)).join('') + (more ? '<button type="button" class="chipbtn jmore" data-jmore="1">Show earlier days</button>' : '') + '</div>' + side + '</div>';
    return { title: 'Journal', sub: '', html, actions: '' };
  }
  // A page for a person or thing: standing facts on top, then every mention (Obsidian-style backlinks)
  function renderLinkPage(name) {
    const pg = pageFor(name), low = name.toLowerCase(), word = new RegExp('(^|[^a-z0-9])' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase() + '($|[^a-z0-9])');
    const hits = s => (s || '').toLowerCase().includes('[[' + low + ']]') || word.test((s || '').toLowerCase());
    const pid = pg ? pg.id : 'newp:' + name;
    const meets = S.tasks.filter(t => isMeet(t) && mName(t).toLowerCase() === low).sort((a, b) => (b.due || '').localeCompare(a.due || '') || (b.createdAt || 0) - (a.createdAt || 0));
    let html = '<div class="jentry editing jpage" data-jiso=""><div class="jhead"><span class="jdate">About ' + esc(name) + '</span></div><div class="jitem" data-jid="' + esc(pid) + '"><button type="button" class="jcam" data-jphoto="' + esc(pid) + '" title="Add a photo" aria-label="Add a photo">' + I.image + '</button>' +
      olEditor(pid, '', pg && pg.notes ? parseOutline(pg.notes) : [{ lvl: 0, text: '' }], (meets.length ? 'Standing notes about this meeting: who comes, what it\u2019s for…' : 'Facts to keep about ' + esc(name) + ': school, doctor, sizes, plate number…'), name) + (pg ? attGrid(pg) : '') + '</div>' + tools('', { page: true }) + '</div>';
    let count = 0, body = '';
    if (meets.length) {
      body += '<div class="section-head jmeets-head">' + I.meet + 'Meetings <span class="n">' + meets.length + '</span></div>' + meets.map(t => { const d = D.fromISO(t.due);
        return '<div class="jentry jmeetrow"><div class="jhead"><button type="button" class="jdate" data-jopen="' + t.due + '">' + D.WD_LONG[d.getDay()] + ', ' + D.MON_SHORT[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + '</button>' + (t.time ? '<span class="jmeet-time">' + D.fmtTime(t.time) + '</span>' : '') + '</div><div class="jitem" data-jid="' + t.id + '">' + (t.notes ? olView(t) : '<p class="hint">No notes</p>') + attGrid(t) + '</div></div>'; }).join('');
      count += meets.length;
    }
    const owe = S.tasks.filter(t => isWaiting(t) && t.waiting.who.toLowerCase() === low);
    if (owe.length) { body += section('Waiting on ' + name, owe, { showList: true }); count += owe.length; }
    const byDay = {};
    S.tasks.filter(t => isNote(t) && !meets.includes(t) && (hits(t.notes) || (isMeet(t) && hits(t.meet)))).forEach(t => (byDay[t.due] = byDay[t.due] || []).push(t));
    Object.keys(byDay).sort().reverse().forEach(iso => {
      const out = [];
      byDay[iso].forEach(t => { const ls = parseOutline(t.notes), mine = []; ls.forEach((l, i) => { if (hits(l.text)) { mine.push(l); for (let j = i + 1; j < ls.length && ls[j].lvl > l.lvl; j++) mine.push(ls[j]); } }); count += mine.length; if ((mine.length || hits(t.meet || '')) && isMeet(t)) { if (!mine.length) count++; out.push({ meetHdr: mName(t) || 'Meeting' }); } out.push(...mine); });
      const d = D.fromISO(iso);
      body += '<div class="jentry"><div class="jhead"><button type="button" class="jdate" data-jopen="' + iso + '">' + D.WD_LONG[d.getDay()] + ', ' + D.MON_SHORT[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + '</button></div><div class="ol ro">' +
        out.map(l => l.meetHdr ? '<div class="jmeet sm">' + I.meet + '<button type="button" class="jlink" data-jlink="' + esc(l.meetHdr) + '">' + esc(l.meetHdr) + '</button></div>' : '<div class="ol-line' + (l.task ? ' istask' + (l.done ? ' isdone' : '') : '') + '" style="--lvl:' + l.lvl + '"><span class="ol-dot"></span>' + (l.task ? '<span class="check small jt' + (l.done ? ' on' : '') + '">' + I.check + '</span>' : '') + '<span class="ol-txt">' + linkify(l.text) + '</span></div>').join('') + '</div></div>';
    });
    const pages = S.tasks.filter(t => isPage(t) && t !== pg && hits(t.notes));
    const papers = S.tasks.filter(t => isPaper(t) && !shut(t) && (noteTitle(t).toLowerCase() === low || hits(paperText(t))));
    const tasks = S.tasks.filter(t => !t.type && !t.jFrom && !owe.includes(t) && (hits(t.title) || hits(t.notes)));
    if (pages.length) body += '<div class="section"><div class="section-head">Pages <span class="n">' + pages.length + '</span></div><div class="tasks">' + pages.map(pageRow).join('') + '</div></div>';
    if (papers.length) body += '<div class="section"><div class="section-head">Notes <span class="n">' + papers.length + '</span></div><div class="tasks">' + papers.map(noteRowForSearch).join('') + '</div></div>';
    if (tasks.length) body += section('Tasks', tasks, { showList: true });
    count += pages.length + papers.length + tasks.length;
    html += count ? '<div class="nlabel jmentions">Mentions</div>' + body : '<p class="hint jnone">No mentions yet. Write [[' + esc(name) + ']] in the journal, a note or a task and it shows up here.</p>';
    return { title: name, sub: meets.length ? meets.length + ' meeting' + (meets.length === 1 ? '' : 's') : count + ' mention' + (count === 1 ? '' : 's'), html, actions: '<button type="button" class="chipbtn" data-jauto="' + esc(name) + '" title="When on, “' + esc(name) + '” written anywhere shows as a link without [[ ]]">Auto-link: ' + (pg && pg.noAuto ? 'off' : 'on') + '</button>' + '<button type="button" class="chipbtn" data-jback="1">' + I.left + 'Journal</button>' };
  }
  const pageRow = p => '<div class="task knote"><span class="evicon">' + I.journal + '</span><div class="tbody" data-jlink="' + esc(p.title) + '" role="button" tabindex="0"><div class="ttitle">' + esc(p.title) + '</div><div class="tmeta"><span>Page</span></div></div></div>';

  // ---- tasks written in the journal ([ ] lines) ↔ real tasks
  function commitTasks(n) {
    if (!n || (!isNote(n) && !isPage(n))) return false;
    const ls = parseOutline(n.notes).filter(l => l.task && l.text.trim());
    const linked = S.tasks.filter(t => t.jFrom === n.id), used = new Set(); let ch = false, rewrite = false;
    const pend = [];
    ls.forEach(l => { const t = linked.find(x => !used.has(x) && x.jKey === tKey(l.text)); if (t) { used.add(t); pair(l, t); } else pend.push(l); });
    const free = linked.filter(t => !used.has(t) && !t.done);
    pend.forEach(l => {
      const t = free.shift(); // the line was edited: update its task
      if (t) { used.add(t); fill(t, l); pair(l, t); return; }
      if (S.trash.tasks.some(x => x.jFrom === n.id && x.jKey === tKey(l.text))) return; // deleted on purpose
      const nt = newTask({ jFrom: n.id }); fill(nt, l); ch = true; pair(l, nt);
    });
    free.forEach(t => { S.tasks = S.tasks.filter(x => x !== t); ch = true; }); // its line is gone
    function fill(t, l) { const wt = parseWaiting(l.text); const p = D.parseQuick(wt ? wt.rest : l.text, S.lists, new Date(), { noRange: true }); if (wt && !(t.waiting && t.waiting.who.toLowerCase() === wt.who.toLowerCase())) t._wt = wt; Object.assign(t, { title: (p.title || l.text.trim()).replace(/\[\[([^\[\]]*)\]\]/g, '$1'), jKey: tKey(l.text), due: p.due || null, time: p.end ? null : (p.time || null), recur: p.recur || null, reminder: p.reminder || null, listId: p.listId || t.listId || 'inbox' }); if (t._wt) { setWaiting(t, t._wt.who, 3); delete t._wt; } ch = true; }
    function pair(l, t) {
      if (l.done && !t.done) { finishTask(t); ch = true; if (!t.done) { l.done = false; rewrite = true; } } // repeating: moves to the next date
      else if (!l.done && t.done) { t.done = false; t.doneAt = null; ch = true; }
    }
    if (rewrite) { const all = parseOutline(n.notes); let k = 0; all.forEach(x => { if (x.task && x.text.trim()) { x.done = ls[k++].done; } }); n.notes = serializeOutline(all); }
    if (ch || rewrite) save();
    return ch || rewrite;
  }
  // A journal task ticked off somewhere else: tick its line too
  function syncJournalTicks() {
    let ch = false;
    S.tasks.forEach(t => {
      if (!t.jFrom || !t.jKey) return;
      if (/\[\[/.test(t.title)) { t.title = t.title.replace(/\[\[([^\[\]]*)\]\]/g, '$1'); ch = true; }
      const n = taskById(t.jFrom); if (!n) return;
      const ls = parseOutline(n.notes); let hit = false;
      ls.forEach(l => { if (l.task && tKey(l.text) === t.jKey && !!l.done !== !!t.done && !t.recur) { l.done = !!t.done; hit = true; } });
      if (hit) { n.notes = serializeOutline(ls); ch = true; }
    });
    if (ch) persistLocal(), schedulePush();
  }

  // ---- editing
  function olRead(ol) { return [...ol.querySelectorAll('.ol-line')].map(div => { const l = { lvl: Number(div.dataset.lvl) || 0, text: div.querySelector('.ol-in').value }; if (div.dataset.task) { l.task = true; l.done = !!div.dataset.done; } return l; }); }
  function olSave(ol, lines) {
    const iso = ol.dataset.oliso, id = ol.dataset.olid, page = ol.dataset.olpage, text = serializeOutline(lines);
    let n = /^new[p]?:/.test(id) ? null : taskById(id);
    if (!text.trim() || lines.every(l => !l.text.trim())) {
      if (n && isMeet(n) && (mName(n) || (n.attachments || []).length)) { n.notes = ''; commitTasks(n); save(); return n; }
      if (n && !(n.attachments || []).length) { S.tasks = S.tasks.filter(x => x !== n); const nid = page ? 'newp:' + page : 'new:' + iso; ol.dataset.olid = nid; setJid(ol, nid); save(); }
      return null;
    }
    if (!n) { n = page ? newTask({ type: 'page', title: page, listId: 'inbox', notes: '' }) : newEntry(iso); ol.dataset.olid = n.id; setJid(ol, n.id); if (ui.jNewFor === iso) ui.jNewFor = null; }
    n.notes = text; if (!page) n.title = isMeet(n) && mName(n) ? mName(n) : entryTitle(lines); save();
    return n;
  }
  function setJid(ol, id) { const it = ol.closest('.jitem'); if (it) { it.dataset.jid = id; const cam = it.querySelector('[data-jphoto]'); if (cam) cam.dataset.jphoto = id; } }
  function olRedraw(ol, lines, focus, caret) {
    const n = olSave(ol, lines); if (n) commitTasks(n);
    ol.innerHTML = linesHtml(n || taskById(ol.dataset.olid), lines);
    const inp = ol.querySelectorAll('.ol-in')[focus];
    if (inp) { inp.focus(); const c = Math.min(caret ?? inp.value.length, inp.value.length); inp.setSelectionRange(c, c); }
    ui.olFocus = { id: ol.dataset.olid, iso: ol.dataset.oliso, i: focus };
    if (ui.view === 'calendar') renderMain();
    renderSide();
  }
  function olShift(lines, i, dir) {
    const l = lines[i], prev = lines[i - 1];
    if (dir > 0 && (!prev || l.lvl > prev.lvl)) return false;
    if (dir < 0 && l.lvl === 0) return false;
    const base = l.lvl; l.lvl += dir;
    for (let j = i + 1; j < lines.length && lines[j].lvl > base; j++) lines[j].lvl += dir; // children move along
    return true;
  }
  const focusedOl = () => { const f = ui.olFocus; return f && (document.querySelector('.ol[data-olid="' + f.id + '"]:not(.ro)') || null); };
  function splitEntry(n) {
    const ls = parseOutline(n.notes), groups = [];
    ls.forEach(l => { if (l.lvl === 0 && l.text.trim() || !groups.length) groups.push([l]); else groups[groups.length - 1].push(l); });
    const real = groups.filter(g => g.some(l => l.text.trim())); if (real.length < 2) return 0;
    snapshot();
    n.notes = serializeOutline(real[0]); n.title = entryTitle(real[0]);
    real.slice(1).forEach((g, k) => { const e = newEntry(n.due, { notes: serializeOutline(g), title: entryTitle(g), createdAt: (n.createdAt || Date.now()) + k + 1 }); S.tasks.forEach(t => { if (t.jFrom === n.id && g.some(l => l.task && tKey(l.text) === t.jKey)) t.jFrom = e.id; }); });
    save(); return real.length;
  }
  function toggleFold(n, i) { if (!n) return; const ls = parseOutline(n.notes), k = foldKey(ls[i]); const f = new Set(n.folds || []); f.has(k) ? f.delete(k) : f.add(k); n.folds = [...f]; if (!n.folds.length) delete n.folds; save(); }

  // Enter in a journal line: everything after the cursor moves to a new line below, starting with a capital
  function olSplit(inp) {
    const ol = inp.closest('.ol'); if (!ol) return;
    const lines = olRead(ol), i = Number(inp.dataset.oli), pos = inp.selectionStart, end = inp.selectionEnd, l = lines[i];
    if (!l) return;
    const after = capFirst(l.text.slice(end).replace(/^\s+/, '')); l.text = l.text.slice(0, pos).replace(/\s+$/, '');
    const nl = { lvl: (lines[i + 1] && lines[i + 1].lvl > l.lvl && !after) ? l.lvl + 1 : l.lvl, text: after };
    if (l.task && (l.text.trim() || after)) { nl.task = true; } else if (l.task && !l.text.trim()) { delete l.task; delete l.done; }
    lines.splice(i + 1, 0, nl); olRedraw(ol, lines, nl.task || !lines[i].task ? i + 1 : i, 0);
  }
  const capFirst = t => t.replace(/^([^\p{L}\[]*)(\p{Ll})/u, (m, a, c) => a + c.toUpperCase());

  // ---- [[ suggestions (journal lines, notes, task notes) and a Link button for phone keyboards
  function linkNames() {
    const c = {};
    const add = (x, w) => { x = (x || '').trim(); if (x) c[x] = (c[x] || 0) + w; };
    S.tasks.forEach(t => {
      if (isNote(t) || isPage(t) || isPaper(t) || !t.type) linksIn(isPaper(t) ? E(t).body : t.notes).forEach(x => add(x, 2));
      if (isPage(t)) add(t.title, 3);
      if (!isNote(t) && !isPage(t) && !isPaper(t)) linksIn(t.title).forEach(x => add(x, 2)); // [[Name]] in a task or event title
      if (isMeet(t)) { add(mName(t), 3); linksIn(t.meet).forEach(x => add(x, 2)); }
      if (isDoc(t)) { add(t.holder, 1); add(noteTitle(t), 1); }
      if (isKNote(t) && t.title) add(t.title, 0.5);
    });
    return Object.keys(c).sort((a, b) => c[b] - c[a] || a.localeCompare(b));
  }
  let sug = null;
  const SUG_FIELDS = '.ol-in, #nBody, #dNotes, .jmeet-in, #qa, #dTitle, #nTitle';
  function hideSuggest() { sug = null; const b = $('#jsug'); if (b) b.hidden = true; }
  // Select some words and type "[": they become a [[link]] (no list pops up)
  document.addEventListener('keydown', e => {
    const el = e.target;
    if (e.key !== '[' || e.ctrlKey || e.metaKey || e.altKey || !el.matches || !el.matches('#nBody, #dNotes, #dTitle, #nTitle, #qa, .ol-in')) return;
    const a = el.selectionStart, b = el.selectionEnd; if (a === b) return;
    const sel = el.value.slice(a, b), lead = sel.match(/^\s*/)[0], trail = sel.match(/\s*$/)[0], word = sel.trim();
    if (!word || word.includes('\n') || word.length > 60 || /[\[\]]/.test(word)) return;
    e.preventDefault();
    el.setRangeText(lead + '[[' + word + ']]' + trail, a, b, 'end');
    const c = a + lead.length + word.length + 4; el.setSelectionRange(c, c);
    el.dispatchEvent(new Event('input', { bubbles: true })); hideSuggest();
  }, true);
  // Screen position of the text cursor in an input or textarea (a hidden copy with the same styling measures it)
  function caretRect(inp) {
    const r = inp.getBoundingClientRect();
    try {
      const cs = getComputedStyle(inp), d = document.createElement('div'), span = document.createElement('span');
      ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom', 'borderTopWidth', 'borderLeftWidth', 'boxSizing', 'tabSize', 'textTransform', 'wordSpacing'].forEach(k => d.style[k] = cs[k]);
      Object.assign(d.style, { position: 'fixed', visibility: 'hidden', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', whiteSpace: inp.tagName === 'TEXTAREA' ? 'pre-wrap' : 'pre', wordWrap: 'break-word', overflow: 'hidden' });
      d.textContent = inp.value.slice(0, inp.selectionStart); span.textContent = '\u200b'; d.appendChild(span); document.body.appendChild(d);
      const sr = span.getBoundingClientRect(); d.remove();
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
      return { left: Math.min(sr.left - inp.scrollLeft, r.right), top: sr.top - inp.scrollTop, bottom: sr.top - inp.scrollTop + lh };
    } catch (e) { return { left: r.left, top: r.top, bottom: r.bottom }; }
  }
  // The list sits just above the line being typed (so the text around it stays visible); below only if there's no room
  function placeSuggest(b, inp) {
    const c = caretRect(inp), h = b.offsetHeight || 180, above = c.top - h - 6 > 8;
    b.style.left = Math.max(8, Math.min(c.left - 12, window.innerWidth - b.offsetWidth - 8)) + 'px';
    b.style.bottom = 'auto'; b.style.top = (above ? c.top - h - 6 : c.bottom + 6) + 'px';
  }
  function updateSuggest(inp) {
    const pos = inp.selectionStart, m = inp.value.slice(0, pos).match(/\[\[([^\[\]\n]{0,40})$/);
    if (!m) { hideSuggest(); return; }
    if (!m[1].trim()) { hideSuggest(); return; } // wait for a letter after [[
    const q = m[1].trim().toLowerCase(), names = linkNames();
    const items = names.filter(x => x.toLowerCase().includes(q)).sort((a, b) => (b.toLowerCase().startsWith(q) ? 1 : 0) - (a.toLowerCase().startsWith(q) ? 1 : 0)).slice(0, 5);
    if (q && !names.some(x => x.toLowerCase() === q)) items.push({ create: m[1].trim() });
    if (!items.length) {
      if (q) { hideSuggest(); return; }
      // Nothing linked yet: say how it works instead of showing nothing
      let h = $('#jsug'); if (!h) { h = document.createElement('div'); h.id = 'jsug'; h.className = 'jsug'; h.setAttribute('role', 'listbox'); document.body.appendChild(h); }
      sug = null; h.innerHTML = '<div class="jsug-i jsug-hint">' + I.link + 'Type a name to link it, e.g. [[Ahmed]]</div>';
      const r0 = inp.getBoundingClientRect(); h.style.left = Math.max(8, Math.min(r0.left, window.innerWidth - 260)) + 'px';
      const below0 = window.innerHeight - r0.bottom > 220; h.style.top = below0 ? (r0.bottom + 4) + 'px' : 'auto'; h.style.bottom = below0 ? 'auto' : (window.innerHeight - r0.top + 4) + 'px';
      h.hidden = false; return;
    }
    let b = $('#jsug'); if (!b) { b = document.createElement('div'); b.id = 'jsug'; b.className = 'jsug'; b.setAttribute('role', 'listbox'); document.body.appendChild(b); }
    sug = { inp, start: pos - m[0].length, end: pos, items, sel: 0 };
    drawSuggest();
    b.hidden = false; placeSuggest(b, inp);
  }
  function drawSuggest() {
    const b = $('#jsug'); if (!b || !sug) return;
    b.innerHTML = sug.items.map((x, k) => '<button type="button" role="option" class="jsug-i' + (k === sug.sel ? ' on' : '') + '" data-sug="' + k + '">' + (typeof x === 'string' ? I.link + esc(x) : I.plus + 'Link “' + esc(x.create) + '”') + '</button>').join('');
  }
  function pickSuggest(k) {
    if (!sug) return;
    const it = sug.items[k], name = typeof it === 'string' ? it : it.create, inp = sug.inp;
    const rest = inp.value.slice(sug.end).replace(/^[^\[\]\n]*\]\]/, '');
    inp.value = inp.value.slice(0, sug.start) + '[[' + name + ']] ' + rest.replace(/^ /, '');
    const c = sug.start + name.length + 5; inp.focus(); inp.setSelectionRange(c, c);
    hideSuggest(); inp.dispatchEvent(new Event('input', { bubbles: true })); hideSuggest();
  }
  // Clicking a link: a note or document with that exact name opens directly; anything else opens its page
  function openLink(name) {
    const paper = !pageFor(name) && S.tasks.find(t => isPaper(t) && noteTitle(t).toLowerCase() === name.toLowerCase());
    ui.selected = null; ui.dayPanel = null;
    if (paper) { openNote(paper.id); return; }
    ui.jlink = name; setView('jlink');
  }

  // ---- Ctrl+O: jump to anything
  function openJump() {
    let el = $('#jump');
    if (!el) { el = document.createElement('div'); el.id = 'jump'; el.className = 'sheet-bg'; document.body.appendChild(el); }
    el.innerHTML = '<div class="jumpbox" role="dialog" aria-label="Jump to"><input id="jumpIn" class="ctl" placeholder="Jump to a day, person, note, document or task…" autocomplete="off"><div id="jumpList" class="jumplist"></div><div class="jsug-hint">↑↓ to choose, Enter to open, Esc to close</div></div>';
    el.hidden = false; ui.jump = { sel: -1, items: [] }; drawJump(''); // nothing picked until you type or use the arrows setTimeout(() => $('#jumpIn').focus(), 20);
  }
  function closeJump() { const el = $('#jump'); if (el) el.hidden = true; ui.jump = null; }
  function jumpItems(q) {
    const low = q.trim().toLowerCase(), out = [], score = s => { s = (s || '').toLowerCase(); return !low ? 1 : s.startsWith(low) ? 3 : s.split(/\s+/).some(w => w.startsWith(low)) ? 2 : s.includes(low) ? 1 : 0; };
    if (low) { // a date: open the journal on that day (past dates win, since the journal looks back)
      let due = low === 'yesterday' ? D.toISO(D.addDays(new Date(), -1)) : null;
      if (!due) { const p = D.parseQuick(q, [], new Date(), { noRange: true }); if (p.due && (!p.title || p.title.trim().toLowerCase() === low)) due = p.due; }
      if (due && due > todayISO() && !/\b\d{4}\b/.test(q)) { const d = D.fromISO(due); due = D.toISO(new Date(d.getFullYear() - 1, d.getMonth(), d.getDate())); }
      if (due) { const d = D.fromISO(due); out.push({ s: 9, icon: I.journal, label: 'Journal · ' + D.WD_LONG[d.getDay()] + ', ' + D.MON_SHORT[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(), go: () => { ui.jEdit = due; setView('journal'); focusJournal(); } }); }
    }
    [['calendar', 'Calendar'], ['all', 'All tasks'], ['myday', 'My Day'], ['notes', 'Notes'], ['docs', 'Important Documents'], ['journal', 'Journal']].forEach(([v, n]) => { const s = score(n); if (s && low) out.push({ s: s + 0.5, icon: VIEWS[v].icon, label: n, go: () => setView(v) }); });
    const paperNames = new Set(S.tasks.filter(t => isPaper(t) && !shut(t)).map(t => noteTitle(t).toLowerCase()));
    linkNames().forEach(n => { if (paperNames.has(n.toLowerCase()) && !pageFor(n) && !isMeetName(n)) return; const s = score(n); if (s) out.push({ s: s + (pageFor(n) || isMeetName(n) ? 1 : 0.6), icon: isMeetName(n) ? I.meet : I.link, label: n, sub: isMeetName(n) ? 'Meetings' : pageFor(n) ? 'Page' : 'Mentions', go: () => openLink(n) }); });
    S.tasks.filter(isPaper).forEach(t => { const s = score(noteTitle(t)); if (s && low) out.push({ s, icon: isDoc(t) ? I.idcard : I.note, label: noteTitle(t), sub: isDoc(t) ? 'Important document' : 'Note', go: () => openNote(t.id) }); });
    S.tasks.filter(t => !t.type && !t.done).forEach(t => { const s = score(t.title); if (s && low) out.push({ s: s - 0.2, icon: I.check, label: t.title, sub: t.due ? D.dueLabel(t.due) : 'Task', go: () => { ui.dayPanel = null; setView('all'); ui.selected = t.id; render(); } }); });
    const seen = new Set();
    return out.sort((a, b) => b.s - a.s).filter(x => { const k = x.label + '|' + (x.sub || ''); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 9);
  }
  function drawJump(q) {
    if (!ui.jump) return;
    ui.jump.items = jumpItems(q); ui.jump.sel = Math.min(ui.jump.sel, Math.max(0, ui.jump.items.length - 1));
    $('#jumpList').innerHTML = ui.jump.items.length ? ui.jump.items.map((x, k) => '<button type="button" class="jsug-i' + (k === ui.jump.sel ? ' on' : '') + '" data-jumpi="' + k + '">' + x.icon + '<span>' + esc(x.label) + '</span>' + (x.sub ? '<span class="hint">' + esc(x.sub) + '</span>' : '') + '</button>').join('') : '<p class="hint" style="padding:8px 10px">Nothing matches. Try a name, a note title, or a date like “nov 20”.</p>';
  }
  function goJump(k) { const it = ui.jump && ui.jump.items[k]; closeJump(); if (it) it.go(); }

  // What goes first in a calendar day (a full day hides from the bottom, so journal lines fold away first):
  // holidays, birthdays/anniversaries, other events, tasks (timed, then untimed, done last), skipped, expiry dates,
  // meeting notes, journal lines. Same rank: earlier time first.
  function calRank(x) {
    const t = x.t;
    if (x.kind === 'event') return t.holiday ? 0 : isYearly(t) ? 1 : 2;
    if (x.kind === 'task') return t.expFor ? 6 : t.done ? 4 : 3;
    if (x.kind === 'skip') return 5;
    if (x.kind === 'expiry') return 6;
    if (x.kind === 'note') return x.meet || isMeet(t) ? 7 : 8;
    return 9;
  }
  const calOrder = (a, b) => calRank(a) - calRank(b) || (a.t.time || '99').localeCompare(b.t.time || '99') || (a.t.createdAt || 0) - (b.t.createdAt || 0);
  // Month view: when a day has more than fits, show what fits plus "+N more" (opens the day)
  function fitCal() {
    if (isPhone()) return;
    document.querySelectorAll('#content .cal-week .cal-day').forEach(day => {
      const box = day.querySelector('.cal-items'); if (!box) return;
      box.querySelectorAll('.cmore').forEach(x => x.remove());
      const kids = [...box.children]; kids.forEach(k => { k.style.display = ''; });
      if (box.scrollHeight <= box.clientHeight + 1) return;
      const more = document.createElement('button'); more.type = 'button'; more.className = 'cmore'; more.dataset.dayopen = day.dataset.day; box.appendChild(more);
      let hid = 0;
      for (let i = kids.length - 1; i >= 0 && box.scrollHeight > box.clientHeight + 1; i--) { kids[i].style.display = 'none'; hid++; more.textContent = '+' + hid + ' more'; }
      if (!hid) more.remove();
    });
  }
  function setupCalFit() {
    const c = $('#content'); if (!c) return;
    let raf = 0; const go = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fitCal); };
    new MutationObserver(go).observe(c, { childList: true });
    window.addEventListener('resize', go);
    go();
  }
  function bindJournal() {
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'o' || e.key === 'O')) { e.preventDefault(); openJump(); return; }
      if (ui.jump && e.target.id === 'jumpIn') {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const n = ui.jump.items.length; if (n) { ui.jump.sel = ui.jump.sel < 0 ? (e.key === 'ArrowDown' ? 0 : n - 1) : (ui.jump.sel + (e.key === 'ArrowDown' ? 1 : -1) + n) % n; drawJump(e.target.value); } return; }
        if (e.key === 'Enter') { e.preventDefault(); if (ui.jump.sel >= 0) goJump(ui.jump.sel); return; }
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeJump(); return; }
        return;
      }
      if (sug && sug.inp === e.target) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sug.sel = (sug.sel + (e.key === 'ArrowDown' ? 1 : -1) + sug.items.length) % sug.items.length; drawSuggest(); return; }
        if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); pickSuggest(sug.sel); return; }
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); hideSuggest(); return; }
      }
      if (e.key === 'Enter' && e.target.matches && e.target.matches('.jmeet-in')) { e.preventDefault(); const it = e.target.closest('.jitem'), f = it && it.querySelector('.ol-in'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } return; }
      const inp = e.target.closest && e.target.closest('.ol-in'); if (!inp) return;
      const ol = inp.closest('.ol'), lines = olRead(ol), i = Number(inp.dataset.oli), pos = inp.selectionStart, end = inp.selectionEnd;
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        // Phone keyboards may still be finishing the word you tapped into: let them, then split where the cursor really is
        if (e.isComposing || e.keyCode === 229 || IS_ANDROID) { setTimeout(() => { if (inp.isConnected) olSplit(inp); }, 0); return; }
        olSplit(inp); return;
      }
      if (e.key === 'Tab') { e.preventDefault(); if (olShift(lines, i, e.shiftKey ? -1 : 1)) olRedraw(ol, lines, i, pos); return; }
      if (e.key === 'Backspace' && pos === 0 && end === 0) {
        if (lines[i].task) { e.preventDefault(); delete lines[i].task; delete lines[i].done; olRedraw(ol, lines, i, 0); return; } // first Backspace: back to a plain bullet
        if (lines[i].lvl > 0 && !lines[i].text) { e.preventDefault(); olShift(lines, i, -1); olRedraw(ol, lines, i, 0); return; }
        if (i > 0) { e.preventDefault(); const p = lines[i - 1], c = p.text.length; p.text += lines[i].text; lines.splice(i, 1); olRedraw(ol, lines, i - 1, c); }
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const all = [...document.querySelectorAll('.jentry.editing .ol-line:not(.hid) .ol-in')], j = all.indexOf(inp) + (e.key === 'ArrowUp' ? -1 : 1);
        if (all[j]) { e.preventDefault(); all[j].focus(); const c = Math.min(pos, all[j].value.length); all[j].setSelectionRange(c, c); }
      }
    });
    document.addEventListener('input', e => {
      if (e.target.id === 'jumpIn') { ui.jump.sel = e.target.value.trim() ? 0 : -1; drawJump(e.target.value); return; }
      if (e.target.matches && e.target.matches('#nBody, #dNotes, #qa, #dTitle, #nTitle')) { updateSuggest(e.target); return; }
      if (e.target.matches && e.target.matches('.jmeet-in')) { const n = taskById(e.target.dataset.jmeetname); if (n) { n.meet = e.target.value; n.title = mName(n) || entryTitle(parseOutline(n.notes)); save(); renderSide(); updateSuggest(e.target); refreshLinksRow(e.target.closest('.jentry'));
        const hd = e.target.closest('.jmeet'), nm = mName(n); let all = hd.querySelector('.jmeet-all');
        if (!nm) { if (all) all.remove(); } else { if (!all) { all = document.createElement('button'); all.type = 'button'; all.className = 'jlink jmeet-all'; all.textContent = 'All'; hd.appendChild(all); } all.dataset.jlink = nm; all.title = 'Every ' + nm + ' meeting'; } if (ui.view === 'calendar' && e.target.closest('#detail')) renderMain(); } return; }
      const inp = e.target.closest && e.target.closest('.ol-in'); if (!inp) return;
      const ol = inp.closest('.ol'), line = inp.closest('.ol-line');
      // typing "[ ]" or "[]" at the start makes it a task line
      const m = !line.dataset.task && inp.value.match(/^\[ ?\]\s/);
      if (m) { const lines = olRead(ol), i = Number(inp.dataset.oli); lines[i].text = inp.value.slice(m[0].length); lines[i].task = true; olRedraw(ol, lines, i, 0); return; }
      if (!e.isComposing && e.inputType === 'insertText' && inp.value.length === 1 && /\p{Ll}/u.test(inp.value)) { inp.value = inp.value.toUpperCase(); inp.setSelectionRange(1, 1); }
      olSave(ol, olRead(ol));
      ui.olFocus = { id: ol.dataset.olid, iso: ol.dataset.oliso, i: Number(inp.dataset.oli) };
      updateSuggest(inp); refreshLinksRow(inp.closest('.jentry'));
      if (ui.view === 'calendar' && inp.closest('#detail')) renderMain();
    });
    document.addEventListener('focusin', e => { const inp = e.target.closest && e.target.closest('.ol-in'); if (inp) { const ol = inp.closest('.ol'); ui.olFocus = { id: ol.dataset.olid, iso: ol.dataset.oliso, i: Number(inp.dataset.oli) }; } });
    document.addEventListener('focusout', e => {
      const inp = e.target.closest && e.target.closest('.ol-in');
      if (inp && inp.closest('.ol-line').dataset.task) { const n = taskById(inp.closest('.ol').dataset.olid); if (n && commitTasks(n)) { const ol = inp.closest('.ol'); setTimeout(() => { if (!ol.isConnected) return; ol.querySelectorAll('.ol-line.istask').forEach(div => { const i = Number(div.querySelector('.ol-in').dataset.oli); const l = olRead(ol)[i]; const c = div.querySelector('.jtchip'); const html = taskChip(linkedTask(n, l)); if (c) c.outerHTML = html || ''; else if (html) div.insertAdjacentHTML('beforeend', html); }); renderSide(); if (ui.view === 'calendar') renderMain(); }, 0); } }
      if (e.target.matches && e.target.matches('.jmeet-in')) { const n = taskById(e.target.dataset.jmeetname); if (n) { n.meet = n.meet.trim(); splitMeetTime(n, e.target); if (!n.meet && !n.notes && !(n.attachments || []).length) setTimeout(() => { if (document.activeElement && document.activeElement.closest && document.activeElement.closest('.jitem[data-jid="' + n.id + '"]')) return; S.tasks = S.tasks.filter(x => x !== n); save(); render(); }, 150); else { save(); if (ui.view === 'journal') setTimeout(renderMain, 150); } } }
      if (e.target.matches && e.target.matches(SUG_FIELDS)) setTimeout(() => { if (!document.activeElement || !document.activeElement.matches(SUG_FIELDS)) hideSuggest(); }, 150);
    });
    document.addEventListener('mousedown', e => { if (e.target.closest('[data-olind], [data-ollink], [data-oltask], .jsug')) e.preventDefault(); });
    document.addEventListener('click', e => {
      const sg = e.target.closest('[data-sug]'); if (sg) { pickSuggest(Number(sg.dataset.sug)); return; }
      const ji = e.target.closest('[data-jumpi]'); if (ji) { goJump(Number(ji.dataset.jumpi)); return; }
      if (e.target.id === 'jump') { closeJump(); return; }
      const ind = e.target.closest('[data-olind]');
      if (ind) { const ol = focusedOl(); if (!ol) return; const f = ui.olFocus, lines = olRead(ol), inp = ol.querySelectorAll('.ol-in')[f.i]; if (olShift(lines, f.i, Number(ind.dataset.olind))) olRedraw(ol, lines, f.i, inp ? inp.selectionStart : 0); return; }
      if (e.target.closest('[data-oltask]')) { const ol = focusedOl(); if (!ol) return; const f = ui.olFocus, lines = olRead(ol); const l = lines[f.i]; if (l.task) { delete l.task; delete l.done; } else l.task = true; olRedraw(ol, lines, f.i); return; }
      if (e.target.closest('[data-ollink]')) {
        const ol = focusedOl() || document.querySelector('.jentry.editing .ol'); if (!ol) return;
        const ins = ol.querySelectorAll('.ol-in'), inp = ins[(ui.olFocus && ui.olFocus.id === ol.dataset.olid) ? ui.olFocus.i : ins.length - 1] || ins[0];
        inp.focus(); const s0 = inp.selectionStart ?? inp.value.length, pre = s0 > 0 && !/\s$/.test(inp.value.slice(0, s0)) ? ' ' : '';
        inp.setRangeText(pre + '[[', s0, inp.selectionEnd ?? s0, 'end');
        inp.dispatchEvent(new Event('input', { bubbles: true })); return;
      }
      const tk = e.target.closest('[data-jtick]');
      if (tk) {
        e.stopPropagation();
        const ol = tk.closest('.ol'), n = taskById(ol.dataset.olid), i = Number(tk.dataset.jtick);
        if (ol.classList.contains('ro')) { if (!n) return; const ls = parseOutline(n.notes), t = linkedTask(n, ls[i]); ls[i].done = !(t ? t.done : ls[i].done); if (ls[i].done) playDone(); n.notes = serializeOutline(ls); commitTasks(n); save(); render(); }
        else { const lines = olRead(ol); lines[i].done = !lines[i].done; if (lines[i].done) playDone(); olRedraw(ol, lines, i); }
        return;
      }
      const fo = e.target.closest('[data-olfold]');
      if (fo) {
        e.stopPropagation(); const ol = fo.closest('.ol'), n = taskById(ol.dataset.olid); if (!n) return;
        if (!ol.classList.contains('ro')) olSave(ol, olRead(ol));
        toggleFold(n, Number(fo.dataset.olfold));
        if (ol.classList.contains('ro')) render(); else ol.innerHTML = linesHtml(n, parseOutline(n.notes));
        return;
      }
      const jl = e.target.closest('[data-jlink]'); if (jl) { e.stopPropagation(); openLink(jl.dataset.jlink); return; }
      if (e.target.closest('[data-jback]')) { setView('journal'); return; }
      const ja = e.target.closest('[data-jauto]'); if (ja) { const nm = ja.dataset.jauto; const pg = pageFor(nm) || newTask({ type: 'page', title: nm, listId: 'inbox', notes: '' }); pg.noAuto = !pg.noAuto; if (!pg.noAuto) delete pg.noAuto; save(); render(); toast(pg.noAuto ? '“' + nm + '” only links when written as [[' + nm + ']]' : '“' + nm + '” now links everywhere it’s written', true); return; }
      const jmo = e.target.closest('[data-jmonth]'); if (jmo) { e.stopPropagation(); const b = ui.jMonth || D.fromISO(ui.jEdit || todayISO()); ui.jMonth = new Date(b.getFullYear(), b.getMonth() + Number(jmo.dataset.jmonth), 1); renderMain(); return; }
      const jo = e.target.closest('[data-jopen]'); if (jo) { ui.jMonth = null; e.stopPropagation(); ui.jEdit = jo.dataset.jopen; ui.selected = null; ui.dayPanel = null; setView('journal'); focusJournal(); return; }
      if (e.target.matches && e.target.matches('.ol:not(.ro)')) { const ins = e.target.querySelectorAll('.ol-line:not(.hid) .ol-in'), last = ins[ins.length - 1]; if (last) { last.focus(); last.setSelectionRange(last.value.length, last.value.length); } return; }
      const jc = e.target.closest('.jmeet-clock'); if (jc && !e.target.matches('.jmeet-tin')) { const ti = jc.querySelector('input'); ti.focus(); try { ti.showPicker(); } catch (x) { } return; }
      const jd = e.target.closest('[data-jdel]'); if (jd) { e.stopPropagation(); const n = taskById(jd.dataset.jdel); if (!n) return; snapshot(); unfocusOl(); trashTask(n); save(); render(); toast((isMeet(n) ? 'Meeting notes' : 'Entry') + ' moved to Recently deleted', true); return; }
      const jm = e.target.closest('[data-jmeet]'); if (jm) { e.stopPropagation(); unfocusOl(); const m = newEntry(jm.dataset.jmeet, { meet: '', title: '' }); save(); render(); focusMeet(m.id, true); return; }
      const jn = e.target.closest('[data-jnew]'); if (jn) { e.stopPropagation(); ui.jNewFor = jn.dataset.jnew; unfocusOl(); if (ui.view === 'calendar') renderDetail(); else renderMain(); focusJournal(true); return; }
      if (e.target.closest('[data-jsplit]')) {
        e.stopPropagation(); const ent = e.target.closest('.jentry'); const f = ui.olFocus;
        const es = entriesFor(ent.dataset.jiso); const target = (f && es.find(x => x.id === f.id)) || es.find(x => parseOutline(x.notes).filter(l => l.lvl === 0 && l.text.trim()).length > 1);
        const k = target ? splitEntry(target) : 0; unfocusOl(); render(); if (k) toast('Split into ' + k + ' entries', true); return;
      }
      const je = e.target.closest('[data-jedit]'); if (je && !e.target.closest('.jlink, [data-jtick], [data-olfold]')) { if (ui.jEdit !== je.dataset.jedit) { ui.jEdit = je.dataset.jedit; ui.jNewFor = null; renderMain(); } focusJournal(); return; }
      if (e.target.closest('[data-jmore]')) { ui.jLimit = (ui.jLimit || 30) + 30; renderMain(); return; }
      const jp = e.target.closest('[data-jphoto]');
      if (jp) { const id = jp.dataset.jphoto; const n = id.startsWith('newp:') ? newTask({ type: 'page', title: id.slice(5), listId: 'inbox', notes: '' }) : id.startsWith('new:') ? newEntry(id.slice(4)) : taskById(id); if (n) pickFiles(n, 'note'); return; }
      // files on an entry or page
      const it = e.target.closest('.jitem[data-jid]'); if (!it) return;
      const n = taskById(it.dataset.jid); if (!n) return;
      const ao = e.target.closest('[data-attopen]'); if (ao) { e.stopPropagation(); openLightbox(n, n.attachments.find(a => a.id === ao.dataset.attopen)); return; }
      const ad = e.target.closest('[data-attdel]'); if (ad) { e.stopPropagation(); removeAttachment(n, ad.dataset.attdel); return; }
      const aa = e.target.closest('[data-attarch]'); if (aa) { e.stopPropagation(); const a = n.attachments.find(x => x.id === aa.dataset.attarch); a.arch = !a.arch; if (!a.arch) delete a.arch; unfocusOl(); save(); render(); return; }
    }, true);
    document.addEventListener('change', e => { if (e.target.matches && e.target.matches('.jmeet-tin')) { const n = taskById(e.target.dataset.jmeettime); if (n) { n.time = e.target.value || null; save(); e.target.closest('.jmeet-clock').classList.toggle('on', !!n.time); if (ui.view === 'calendar') renderMain(); } return; }
      if (e.target.id === 'jDate' && e.target.value) { ui.jEdit = e.target.value; ui.jNewFor = null; renderMain(); focusJournal(); } });
    window.addEventListener('resize', hideSuggest);
  }
  // keep the "Linked:" row under a day up to date while typing
  function refreshLinksRow(ent) {
    if (!ent || !ent.dataset.jiso) return;
    const links = [...new Set([].concat(...entriesFor(ent.dataset.jiso).map(n => linksIn((n.meet || '') + '\n' + n.notes))))];
    let row = ent.querySelector('.jlinks');
    const html = links.length ? I.link + links.map(x => '<button type="button" class="jlink" data-jlink="' + esc(x) + '">' + esc(x) + '</button>').join('') : '';
    if (!html) { if (row) row.remove(); return; }
    if (!row) { row = document.createElement('div'); row.className = 'jlinks'; ent.appendChild(row); }
    if (row.innerHTML !== html) row.innerHTML = html;
  }
  function focusJournal(newest) {
    setTimeout(() => {
      const root = ui.view === 'calendar' ? $('#detail') : $('#content');
      const els = root.querySelectorAll('.jentry.editing:not(.jpage) .ol');
      const ol = els[els.length - 1]; if (!ol) return;
      const ins = ol.querySelectorAll('.ol-line:not(.hid) .ol-in'), last = ins[ins.length - 1];
      if (last) { last.focus(); last.setSelectionRange(last.value.length, last.value.length); last.scrollIntoView({ block: 'center' }); }
    }, 30);
  }


  /* ====================== Waiting on someone (GTD "waiting for") ====================== */
  const WAIT_DAYS = [[2, '2 days'], [3, '3 days'], [5, '5 days'], [7, '1 week'], [14, '2 weeks']];
  const isWaiting = t => !!(t && t.waiting && !t.done);
  const nudgeRem = t => !!(t && t.waiting && t.reminder && t.reminder.slice(0, 10) === t.waiting.nudge);
  const nudgeDue = t => isWaiting(t) && t.waiting.nudge <= todayISO();
  const shortDate = iso => { const d = D.fromISO(iso); return D.MON_SHORT[d.getMonth()] + ' ' + d.getDate(); };
  // "waiting on Axl: EID copy", "waiting for [[Axl]] EID copy", "wf Axl - quote" → { who, rest }
  const WAIT_RE = /^\s*(?:waiting\s+(?:on|for)|wf)\s+(?:\[\[([^\[\]]+)\]\]|([^\s:,\-–]+))\s*[:,\-–]?\s*/i;
  function parseWaiting(text) { const m = (text || '').match(WAIT_RE); if (!m) return null; const who = (m[1] || m[2]).trim(); const rest = text.slice(m[0].length).trim(); return { who, rest: rest || 'Reply from ' + who }; }
  function setWaiting(t, who, days) {
    who = (who || '').replace(/^\[\[|\]\]$/g, '').trim(); if (!who) return;
    days = days || (t.waiting && t.waiting.every) || 3;
    const T = todayISO(), keepSince = t.waiting && t.waiting.who.toLowerCase() === who.toLowerCase();
    t.waiting = { who, since: keepSince ? t.waiting.since : T, every: days, nudge: D.toISO(D.addDays(D.fromISO(T), days)), count: keepSince ? (t.waiting.count || 0) : 0 };
    t.reminder = t.waiting.nudge + AM; t.remindedFor = null;
  }
  function followedUp(t) {
    if (!isWaiting(t)) return;
    t.waiting.count = (t.waiting.count || 0) + 1; t.waiting.last = todayISO();
    t.waiting.nudge = D.toISO(D.addDays(new Date(), t.waiting.every || 3));
    t.reminder = t.waiting.nudge + AM; t.remindedFor = null;
  }
  function stopWaiting(t) { if (!t.waiting) return; if (nudgeRem(t)) { t.reminder = null; t.remindedFor = null; } delete t.waiting; }
  function waitChip(t) {
    if (!isWaiting(t)) return '';
    const w = t.waiting, days = D.diffDays(D.fromISO(todayISO()), D.fromISO(w.since));
    return '<span class="waitchip' + (nudgeDue(t) ? ' due' : '') + '">' + I.clock + (nudgeDue(t) ? 'Follow up with ' : 'Waiting on ') + '<b class="jlink" data-jlink="' + esc(w.who) + '">' + esc(w.who) + '</b>' + (days > 0 ? ' · ' + days + ' day' + (days === 1 ? '' : 's') : ' · since today') + (w.count ? ' · nudged ' + w.count + '×' : '') + '</span>';
  }
  function waitingField(t) {
    const names = linkNames().slice(0, 40);
    if (!isWaiting(t)) {
      if (ui.waitForm !== t.id) return '<button type="button" class="toggle-row" data-wait="open">' + I.clock + 'Waiting on someone…</button>';
      return '<div class="field waitform"><label for="wWho">Waiting on</label><div class="row2"><input class="ctl" id="wWho" list="wNames" placeholder="Who? e.g. Axl" autocomplete="off"><select class="ctl" id="wDays" aria-label="Remind me to follow up after">' + WAIT_DAYS.map(([d, n]) => '<option value="' + d + '"' + (d === 3 ? ' selected' : '') + '>Follow up in ' + n + '</option>').join('') + '</select></div><datalist id="wNames">' + names.map(x => '<option value="' + esc(x) + '">').join('') + '</datalist>' +
        '<div class="row-btns"><button type="button" class="chipbtn solid" data-wait="set">Start waiting</button><button type="button" class="chipbtn" data-wait="cancel">Cancel</button></div></div>';
    }
    const w = t.waiting;
    return '<div class="field waitbox' + (nudgeDue(t) ? ' due' : '') + '"><span class="field-label">' + I.clock + 'Waiting on <button type="button" class="jlink" data-jlink="' + esc(w.who) + '">' + esc(w.who) + '</button> since ' + esc(shortDate(w.since)) + '</span>' +
      '<div class="hint">' + (nudgeDue(t) ? 'Time to follow up.' : 'Next nudge ' + esc(D.dueLabel(w.nudge)) + '.') + (w.count ? ' Followed up ' + w.count + ' time' + (w.count === 1 ? '' : 's') + (w.last ? ', last ' + esc(shortDate(w.last)) : '') + '.' : '') + '</div>' +
      '<div class="row-btns"><button type="button" class="chipbtn' + (nudgeDue(t) ? ' solid' : '') + '" data-wait="nudged">Followed up</button><select class="ctl" id="wEvery" aria-label="Nudge every">' + WAIT_DAYS.map(([d, n]) => '<option value="' + d + '"' + (w.every === d ? ' selected' : '') + '>Nudge every ' + n + '</option>').join('') + '</select><button type="button" class="chipbtn" data-wait="stop">Stop waiting</button></div></div>';
  }
  function bindWaiting() {
    const det = $('#detail');
    det.addEventListener('click', e => {
      const b = e.target.closest('[data-wait]'); if (!b) return;
      const t = ui.selected && taskById(ui.selected); if (!t) return;
      const a = b.dataset.wait;
      if (a === 'open') { ui.waitForm = t.id; renderDetail(); setTimeout(() => $('#wWho') && $('#wWho').focus(), 20); return; }
      if (a === 'cancel') { ui.waitForm = null; renderDetail(); return; }
      if (a === 'set') { const who = $('#wWho').value.trim(); if (!who) { $('#wWho').focus(); return; } snapshot(); setWaiting(t, who, Number($('#wDays').value)); ui.waitForm = null; save(); render(); toast('Waiting on ' + who + '. Tally will nudge you ' + D.dueLabel(t.waiting.nudge) + '.', true); return; }
      if (a === 'nudged') { snapshot(); followedUp(t); save(); render(); toast('Nice. Next nudge ' + D.dueLabel(t.waiting.nudge) + '.', true); return; }
      if (a === 'stop') { snapshot(); stopWaiting(t); save(); render(); toast('No longer waiting', true); }
    });
    det.addEventListener('change', e => { if (e.target.id !== 'wEvery') return; const t = taskById(ui.selected); if (!isWaiting(t)) return; t.waiting.every = Number(e.target.value); t.waiting.nudge = D.toISO(D.addDays(D.fromISO(t.waiting.last || t.waiting.since), t.waiting.every)); if (t.waiting.nudge < todayISO()) t.waiting.nudge = todayISO(); t.reminder = t.waiting.nudge + AM; t.remindedFor = null; save(); render(); });
    det.addEventListener('keydown', e => { if (e.target.id === 'wWho' && e.key === 'Enter') { e.preventDefault(); det.querySelector('[data-wait="set"]').click(); } });
  }


  /* ====================== Pages & swiping (per device): opening page, swipe order ====================== */
  const PAGE_DEFS = [['myday', 'My Day'], ['calendar', 'Calendar'], ['journal', 'Journal'], ['all', 'All tasks'], ['notes', 'Notes'], ['docs', 'Important Documents']];
  const PAGE_NAME = Object.fromEntries(PAGE_DEFS);
  function swipeOrder() {
    const def = PAGE_DEFS.map(p => p[0]), s = S.settings.swipe || {};
    const order = (s.order || []).filter(v => def.includes(v)); def.forEach(v => { if (!order.includes(v)) order.push(v); });
    const off = new Set(s.off || []);
    return { order, off, list: order.filter(v => !off.has(v)) };
  }
  const startView = () => PAGE_NAME[S.settings.startView] ? S.settings.startView : 'calendar';
  function pagesSheetHtml() {
    const { order, off, list } = swipeOrder(), st = startView(), i = list.indexOf(st);
    const left = i > 0 ? list[i - 1] : null, right = i >= 0 && i < list.length - 1 ? list[i + 1] : null;
    return '<div class="sheet narrow" role="dialog" aria-modal="true" aria-labelledby="pgTitle"><div class="sheet-head"><h2 id="pgTitle">Pages & swiping</h2><button type="button" class="iconbtn" data-close="1" aria-label="Close">' + I.x + '</button></div><div class="sheet-body">' +
      '<div class="field"><label for="pgStart">Tally opens on</label><select class="ctl" id="pgStart">' + PAGE_DEFS.map(([v, n]) => '<option value="' + v + '"' + (v === st ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></div>' +
      '<div class="field"><span class="field-label">Swipe order</span><p class="hint" style="margin:0 0 6px">Swipe left for the next page, right for the one before. Untick a page to skip it when swiping.</p><div class="pglist">' +
      order.map((v, k) => '<div class="pgrow' + (off.has(v) ? ' off' : '') + (v === st ? ' start' : '') + '"><label class="chk"><input type="checkbox" data-pgon="' + v + '"' + (off.has(v) ? '' : ' checked') + '> ' + PAGE_NAME[v] + (v === st ? ' <span class="pgtag">Opens here</span>' : '') + '</label><span class="spacer"></span>' +
        '<button type="button" class="iconbtn" data-pgmove="' + v + ':-1"' + (k === 0 ? ' disabled' : '') + ' aria-label="Move ' + PAGE_NAME[v] + ' up">' + I.chev + '</button><button type="button" class="iconbtn down" data-pgmove="' + v + ':1"' + (k === order.length - 1 ? ' disabled' : '') + ' aria-label="Move ' + PAGE_NAME[v] + ' down">' + I.chev + '</button></div>').join('') + '</div></div>' +
      '<div class="pgpreview">' + (i < 0 ? 'Your opening page is skipped when swiping, so swiping starts from whichever included page you are on.'
        : 'From <b>' + PAGE_NAME[st] + '</b>: swipe right → <b>' + (left ? PAGE_NAME[left] : 'nothing') + '</b>, swipe left → <b>' + (right ? PAGE_NAME[right] : 'nothing') + '</b>.') + '</div>' +
      '<p class="hint">These settings are just for this device, so your phone and computer can differ.</p><button type="button" class="linkbtn" data-pgreset="1">Back to the standard order</button></div></div>';
  }
  function openPages() { const el = $('#sheet'); el.innerHTML = pagesSheetHtml(); el.hidden = false; }
  function bindPages() {
    const el = $('#sheet');
    const redraw = () => { save(); el.innerHTML = pagesSheetHtml(); };
    el.addEventListener('click', e => {
      const mv = e.target.closest('[data-pgmove]');
      if (mv) { const [v, d] = mv.dataset.pgmove.split(':'); const { order, off } = swipeOrder(); const i = order.indexOf(v), j = i + Number(d); if (j < 0 || j >= order.length) return; [order[i], order[j]] = [order[j], order[i]]; S.settings.swipe = { order, off: [...off] }; redraw(); return; }
      if (e.target.closest('[data-pgreset]')) { delete S.settings.swipe; S.settings.startView = 'calendar'; redraw(); }
    });
    el.addEventListener('change', e => {
      if (e.target.dataset.pgon) { const { order, off } = swipeOrder(); e.target.checked ? off.delete(e.target.dataset.pgon) : off.add(e.target.dataset.pgon); S.settings.swipe = { order, off: [...off] }; redraw(); }
      if (e.target.id === 'pgStart') { S.settings.startView = e.target.value; redraw(); }
    });
    $('#menu').addEventListener('click', e => { if (e.target.closest('[data-mact="pages"]')) { e.stopPropagation(); ui.menu = null; renderMenu(); openPages(); } }, true);
  }

  // Typing a year into a date box: Chrome reports each digit as a whole date ("2" = year 0002), and saving that
  // redraws the panel and throws away the rest of the year. Ignore dates before 1900 until the year is complete.
  ['change', 'input'].forEach(type => document.addEventListener(type, e => {
    const el = e.target;
    if (el && el.type === 'date' && el.value && Number(el.value.slice(0, 4)) < 1900) e.stopImmediatePropagation();
  }, true));

  /* ---------- boot ---------- */
  loadSyncMeta(); S = load(); persistLocal(); applyTheme(); applyTypeColors();
  ui.view = startView(); // Settings → Pages & swiping
  bind(); if (isPhone()) $('#qa').placeholder = 'Add a task'; updatePreview(); render();
  const runReminders = () => loadPushed().then(checkReminders, checkReminders);
  runReminders(); setInterval(runReminders, 15000);
  refreshNews(); setInterval(() => { refreshNews(); if ($('#newsBox')) drawNews(); }, 5 * 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshNews(); });
  bindSide();
  if (PHONE_MQ && PHONE_MQ.addEventListener) PHONE_MQ.addEventListener('change', () => refreshNews());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) runReminders(); });
  // Opened from a notification: show that task
  const openTask = id => { if (!id || !taskById(id)) return; ui.dayPanel = null; ui.awayPanel = false; ui.selected = id; ui.confirmDelete = false; document.querySelector('.app').classList.remove('nav-open'); render(); };
  try { const q = new URLSearchParams(location.search).get('open'); if (q) { history.replaceState(null, '', location.pathname); openTask(q); setTimeout(() => openTask(q), 2500); } } catch (e) { }
  if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.tallyOpen) openTask(e.data.tallyOpen); });
  rollEvents(); purgeTrash(); refreshHolidays(); setInterval(() => { rollEvents(); purgeTrash(); updateBadge(); refreshHolidays(); uploadPending(); gcFiles(); runOcr(); autoExpiryScan(); }, 3600000);
  bindNotes(); bindJournal(); setupCalFit(); bindNoteLists(); bindWaiting(); bindPages(); setTimeout(gcFiles, 60000); setTimeout(runOcr, 20000); setTimeout(() => {
    let ch = 0;
    const gone = S.tasks.filter(t => (t.renewFor && !t.expFor && !t.done) || (isNote(t) && !(t.attachments || []).length && !(isMeet(t) && mName(t)) && parseOutline(t.notes).every(l => !l.text.trim()))); // separate "Renew …" tasks; journal entries left completely blank
    if (gone.length) { S.tasks = S.tasks.filter(t => !gone.includes(t)); ch++; }
    S.tasks.forEach(t => { if (isMeet(t) && !t.time) { const was = t.meet; splitMeetTime(t); if (t.meet !== was) ch++; } });
    S.tasks.forEach(t => { if ((t.expFor || t.waiting) && t.reminder && /T09:00$/.test(t.reminder) && t.remindedFor !== t.reminder) { t.reminder = t.reminder.slice(0, 10) + AM; ch++; } });
    S.tasks.forEach(t => {
      if (t.expFor && t.notes && /^Expiry date of /.test(t.notes)) { t.notes = ''; ch++; }
      if (isPaper(t) && (t.renew || t.reminder)) { if (t.renew && t.lead === undefined) t.lead = t.renew.days; delete t.renew; delete t.reminder; delete t.remindedFor; if (t.expires) placeExpTask(t); ch++; }
      if (isPaper(t) && t.expires && expTask(t) && expTask(t).lead === undefined) { placeExpTask(t); ch++; }
    });
    if (ch) { save(); render(); }
    autoExpiryScan(); expiredNotice(); }, 4000); setTimeout(weeklyBackup, 90000); setInterval(weeklyBackup, 3600000);
  if (/[?&]share=1/.test(location.search)) { history.replaceState(null, '', location.pathname); takeShared(); }
  startSync();
})();
