'use strict';

var whyNotEqual = require('./why');

/** @type {typeof import('.')} */
module.exports = function isEqual(value, other) {
	return whyNotEqual(value, other) === '';
};
