import { Layout } from "@/components/layout"
import "@/styles/globals.css"
import { Source_Sans_Pro } from "next/font/google"

const font = Source_Sans_Pro({
  subsets: ["latin"],
  weight: "400",
})

export const metadata = {
  title: "Single-player Twitter",
  description:
    "If a tweet is made in the forest and no one is around, does it get ratioed?",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
