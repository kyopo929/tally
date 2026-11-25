// Which Supabase project this copy of Tally uses.
// A copy of Tally sets SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Vercel → Settings → Environment Variables.
// The built-in values belong to the original site only, so a copy without its own settings never talks to someone else's data.
const ORIGINAL_HOST = 'tally-ntqo.vercel.app';
const ORIGINAL = { url: 'https://tvygsmhbrjsjgnnvdgns.supabase.co', key: 'sb_publishable_Ni3DpOM242PEEpRIa-Ss9w_tMCjInmR' };

// Public-holiday countries a copy offers in Settings: HOLIDAYS="ae,us" (any of ae, us, kr). Default ae,us; the original also has kr.
function holidaysFor(req) {
  if (process.env.HOLIDAYS) return process.env.HOLIDAYS.split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  return isOriginal(req) ? ['ae', 'us', 'kr'] : ['ae', 'us'];
}
function isOriginal(req) {
  const host = String((req && req.headers && (req.headers['x-forwarded-host'] || req.headers.host)) || '').toLowerCase();
  return host === ORIGINAL_HOST || process.env.VERCEL_PROJECT_PRODUCTION_URL === ORIGINAL_HOST;
}
// Accept the address however it was pasted ("…supabase.co/rest/v1/", spaces): keep just https://<project>.supabase.co
function cleanUrl(u) {
  u = String(u || '').trim();
  try { return new URL(/^https?:\/\//i.test(u) ? u : 'https://' + u).origin; } catch (e) { return u.replace(/\/+$/, ''); }
}
function supabaseFor(req) {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY) return { url: cleanUrl(process.env.SUPABASE_URL), key: process.env.SUPABASE_PUBLISHABLE_KEY.trim() };
  if (isOriginal(req)) return ORIGINAL;
  return { url: '', key: '' };
}
module.exports = { supabaseFor, holidaysFor, isOriginal };
