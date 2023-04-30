"use client"

import { Auth } from "@supabase/auth-ui-react"
import {
  // Import predefined theme
  ThemeSupa,
} from "@supabase/auth-ui-shared"
import { useTheme } from "next-themes"

import { supabase } from "@/lib/supabase"

export default function Page() {
  const { theme } = useTheme()
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
          theme={theme === "dark" ? "dark" : "default"}
        />
      </div>
    </div>
  )
}
