"use client"

import { useEffect, useRef, useState } from "react"
import { PostgrestResponse } from "@supabase/supabase-js"
import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite"

import { useStore } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { TweetRow } from "@/lib/types"
import { Tweet } from "@/components/tweet"

const PAGE_SIZE = 10

export async function getRecentTweets([path, pageIndex, previousPageData]: [
  key: string,
  pageIndex: number,
  previousPageData: TweetRow[]
]) {
  if (previousPageData && !previousPageData.length) return []

  const { data, error }: PostgrestResponse<TweetRow> = await supabase
    .from("timeline")
    .select("id, username, content, created_at, reply_to_id, user_id")
    .order("created_at", { ascending: false })
    .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1)
  if (error) {
    throw error
  }
  return data
}

const getKey: SWRInfiniteKeyLoader<TweetRow[]> = (index, previousPageData) => {
  return ["timeline", index, previousPageData]
}

export default function Timeline() {
  const timelineLoaded = useStore((state) => state.setTimeline)
  const lastRefresh = useStore((state) => state.lastRefresh)
  const [hasMore, setHasMore] = useState(true)

  const { data, error, size, setSize, mutate } = useSWRInfinite(
    getKey,
    getRecentTweets,
    {
      onSuccess(data) {
        timelineLoaded(data[data.length - 1])
        if (data[data.length - 1].length < PAGE_SIZE) {
          setHasMore(false)
        }
      },
    }
  )

  useEffect(() => {
    if (lastRefresh === null) {
      mutate(undefined, { revalidate: true })
    }
  }, [lastRefresh, mutate])

  const sentinel = useRef<HTMLDivElement>()

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setSize((prev) => prev + 1)
        }
      })
    })
    observer.observe(sentinel.current)
    return () => observer.disconnect()
  }, [setSize])

  return (
    <>
      {data?.map((snapshot, idx) => {
        return (
          <div key={idx}>
            {snapshot.map(
              ({ id, username, created_at, content, reply_to_id }) => (
                <Tweet
                  key={id}
                  content={content}
                  id={id}
                  replyToId={reply_to_id}
                  createdAt={created_at}
                  username={username}
                />
              )
            )}
          </div>
        )
      })}
      {hasMore && <div ref={sentinel}></div>}
    </>
  )
}
