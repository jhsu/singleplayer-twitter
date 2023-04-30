import { cookies, headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@supabase/auth-helpers-nextjs"

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerSupabaseClient({ headers, cookies })
  const data = await req.json()
  const ses = await supabase.auth.getSession()

  if (ses.error) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  await supabase
    .from("profiles")
    .upsert({ username: data.username, id: ses.data.session.user.id })
    .eq("id", ses.data.session.user.id)

  return NextResponse.json({
    id: ses.data.session.user.id,
    username: data.username,
  })
}
