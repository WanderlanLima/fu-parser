import { FUItem } from "../../external/project-fu";

export type CampActivity = {
	name: string;
	description: string;
};

export function campActivityToFuItem(data: CampActivity, folderId: string, source: string): FUItem {
	return {
		type: "optionalFeature" as const,
		name: data.name,
		folder: folderId,
		system: {
			optionalType: "projectfu.campActivity",
			data: { description: data.description },
			source: source,
		},
	};
}
