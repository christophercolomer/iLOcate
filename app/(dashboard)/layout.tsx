"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, Home, Languages, CalendarDays, BookmarkCheck, Map, Utensils, Building2 } from "lucide-react"

const dashNavLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/map", label: "Map", icon: Map },
  { href: "/dashboard/places", label: "Places", icon: Building2 },
  { href: "/dashboard/food", label: "Food", icon: Utensils },
  { href: "/dashboard/translator", label: "Translator", icon: Languages },
  { href: "/dashboard/itinerary", label: "Itinerary", icon: CalendarDays },
  { href: "/dashboard/saved-routes", label: "Saved Routes", icon: BookmarkCheck },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">
              iLO<span className="text-primary">cate</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" role="navigation" aria-label="Dashboard navigation">
            {dashNavLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              U
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
          {dashNavLinks.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
