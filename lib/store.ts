import { Session } from "@supabase/supabase-js"
import { create } from "zustand"

import { TweetRow } from "./types"

interface Store {
  timeline: TweetRow[]
  lastRefresh: Date | null
  setTimeline: (timeline: TweetRow[]) => void
  triggerRefresh: () => void

  session: Session | null
  profile: { id: string; username: string } | null
  setProfile: (profile: { id: string; username: string }) => void
  setSession: (session: Session) => void
  logout: () => void
}
export const useStore = create<Store>((set) => ({
  session: null,
  timeline: [],
  lastRefresh: null,
  profile: null,

  setProfile: (profile) => set({ profile }),

  setTimeline: (timeline) => {
    set({ timeline, lastRefresh: new Date() })
  },
  triggerRefresh: () => set({ lastRefresh: null }),

  setSession: (session) => set({ session }),
  logout: () => set({ session: null, profile: null }),
}))
