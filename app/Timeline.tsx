"use client";

import { useEffect, useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { PostgrestResponse } from "@supabase/supabase-js";
import useSWRInfinite from "swr/infinite";

import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { TweetRow } from "@/lib/types";
import { Tweet } from "@/components/tweet";
import { LoadingBox } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

export async function getRecentTweets([
	path,
	[userId, username],
	pageIndex,
	previousPageData,
]: [
	key: string,
	user: [userId: string | null, username: string | null],
	pageIndex: number,
	previousPageData: TweetRow[],
]) {
	if (previousPageData && !previousPageData.length) return [];
	let query = supabase
		.from("timeline")
		.select("id, username, content, created_at, reply_to_id, user_id")
		.order("created_at", { ascending: false })
		.range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1);

	if (userId) {
		query = query.eq("user_id", userId);
	} else if (username) {
		query = query.ilike("username", username.toLowerCase());
	}

	const { data, error }: PostgrestResponse<TweetRow> = await query;

	if (error) {
		throw error;
	}
	return data;
}

export default function Timeline({
	userId,
	username,
}: {
	userId?: string;
	username?: string;
}) {
	const timeline = useStore((state) => state.timeline);
	const clearTimeline = useStore((state) => state.clearTimeline);
	const setTimeline = useStore((state) => state.setTimeline);

	const lastRefresh = useStore((state) => state.lastRefresh);
	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		return () => clearTimeline();
	}, [clearTimeline]);

	const { data, error, size, setSize, mutate, isLoading } = useSWRInfinite(
		(index, previousPageData) => {
			return [
				`timeline/${userId}/${username}`,
				[userId, username],
				index,
				previousPageData,
			];
		},
		getRecentTweets,
		{
			revalidateFirstPage: true,
			revalidateOnMount: true,
			onSuccess(data) {
				setTimeline(data.flat());
				if (data[data.length - 1].length < PAGE_SIZE) {
					setHasMore(false);
				}
			},
		},
	);

	useEffect(() => {
		if (lastRefresh === null) {
			mutate(undefined, { revalidate: true });
		}
	}, [lastRefresh, mutate]);

	const sentinel = useRef<HTMLDivElement>();

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setSize((prev) => prev + 1);
					}
				});
			},
			{
				root: null,
				rootMargin: "300px",
			},
		);
		observer.observe(sentinel.current);
		return () => observer.disconnect();
	}, [setSize]);

	const [parent, enableAnimations] = useAutoAnimate(/* optional config */);

	return (
		<>
			<div ref={parent}>
				{timeline.map(({ id, username, created_at, content, reply_to_id }) => (
					<Tweet
						key={id}
						content={content}
						id={id}
						replyToId={reply_to_id}
						createdAt={created_at}
						username={username}
					/>
				))}
				{isLoading && (
					<div className="flex flex-col gap-4">
						<div className="border-b p-4">
							<LoadingBox />
						</div>
						<div className="border-b p-4">
							<LoadingBox />
						</div>
					</div>
				)}
			</div>
			{hasMore && <div ref={sentinel} />}
		</>
	);
}
