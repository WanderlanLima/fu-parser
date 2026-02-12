import { StringToken } from "./lexers/token";

export const isMartial = (token: StringToken) =>
	(token.font.includes("BasicShapes1") && token.string === "E") ||
	(token.font.includes("Type3") && token.string === "W");

export const isNoQuality = (s: string) => {
	const normalized = s.trim().toLowerCase();
	return normalized === "no quality." || normalized === "sem características especiais." || normalized === "sem caracteristicas especiais.";
};

export const normalizeStat = (s: string): string => {
	const map: Record<string, string> = {
		DEX: "DEX",
		DES: "DEX",
		MIG: "MIG",
		VIG: "MIG",
		INS: "INS",
		AST: "INS",
		WLP: "WLP",
		VON: "WLP",
	};
	return map[s.trim().toUpperCase()] || s.trim();
};

export const normalizeDamageType = (s: string): string => {
	const map: Record<string, string> = {
		physical: "physical",
		físico: "physical",
		air: "air",
		ar: "air",
		bolt: "bolt",
		raio: "bolt",
		dark: "dark",
		trevas: "dark",
		earth: "earth",
		terra: "earth",
		fire: "fire",
		fogo: "fire",
		ice: "ice",
		gelo: "ice",
		light: "light",
		luz: "light",
		poison: "poison",
		veneno: "poison",
	};
	return map[s.trim().toLowerCase()] || s.trim().toLowerCase();
};

export const normalizeHanded = (s: string): string => {
	const val = s.trim().toLowerCase();
	if (val === "one-handed" || val === "uma mão") return "one-handed";
	if (val === "two-handed" || val === "duas mãos") return "two-handed";
	return val;
};

export const normalizeDistance = (s: string): string => {
	const val = s.trim().toLowerCase();
	if (val === "melee" || val === "corpo a corpo" || val === "c a c") return "melee";
	if (val === "ranged" || val === "à distância" || val === "a distância") return "ranged";
	return val;
};

export const translateWeaponCategory = (s: string): string => {
	const map: Record<string, string> = {
		arcane: "arcane",
		arcana: "arcane",
		bow: "bow",
		arco: "bow",
		brawling: "brawling",
		luta: "brawling",
		dagger: "dagger",
		adaga: "dagger",
		firearm: "firearm",
		"arma de fogo": "firearm",
		flail: "flail",
		malho: "flail",
		heavy: "heavy",
		pesada: "heavy",
		spear: "spear",
		lança: "spear",
		sword: "sword",
		espada: "sword",
		thrown: "thrown",
		arremessável: "thrown",
		"ar-remessável": "thrown",
	};
	return map[s.trim().toLowerCase()] || s.trim().toLowerCase();
};
export const convertDashOrNumber = (s: string) => (s === "-" ? 0 : Number(s));

export const convertCosts = (s: string) => {
	if (s.endsWith(" z")) {
		return Number(s.slice(0, -2));
	} else if (s === "-") {
		return 0;
	} else {
		return Number(s);
	}
};

export const prettifyStrings = (lines: string[]): string => {
	return lines
		.reduce((acc, line) => {
			const s = line.trim();
			if (/^[.?!),]/.test(s)) {
				return acc + s;
			} else {
				return acc + " " + s;
			}
		}, "")
		.trim();
};

export function parseDescription(descriptionTokens: StringToken[]): string {
	const bulletPoints = ["", "•"];

	// nextBulletIndex[i] is the index of the next bullet point after i
	const nextBulletIndex = Array(descriptionTokens.length).fill(-1);
	let next = -1;
	for (let i = descriptionTokens.length - 1; i >= 0; i--) {
		nextBulletIndex[i] = next;
		if (bulletPoints.includes(descriptionTokens[i].string)) {
			next = i;
		}
	}

	let description = "";
	let paragraphStarted = false;
	let listStarted = false;

	const startParagraph = () => {
		paragraphStarted = true;
		description += "<p>";
	};

	const endParagraph = () => {
		paragraphStarted = false;
		description += "</p>";
	};

	const startList = () => {
		listStarted = true;
		description += "<ul><li>";
	};

	const endList = () => {
		listStarted = false;
		description += "</li></ul>";
	};

	const nextListItem = () => {
		description += "</li><li>";
	};

	const isOffensiveSpellIcon = (token: StringToken | undefined) => {
		return token
			? (token.font.includes("Heydings-Icons") && token.string === "r") ||
			(token.font.includes("Type3") && token.string === "O")
			: false;
	};

	for (let i = 0; i < descriptionTokens.length; i++) {
		const token = descriptionTokens[i];

		// Handle bullet points
		if (bulletPoints.includes(token.string)) {
			if (!listStarted) {
				if (paragraphStarted) endParagraph();
				startList();
			} else {
				nextListItem();
			}
			continue;
		}

		// Handle offensive spell icon
		if (isOffensiveSpellIcon(token)) {
			// Sometimes there are two tokens with "r" in a row, we will skip the first one
			if (!isOffensiveSpellIcon(descriptionTokens.at(i + 1))) {
				description += " @ICON[offensive] ";
			}
			continue;
		}

		// Handle normal description line

		if (!paragraphStarted && !listStarted) {
			startParagraph();
		}

		let line = token.string.trim();
		const previousLine = descriptionTokens.at(i - 1)?.string;
		if (!/^[.?!),]/.test(line) && i !== 0 && !previousLine?.endsWith("(")) {
			line = " " + line;
		}

		if (token.font.includes("PTSans-NarrowBold")) {
			line = `<strong>${line}</strong>`;
		}

		description += line;

		const isLastListItem = line.endsWith(".") && listStarted && nextBulletIndex[i] === -1;
		if (isLastListItem) {
			endList();
		}
	}

	if (listStarted) endList();
	if (paragraphStarted) endParagraph();

	return description;
}
