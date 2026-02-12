import { ItemWithImageToken } from "../lexers/token";
import { Shield } from "../model/shield";
import { convertCosts, isMartial, convertDashOrNumber, parseDescription, isNoQuality } from "../parsers-commons";

export function parseShield(shieldToken: ItemWithImageToken): Shield {
	const shieldStringTokens = shieldToken.strings.map((token) => token.string);
	const name = shieldStringTokens[0];
	const martial = isMartial(shieldToken.strings[1]);

	const indexShift = martial ? 1 : 0;
	const cost = convertCosts(shieldStringTokens[1 + indexShift]);
	const def = convertDashOrNumber(shieldStringTokens[2 + indexShift]);
	const mdef = convertDashOrNumber(shieldStringTokens[3 + indexShift]);
	const init = convertDashOrNumber(shieldStringTokens[4 + indexShift]);
	const description = parseDescription(
		shieldToken.strings.slice(5 + indexShift).filter((token) => !isNoQuality(token.string)),
	);

	return {
		image: shieldToken.image.image,
		name: name,
		martial: martial,
		cost: cost,
		def: def,
		mdef: mdef,
		init: init,
		description: description,
	};
}
