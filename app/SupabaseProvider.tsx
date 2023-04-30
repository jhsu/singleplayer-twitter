"use client"

import { useState } from "react"
import {
  Session,
  createBrowserSupabaseClient,
} from "@supabase/auth-helpers-nextjs"
import { SessionContextProvider } from "@supabase/auth-helpers-react"

export default function SupabaseProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode
  initialSession?: Session
}) {
  // Create a new supabase browser client on every first render.
  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      {children}
    </SessionContextProvider>
  )
}
