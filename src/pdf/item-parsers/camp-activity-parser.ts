import { FeatureToken } from "../lexers/token";
import { parseDescription } from "../parsers-commons";
import { CampActivity } from "../model/camp-activity";

export function parseCampActivity(campActivityToken: FeatureToken): CampActivity {
	const campActivityTokens = campActivityToken.strings.map((token) => token.string);
	const name = campActivityTokens[0];
	const target = campActivityTokens[1];
	const description =
		`<p>Target: <strong>${target}</strong></p>` + parseDescription(campActivityToken.strings.slice(2));

	return {
		name: name,
		description: description,
	};
}
