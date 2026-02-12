import { Image } from "./common";
import { FUItem } from "../../external/project-fu";

export type Armor = {
	image: Image;
	name: string;
	martial: boolean;
	cost: number;
	def: number;
	mdef: number;
	init: number;
	description: string;
};

export const convertDef = (prefix: string) => (s: string) => {
	const stringMap: Record<string, string> = {
		DES: "DEX",
		AST: "INS",
		VIG: "MIG",
		VON: "WLP",
	};

	let normalized = s;
	for (const key in stringMap) {
		normalized = normalized.replace(key, stringMap[key]);
	}

	if (normalized.startsWith(prefix + " size")) {
		const num = normalized.slice((prefix + " size").length);
		return num === "" ? 0 : Number(num);
	} else if (normalized.startsWith(prefix + " die")) {
		const num = normalized.slice((prefix + " die").length);
		return num === "" ? 0 : Number(num);
	} else if (normalized.startsWith(prefix)) {
		// Handle "DEX + 1" or "DEX"
		const num = normalized.slice(prefix.length).replace("+", "").trim();
		return num === "" ? 0 : Number(num);
	} else return s === "-" ? 0 : Number(s);
};

export function armorToFuItem(data: Armor, imagePath: string, folderId: string, source: string): FUItem {
	return {
		type: "armor" as const,
		name: data.name,
		img: imagePath + "/" + data.name + ".png",
		folder: folderId,
		system: {
			isMartial: { value: data.martial },
			description: data.description === "No Quality." ? "" : data.description,
			cost: { value: data.cost },
			source: source,
			def: { value: data.def },
			mdef: { value: data.mdef },
			init: { value: data.init },
			isBehavior: false,
			weight: { value: 1 },
		},
	};
}
