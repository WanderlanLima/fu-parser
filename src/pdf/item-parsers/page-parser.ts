import { asStringToken, FeatureToken, ItemToken, ItemWithImageToken, Token } from "../lexers/token";
import { itemizeTokens } from "./token-itemizer";
import "../../common/common.ts";
import { Item, ItemCategory } from "../model/common";
import { parseAccessory } from "./accessory-parser";
import { parseShield } from "./shield-parser";
import { parseArmor } from "./armor-parser";
import { parseWeapon } from "./weapon-parser";
import { parseWeaponModule } from "./weapon-module-parser";
import { parseCampActivity } from "./camp-activity-parser";

export function parsePage(pageData: Token[]): Map<ItemCategory, Item[]> {
	// Watermark check disabled to support Portuguese PDF which may not have it or uses different font
	/*
	const watermark = pageData[pageData.length - 1];
	if (watermark.kind !== "String" || asStringToken(watermark).font !== "Helvetica") {
		throw new Error("Failed to parse page because it is not watermarked.");
	} else {
	*/
	const [itemTokensByCategory, optionalWeaponCategory] = itemizeTokens(pageData);
	return itemTokensByCategory.map((category, itemTokens) => {
		const items = itemTokens.reduce((acc, token) => {
			try {
				const item = parseItem(category, token, optionalWeaponCategory);
				if (!hasUndefinedProperty(item)) {
					acc.push(item);
				}
			} catch (e) {
				console.warn(`Skipping invalid item on page ${category}:`, e);
			}
			return acc;
		}, [] as Item[]);
		return [category, items];
	});
	// }
}

function parseItem(category: ItemCategory, itemToken: ItemToken, optionalWeaponCategory: string): Item {
	switch (category) {
		case "WEAPON":
			return parseWeapon(itemToken as ItemWithImageToken, optionalWeaponCategory);
		case "ARMOR":
			return parseArmor(itemToken as ItemWithImageToken);
		case "SHIELD":
			return parseShield(itemToken as ItemWithImageToken);
		case "ACCESSORY":
			return parseAccessory(itemToken as ItemWithImageToken);
		case "WEAPON MODULE":
			return parseWeaponModule(itemToken as ItemWithImageToken);
		case "CAMP ACTIVITY":
			return parseCampActivity(itemToken as FeatureToken);
		default:
			// This should never happen if `category` is properly typed
			throw new Error(`Unknown item category: ${category}`);
	}
}

function hasUndefinedProperty(item: Item): boolean {
	return Object.entries(item).some(([_, value]) => value === undefined);
}
