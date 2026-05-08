'use strict';

/* eslint max-lines: 0 */

var ObjectPrototype = Object.prototype;
var toStr = ObjectPrototype.toString;
var booleanValue = Boolean.prototype.valueOf;
var hasOwn = require('hasown');
var isArray = require('isarray');
var isArrowFunction = require('is-arrow-function');
var isBoolean = require('is-boolean-object');
var isDate = require('is-date-object');
var isGenerator = require('is-generator-function');
var isNumber = require('is-number-object');
var isRegex = require('is-regex');
var isString = require('is-string');
var isSymbol = require('is-symbol');
var isCallable = require('is-callable');
var isBigInt = require('is-bigint');
var getIterator = require('es-get-iterator');
var toPrimitive = require('es-to-primitive/es2015');
var whichCollection = require('which-collection');
var whichBoxedPrimitive = require('which-boxed-primitive');
var getPrototypeOf = require('object.getprototypeof/polyfill')();
var hasSymbols = require('has-symbols/shams')();
var hasBigInts = require('has-bigints')();
var getSideChannel = require('side-channel');
var alreadyVisitedPair = require('./visited');
var compareCallable = require('./compareCallable');
var pairTry = require('./pairTry');

var MAX_ITER = 1e6;

var isKeyRecursive = function (parent, container, key) {
	try {
		return !!container && container[key] === parent;
	} catch (e) {
		return false;
	}
};

var objectType = function (v) { return whichCollection(v) || whichBoxedPrimitive(v) || typeof v; };

var isProto = Object.prototype.isPrototypeOf;

var symbolValue = hasSymbols ? Symbol.prototype.valueOf : null;

var bigIntValue = hasBigInts ? BigInt.prototype.valueOf : null;

var testToPrim = function testToPrimitive(value, other, hint, hintName) {
	var valPrimitive = NaN;
	var valPrimitiveThrows = false;
	try {
		valPrimitive = toPrimitive(value, hint);
	} catch (error) {
		valPrimitiveThrows = true;
	}

	var otherPrimitive = NaN;
	var otherPrimitiveThrows = false;
	try {
		otherPrimitive = toPrimitive(other, hint);
	} catch (error) {
		otherPrimitiveThrows = true;
	}

	if (valPrimitiveThrows || otherPrimitiveThrows) {
		if (!valPrimitiveThrows) { return 'second argument toPrimitive (hint ' + hintName + ') throws; first does not'; }
		if (!otherPrimitiveThrows) { return 'first argument toPrimitive (hint ' + hintName + ') throws; second does not'; }
	} else if (valPrimitive !== otherPrimitive) {
		return 'first argument toPrimitive does not match second argument toPrimitive (hint ' + hintName + ')';
	}
	return '';
};

module.exports = function whyNotEqual(value, other, visited) {
	if (value === other) { return ''; }
	if (value == null || other == null) {
		return value === other ? '' : String(value) + ' !== ' + String(other);
	}
	var seen = visited || getSideChannel();
	if (alreadyVisitedPair(seen, value, other)) { return ''; }

	var valToStr = toStr.call(value);
	var otherToStr = toStr.call(other);
	if (valToStr !== otherToStr) {
		return 'toStringTag is not the same: ' + valToStr + ' !== ' + otherToStr;
	}

	var valIsBool = isBoolean(value);
	var otherIsBool = isBoolean(other);
	if (valIsBool || otherIsBool) {
		if (!valIsBool) { return 'first argument is not a boolean; second argument is'; }
		if (!otherIsBool) { return 'second argument is not a boolean; first argument is'; }
		var valBoolVal = booleanValue.call(value);
		var otherBoolVal = booleanValue.call(other);
		if (valBoolVal === otherBoolVal) { return ''; }
		return 'primitive value of boolean arguments do not match: ' + valBoolVal + ' !== ' + otherBoolVal;
	}

	var valIsNumber = isNumber(value);
	var otherIsNumber = isNumber(other);
	if (valIsNumber || otherIsNumber) {
		if (!valIsNumber) { return 'first argument is not a number; second argument is'; }
		if (!otherIsNumber) { return 'second argument is not a number; first argument is'; }
		var valNum = Number(value);
		var otherNum = Number(other);
		if (valNum === otherNum) { return ''; }
		var valIsNaN = isNaN(value);
		var otherIsNaN = isNaN(other);
		if (valIsNaN && !otherIsNaN) {
			return 'first argument is NaN; second is not';
		} else if (!valIsNaN && otherIsNaN) {
			return 'second argument is NaN; first is not';
		} else if (valIsNaN && otherIsNaN) {
			return '';
		}
		return 'numbers are different: ' + value + ' !== ' + other;
	}

	var valIsString = isString(value);
	var otherIsString = isString(other);
	if (valIsString || otherIsString) {
		if (!valIsString) { return 'second argument is string; first is not'; }
		if (!otherIsString) { return 'first argument is string; second is not'; }
		var stringVal = String(value);
		var otherVal = String(other);
		if (stringVal === otherVal) { return ''; }
		return 'string values are different: "' + stringVal + '" !== "' + otherVal + '"';
	}

	var valIsDate = isDate(value);
	var otherIsDate = isDate(other);
	if (valIsDate || otherIsDate) {
		if (!valIsDate) { return 'second argument is Date, first is not'; }
		if (!otherIsDate) { return 'first argument is Date, second is not'; }
		var valTime = +value;
		var otherTime = +other;
		if (valTime !== otherTime) {
			return 'Dates have different time values: ' + valTime + ' !== ' + otherTime;
		}
	}

	var valIsRegex = isRegex(value);
	var otherIsRegex = isRegex(other);
	if (valIsRegex || otherIsRegex) {
		if (!valIsRegex) { return 'second argument is RegExp, first is not'; }
		if (!otherIsRegex) { return 'first argument is RegExp, second is not'; }
		var rs = pairTry(
			function () { return String(value); },
			function () { return String(other); },
			'String(regex)'
		);
		if (rs.diag) { return rs.diag; }
		if (rs.v.ok && rs.v.val !== rs.o.val) {
			return 'regular expressions differ: ' + rs.v.val + ' !== ' + rs.o.val;
		}
	}

	var valIsArray = isArray(value);
	var otherIsArray = isArray(other);
	if (valIsArray || otherIsArray) {
		if (!valIsArray) { return 'second argument is an Array, first is not'; }
		if (!otherIsArray) { return 'first argument is an Array, second is not'; }
		if (value.length !== other.length) {
			return 'arrays have different length: ' + value.length + ' !== ' + other.length;
		}

		var index = value.length - 1;
		var equal = '';
		var valHasIndex, otherHasIndex;
		while (equal === '' && index >= 0) {
			valHasIndex = hasOwn(value, index);
			otherHasIndex = hasOwn(other, index);
			if (!valHasIndex && otherHasIndex) { return 'second argument has index ' + index + '; first does not'; }
			if (valHasIndex && !otherHasIndex) { return 'first argument has index ' + index + '; second does not'; }
			var pi = pairTry(
				// eslint-disable-next-line no-loop-func
				function () { return value[index]; },
				// eslint-disable-next-line no-loop-func
				function () { return other[index]; },
				'index ' + index
			);
			if (pi.diag) { return pi.diag; }
			if (pi.v.ok) { equal = whyNotEqual(pi.v.val, pi.o.val, seen); }
			index -= 1;
		}
		return equal;
	}

	var valueIsSym = isSymbol(value);
	var otherIsSym = isSymbol(other);
	if (valueIsSym !== otherIsSym) {
		if (valueIsSym) { return 'first argument is Symbol; second is not'; }
		return 'second argument is Symbol; first is not';
	}
	if (valueIsSym && otherIsSym) {
		return symbolValue.call(value) === symbolValue.call(other) ? '' : 'first Symbol value !== second Symbol value';
	}

	var valueIsBigInt = isBigInt(value);
	var otherIsBigInt = isBigInt(other);
	if (valueIsBigInt !== otherIsBigInt) {
		if (valueIsBigInt) { return 'first argument is BigInt; second is not'; }
		return 'second argument is BigInt; first is not';
	}
	if (valueIsBigInt && otherIsBigInt) {
		return bigIntValue.call(value) === bigIntValue.call(other) ? '' : 'first BigInt value !== second BigInt value';
	}

	var valueIsGen = isGenerator(value);
	var otherIsGen = isGenerator(other);
	if (valueIsGen !== otherIsGen) {
		if (valueIsGen) { return 'first argument is a Generator function; second is not'; }
		return 'second argument is a Generator function; first is not';
	}

	var valueIsArrow = isArrowFunction(value);
	var otherIsArrow = isArrowFunction(other);
	if (valueIsArrow !== otherIsArrow) {
		if (valueIsArrow) { return 'first argument is an arrow function; second is not'; }
		return 'second argument is an arrow function; first is not';
	}

	var valueIsCallable = isCallable(value);
	var otherIsCallable = isCallable(other);
	if (valueIsCallable || otherIsCallable) {
		var fnResult = compareCallable(value, other, valueIsCallable, otherIsCallable, valueIsGen, valueIsArrow, seen, whyNotEqual);
		if (fnResult) { return fnResult; }
	}

	var valueIsObj = valIsDate || valIsRegex || valIsArray || valueIsGen || valueIsArrow || valueIsCallable || Object(value) === value;
	var otherIsObj = otherIsDate || otherIsRegex || otherIsArray || otherIsGen || otherIsArrow || otherIsCallable || Object(other) === other;

	if (valueIsObj || otherIsObj) {
		if (typeof value !== typeof other) { return 'arguments have a different typeof: ' + typeof value + ' !== ' + typeof other; }
		var pp = pairTry(
			function () { return isProto.call(value, other); },
			function () { return isProto.call(other, value); },
			'[[Prototype]] check'
		);
		if (pp.diag) { return pp.diag; }
		if (pp.v.ok) {
			if (pp.v.val) { return 'first argument is the [[Prototype]] of the second'; }
			if (pp.o.val) { return 'second argument is the [[Prototype]] of the first'; }
		}
		var pgp = pairTry(
			function () { return getPrototypeOf(value); },
			function () { return getPrototypeOf(other); },
			'getPrototypeOf'
		);
		if (pgp.diag) { return pgp.diag; }
		if (pgp.v.ok && pgp.v.val !== pgp.o.val) { return 'arguments have a different [[Prototype]]'; }

		var valueIsFn = typeof value === 'function';
		var otherIsFn = typeof other === 'function';

		if (!valueIsFn || !otherIsFn) {
			var result = testToPrim(value, other, String, 'String')
				|| testToPrim(value, other, Number, 'Number')
				|| testToPrim(value, other, void undefined, 'default');
			if (result) {
				return result;
			}
		}

		var valueIterator = getIterator(value);
		var otherIterator = getIterator(other);
		if (!!valueIterator !== !!otherIterator) {
			if (valueIterator) { return 'first argument is iterable; second is not'; }
			return 'second argument is iterable; first is not';
		}
		if (valueIterator && otherIterator) { // both should be truthy or falsy at this point
			var valueIterResult, otherIterResult, nextWhy;
			var valueDone, otherDone, valueIterVal, otherIterVal;
			var valueNextThrows, otherNextThrows;
			var iterCount = 0;
			do {
				if (iterCount >= MAX_ITER) { return 'iteration aborted: maximum iteration count (' + MAX_ITER + ') exceeded'; }
				iterCount += 1;
				valueNextThrows = false;
				otherNextThrows = false;
				try {
					valueIterResult = valueIterator.next();
					valueDone = !!valueIterResult.done;
					valueIterVal = valueIterResult.value;
				} catch (e) { valueNextThrows = true; }
				try {
					otherIterResult = otherIterator.next();
					otherDone = !!otherIterResult.done;
					otherIterVal = otherIterResult.value;
				} catch (e) { otherNextThrows = true; }
				if (valueNextThrows || otherNextThrows) {
					if (!valueNextThrows) { return 'second ' + objectType(other) + ' iterator next() throws; first does not'; }
					if (!otherNextThrows) { return 'first ' + objectType(value) + ' iterator next() throws; second does not'; }
					return ''; // both throw, treat as equal-so-far, mirroring testToPrim
				}
				if (!valueDone && !otherDone) {
					nextWhy = whyNotEqual(valueIterVal, otherIterVal, seen);
					if (nextWhy !== '') { return 'iteration results are not equal: value at key "value" differs: ' + nextWhy; }
				}
			} while (!valueDone && !otherDone);
			if (valueDone && !otherDone) { return 'first ' + objectType(value) + ' argument finished iterating before second ' + objectType(other); }
			if (!valueDone && otherDone) { return 'second ' + objectType(other) + ' argument finished iterating before first ' + objectType(value); }
			return '';
		}

		var key, valueKeyIsRecursive, otherKeyIsRecursive, keyWhy;
		for (key in value) {
			if (hasOwn(value, key)) {
				if (!hasOwn(other, key)) { return 'first argument has key "' + key + '"; second does not'; }
				var pk = pairTry(
					// eslint-disable-next-line no-loop-func
					function () { return value[key]; },
					// eslint-disable-next-line no-loop-func
					function () { return other[key]; },
					'key "' + key + '"'
				);
				if (pk.diag) { return pk.diag; }
				if (pk.v.ok) {
					valueKeyIsRecursive = isKeyRecursive(value, pk.v.val, key);
					otherKeyIsRecursive = isKeyRecursive(other, pk.o.val, key);
					if (valueKeyIsRecursive !== otherKeyIsRecursive) {
						if (valueKeyIsRecursive) { return 'first argument has a circular reference at key "' + key + '"; second does not'; }
						return 'second argument has a circular reference at key "' + key + '"; first does not';
					}
					if (!valueKeyIsRecursive && !otherKeyIsRecursive) {
						keyWhy = whyNotEqual(pk.v.val, pk.o.val, seen);
						if (keyWhy !== '') { return 'value at key "' + key + '" differs: ' + keyWhy; }
					}
				}
			}
		}
		for (key in other) {
			if (hasOwn(other, key) && !hasOwn(value, key)) {
				return 'second argument has key "' + key + '"; first does not';
			}
		}
		return '';
	}

	return false;
};
