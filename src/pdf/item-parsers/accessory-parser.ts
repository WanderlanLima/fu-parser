import { ItemWithImageToken } from "../lexers/token";
import { Accessory } from "../model/accessory";
import { convertCosts, parseDescription } from "../parsers-commons";

export function parseAccessory(accessoryToken: ItemWithImageToken): Accessory {
	const accessoryStringTokens = accessoryToken.strings.map((token) => token.string);
	const name = accessoryStringTokens[0];
	const cost = convertCosts(accessoryStringTokens[1]);
	const description = parseDescription(accessoryToken.strings.slice(2));

	return {
		image: accessoryToken.image.image,
		name: name,
		description: description,
		cost: cost,
	};
}
