import { ItemWithImageToken } from "../lexers/token";
import {
	convertCosts,
	isMartial,
	parseDescription,
	normalizeStat,
	normalizeDamageType,
	translateWeaponCategory,
	normalizeHanded,
	normalizeDistance,
	isNoQuality,
} from "../parsers-commons";
import { Weapon } from "../model/weapon";
import { DamageType, Distance, Handed, Stat, WeaponCategory } from "../model/common";

export function parseWeapon(weaponToken: ItemWithImageToken, optionalWeaponCategory: string): Weapon {
	// This value will change depending on optional martial and accuracy bonus strings
	let indexShift = 0;

	const weaponStringTokens = weaponToken.strings.map((token) => token.string);
	const name = weaponStringTokens[0];

	const martial = isMartial(weaponToken.strings[1]);

	// Martial string is optional
	if (martial) {
		indexShift++;
	}

	const cost = convertCosts(weaponStringTokens[1 + indexShift]);

	// We skip index 2(+) and 4(+), these are "【" and "】"
	const [primaryAccuracyStat, secondaryAccuracyStat] = weaponStringTokens[3 + indexShift].split("+");

	// Bonus string is optional
	const maybeBonus = Number(weaponStringTokens[5 + indexShift]);
	if (!isNaN(maybeBonus)) {
		indexShift++;
	}
	const bonus = isNaN(maybeBonus) ? 0 : maybeBonus;
	const accuracy = {
		primary: normalizeStat(primaryAccuracyStat) as Stat,
		secondary: normalizeStat(secondaryAccuracyStat) as Stat,
		bonus: bonus,
	};

	// We skip index 5(+) and 7(+), these are "【" and "】"
	// Handle HR + X or RA + X
	const damageToken = weaponStringTokens[6 + indexShift];
	// Remove prefix "HR + " or "RA + "
	const damage = Number(damageToken.replace(/^(HR|RA)\s*\+\s*/, ""));

	// Sometimes light type damage is separated to l + ight
	let rawDamageType = weaponStringTokens[8 + indexShift];
	if (rawDamageType === "l") {
		rawDamageType += weaponStringTokens[8 + ++indexShift];
	}
	const damageType = normalizeDamageType(rawDamageType) as DamageType;

	if (optionalWeaponCategory === "") {
		indexShift++;
	}
	const category =
		optionalWeaponCategory === ""
			? (translateWeaponCategory(weaponStringTokens[8 + indexShift]) as WeaponCategory)
			: (translateWeaponCategory(optionalWeaponCategory) as WeaponCategory);

	if (optionalWeaponCategory === "") {
		// We skip one index - this is section separator
		indexShift++;
	}

	const hands = normalizeHanded(weaponStringTokens[9 + indexShift]) as Handed;

	// We skip index 11(+) this is section separator
	const distance = normalizeDistance(weaponStringTokens[11 + indexShift]) as Distance;

	// We skip index 13(+) this is section separator
	const description = parseDescription(
		weaponToken.strings.slice(13 + indexShift).filter((token) => !isNoQuality(token.string)),
	);

	return {
		image: weaponToken.image.image,
		name: name,
		martial: martial,
		cost: cost,
		accuracy: accuracy,
		damage: damage,
		damageType: damageType,
		hands: hands,
		melee: distance,
		category: category,
		description: description,
	};
}
