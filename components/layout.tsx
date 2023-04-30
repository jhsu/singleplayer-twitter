"use client"

import { Inter as FontSans } from "next/font/google"
import Head from "next/head"
import { ThemeProvider } from "next-themes"

import { SiteHeader } from "@/components/site-header"
import "@/styles/globals.css"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Head>
        <style jsx global>{`
          :root {
            --font-sans: ${fontSans.style.fontFamily};
          }
        `}</style>
      </Head>
      <div className="flex h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </div>
    </ThemeProvider>
  )
}
