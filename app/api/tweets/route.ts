import { NextApiResponse } from "next"
import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@supabase/auth-helpers-nextjs"

export async function POST(request: Request) {
  const supabase = createRouteHandlerSupabaseClient({
    headers,
    cookies,
  })
  const { data: session } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  const res = await supabase
    .from("profiles")
    .select("username")
    .eq("id", session.session.user.id)
    .limit(1)
    .single()

  const { tweet, reply_to_id } = await request.json()
  const username = res.data.username

  const result = await supabase.from("timeline").insert({
    content: tweet,
    username,
    user_id: session.session.user.id,
    reply_to_id,
  })
  return NextResponse.json(
    {
      tweet,
      username,
      reply_to_id,
    },
    {
      headers: { "content-type": "application/json" },
      status: result.status >= 300 ? 401 : 201,
    }
  )
}
