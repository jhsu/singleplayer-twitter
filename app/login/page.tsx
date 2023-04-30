"use client"

import { Auth } from "@supabase/auth-ui-react"
import {
  // Import predefined theme
  ThemeSupa,
} from "@supabase/auth-ui-shared"

import { supabase } from "@/lib/supabase"
import { Layout } from "@/components/layout"

export default function Page() {
  return (
    <div
      className="max-w-lg items-center p-4"
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      <div className="max-w-md">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google", "twitter"]}
        />
      </div>
    </div>
  )
}
