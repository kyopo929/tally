// Texts & WhatsApp → Tally: reading what the phone sent and deciding what to do with it.
// Kept apart from api/msg.js so tests/msg.test.js can check it without a server.
'use strict';

const KEYS = ['src', 'from', 'name', 'text'];
// MacroDroid leaves a magic-text name as is when it has nothing for it ("{sms_name}")
const blankMagic = v => (/^\s*[{\[][a-z_=]+[}\]]\s*$/i.test(v) ? '' : v);

// The phone's request, however it arrived: proper JSON, JSON broken by quotes or line breaks inside the
// message (MacroDroid pastes the text in as is), a form, or the address's ?query.
function readMessage(raw, query) {
  let o = null;
  if (raw && typeof raw === 'object' && !Buffer.isBuffer(raw)) o = raw;
  else {
    const s = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw || '');
    try { o = JSON.parse(s); } catch (e) { o = null; }
    if (!o && /"text"\s*:/.test(s)) {
      // Broken JSON: short fields by pattern, the text is everything between "text":" and the last quote
      o = {};
      for (const k of ['src', 'from', 'name']) { const m = new RegExp('"' + k + '"\\s*:\\s*"([^"\\n]*)"').exec(s); if (m) o[k] = m[1]; }
      const m = /"text"\s*:\s*"([\s\S]*)"\s*\}?\s*$/.exec(s);
      if (m) o.text = m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
    if (!o && /(^|&)text=/.test(s)) { o = {}; new URLSearchParams(s).forEach((v, k) => { o[k] = v; }); }
  }
  o = o || {};
  const out = {};
  for (const k of KEYS) out[k] = blankMagic(String((o[k] != null ? o[k] : query && query.get(k)) || '')).trim();
  return out;
}

// One-time codes and passwords never get filed anywhere
const CODEWORD = /\b(otp|one[\s-]?time|verification|verify|passcode|pass code|password|pwd|pin|security code|auth(?:entication|orization)? code|log[\s-]?in|sign[\s-]?in|confirmation code|access code|code)\b|رمز|كلمة (?:المرور|السر)|인증|비밀번호/i;
function isCode(text) {
  const t = String(text || '');
  return CODEWORD.test(t) && /(^|\D)\d{4,8}(\D|$)/.test(t.replace(/(\d)[\s-](?=\d)/g, '$1'));
}

// WhatsApp notifications that aren't a message from someone
const WA_SKIP = /^(\d+ new messages?|\d+ messages? from \d+ chats?|checking for new messages|whatsapp web is (currently )?active|incoming (voice|video) call|ongoing (voice|video) call|calling…?|ringing…?|backup in progress.*|you have new messages|waiting for this message.*)$/i;

// What to file: { skip: reason } or { src, from, name, text, person }
function classify(m) {
  const src = /wa|whatsapp/i.test(m.src) ? 'wa' : 'sms';
  let from = m.from, name = m.name, text = m.text;
  if (!text) return { skip: 'empty' };
  if (isCode(text)) return { skip: 'code' };
  if (src === 'wa') {
    from = from || name; // WhatsApp only gives the notification title (a name, or a group with the sender)
    from = from.replace(/\s*\(\d+ (new )?messages?\)\s*$/i, '').trim();
    if (!from || /^whatsapp( business)?$/i.test(from) || WA_SKIP.test(text.trim())) return { skip: 'summary' };
    if (/^missed (voice|video) call$/i.test(text.trim())) text = 'Missed ' + (/video/i.test(text) ? 'video call' : 'call');
    return { src, from, name: from, text, person: true };
  }
  // SMS: a real phone number is a person; names (ENBD, du, AD-Careem) and short codes are businesses
  const digits = from.replace(/\D/g, '');
  const person = !!from && !/[a-z]/i.test(from) && digits.length >= 8;
  if (name && name.replace(/\D/g, '') === digits && /^[\d\s+()-]+$/.test(name)) name = ''; // "name" was just the number again
  return { src, from, name: name || from, text, person };
}

module.exports = { readMessage, classify, isCode };
