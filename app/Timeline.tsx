"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PostgrestResponse } from "@supabase/supabase-js"
import { DateTime } from "luxon"
import { suspend } from "suspend-react"

import { useStore } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { TweetRow } from "@/lib/types"
import { Tweet } from "@/components/tweet"

export async function getRecentTweets() {
  const { data, error }: PostgrestResponse<TweetRow> = await supabase
    .from("timeline")
    .select("id, username, content, created_at, reply_to_id, user_id")
    .order("created_at", { ascending: false })
    .limit(10)
  return { data, error }
}

export default function Timeline() {
  const timelineLoaded = useStore((state) => state.setTimeline)
  const timeline = useStore((state) => state.timeline)
  const lastRefresh = useStore((state) => state.lastRefresh)

  const [stale, setStale] = useState(0)

  const data = suspend(async () => {
    const { data } = await getRecentTweets()
    return data
  }, [stale])

  useEffect(() => {
    timelineLoaded(data)
  }, [data, timelineLoaded])

  useEffect(() => {
    if (lastRefresh === null) {
      setStale((n) => n + 1)
    }
  }, [lastRefresh])

  return (
    <>
      {timeline?.map(({ id, username, created_at, content, reply_to_id }) => (
        <Tweet
          key={id}
          content={content}
          id={id}
          replyToId={reply_to_id}
          createdAt={created_at}
          username={username}
        />
      ))}
    </>
  )
}
