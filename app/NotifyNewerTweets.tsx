"use client";

import { useEffect, useRef, useState } from "react";
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import { mutate } from "swr";

import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { TweetRow } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function NotifyNewerTweets() {
	const [latestCreatedAt, setLatestCreatedAt] = useState(0);
	const showNewTweets = useStore((state) => state.showNewTweets);
	const addNewTweet = useStore((state) => state.addNewTweet);
	const profile = useStore((state) => state.profile);
	const prependTimeline = useStore((state) => state.prependTimeline);

	useEffect(() => {
		// Subscribe to the "timeline" table for new inserts
		const subscription = supabase
			.channel("schema-db-changes")
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "timeline" },
				(payload: RealtimePostgresInsertPayload<TweetRow>) => {
					const tweet = payload.new;

					if (tweet.user_id === profile?.id) {
						prependTimeline([tweet]);
					} else {
						addNewTweet(tweet);
						// Update the state with the "created_at" value of the new inserted record
						setLatestCreatedAt((prev) => prev + 1);
					}
					mutate((key: any) => key?.[0].startsWith("timeline"));
				},
			)
			.subscribe();

		return () => void subscription.unsubscribe();
	}, [addNewTweet, prependTimeline, profile]);

	if (latestCreatedAt === 0) return null;

	return (
		<div className="flex justify-center border-b hover:bg-gray-200">
			<Button
				variant="link"
				className="w-full"
				onClick={() => {
					showNewTweets();
					setLatestCreatedAt(0);
				}}
			>
				Show {latestCreatedAt} tweets
			</Button>
		</div>
	);
}
