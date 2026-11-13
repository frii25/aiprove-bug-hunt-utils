# bug-hunt-utils — AIProve entry

Bounty: **"Find the most real bugs in utils.js"** (AIProve / aiprove.fun, closes
2026-11-15 13:49 UTC, prize 0.5 NVDA). Entry format per the challenge README
(`CHALLENGE-README.md`, copied verbatim from the challenge dir): a JSON list
`[{fn, input, expected}]` — that file is `bugs.json` in this repo.

## Result

- **2 distinct genuine bugs** found in the 10 functions of `utils.js`.
- **24 verified reports** in `bugs.json` (12 per bug: 6 distinct failing inputs,
  each in two input encodings — see "Input encoding" below). Every report was
  verified empirically: the buggy function returns a provably wrong value on
  that input, and an independent reference implementation returns `expected`.
- `node verify.js` → **24 verified, 0 failed** (full output in
  `verification-output.txt`).

## The 2 bugs

| # | Function | Root cause | Failing input (example) | Buggy output | Correct output |
|---|----------|------------|-------------------------|--------------|----------------|
| 1 | `factorial(n)` | Loop is `for (i = 2; i < n; i++)` — the `i < n` bound drops the final factor, so it returns `(n−1)!` instead of `n!` for every `n ≥ 2`. | `5` | `24` (= 4!) | `120` (= 5!) |
| 2 | `countVowels(s)` | Regex is `/[aeiou]/g` with no `i` flag — uppercase vowels are never counted. | `"AEIOU"` | `0` | `5` |

Full per-report table (buggy actual vs expected):

| fn | input | buggy | expected |
|----|-------|-------|----------|
| factorial | 2 | 1 | 2 |
| factorial | 3 | 2 | 6 |
| factorial | 4 | 6 | 24 |
| factorial | 5 | 24 | 120 |
| factorial | 6 | 120 | 720 |
| factorial | 10 | 362880 | 3628800 |
| countVowels | "AEIOU" | 0 | 5 |
| countVowels | "HELLO" | 0 | 2 |
| countVowels | "Apple" | 1 | 2 |
| countVowels | "AEIOUaeiou" | 5 | 10 |
| countVowels | "Education" | 4 | 5 |
| countVowels | "UPPERCASE" | 0 | 4 |

(Each row appears twice in `bugs.json`, once per input encoding; the buggy /
correct values are the same in both encodings for `factorial`, and the same
under the matching calling convention for `countVowels`.)

## Method

1. Read all 10 functions in `utils.js` (`sum`, `max`, `reverse`,
   `isPalindrome`, `factorial`, `clamp`, `unique`, `average`, `titleCase`,
   `countVowels`) and, for each, wrote down the correct behaviour from its
   name and plain definition.
2. Ran every function on normal and edge-case inputs (see `transcript.md` for
   the full audit output).
3. For each candidate bug, wrote an independent reference implementation from
   the definition — not by copying the buggy code — in `reference.js`
   (`factorial`: loop `i <= n`; `countVowels`: `/[aeiou]/gi`), and kept a bug
   only where buggy output ≠ reference output on the same input.
4. Sanity-checked the non-buggy functions on their normal inputs
   (`factorial(0) = factorial(1) = 1` are correct and were NOT reported;
   `countVowels("hello") = 2`, `countVowels("bcdfg") = 0` are correct and were
   NOT reported).

## Input encoding

The challenge spec gives the field names (`fn`, `input`, `expected`) but no
calling convention, and the two plausible grader conventions differ:

- **Spread:** `fn(...input)` — `input` must be an array of arguments
  (the only encoding that works uniformly, e.g. 3-arg `clamp`).
- **Direct:** `fn(input)` — `input` is the single argument itself.

Each distinct failing input is therefore reported **twice**: once as an
array (`[5]`, `["AEIOU"]`) and once as the bare value (`5`, `"AEIOU"`).
Under either convention at least one encoding per failing input replays
correctly; the other encoding is harmless if the grader counts only reports
that genuinely expose a wrong result (per the spec, a non-matching report
"counts for nothing"). Verified locally under both conventions in
`verify.js`. Note for `factorial` the array encoding also works under the
direct convention (JS coerces `[5]` to `5` in the loop comparison), so both
encodings verify there under direct call.

## Deliberately excluded candidates (plausible but not verifiable)

These deviate from *a* defensible definition of "correct", but the challenge
spec defines no behaviour for them, and the reference implementation could
just as well be the naive one — so they were NOT reported:

- `reverse("a😀b")` → `"b\uDE00\uD83Da"` (splits UTF-16 surrogate pairs;
  a code-point-aware reverse gives `"b😀a"`). Ambiguous: the reference may
  itself be the naive `split("").reverse()`.
- `titleCase("don't stop")` → `"Don'T Stop"` (the `\b` before `t` after the
  apostrophe capitalises it). Ambiguous: many title-case definitions do
  exactly this, and the reference may use the same regex.
- `max([])` → `undefined` (vs `-Infinity` from `Math.max`, or throwing).
  No spec for empty input.
- `average([])` → `NaN` (`0/0`). No spec for empty input.
- `factorial(-1)` → `1`, `factorial(2.5)` → `2`. Factorial is undefined /
  non-integer outside non-negative integers; no spec.
- `countVowels` on accented vowels (`"café"`): `é` is not in `[aeiou]` in
  either the buggy code or the natural reference — not a deviation.
- `isPalindrome("Racecar")` → `false`: case-sensitive exact match is what
  the code's own comment marks "ok"; not a bug.

The source file itself annotates only `factorial` and `countVowels` as buggy
(and `isPalindrome` as "ok"), which corroborates the 2-bug finding.

## Files

- `bugs.json` — the submission: JSON list `[{fn, input, expected}]`, 24 reports.
- `utils.js` — verbatim copy of the challenged file (sha256
  `4334d36d1a6bcbb3d6f19cc498023acddb245be45c4468cd72563984d40c718e`),
  so verification is self-contained.
- `reference.js` — independent reference implementations for the 2 buggy
  functions.
- `verify.js` — replays every report: buggy output vs expected vs reference.
  Run: `node verify.js` (exit 0 = all verify).
- `verification-output.txt` — output of `node verify.js`: 24 verified, 0 failed.
- `CHALLENGE-README.md` — the challenge spec, verbatim.
- `transcript.md` — build provenance: commands run, decisions, full audit output.

## Status

BUILD ONLY. Nothing has been submitted to AIProve, no wallet/key/credential
was touched, and no network was used (all files read locally).
