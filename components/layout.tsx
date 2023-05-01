"use client"

import { Inter as FontSans } from "next/font/google"
import Head from "next/head"
import { ThemeProvider } from "next-themes"

import { SiteHeader } from "@/components/site-header"
import "@/styles/globals.css"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Session, SessionContextProvider } from "@supabase/auth-helpers-react"

import { useStore } from "@/lib/store"
import { supabase } from "@/lib/supabase"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const useUserSession = () => {
  const user = useStore((state) => state.session)
  const profile = useStore((state) => state.profile)
  const router = useRouter()

  useEffect(() => {
    if (user && !profile) {
      // fetch profile, else redirect to pick username
      router.push("/profile/pick-username")
    }
  }, [user, profile, router])
}

interface LayoutProps {
  children: React.ReactNode
  initialSession?: Session
  profile?: { id: string; username: string } | null
}

export function Layout({ children, initialSession, profile }: LayoutProps) {
  const setSession = useStore((state) => state.setSession)
  const setProfile = useStore((state) => state.setProfile)
  const logout = useStore((state) => state.logout)

  useEffect(() => {
    if (profile) {
      setProfile(profile)
    }
  }, [profile, setProfile])

  useEffect(() => {
    supabase.auth.getSession().then((resp) => {
      if (!resp.error) {
        setSession(resp.data.session)
      } else {
        logout()
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession, logout])

  useUserSession()

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionContextProvider
        supabaseClient={supabase}
        initialSession={initialSession}
      >
        <Head>
          <style jsx global>{`
            :root {
              --font-sans: ${fontSans.style.fontFamily};
            }
          `}</style>
        </Head>
        <div className="flex h-full flex-col">
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
        </div>
      </SessionContextProvider>
    </ThemeProvider>
  )
}
