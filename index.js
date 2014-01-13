"use strict";

var toString = Object.prototype.toString;
var has = Object.prototype.hasOwnProperty;

var getPrototypeOf = Object.getPrototypeOf;
if (!getPrototypeOf) {
	if (typeof this.__proto__ === "object") {
		getPrototypeOf = function (obj) {
			return obj.__proto__;
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
			return constructor ? constructor.prototype : null; // needed for IE
		};
	}
}

var dateType = '[object Date]';
var regexType = '[object RegExp]';
var arrayType = '[object Array]';
var funcType = '[object Function]';
var objType = '[object Object]';

module.exports = function isEqual(value, other) {
	if (value === other) { return true; }

	var type = toString.call(value);
	if (type !== toString.call(other)) { return false; }

	if (type === dateType) { return value.getTime() === other.getTime(); }

	if (type === regexType) { return String(value) === String(other); }

	if (type === arrayType) {
		if (value.length !== other.length) { return false; }

		var index = value.length;
		do {
			--index;
		} while (index > 0 && index in value && index in other && isEqual(value[index], other[index]));
		return index <= 0;
	}

	if (type === funcType) {
		return isEqual(value.name, other.name) && isEqual(String(value), String(other));
	}

	if (type === objType) {
		if (getPrototypeOf(value) !== getPrototypeOf(other)) { return false; }
		var key;
		for (key in value) {
			if (has.call(value, key)) {
				if (!(key in other)) { return false; }
				if (!isEqual(value[key], other[key])) { return false; }
			}
		}
		for (key in other) {
			if (has.call(other, key)) {
				if (!(key in value)) { return false; }
				if (!isEqual(other[key], value[key])) { return false; }
			}
		}
		return true;
	}

	return false;
};

