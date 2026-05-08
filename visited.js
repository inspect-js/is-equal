'use strict';

var getSideChannel = require('side-channel');

module.exports = function alreadyVisitedPair(visited, value, other) {
	if (!value || !other) { return false; }
	var typeV = typeof value;
	var typeO = typeof other;
	if (typeV !== 'object' && typeV !== 'function') { return false; }
	if (typeO !== 'object' && typeO !== 'function') { return false; }
	var inner;
	if (visited.has(value)) {
		inner = visited.get(value);
		if (inner.has(other)) { return true; }
	} else {
		inner = getSideChannel();
		visited.set(value, inner);
	}
	inner.set(other, true);
	return false;
};
