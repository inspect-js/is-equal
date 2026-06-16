'use strict';

// TODO: delete in next semver-major

var isSymbol = require('is-symbol');

module.exports = function getSymbolIterator() {
	/** @type {string | symbol | null} */
	var symbolIterator = typeof Symbol === 'function' && isSymbol(Symbol.iterator) ? Symbol.iterator : null;

	if (typeof Object.getOwnPropertyNames === 'function' && typeof Map === 'function' && typeof Map.prototype.entries === 'function') {
		/** @type {(string | symbol)[]} */
		var names = Object.getOwnPropertyNames(Map.prototype);
		var symbols = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(Map.prototype) : [];
		names.concat(symbols).forEach(function (name) {
			if (name !== 'entries' && name !== 'size' && (/** @type {Record<string | symbol, unknown>} */ (/** @type {unknown} */ (Map.prototype)))[name] === Map.prototype.entries) {
				symbolIterator = name;
			}
		});
	}

	return symbolIterator;
};
