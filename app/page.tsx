import { Suspense } from "react"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Layout } from "@/components/layout"
import ComposeTweet from "./ComposeTweet"
import NotifyNewerTweets from "./NotifyNewerTweets"
import Timeline from "./Timeline"

export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
}

export default async function IndexPage() {
  return (
    <>
      <section className="container flex h-full flex-col items-center px-0">
        <div className="flex h-full w-full max-w-[980px] flex-col items-center">
          <div className="h-full w-full max-w-2xl border border-y-0 py-4">
            <ComposeTweet />
            <NotifyNewerTweets />
            <Suspense fallback={<div>Loading...</div>}>
              <Timeline />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  )
}
