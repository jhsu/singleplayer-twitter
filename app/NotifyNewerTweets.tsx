"use client"

import { useEffect, useRef, useState } from "react"
import { mutate } from "swr"

import { useStore } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function NotifyNewerTweets() {
  const [latestCreatedAt, setLatestCreatedAt] = useState(0)
  const previousTimestamp = useRef<string | null>(null)
  const triggerRefresh = useStore((state) => state.triggerRefresh)

  useEffect(() => {
    // Subscribe to the "timeline" table for new inserts
    const subscription = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public" },
        (payload) => {
          // Update the state with the "created_at" value of the new inserted record
          const newUpdate = new Date(payload.new.created_at)
          const previous = previousTimestamp.current
            ? new Date(previousTimestamp.current)
            : null
          if (
            !previous ||
            (previous && newUpdate.getTime() >= previous.getTime())
          ) {
            setLatestCreatedAt((prev) => prev + 1)
            mutate((key: any) => key?.[0].startsWith("timeline"))
            previousTimestamp.current = payload.new.created_at
          }
        }
      )
      .subscribe()

    // Clean up the subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (latestCreatedAt === 0) return null

  return (
    <div>
      <Button
        onClick={() => {
          triggerRefresh()
          setLatestCreatedAt(0)
        }}
      >
        Show {latestCreatedAt} new tweets
      </Button>
    </div>
  )
}
