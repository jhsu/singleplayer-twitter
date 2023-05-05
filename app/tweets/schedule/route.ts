import { NextResponse } from "next/server";
import { checkForTweet } from "@/jobs/twerps";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const key = searchParams.get("key");
	if (key !== process.env.CRON_SHARED_KEY) {
		return new Response("Unauthorized", { status: 404 });
	}
	const result = await checkForTweet();

	return NextResponse.json({ success: result });
}
