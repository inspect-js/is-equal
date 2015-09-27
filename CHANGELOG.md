1.2.4 / 2015-09-27
================='
  * [Fix] Boxed Symbols should be coerced to primitives before testing for equality
  * [Refactor] Use `is-boolean-object` to reliably detect Booleans
  * [Deps] update `is-arrow-function`, `is-date-object`
  * [Docs] Switch from vb.teelaun.ch to versionbadg.es for the npm version badge SVG
  * [Tests] up to `io.js` `v3.3`, `node` `v4.1`
  * [Tests] add `npm run security` and `npm run eslint`
  * [Dev Deps] update `tape`, `jscs`, `make-arrow-function`, `make-generator-function`, `semver`, `eslint`, `@ljharb/eslint-config`, `nsp`, `covert`

1.2.3 / 2015-02-06
=================
  * Update `is-callable`, `is-number-object`, `is-string`, `is-generator-function`, `tape`, `jscs`
  * Run `travis-ci` tests on `iojs` and `node` v0.12; speed up builds; allow 0.8 failures.

1.2.2 / 2015-01-29
=================
  * Update `is-arrow-function`, `is-callable`, `is-number-object`, `is-string`

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
