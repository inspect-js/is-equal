import { Channel } from 'side-channel';
import Why from './why';

declare function compareCallable<V, O>(
	value: V,
	other: O,
	valueIsCallable: boolean,
	otherIsCallable: boolean,
	valueIsGen: boolean,
	valueIsArrow: boolean,
	seen: Channel<unknown, unknown>,
	whyNotEqual: typeof Why,
): string;

export = compareCallable;
