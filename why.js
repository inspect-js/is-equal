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

/**
 * @param {unknown} parent
 * @param {unknown} container
 * @param {PropertyKey} key
 * @returns {boolean}
 */
function isKeyRecursive(parent, container, key) {
	try {
		return !!container && (/** @type {Record<PropertyKey, unknown>} */ (container))[key] === parent;
	} catch (e) {
		return false;
	}
}

/** @param {unknown} v */
function objectType(v) {
	return whichCollection(v) || whichBoxedPrimitive(v) || typeof v;
}

var isProto = Object.prototype.isPrototypeOf;

var symbolValue = hasSymbols ? Symbol.prototype.valueOf : null;

var bigIntValue = hasBigInts ? BigInt.prototype.valueOf : null;

var $isExtensible = typeof Object.isExtensible === 'function' ? Object.isExtensible : null;
var $isSealed = typeof Object.isSealed === 'function' ? Object.isSealed : null;
var $isFrozen = typeof Object.isFrozen === 'function' ? Object.isFrozen : null;
var hasIntegrityLevels = !!$isExtensible && !!$isSealed && !!$isFrozen;

/** @param {object} o */
function getIntegrityLevel(o) {
	if ((/** @type {NonNullable<typeof $isFrozen>} */ ($isFrozen))(o)) {
		return /** @type {const} */ ('frozen');
	}
	if ((/** @type {NonNullable<typeof $isSealed>} */ ($isSealed))(o)) {
		return /** @type {const} */ ('sealed');
	}
	if (!(/** @type {NonNullable<typeof $isExtensible>} */ ($isExtensible))(o)) {
		return /** @type {const} */ ('non-extensible');
	}
	return /** @type {const} */ ('extensible');
}

/** @typedef {import('es-to-primitive').primitive} primitive */

/**
 * @template V
 * @template O
 * @param {V} value
 * @param {O} other
 * @param {StringConstructor | NumberConstructor | undefined} hint
 * @param {string} hintName
 * @returns {string}
 */
function testToPrim(value, other, hint, hintName) {
	/** @type {primitive} */
	var valPrimitive = NaN;
	var valPrimitiveThrows = false;
	try {
		valPrimitive = toPrimitive(value, hint);
	} catch (error) {
		valPrimitiveThrows = true;
	}

	/** @type {primitive} */
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
}

/** @type {typeof import('./why')} */
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

	if (hasIntegrityLevels && Object(value) === value && Object(other) === other) {
		var valueLevel = getIntegrityLevel(value);
		var otherLevel = getIntegrityLevel(other);
		if (valueLevel !== otherLevel) {
			return 'integrity levels differ: ' + valueLevel + ' !== ' + otherLevel;
		}
	}

	var valAsBool = isBoolean(value) ? value : null;
	var otherAsBool = isBoolean(other) ? other : null;
	if (valAsBool !== null || otherAsBool !== null) {
		if (valAsBool === null) { return 'first argument is not a boolean; second argument is'; }
		if (otherAsBool === null) { return 'second argument is not a boolean; first argument is'; }
		var valBoolVal = booleanValue.call(valAsBool);
		var otherBoolVal = booleanValue.call(otherAsBool);
		if (valBoolVal === otherBoolVal) { return ''; }
		return 'primitive value of boolean arguments do not match: ' + valBoolVal + ' !== ' + otherBoolVal;
	}

	var valAsNumber = isNumber(value) ? value : null;
	var otherAsNumber = isNumber(other) ? other : null;
	if (valAsNumber !== null || otherAsNumber !== null) {
		if (valAsNumber === null) { return 'first argument is not a number; second argument is'; }
		if (otherAsNumber === null) { return 'second argument is not a number; first argument is'; }
		var valNum = Number(valAsNumber);
		var otherNum = Number(otherAsNumber);
		if (valNum === otherNum) { return ''; }
		var valIsNaN = isNaN(/** @type {number} */ (valAsNumber));
		var otherIsNaN = isNaN(/** @type {number} */ (otherAsNumber));
		if (valIsNaN && !otherIsNaN) {
			return 'first argument is NaN; second is not';
		} else if (!valIsNaN && otherIsNaN) {
			return 'second argument is NaN; first is not';
		} else if (valIsNaN && otherIsNaN) {
			return '';
		}
		return 'numbers are different: ' + valAsNumber + ' !== ' + otherAsNumber;
	}

	var valAsString = isString(value) ? value : null;
	var otherAsString = isString(other) ? other : null;
	if (valAsString !== null || otherAsString !== null) {
		if (valAsString === null) { return 'second argument is string; first is not'; }
		if (otherAsString === null) { return 'first argument is string; second is not'; }
		var stringVal = String(valAsString);
		var otherVal = String(otherAsString);
		if (stringVal === otherVal) { return ''; }
		return 'string values are different: "' + stringVal + '" !== "' + otherVal + '"';
	}

	var valAsDate = isDate(value) ? value : null;
	var otherAsDate = isDate(other) ? other : null;
	if (valAsDate !== null || otherAsDate !== null) {
		if (valAsDate === null) { return 'second argument is Date, first is not'; }
		if (otherAsDate === null) { return 'first argument is Date, second is not'; }
		var valTime = +valAsDate;
		var otherTime = +otherAsDate;
		if (valTime !== otherTime) {
			return 'Dates have different time values: ' + valTime + ' !== ' + otherTime;
		}
	}

	var valAsRegex = isRegex(value) ? value : null;
	var otherAsRegex = isRegex(other) ? other : null;
	if (valAsRegex !== null || otherAsRegex !== null) {
		if (valAsRegex === null) { return 'second argument is RegExp, first is not'; }
		if (otherAsRegex === null) { return 'first argument is RegExp, second is not'; }
		var rs = pairTry(
			function () { return String(valAsRegex); },
			function () { return String(otherAsRegex); },
			'String(regex)'
		);
		if (rs.diag) { return rs.diag; }
		if (rs.v.ok && rs.v.val !== rs.o.val) {
			return 'regular expressions differ: ' + rs.v.val + ' !== ' + rs.o.val;
		}
	}

	var valAsArray = isArray(value) ? value : null;
	var otherAsArray = isArray(other) ? other : null;
	if (valAsArray !== null || otherAsArray !== null) {
		if (valAsArray === null) { return 'second argument is an Array, first is not'; }
		if (otherAsArray === null) { return 'first argument is an Array, second is not'; }
		if (valAsArray.length !== otherAsArray.length) {
			return 'arrays have different length: ' + valAsArray.length + ' !== ' + otherAsArray.length;
		}

		var index = valAsArray.length - 1;
		/** @type {string | false} */
		var equal = '';
		var valHasIndex, otherHasIndex;
		while (equal === '' && index >= 0) {
			valHasIndex = hasOwn(valAsArray, index);
			otherHasIndex = hasOwn(otherAsArray, index);
			if (!valHasIndex && otherHasIndex) { return 'second argument has index ' + index + '; first does not'; }
			if (valHasIndex && !otherHasIndex) { return 'first argument has index ' + index + '; second does not'; }
			var pi = pairTry(
				// eslint-disable-next-line no-loop-func
				function () { return (/** @type {NonNullable<typeof valAsArray>} */ (valAsArray))[index]; },
				// eslint-disable-next-line no-loop-func
				function () { return (/** @type {NonNullable<typeof otherAsArray>} */ (otherAsArray))[index]; },
				'index ' + index
			);
			if (pi.diag) { return pi.diag; }
			if (pi.v.ok) { equal = whyNotEqual(pi.v.val, pi.o.val, seen); }
			index -= 1;
		}
		return equal;
	}

	var valAsSym = isSymbol(value) ? value : null;
	var otherAsSym = isSymbol(other) ? other : null;
	if ((valAsSym === null) !== (otherAsSym === null)) {
		if (valAsSym !== null) { return 'first argument is Symbol; second is not'; }
		return 'second argument is Symbol; first is not';
	}
	if (valAsSym !== null && otherAsSym !== null) {
		return (/** @type {NonNullable<typeof symbolValue>} */ (symbolValue)).call(valAsSym) === (/** @type {(this: unknown) => symbol} */ (symbolValue)).call(otherAsSym)
			? ''
			: 'first Symbol value !== second Symbol value';
	}

	var valAsBigInt = isBigInt(value) ? value : null;
	var otherAsBigInt = isBigInt(other) ? other : null;
	if ((valAsBigInt === null) !== (otherAsBigInt === null)) {
		if (valAsBigInt !== null) { return 'first argument is BigInt; second is not'; }
		return 'second argument is BigInt; first is not';
	}
	if (valAsBigInt !== null && otherAsBigInt !== null) {
		return (/** @type {NonNullable<typeof bigIntValue>} */ (bigIntValue)).call(valAsBigInt) === (/** @type {(this: unknown) => bigint} */ (bigIntValue)).call(otherAsBigInt)
			? ''
			: 'first BigInt value !== second BigInt value';
	}

	var valAsGen = isGenerator(value) ? value : null;
	var otherAsGen = isGenerator(other) ? other : null;
	if ((valAsGen === null) !== (otherAsGen === null)) {
		if (valAsGen !== null) { return 'first argument is a Generator function; second is not'; }
		return 'second argument is a Generator function; first is not';
	}

	var valAsArrow = isArrowFunction(value) ? value : null;
	var otherAsArrow = isArrowFunction(other) ? other : null;
	if ((valAsArrow === null) !== (otherAsArrow === null)) {
		if (valAsArrow !== null) { return 'first argument is an arrow function; second is not'; }
		return 'second argument is an arrow function; first is not';
	}

	var valAsCallable = isCallable(value) ? value : null;
	var otherAsCallable = isCallable(other) ? other : null;
	if (valAsCallable !== null || otherAsCallable !== null) {
		var fnResult = compareCallable(
			value,
			other,
			valAsCallable !== null,
			otherAsCallable !== null,
			valAsGen !== null,
			valAsArrow !== null,
			seen,
			whyNotEqual
		);
		if (fnResult) { return fnResult; }
	}

	var valueIsObj = valAsDate !== null || valAsRegex !== null || valAsArray !== null || valAsGen !== null || valAsArrow !== null || valAsCallable !== null || Object(value) === value;
	var otherIsObj = otherAsDate !== null || otherAsRegex !== null || otherAsArray !== null || otherAsGen !== null || otherAsArrow !== null || otherAsCallable !== null || Object(other) === other;

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

		/** @type {string} */
		var key;
		var valueKeyIsRecursive, otherKeyIsRecursive, keyWhy;
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
					if (valueKeyIsRecursive && !otherKeyIsRecursive) { return 'first argument has a circular reference at key "' + key + '"; second does not'; }
					if (otherKeyIsRecursive && !valueKeyIsRecursive) { return 'second argument has a circular reference at key "' + key + '"; first does not'; }
					keyWhy = '';
					if (!valueKeyIsRecursive && !otherKeyIsRecursive) { keyWhy = whyNotEqual(pk.v.val, pk.o.val, seen); }
					if (keyWhy !== '') { return 'value at key "' + key + '" differs: ' + keyWhy; }
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
