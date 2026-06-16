declare module 'object.getprototypeof/polyfill' {
	function getPolyfill(): (value: unknown) => unknown;

	export = getPolyfill;
}
