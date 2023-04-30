import { NextApiRequest, NextApiResponse } from "next"
import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"

export async function POST(request: Request, response: NextApiResponse) {
  const supabase = createServerSupabaseClient({
    req: request as any,
    res: response,
  })
  const { data: session } = await supabase.auth.getSession()
  const { tweet, username } = await request.json()
  await supabase.from("timeline").insert({ content: tweet, username })
  return NextResponse.json(
    { tweet, username },
    {
      headers: { "content-type": "application/json" },
    }
  )
}
