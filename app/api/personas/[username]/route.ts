import { NextResponse } from "next/server"
import { aiPersonas } from "@/jobs/personas"

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const username = params.username.toLowerCase()
  const persona = aiPersonas.find(
    (persona) => persona.username.toLowerCase() === username
  )

  if (!persona) {
    return NextResponse.json(
      {
        error: "Not found",
      },
      { status: 404 }
    )
  }

  return NextResponse.json(persona)
}
