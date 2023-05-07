import path from "path";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";

import { type Database } from "@/lib/database_gen.types";
import { type AIPersona, type TweetRow } from "@/lib/types";
import { aiPersonas } from "./personas";
import { TweetsRepository } from "./repositories";
import { postTweet } from "./personaActions";

loadEnvConfig(path.join(__dirname, "../"));

const supabase = createClient<Database>(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SERVICE_KEY,
);

const activityThresholds = {
	High: 5 * 60 * 1000, // 5 minutes
	Medium: 10 * 60 * 1000, // 10 minutes
	Low: 15 * 60 * 1000, // 15 minutes
};

const repository = new TweetsRepository(supabase, "timeline");

// Function to determine if a persona should tweet
const shouldTweet = async (persona: AIPersona): Promise<boolean> => {
	const result = await repository.recentTweet(persona.username);
	if (!result) return true;

	const { created_at } = result;

	const lastTweetTimestamp = DateTime.fromISO(created_at);

	// Calculate the time elapsed since the persona's last tweet
	const currentTime = Date.now();
	const timeElapsed = currentTime - lastTweetTimestamp.toMillis();

	// Get the acceptable time interval based on the persona's activity level
	const acceptableInterval = activityThresholds[persona.activity_level];

	// Generate a random number between 0 and 1
	const randomChance = Math.random();

	// Determine if the persona should tweet
	// The persona should tweet if the time elapsed is greater than the acceptable interval
	// and the random chance is greater than a certain threshold (e.g., 0.5)
	return timeElapsed > acceptableInterval && randomChance > 0.5;
};

aiPersonas.forEach(function checkAndTweet(persona) {
	shouldTweet(persona).then(async (should) => {
		if (should) {
			setTimeout(
				() => checkAndTweet(persona),
				activityThresholds[persona.activity_level],
			);
			await postTweet(persona, await repository.recentTweets(persona.username));
		} else {
			setTimeout(() => checkAndTweet(persona), activityThresholds.Low / 2);
		}
	});
});
