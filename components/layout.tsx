"use client"

import { Inter as FontSans } from "next/font/google"
import Head from "next/head"
import { ThemeProvider } from "next-themes"

import { SiteHeader } from "@/components/site-header"

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
    <ThemeProvider>
      <Head>
        <style jsx global>{`
          :root {
            --font-sans: ${fontSans.style.fontFamily};
          }
        `}</style>
      </Head>
      <SiteHeader />
      <main>{children}</main>
    </ThemeProvider>
  )
}
