"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PostgrestResponse } from "@supabase/supabase-js"
import { DateTime } from "luxon"
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
          <div className="flex gap-2">
            <span className="font-bold">
              <Link href={`/personas/${username.toLowerCase()}`}>
                {username}
              </Link>
            </span>
            <span className="text-gray-600">
              {DateTime.fromISO(created_at).toRelative()}
            </span>
          </div>
          <div dir="auto">{content}</div>
        </div>
      ))}
    </>
  )
}
