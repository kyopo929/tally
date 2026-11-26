// GET /config.js — tells the app which Supabase project to sync with (see api/_cfg.js).
const { supabaseFor, holidaysFor, featuresFor } = require('./_cfg');
module.exports = (req, res) => {
  const s = supabaseFor(req);
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.end('window.TALLY_CONFIG = ' + JSON.stringify({ supabaseUrl: s.url, supabaseKey: s.key, holidays: holidaysFor(req), features: featuresFor(req) }) + ';\n');
};
