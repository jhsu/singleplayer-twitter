import { Session } from "@supabase/supabase-js"
import { create } from "zustand"

import { TweetRow } from "./types"

interface Store {
  newTweets: TweetRow[]
  /**
   * Add a new tweet to the store to be shown before the timeline
   * @param tweet {TweetRow} - inserted tweet
   * @returns
   */
  addNewTweet: (tweet: TweetRow) => void
  timeline: TweetRow[]
  clearTimeline: () => void
  lastRefresh: Date | null
  setTimeline: (timeline: TweetRow[]) => void
  showNewTweets: () => void
  prependTimeline: (timeline: TweetRow[]) => void
  appendTimeline: (timeline: TweetRow[]) => void

  triggerRefresh: () => void

  session: Session | null
  profile: { id: string; username: string } | null
  setProfile: (profile: { id: string; username: string }) => void
  setSession: (session: Session) => void
  logout: () => void
}
export const useStore = create<Store>((set) => ({
  session: null,
  /**
   * stores the new tweets that just got created and weren't part of the original fetch
   */
  newTweets: [],
  addNewTweet: (tweet) =>
    set((state) => ({ newTweets: [tweet, ...state.newTweets] })),
  showNewTweets: () => {
    set((state) => ({
      newTweets: [],
      timeline: [...state.newTweets, ...state.timeline],
    }))
  },

  timeline: [],
  lastRefresh: null,
  profile: null,

  setProfile: (profile) => set({ profile }),

  clearTimeline() {
    set({ timeline: [], lastRefresh: null })
  },
  setTimeline: (timeline) => {
    set({ timeline, lastRefresh: new Date() })
  },
  prependTimeline: (timeline) => {
    set((state) => ({ timeline: [...timeline, ...state.timeline] }))
  },
  appendTimeline: (timeline: TweetRow[]) => {
    set((state) => ({ timeline: [...state.timeline, ...timeline] }))
  },
  triggerRefresh: () => set({ lastRefresh: null }),

  setSession: (session) => set({ session }),
  logout: () => set({ session: null, profile: null }),
}))
