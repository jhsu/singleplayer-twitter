import { Layout } from "@/components/layout"
import "@/styles/globals.css"
import { Source_Sans_Pro } from "next/font/google"
import { cookies, headers } from "next/headers"
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs"

import { ProfileRow } from "@/lib/types"

const font = Source_Sans_Pro({
  subsets: ["latin"],
  weight: "400",
})

export const metadata = {
  title: "Single-player Twitter",
  description:
    "If a tweet is made in the forest and no one is around, does it get ratioed?",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentSupabaseClient({
    headers,
    cookies,
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const res = session
    ? await supabase
        .from("profiles")
        .select()
        .eq("id", session.user.id)
        .limit(1)
        .single<ProfileRow>()
    : null

  return (
    <html lang="en">
      <body className={font.className}>
        <Layout initialSession={session} profile={res?.data}>
          {children}
        </Layout>
      </body>
    </html>
  )
}
