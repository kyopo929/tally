/* Spending: reading bank texts and sorting expenses into categories. Pure functions, no DOM.
   Shown where /config.js lists features: ['spending'] (api/_cfg.js: the original site by default). */
(function (root) {
  const CATS = ['Groceries', 'Dining', 'Transport', 'Fuel', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Travel', 'Family', 'Transfers', 'Bank fees', 'Cash', 'Other'];
  // First match wins; words are matched anywhere in the shop name or description (lower case)
  const RULES = [
    ['Bank fees', /\bfee\b|\bfees\b|\bcharges?\b|\bvat on\b|commission/],
    ['Cash', /\batm\b|cash withdrawal|withdrawal/],
    ['Transfers', /beneficiar|transfer|\btt\b|remittance|\bdtb\b|western union|exchange house|al ansari|lulu exchange/],
    ['Fuel', /\benoc\b|\beppco\b|adnoc|emarat|petrol|fuel|service station/],
    ['Groceries', /carrefour|lulu|spinneys|waitrose|choithram|union coop|co-?op|grandiose|kibsons|viva\b|nesto|west zone|al maya|supermarket|hypermarket|grocery|baqala|instashop|el grocer/],
    ['Dining', /talabat|deliveroo|careem food|noon food|zomato|restaurant|cafe|café|coffee|starbucks|costa|tim hortons|mcdonald|kfc|burger|pizza|shawarma|bakery|grill|kitchen|eatery|dining|sushi|bistro/],
    ['Transport', /careem|uber|\brta\b|salik|\bnol\b|taxi|parking|mawaqif|darb|metro/],
    ['Bills', /\bdu\b|etisalat|\be&|dewa|sewa|fewa|addc|empower|tabreed|internet|mobile bill|telecom|insurance|\brent\b|ejari/],
    ['Health', /pharmacy|aster|life pharmacy|boots|clinic|hospital|medical|dental|mediclinic|nmc|health|optic/],
    ['Travel', /emirates airlines|emirates\.com|flydubai|etihad|air arabia|airline|airways|hotel|booking\.com|agoda|airbnb|expedia|marriott|hilton|travel/],
    ['Entertainment', /steam|netflix|spotify|playstation|xbox|nintendo|apple\.com|itunes|google play|youtube|disney|osn|shahid|anghami|\bvox\b|reel cinemas|novo|cinema|game|ticket/],
    ['Shopping', /amazon|noon\b|noon\.com|ikea|namshi|shein|centrepoint|max fashion|h&m|zara|decathlon|ace hardware|sharaf|jumbo|virgin megastore|mall|store|shop|trading/]
  ];
  function categorize(s) {
    const t = ' ' + String(s || '').toLowerCase() + ' ';
    for (const [cat, re] of RULES) if (re.test(t)) return cat;
    return 'Other';
  }
  const num = s => Number(String(s).replace(/,/g, ''));
  const tidyCase = s => /[a-z]/.test(s) ? s : s.toLowerCase().replace(/(^|[\s\-&/(])([a-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/\.(com|ae|net|org)\b/gi, m => m.toLowerCase());
  // "STEAMGAMES.COM 4259522, 912-1844160" → "Steamgames.com"; "DTB 1115261126453483 TO VARIOUS BENEFICIARIES AED" → "To Various Beneficiaries"
  function cleanName(s) {
    let t = String(s || '').replace(/\s+/g, ' ').trim();
    t = t.replace(/\b(?:DTB|POS|ECOM|IPI|IBFT)\b/g, ' ');
    t = t.replace(/\b[A-Z]{3}\s+[\d,]+\.\d{2}\b/g, ' ');            // "AED 15.00" repeated inside
    t = t.replace(/\b[A-Z]{3}\s*$/, ' ');                             // a trailing currency code
    t = t.split(',')[0];                                             // ", 912-1844160" and similar references
    t = t.replace(/(?:^|\s)[\d\-\/#*]{4,}(?=\s|$)/g, ' ');           // long reference numbers
    t = t.replace(/\s+/g, ' ').trim();
    return tidyCase(t) || 'Bank payment';
  }
  const last = s => { const d = String(s).replace(/[^0-9X]/gi, ''); return d.slice(-5); };

  /* One bank text → { kind: 'out'|'in', amount, cur, name, cat, acct, acctLabel } or null when it isn't a transaction.
     acct is how the bank names the account or card ("acct:101XXX04XXX01", "card:8938"): you say once whether it's personal or work. */
  function parseBank(text) {
    const s = String(text || '').replace(/\s+/g, ' ').trim();
    if (!s) return null;
    if (/declined|unsuccessful|failed|not been processed|otp|one[- ]time/i.test(s)) return null;
    let m;
    // Purchase of AED 300.04 with Debit Card ending 8938 at STEAMGAMES.COM 4259522, 912-1844160. Avl Balance is AED …
    if ((m = /\b(Purchase|Payment|Transaction|Cash withdrawal|Withdrawal|Refund)\b(?: of)? ([A-Z]{3}) ?([\d,]+(?:\.\d+)?) (?:with|using|on|from|to) (?:your )?(Debit|Credit|Prepaid)? ?Card (?:ending|no\.?|number)? ?(?:with )?[X*]*(\d{4})(?: at (.+?)(?=\.\s*(?:Avl|Available|Pls|Please|Your|Current|Bal)|\.?\s*$))?/i.exec(s))) {
      const what = m[1].toLowerCase(), kind = what === 'refund' ? 'in' : 'out';
      const atm = /withdrawal/.test(what);
      const name = atm ? 'Cash withdrawal' : cleanName(m[6] || '');
      return { kind, amount: num(m[3]), cur: m[2].toUpperCase(), name, cat: atm ? 'Cash' : categorize(name), acct: 'card:' + m[5], acctLabel: (m[4] ? tidyCase(m[4].toUpperCase()) + ' card' : 'Card') + ' …' + m[5] };
    }
    // AED 72,885.58 has been debited from your account no. 101XXX04XXX01 DTB 1115… TO VARIOUS BENEFICIARIES AED. The available balance is …
    if ((m = /([A-Z]{3}) ?([\d,]+(?:\.\d+)?) (?:has been|was|is) (debited|credited|deposited|transferred) (?:from|to|into|in) your (?:account|a\/c|acct)(?: no\.?| number)? ?([0-9X*]{4,})\s*(.*?)(?:\.\s*(?:The )?(?:available|avl|current)? ?balance|\.\s*Avl|$)/i.exec(s))) {
      const kind = /debited|transferred/i.test(m[3]) && !/to your/i.test(m[0]) ? 'out' : 'in';
      const desc = m[5] || '', name = desc ? cleanName(desc) : kind === 'in' ? 'Money in' : 'Bank payment';
      const cat = kind === 'in' ? 'Other' : categorize(desc + ' ' + name);
      return { kind, amount: num(m[2]), cur: m[1].toUpperCase(), name: cat === 'Bank fees' ? 'Bank fee' : name, cat, acct: 'acct:' + m[4].toUpperCase(), acctLabel: 'Account …' + last(m[4]) };
    }
    return null;
  }

  /* The add box on the Spending page: "45 lunch", "lunch 45 cash", "120.5 carrefour card", "+500 salary" (money in) */
  function parseQuick(v) {
    let s = String(v || '').trim(); if (!s) return null;
    let kind = 'out';
    if (/^\+/.test(s)) { kind = 'in'; s = s.slice(1).trim(); }
    let cur = 'AED';
    const cm = /\b(aed|usd|eur|gbp|krw|inr|sar)\b/i.exec(s); if (cm) { cur = cm[1].toUpperCase(); s = (s.slice(0, cm.index) + s.slice(cm.index + cm[0].length)).trim(); }
    const am = /(?:^|\s)(\d[\d,]*(?:\.\d{1,2})?)(?=\s|$)/.exec(s); if (!am) return null;
    const amount = num(am[1]); if (!(amount > 0)) return null;
    s = (s.slice(0, am.index) + ' ' + s.slice(am.index + am[0].length)).replace(/\s+/g, ' ').trim();
    let via = 'Cash';
    const vm = /\b(cash|card|transfer)\b/i.exec(s); if (vm) { via = vm[1].toLowerCase() === 'cash' ? 'Cash' : vm[1].toLowerCase() === 'card' ? 'Card' : 'Bank transfer'; s = (s.slice(0, vm.index) + s.slice(vm.index + vm[0].length)).replace(/\s+/g, ' ').trim(); }
    const name = s ? s.charAt(0).toUpperCase() + s.slice(1) : (kind === 'in' ? 'Money in' : 'Expense');
    return { kind, amount, cur, name, via, cat: kind === 'in' ? 'Other' : categorize(name) };
  }

  const api = { CATS, categorize, parseBank, parseQuick, cleanName };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TallySpend = api;
})(typeof window !== 'undefined' ? window : globalThis);
