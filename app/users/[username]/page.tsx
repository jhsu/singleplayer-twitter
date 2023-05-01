import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs"

export const revalidate = 0

async function getData(username: string) {
  const supabase = createServerComponentSupabaseClient({
    headers,
    cookies,
  })

  const result = await supabase
    .from("profiles")
    .select()
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

  if (!data) {
    redirect("/")
  }

  return (
    <div>
      <div>{username}</div>
      {data.id}
      {data.username}
    </div>
  )
}
