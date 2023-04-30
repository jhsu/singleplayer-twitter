import Link from "next/link"
import { suspend } from "suspend-react"

import { siteConfig } from "@/config/site"
import { useStore } from "@/lib/store"
import { supabase } from "@/lib/supabase"
import { Icons } from "@/components/icons"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"

export function SiteHeader() {
  const session = useStore((state) => state.session)
  const username = useStore((state) => state.profile?.username)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-b-slate-200 bg-white dark:border-b-slate-700 dark:bg-slate-900">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {username ? (
              <span>{username}</span>
            ) : (
              <Link href="/login">Login</Link>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
