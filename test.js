"use strict";

var test = require('tape');
var isEqual = require('./');

test('primitives', function (t) {
	t.ok(isEqual(), 'undefineds are equal');
	t.ok(isEqual(null, null), 'nulls are equal');
	t.ok(isEqual(true, true), 'trues are equal');
	t.ok(isEqual(false, false), 'falses are equal');
	t.ok(isEqual('foo', 'foo'), 'strings are equal');
	t.ok(isEqual(42, 42), 'numbers are equal');
	t.ok(isEqual(0 / Infinity, -0 / Infinity), 'opposite sign zeroes are equal');
	t.ok(isEqual(Infinity, Infinity), 'infinities are equal');
	t.end();
});

test('NaN', function (t) {
	t.ok(isEqual(NaN, NaN), 'NaNs are equal');
	t.end();
});

test('boxed primitives', function (t) {
	t.ok(isEqual(new String(''), ''), 'Empty String and empty string are equal');
	t.ok(isEqual(new String('foo'), 'foo'), 'String and string are equal');
	t.ok(isEqual(new Boolean(true), true), 'Boolean true and boolean true are equal');
	t.ok(isEqual(new Boolean(false), false), 'Boolean false and boolean false are equal');
	t.ok(isEqual(new Number(42), 42), 'Number and number literal are equal');
	t.end();
});

test('dates', function (t) {
	t.ok(isEqual(new Date(123), new Date(123)), 'two dates with the same timestamp are equal');
	t.notOk(isEqual(new Date(123), new Date(456)), 'two dates with different timestamp are not equal');
	t.end();
});

test('regexes', function (t) {
	t.ok(isEqual(/a/g, /a/g), 'two regex literals are equal');
	t.notOk(isEqual(/a/g, /b/g), 'two different regex literals are not equal');
	t.ok(isEqual(new RegExp('a', 'g'), new RegExp('a', 'g')), 'two regex objects are equal');
	t.notOk(isEqual(new RegExp('a', 'g'), new RegExp('b', 'g')), 'two different regex objects are equal');
	t.ok(isEqual(new RegExp('a', 'g'), /a/g), 'regex object and literal, same content, are equal');
	t.notOk(isEqual(new RegExp('a', 'g'), /b/g), 'regex object and literal, different content, are not equal');
	t.end();
});

test('arrays', function (t) {
	t.ok(isEqual([], []), 'empty arrays are equal');
	t.ok(isEqual([1, 2, 3], [1, 2, 3]), 'same arrays are equal');
	t.notOk(isEqual([1, 2, 3], [3, 2, 1]), 'arrays in different order with same values are not equal');
	t.notOk(isEqual([1, 2], [1, 2, 3]), 'arrays with different lengths are not equal');
	t.notOk(isEqual([1, 2, 3], [1, 2]), 'arrays with different lengths are not equal');

	t.test('nested values', function (st) {
		st.ok(isEqual([[1, 2], [2, 3], [3, 4]], [[1, 2], [2, 3], [3, 4]]), 'arrays with same array values are equal');
		st.end();
	});
	t.end();
});

test('objects', function (t) {
	t.test('prototypes', function (st) {
		var F = function F() {
			this.foo = 42;
		};
		var G = function G() {};
		G.prototype = new F();
		G.prototype.constructor = G;
		var H = function H() {};
		H.prototype = G.prototype;
		var I = function I() {};

		var f1 = new F();
		var f2 = new F();
		var g1 = new G();
		var h1 = new H();
		var i1 = new I();

		st.ok(isEqual(f1, f2), 'two instances of the same thing are equal');

		st.ok(isEqual(g1, h1), 'two instances of different things with the same prototype are equal');
		st.notOk(isEqual(f1, i1), 'two instances of different things with a different prototype are not equal');

		var isParentEqualToChild = isEqual(f1, g1);
		st.notOk(isParentEqualToChild, 'two instances of a parent and child are not equal');
		var isChildEqualToParent = isEqual(g1, f1);
		st.notOk(isChildEqualToParent, 'two instances of a child and parent are not equal');

		g1.foo = 'bar';
		var g2 = new G();
		st.notOk(isEqual(g1, g2), 'two instances of the same thing with different properties are not equal');
		st.notOk(isEqual(g2, g1), 'two instances of the same thing with different properties are not equal');
		st.end();
	});

	t.test('literals', function (st) {
		var a = { foo: 42 };
		var b = { foo: 42 };
		st.ok(isEqual(a, a), 'same hash is equal to itself');
		st.ok(isEqual(a, b), 'two similar hashes are equal');
		st.ok(isEqual({ nested: a }, { nested: a }), 'similar hashes with same nested hash are equal');
		st.ok(isEqual({ nested: a }, { nested: b }), 'similar hashes with similar nested hash are equal');

		st.notOk(isEqual({ a: 42, b: 0 }, { a: 42 }), 'first hash missing a key is not equal');
		st.notOk(isEqual({ a: 42 }, { a: 42, b: 0 }), 'second hash missing a key is not equal');
		st.end();
	});

	t.end();
});

test('functions', function (t) {
	var f1 = function f() { /* SOME STUFF */ return 1; };
	var f2 = function f() { /* SOME STUFF */ return 1; };
	var f3 = function f() { /* SOME DIFFERENT STUFF */ return 2; };
	var g = function g() { /* SOME STUFF */ return 1; };
	var anon1 = function () { /* ANONYMOUS! */ return 'anon'; };
	var anon2 = function () { /* ANONYMOUS! */ return 'anon'; };

	/* for code coverage */
	f1();
	f2();
	f3();
	g();
	anon1();
	anon2();
	/* end for code coverage */

	var anon1withArg = function (a) { /* ANONYMOUS! */ };

	t.ok(isEqual(f1, f1), 'same function is equal to itself');
	t.ok(isEqual(anon1, anon1), 'same anon function is equal to itself');
	t.notOk(isEqual(anon1, anon1withArg), 'similar anon function with different lengths are not equal');

	t.notOk(isEqual(f1, g), 'functions with different names but same implementations are not equal');
	t.ok(isEqual(f1, f2), 'functions with same names but same implementations are equal');
	t.notOk(isEqual(f1, f3), 'functions with same names but different implementations are not equal');
	t.ok(isEqual(anon1, anon2), 'anon functions with same implementations are equal');

	t.end();
});

