module.exports = function () {
	var mapForEach = typeof Map === 'function' ? Map.prototype.forEach : null;
	var setForEach = typeof Set === 'function' ? Set.prototype.forEach : null;

	return { Map: mapForEach, Set: setForEach };
};
