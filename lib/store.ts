import { create } from "zustand"

import { TweetRow } from "./types"

interface Store {
  timeline: TweetRow[]
  lastRefresh: Date | null
  setTimeline: (timeline: TweetRow[]) => void
  triggerRefresh: () => void
}
export const useStore = create<Store>((set) => ({
  timeline: [],
  lastRefresh: null,

  setTimeline: (timeline) => {
    set({ timeline, lastRefresh: new Date() })
  },
  triggerRefresh: () => set({ lastRefresh: null }),
}))
