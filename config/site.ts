import { NavItem } from "@/types/nav"

interface SiteConfig {
  name: string
  description: string
  mainNav: NavItem[]
  links: {}
}

export const siteConfig: SiteConfig = {
  name: "Single-player Twitter",
  description:
    "If a tweet is made in the forest and no one is around, does it get ratioed?",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
  ],
  links: {},
}
