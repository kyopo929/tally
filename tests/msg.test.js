// node tests/msg.test.js — checks how texts and WhatsApp messages from the phone are read and sorted.
'use strict';
const assert = require('assert');
const { readMessage, classify, isCode } = require('../api/_msg');

let n = 0;
const ok = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL: ' + name); throw e; } };
const q = new URLSearchParams('');

ok('proper JSON', () => {
  const m = readMessage('{"src":"sms","from":"+971 50 123 4567","name":"Ravi","text":"Can you send the contract?"}', q);
  assert.deepStrictEqual(m, { src: 'sms', from: '+971 50 123 4567', name: 'Ravi', text: 'Can you send the contract?' });
});
ok('JSON broken by quotes and line breaks in the message', () => {
  const m = readMessage('{"src":"sms","from":"+971501234567","name":"Ravi","text":"He said "ok"\nsee you at 5"}', q);
  assert.strictEqual(m.text, 'He said "ok"\nsee you at 5');
  assert.strictEqual(m.name, 'Ravi');
});
ok('already parsed object and Buffer', () => {
  assert.strictEqual(readMessage({ src: 'wa', from: 'Mom', text: 'Hi' }, q).from, 'Mom');
  assert.strictEqual(readMessage(Buffer.from('{"text":"x","from":"1"}'), q).text, 'x');
});
ok('form body and ?query', () => {
  assert.strictEqual(readMessage('src=sms&from=%2B97150&text=hello+there', q).text, 'hello there');
  assert.strictEqual(readMessage('', new URLSearchParams('from=Ravi&text=hey&src=wa')).src, 'wa');
});
ok('unfilled magic text counts as empty', () => {
  assert.strictEqual(readMessage('{"from":"+97150","name":"{sms_name}","text":"hi"}', q).name, '');
});

ok('one-time codes are never filed', () => {
  assert.ok(isCode('Your OTP is 482913. Do not share it.'));
  assert.ok(isCode('482 913 is your verification code'));
  assert.ok(isCode('Use code 4829 to sign in to Careem'));
  assert.ok(isCode('رمز التحقق الخاص بك هو 5521'));
  assert.ok(isCode('[카카오] 인증번호 [123456]'));
  assert.strictEqual(classify({ src: 'sms', from: 'ENBD', name: '', text: 'OTP 123456 for AED 50.00' }).skip, 'code');
});
ok('ordinary messages are not codes', () => {
  assert.ok(!isCode('Can you call me on 0501234567?'));
  assert.ok(!isCode('Meeting moved to 3pm'));
  assert.ok(!isCode('Room 1204, see you there'));
});

ok('SMS from a phone number is a person; names and short codes are businesses', () => {
  const p = classify({ src: 'sms', from: '+971501234567', name: 'Ravi', text: 'Call me' });
  assert.strictEqual(p.person, true); assert.strictEqual(p.name, 'Ravi');
  assert.strictEqual(classify({ src: 'sms', from: 'ENBD', name: '', text: 'Purchase AED 50' }).person, false);
  assert.strictEqual(classify({ src: 'sms', from: 'AD-Careem', name: '', text: 'Your ride' }).person, false);
  assert.strictEqual(classify({ src: 'sms', from: '1010', name: '', text: 'Bill ready' }).person, false);
});
ok('a person not in contacts is shown by number', () => {
  const p = classify({ src: 'sms', from: '+971501234567', name: '+971501234567', text: 'Hello' });
  assert.strictEqual(p.name, '+971501234567'); assert.strictEqual(p.person, true);
});

ok('WhatsApp: names, counts trimmed, summaries skipped', () => {
  const w = classify({ src: 'wa', from: 'Ravi (3 messages)', name: '', text: 'Are you coming?' });
  assert.strictEqual(w.from, 'Ravi'); assert.strictEqual(w.person, true); assert.strictEqual(w.src, 'wa');
  assert.strictEqual(classify({ src: 'wa', from: 'WhatsApp', name: '', text: '5 new messages' }).skip, 'summary');
  assert.strictEqual(classify({ src: 'wa', from: 'Ravi', name: '', text: '4 messages from 2 chats' }).skip, 'summary');
  assert.strictEqual(classify({ src: 'wa', from: 'Ravi', name: '', text: 'Incoming voice call' }).skip, 'summary');
  assert.strictEqual(classify({ src: 'wa', from: 'Ravi', name: '', text: 'Missed voice call' }).text, 'Missed call');
});
ok('empty messages are skipped', () => {
  assert.strictEqual(classify({ src: 'sms', from: '+97150', name: '', text: '' }).skip, 'empty');
});

console.log('msg tests passed: ' + n);
