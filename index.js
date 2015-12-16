'use strict';

var ObjectPrototype = Object.prototype;
var toStr = ObjectPrototype.toString;
var booleanValue = Boolean.prototype.valueOf;
var has = require('has');
var isArrowFunction = require('is-arrow-function');
var isBoolean = require('is-boolean-object');
var isDate = require('is-date-object');
var isGenerator = require('is-generator-function');
var isNumber = require('is-number-object');
var isRegex = require('is-regex');
var isString = require('is-string');
var isSymbol = require('is-symbol');
var isCallable = require('is-callable');

var isProto = Object.prototype.isPrototypeOf;

var foo = function foo() {};
var functionsHaveNames = foo.name === 'foo';

var symbolValue = typeof Symbol === 'function' ? Symbol.prototype.valueOf : null;
var symbolIterator = require('./getSymbolIterator')();

var collectionsForEach = require('./getCollectionsForEach')();

var getPrototypeOf = Object.getPrototypeOf;
if (!getPrototypeOf) {
	/* eslint-disable no-proto */
	if (typeof 'test'.__proto__ === 'object') {
		getPrototypeOf = function (obj) {
			return obj.__proto__;
		};
	} else {
		getPrototypeOf = function (obj) {
			var constructor = obj.constructor,
				oldConstructor;
			if (has(obj, 'constructor')) {
				oldConstructor = constructor;
				if (!(delete obj.constructor)) { // reset constructor
					return null; // can't delete obj.constructor, return null
				}
				constructor = obj.constructor; // get real constructor
				obj.constructor = oldConstructor; // restore constructor
			}
			return constructor ? constructor.prototype : ObjectPrototype; // needed for IE
		};
	}
	/* eslint-enable no-proto */
}

var isArray = Array.isArray || function (value) {
	return toStr.call(value) === '[object Array]';
};

var normalizeFnWhitespace = function normalizeFnWhitespace(fnStr) {
	// this is needed in IE 9, at least, which has inconsistencies here.
	return fnStr.replace(/^function ?\(/, 'function (').replace('){', ') {');
};

var tryMapSetEntries = function tryMapSetEntries(collection) {
	var foundEntries = [];
	try {
		collectionsForEach.Map.call(collection, function (key, value) {
			foundEntries.push([key, value]);
		});
	} catch (notMap) {
		try {
			collectionsForEach.Set.call(collection, function (value) {
				foundEntries.push([value]);
			});
		} catch (notSet) {
			return false;
		}
	}
	return foundEntries;
};

module.exports = function isEqual(value, other) {
	if (value === other) { return true; }
	if (value == null || other == null) { return value === other; }

	if (toStr.call(value) !== toStr.call(other)) { return false; }

	var valIsBool = isBoolean(value);
	var otherIsBool = isBoolean(other);
	if (valIsBool || otherIsBool) {
		return valIsBool && otherIsBool && booleanValue.call(value) === booleanValue.call(other);
	}

	var valIsNumber = isNumber(value);
	var otherIsNumber = isNumber(value);
	if (valIsNumber || otherIsNumber) {
		return valIsNumber && otherIsNumber && (Number(value) === Number(other) || (isNaN(value) && isNaN(other)));
	}

	var valIsString = isString(value);
	var otherIsString = isString(other);
	if (valIsString || otherIsString) {
		return valIsString && otherIsString && String(value) === String(other);
	}

	var valIsDate = isDate(value);
	var otherIsDate = isDate(other);
	if (valIsDate || otherIsDate) {
		return valIsDate && otherIsDate && +value === +other;
	}

	var valIsRegex = isRegex(value);
	var otherIsRegex = isRegex(other);
	if (valIsRegex || otherIsRegex) {
		return valIsRegex && otherIsRegex && String(value) === String(other);
	}

	var valIsArray = isArray(value);
	var otherIsArray = isArray(other);
	if (valIsArray || otherIsArray) {
		if (!valIsArray || !otherIsArray) { return false; }
		if (value.length !== other.length) { return false; }
		if (String(value) !== String(other)) { return false; }

		var index = value.length - 1;
		var equal = true;
		while (equal && index >= 0) {
			equal = has(value, index) && has(other, index) && isEqual(value[index], other[index]);
			index -= 1;
		}
		return equal;
	}

	var valueIsSym = isSymbol(value);
	var otherIsSym = isSymbol(other);
	if (valueIsSym !== otherIsSym) { return false; }
	if (valueIsSym && otherIsSym) {
		return symbolValue.call(value) === symbolValue.call(other);
	}

	var valueIsGen = isGenerator(value);
	var otherIsGen = isGenerator(other);
	if (valueIsGen !== otherIsGen) { return false; }

	var valueIsArrow = isArrowFunction(value);
	var otherIsArrow = isArrowFunction(other);
	if (valueIsArrow !== otherIsArrow) { return false; }

	if (isCallable(value) || isCallable(other)) {
		if (functionsHaveNames && !isEqual(value.name, other.name)) { return false; }
		if (!isEqual(value.length, other.length)) { return false; }

		var valueStr = normalizeFnWhitespace(String(value));
		var otherStr = normalizeFnWhitespace(String(other));
		if (isEqual(valueStr, otherStr)) { return true; }

		if (!valueIsGen && !valueIsArrow) {
			return isEqual(valueStr.replace(/\)\s*\{/, '){'), otherStr.replace(/\)\s*\{/, '){'));
		}
		return isEqual(valueStr, otherStr);
	}

	if (typeof value === 'object' || typeof other === 'object') {
		if (typeof value !== typeof other) { return false; }
		if (isProto.call(value, other) || isProto.call(other, value)) { return false; }
		if (getPrototypeOf(value) !== getPrototypeOf(other)) { return false; }

		if (symbolIterator) {
			var valueIteratorFn = value[symbolIterator];
			var valueIsIterable = isCallable(valueIteratorFn);
			var otherIteratorFn = other[symbolIterator];
			var otherIsIterable = isCallable(otherIteratorFn);
			if (valueIsIterable !== otherIsIterable) {
				return false;
			}
			if (valueIsIterable && otherIsIterable) {
				var valueIterator = valueIteratorFn.call(value);
				var otherIterator = otherIteratorFn.call(other);
				var valueNext, otherNext;
				do {
					valueNext = valueIterator.next();
					otherNext = otherIterator.next();
					if (!valueNext.done && !otherNext.done && !isEqual(valueNext, otherNext)) {
						return false;
					}
				} while (!valueNext.done && !otherNext.done);
				return valueNext.done === otherNext.done;
			}
		} else if (collectionsForEach.Map || collectionsForEach.Set) {
			var valueEntries = tryMapSetEntries(value);
			var otherEntries = tryMapSetEntries(other);
			if (isArray(valueEntries) !== isArray(otherEntries)) {
				return false; // either: neither is a Map/Set, or one is and the other isn't.
			}
			if (valueEntries && otherEntries) {
				return isEqual(valueEntries, otherEntries);
			}
		}

		var key, valueKeyIsRecursive, otherKeyIsRecursive;
		for (key in value) {
			if (has(value, key)) {
				if (!has(other, key)) { return false; }
				valueKeyIsRecursive = value[key] && value[key][key] === value;
				otherKeyIsRecursive = other[key] && other[key][key] === other;
				if (valueKeyIsRecursive !== otherKeyIsRecursive) {
					return false;
				}
				if (!valueKeyIsRecursive && !otherKeyIsRecursive && !isEqual(value[key], other[key])) {
					return false;
				}
			}
		}
		for (key in other) {
			if (has(other, key)) {
				if (!has(value, key)) { return false; }
				valueKeyIsRecursive = value[key] && value[key][key] === value;
				otherKeyIsRecursive = other[key] && other[key][key] === other;
				if (valueKeyIsRecursive !== otherKeyIsRecursive) {
					return false;
				}
				if (!valueKeyIsRecursive && !otherKeyIsRecursive && !isEqual(other[key], value[key])) {
					return false;
				}
			}
		}
		return true;
	}

	return false;
};
