// node tests/spend.test.js — checks reading bank texts and the Spending add box.
'use strict';
const assert = require('assert');
const { parseBank, parseQuick, categorize } = require('../src/spend.js');
let n = 0;
const ok = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL: ' + name); throw e; } };

ok('card purchase (Emirates NBD)', () => {
  const r = parseBank('Purchase of AED 300.04 with Debit Card ending 8938 at STEAMGAMES.COM 4259522, 912-1844160. Avl Balance is AED 17,480.40.  Pls refer stmt for exact amt.');
  assert.deepStrictEqual(r, { kind: 'out', amount: 300.04, cur: 'AED', name: 'Steamgames.com', cat: 'Entertainment', acct: 'card:8938', acctLabel: 'Debit card …8938' });
});
ok('account debit: transfer to beneficiaries', () => {
  const r = parseBank('AED 72,885.58 has been debited from your account no. 101XXX04XXX01 DTB 1115261126453483 TO VARIOUS BENEFICIARIES AED. The available balance is AED 145,670.37.');
  assert.strictEqual(r.kind, 'out'); assert.strictEqual(r.amount, 72885.58); assert.strictEqual(r.acct, 'acct:101XXX04XXX01');
  assert.strictEqual(r.name, 'To Various Beneficiaries'); assert.strictEqual(r.cat, 'Transfers'); assert.strictEqual(r.acctLabel, 'Account …XXX01');
});
ok('bank fee', () => {
  const r = parseBank('AED 15.00 has been debited from your account no. 101XXX04XXX01 DTB TT CORR FEE 1115271126471273 AED 15.00. The available balance is AED 70,843.38.');
  assert.strictEqual(r.amount, 15); assert.strictEqual(r.cat, 'Bank fees'); assert.strictEqual(r.name, 'Bank fee');
});
ok('money in and refunds', () => {
  const r = parseBank('AED 5,000.00 has been credited to your account no. 101XXX04XXX01 SALARY NOV. The available balance is AED 9,000.00.');
  assert.strictEqual(r.kind, 'in'); assert.strictEqual(r.amount, 5000);
  const f = parseBank('Refund of AED 49.00 with Credit Card ending 1234 at AMAZON.AE. Avl Cr. limit is AED 10,000.00');
  assert.strictEqual(f.kind, 'in'); assert.strictEqual(f.acct, 'card:1234'); assert.strictEqual(f.name, 'Amazon.ae');
});
ok('foreign currency and ATM', () => {
  const r = parseBank('Purchase of USD 12.99 with Credit Card ending 4321 at NETFLIX.COM. Avl Cr. Limit is AED 9,000.00');
  assert.strictEqual(r.cur, 'USD'); assert.strictEqual(r.cat, 'Entertainment');
  const a = parseBank('Cash withdrawal of AED 500.00 with Debit Card ending 8938 at ATM DUBAI MALL. Avl Balance is AED 1,000.00');
  assert.strictEqual(a.cat, 'Cash'); assert.strictEqual(a.name, 'Cash withdrawal');
});
ok('not a transaction', () => {
  assert.strictEqual(parseBank('Your OTP for AED 300.00 is 123456'), null);
  assert.strictEqual(parseBank('Your statement is ready'), null);
  assert.strictEqual(parseBank('Transaction of AED 50.00 with Debit Card ending 8938 was declined'), null);
});
ok('categories', () => {
  assert.strictEqual(categorize('CARREFOUR MOE'), 'Groceries');
  assert.strictEqual(categorize('TALABAT'), 'Dining');
  assert.strictEqual(categorize('ENOC 1023'), 'Fuel');
  assert.strictEqual(categorize('CAREEM RIDE'), 'Transport');
  assert.strictEqual(categorize('DEWA'), 'Bills');
  assert.strictEqual(categorize('Parent gift'), 'Other');
});
ok('add box', () => {
  assert.deepStrictEqual(parseQuick('45 lunch'), { kind: 'out', amount: 45, cur: 'AED', name: 'Lunch', via: 'Cash', cat: 'Other' });
  const c = parseQuick('carrefour 120.50 card'); assert.strictEqual(c.amount, 120.5); assert.strictEqual(c.via, 'Card'); assert.strictEqual(c.cat, 'Groceries');
  assert.strictEqual(parseQuick('+500 cash gift').kind, 'in');
  assert.strictEqual(parseQuick('usd 20 taxi').cur, 'USD');
  assert.strictEqual(parseQuick('lunch'), null);
});
console.log('spend tests passed: ' + n);
