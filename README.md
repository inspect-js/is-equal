#is-equal <sup>[![Version Badge][2]][1]</sup>

[![Build Status][3]][4] [![dependency status][5]][6] [![dev dependency status][7]][8]

[![npm badge][11]][1]

[![browser support][9]][10]

Are these two values conceptually equal?

## Example

```js
var isEqual = require('is-equal');
var assert = require('assert');

var primitives = [true, false, undefined, 42, 'foo'];
primitives.forEach(function (primitive) {
	assert.equal(isEqual(primitive, primitive), true);
});
assert.equal(isEqual(/a/g, /a/g));
assert.equal(isEqual(/a/g, new RegExp('a', 'g')));
assert.equal(isEqual({ a: 2 }, { a: 2 }), true);
assert.equal(isEqual([1, [2, 3], 4], [1, [2, 3], 4]), true);
var timestamp = Date.now();
assert.equal(isEqual(new Date(timestamp), new Date(timestamp)), true);
```

## Tests
Simply clone the repo, `npm install`, and run `npm test`

[1]: https://npmjs.org/package/is-equal
[2]: http://vb.teelaun.ch/ljharb/is-equal.svg
[3]: https://travis-ci.org/ljharb/is-equal.png
[4]: https://travis-ci.org/ljharb/is-equal
[5]: https://david-dm.org/ljharb/is-equal.png
[6]: https://david-dm.org/ljharb/is-equal
[7]: https://david-dm.org/ljharb/is-equal/dev-status.png
[8]: https://david-dm.org/ljharb/is-equal#info=devDependencies
[9]: https://ci.testling.com/ljharb/is-equal.png
[10]: https://ci.testling.com/ljharb/is-equal
[11]: https://nodei.co/npm/is-equal.png?downloads=true&stars=true

