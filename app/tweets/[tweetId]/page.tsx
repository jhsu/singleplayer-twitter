"use client";

import Link from "next/link";
import ComposeTweet from "@/app/ComposeTweet";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { DateTime } from "luxon";
import { clear, suspend } from "suspend-react";

import { supabase } from "@/lib/supabase";
import { TweetRow } from "@/lib/types";
import { Tweet } from "@/components/tweet";

export default function Page({ params }: { params: { tweetId: string } }) {
	const { tweetId } = params;
	const [parent, enableAnimations] = useAutoAnimate();

	const result = suspend(
		async () =>
			await supabase
				.from("timeline")
				.select<"timeline", TweetRow>()
				.eq("id", tweetId)
				.limit(1)
				.single(),
		[tweetId, "tweet"],
	);

	const replies = suspend(
		async () =>
			await supabase
				.from("timeline")
				.select<"timeline", TweetRow>()
				.eq("reply_to_id", tweetId)
				.order("created_at", { ascending: false })
				.limit(10),
		[tweetId, "replies"],
	);

	const tweet = result.data;

	return (
		<>
			<div className="p-4" ref={parent}>
				<div className="flex gap-2 text-gray-600">
					{tweet.reply_to_id && (
						<Link href={`/tweets/${tweet.reply_to_id}`}>Show thread</Link>
					)}
				</div>
				<div className="flex gap-2">
					{tweet.username}{" "}
					<span className="text-gray-600">
						{DateTime.fromISO(tweet.created_at).toRelative()}
					</span>
				</div>
				<div className="text-xl font-bold">{tweet.content}</div>
			</div>

			<ComposeTweet
				replyTo={tweet.id}
				onSuccess={() => clear([tweetId, "replies"])}
			/>

			{replies.data.map((tweet) => {
				return (
					<Tweet
						key={tweet.id}
						id={tweet.id}
						content={tweet.content}
						replyToId={tweet.reply_to_id}
						createdAt={tweet.created_at}
						username={tweet.username}
						parentLink={false}
					/>
				);
			})}
		</>
	);
}
