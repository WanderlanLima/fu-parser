import { ItemWithImageToken } from "../lexers/token";
import { Armor, convertDef } from "../model/armor";
import { convertCosts, isMartial, convertDashOrNumber, parseDescription, isNoQuality } from "../parsers-commons";

export function parseArmor(armorToken: ItemWithImageToken): Armor {
	const armorStringTokens = armorToken.strings.map((token) => token.string);
	const name = armorStringTokens[0];
	const martial = isMartial(armorToken.strings[1]);

	const indexShift = martial ? 1 : 0;
	const cost = convertCosts(armorStringTokens[1 + indexShift]);
	const def = convertDef("DEX")(armorStringTokens[2 + indexShift]);
	const mdef = convertDef("INS")(armorStringTokens[3 + indexShift]);
	const init = convertDashOrNumber(armorStringTokens[4 + indexShift]);
	const description = parseDescription(
		armorToken.strings.slice(5 + indexShift).filter((token) => !isNoQuality(token.string)),
	);

	return {
		image: armorToken.image.image,
		name: name,
		martial: martial,
		cost: cost,
		def: def,
		mdef: mdef,
		init: init,
		description: description,
	};
}
