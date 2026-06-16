import { Channel } from 'side-channel';

declare function whyNotEqual<V, O>(
	value?: V,
	other?: O,
	visited?: Channel<unknown, unknown>,
): string | false;

export = whyNotEqual;
