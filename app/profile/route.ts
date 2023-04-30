import { cookies, headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerSupabaseClient } from "@supabase/auth-helpers-nextjs"

export const revalidate = 0

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerSupabaseClient({ headers, cookies })
  const session = await supabase.auth.getSession()

  if (session.error) {
    return NextResponse.json({ session: session.data }, { status: 401 })
  }

  const id = session.data.session.user.id
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", id)
    .limit(1)
    .single()
  if (error) {
    return NextResponse.json(
      { error: "Unable to find profile" },
      { status: 404 }
    )
  }
  return {
    id,
    username: data.username,
  }
}
