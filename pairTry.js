'use strict';

/** @type {import('./pairTry')} */
module.exports = function pairTry(vFn, oFn, label) {
	/** @type {import('./pairTry').TryResult<ReturnType<typeof vFn>>} */
	var v;
	try {
		v = { ok: true, val: vFn() };
	} catch (e) {
		v = { ok: false, val: undefined };
	}
	/** @type {import('./pairTry').TryResult<ReturnType<typeof oFn>>} */
	var o;
	try {
		o = { ok: true, val: oFn() };
	} catch (e) {
		o = { ok: false, val: undefined };
	}
	var diag = '';
	if (v.ok !== o.ok) {
		diag = (v.ok ? 'second' : 'first') + ' argument ' + label + ' throws; ' + (v.ok ? 'first' : 'second') + ' does not';
	}
	return {
		diag: diag,
		o: o,
		v: v
	};
};
