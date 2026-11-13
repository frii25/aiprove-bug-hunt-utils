// Independent reference implementations, written from the function names /
// plain mathematical definitions — NOT copied from utils.js.
//   factorial(n)   = n!  = 1*2*...*n  (0! = 1! = 1)
//   countVowels(s) = number of a/e/i/o/u characters, either case.
function factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
function countVowels(s) { return (s.match(/[aeiou]/gi) || []).length; }
module.exports = { factorial, countVowels };
