"use client"

import { useEffect, useState } from "react"
import { PostgrestResponse } from "@supabase/supabase-js"
import { suspend } from "suspend-react"

import { useStore } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { TweetRow } from "@/lib/types"

export async function getRecentTweets() {
  const { data, error }: PostgrestResponse<TweetRow> = await supabase
    .from("timeline")
    .select("id, username, content, created_at")
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
      {timeline?.map(({ id, username, created_at, content }) => (
        <div key={id} className="border-b p-4">
          <div>
            <span className="font-bold">{username}</span>
            <span className="text-gray-600">{created_at}</span>
          </div>
          <div dir="auto">{content}</div>
        </div>
      ))}
    </>
  )
}
