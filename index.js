"use strict";

var ObjectPrototype = Object.prototype;
var toString = ObjectPrototype.toString;
var has = ObjectPrototype.hasOwnProperty;

var getPrototypeOf = Object.getPrototypeOf;
if (!getPrototypeOf) {
	if (typeof 'test'['__proto__'] === "object") {
		getPrototypeOf = function (obj) {
			return obj['__proto__'];
		};
	} else {
		getPrototypeOf = function (obj) {
			var constructor = obj.constructor,
				oldConstructor;
			if (has.call(obj, 'constructor')) {
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
}

var boolType = '[object Boolean]';
var numberType = '[object Number]';
var stringType = '[object String]';
var dateType = '[object Date]';
var regexType = '[object RegExp]';
var arrayType = '[object Array]';
var funcType = '[object Function]';
var objType = '[object Object]';

module.exports = function isEqual(value, other) {
	if (value === other) { return true; }

	var type = toString.call(value);
	if (type !== toString.call(other)) { return false; }

	if (type === boolType) { return value.valueOf() === other.valueOf(); }

	if (type === numberType) {
		return (Number(value) === Number(other)) || (isNaN(value) && isNaN(other));
	}

	if (type === stringType) { return String(value) === String(other); }

	if (type === dateType) { return value.getTime() === other.getTime(); }

	if (type === regexType) { return String(value) === String(other); }

	if (type === arrayType) {
		if (value.length !== other.length) { return false; }
		if (String(value) !== String(other)) { return false; }

		var index = value.length;
		do {
			--index;
		} while (index > 0 && has.call(value, index) && has.call(other, index) && isEqual(value[index], other[index]));
		return index <= 0;
	}

	if (type === funcType) {
		if (!isEqual(value.name, other.name)) { return false; }
		if (!isEqual(value.length, other.length)) { return false; }

		return isEqual(String(value), String(other));
	}

	if (type === objType) {
		if (value.isPrototypeOf(other) || other.isPrototypeOf(value)) { return false; }
		if (getPrototypeOf(value) !== getPrototypeOf(other)) { return false; }
		var key;
		for (key in value) {
			if (has.call(value, key)) {
				if (!has.call(other, key)) { return false; }
				if (!isEqual(value[key], other[key])) { return false; }
			}
		}
		for (key in other) {
			if (has.call(other, key)) {
				if (!has.call(value, key)) { return false; }
				if (!isEqual(other[key], value[key])) { return false; }
			}
		}
		return true;
	}

	return false;
};

