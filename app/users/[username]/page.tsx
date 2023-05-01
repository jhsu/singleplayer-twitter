import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import Timeline from "@/app/Timeline"
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs"

import { ProfileRow } from "@/lib/types"
import UserProfile from "@/components/users/profile"

// export const revalidate = 0

async function getData(username: string) {
  const supabase = createServerComponentSupabaseClient({
    headers,
    cookies,
  })

  const result = await supabase
    .from("profiles")
    .select<"profiles", ProfileRow>()
    .eq("username", username.toLowerCase())
    .limit(1)
    .maybeSingle()

  if (result.error) {
    throw new Error("Failed to find user")
  }

  return result.data
}

export default async function Page({
  params,
}: {
  params: { username: string }
}) {
  const { username } = params
  const data = await getData(username)

  return (
    <div className="flex flex-1 justify-center">
      <div className="w-full max-w-2xl border-x">
        <div className="border-b p-8">
          <UserProfile profile={{ username: data?.username ?? username }} />
        </div>
        <Timeline userId={data?.id} username={username} />
      </div>
    </div>
  )
}
