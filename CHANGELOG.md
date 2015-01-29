1.2.1 / 2015-01-29
=================
  * Use `is-string` and `is-callable` modules.

1.2.0 / 2015-01-28
=================
  * Remove most `Object#toString` checks, to prepare for an ES6 @@toStringTag world where they aren’t reliable.

1.1.1 / 2015-01-20
=================
  * Fix generator function detection in newer v8 / io.js
  * Update `is-arrow-function`, `is-generator-function`, `jscs`, `tape`
  * toString is a reserved word in older browsers

1.1.0 / 2014-12-15
=================
  * Add tests and support for ES6 Symbols, generators, and arrow functions
  * Consider standard functions equal if name/body/arity are all equal.
  * Update `covert`, `tape`, `jscs`
  * Add a bunch of npm scripts

1.0.0 / 2014-08-08
==================
  * Updating `tape`, `covert`
  * Make sure old and unstable nodes don't break Travis
