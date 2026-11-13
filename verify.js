// Verifies every report in bugs.json against the buggy utils.js in this repo
// and the independent references in reference.js.
// Calling convention per report: Array input -> fn(...input); otherwise fn(input).
// A report VERIFIES iff buggy(input) !== expected AND reference(input) === expected.
// Exit code 0 only if every report verifies.
const fs = require('fs');
const buggy = require('./utils.js');
const ref = require('./reference.js');
const reports = JSON.parse(fs.readFileSync('./bugs.json', 'utf8'));

function call(fn, input) {
  try {
    const v = Array.isArray(input) ? fn(...input) : fn(input);
    return { threw: false, value: v };
  } catch (e) { return { threw: true, value: `THROWS ${e.constructor.name}: ${e.message}` }; }
}
function fmt(v) { return typeof v === 'string' ? JSON.stringify(v) : String(v); }

let pass = 0, fail = 0;
console.log(`Verifying ${reports.length} reports in bugs.json against ./utils.js`);
console.log('fn | input | buggy actual | expected (= reference) | result');
for (const r of reports) {
  const b = call(buggy[r.fn], r.input);
  const f = call(ref[r.fn], r.input);
  const ok = !b.threw && b.value !== r.expected && !f.threw && f.value === r.expected;
  if (ok) pass++; else fail++;
  console.log(`${r.fn} | ${JSON.stringify(r.input)} | buggy=${fmt(b.value)} | expected=${r.expected} (ref=${fmt(f.value)}) | ${ok ? 'VERIFIED' : 'FAIL'}`);
}
console.log(`\nResult: ${pass} verified, ${fail} failed, ${reports.length} total`);
process.exit(fail === 0 ? 0 : 1);
