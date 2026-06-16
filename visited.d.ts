import { Channel } from 'side-channel';

declare function alreadyVisitedPair<V, O>(
	visited: Channel<unknown, unknown>,
	value: V,
	other: O,
): boolean;

export = alreadyVisitedPair;
