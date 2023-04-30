import { Suspense } from "react"
import Link from "next/link"

import { siteConfig } from "@/config/site"
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

const LoadingBox = ({ half }: { half?: boolean }) => {
  return (
    <div
      className={`h-4 rounded bg-gray-800 ${half ? "w-1/2" : "w-full"}`}
    ></div>
  )
}
const LoadingTimeline = () => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 border-b p-4">
        <LoadingBox half />
        <LoadingBox />
      </div>
      <div className="flex flex-col gap-4 border-b p-4">
        <LoadingBox half />
        <LoadingBox />
      </div>
      <div className="flex flex-col gap-4 border-b p-4">
        <LoadingBox half />
        <LoadingBox />
      </div>
      <div className="flex flex-col gap-4 border-b p-4">
        <LoadingBox half />
        <LoadingBox />
      </div>
    </div>
  )
}

export default async function IndexPage() {
  return (
    <>
      <section className="container flex h-full flex-col items-center px-0">
        <div className="flex h-full w-full max-w-[980px] flex-col items-center">
          <div className="h-full w-full max-w-2xl border-0 py-4 sm:border sm:border-y-0">
            <ComposeTweet />
            <NotifyNewerTweets />
            <Suspense fallback={<LoadingTimeline />}>
              <Timeline />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  )
}
