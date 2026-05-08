'use strict';

var pairTry = require('./pairTry');
var functionsHaveNames = require('functions-have-names')();

var normalizeFnWhitespace = function normalizeWhitespace(fnStr) {
	// this is needed in IE 9, at least, which has inconsistencies here.
	return fnStr.replace(/^function ?\(/, 'function (').replace('){', ') {');
};

module.exports = function compareCallable(value, other, valueIsCallable, otherIsCallable, valueIsGen, valueIsArrow, seen, whyNotEqual) {
	if (valueIsCallable !== otherIsCallable) {
		return valueIsCallable ? 'first argument is callable; second is not' : 'second argument is callable; first is not';
	}
	if (functionsHaveNames) {
		var pn = pairTry(
			function () { return value.name; },
			function () { return other.name; },
			'.name'
		);
		if (pn.diag) { return pn.diag; }
		if (pn.v.ok && whyNotEqual(pn.v.val, pn.o.val, seen) !== '') { return 'Function names differ: "' + pn.v.val + '" !== "' + pn.o.val + '"'; }
	}
	var pl = pairTry(
		function () { return value.length; },
		function () { return other.length; },
		'.length'
	);
	if (pl.diag) { return pl.diag; }
	if (pl.v.ok && whyNotEqual(pl.v.val, pl.o.val, seen) !== '') { return 'Function lengths differ: ' + pl.v.val + ' !== ' + pl.o.val; }

	var ps = pairTry(
		function () { return String(value); },
		function () { return String(other); },
		'String(fn)'
	);
	if (ps.diag) { return ps.diag; }
	if (ps.v.ok) {
		var valueStr = normalizeFnWhitespace(ps.v.val);
		var otherStr = normalizeFnWhitespace(ps.o.val);
		var fnStrDiff = whyNotEqual(valueStr, otherStr, seen) !== '';
		var canStripBraceWs = !valueIsGen && !valueIsArrow;
		if (fnStrDiff && (!canStripBraceWs || whyNotEqual(valueStr.replace(/\)\s*\{/, '){'), otherStr.replace(/\)\s*\{/, '){'), seen) !== '')) {
			return 'Function string representations differ';
		}
	}
	return '';
};
