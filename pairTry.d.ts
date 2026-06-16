declare namespace pairTry {
	type TryResult<T> = { ok: true, val: T } | { ok: false, val: undefined };
	type PairResult<V, O> = { diag: string, o: TryResult<O>, v: TryResult<V> };
}

declare function pairTry<V, O>(
	vFn: () => V,
	oFn: () => O,
	label: string,
): pairTry.PairResult<V, O>;

export = pairTry;
