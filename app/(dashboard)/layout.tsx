"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { MapPin, Home, Languages, CalendarDays, BookmarkCheck, Map, Utensils, Building2, LogOut, User, Menu, X } from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const dashNavLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/map", label: "Map", icon: Map },
  { href: "/dashboard/places", label: "Places", icon: Building2 },
  { href: "/dashboard/food", label: "Food", icon: Utensils },
  { href: "/dashboard/translator", label: "Translator", icon: Languages },
  { href: "/dashboard/itinerary", label: "Itinerary", icon: CalendarDays },
  { href: "/dashboard/saved-routes", label: "Saved Routes", icon: BookmarkCheck },
]

function UserMenu() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserInitial = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 w-11 cursor-pointer rounded-full p-0 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {getUserInitial()}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <div className="text-sm font-medium">{user?.displayName || "User"}</div>
          <div className="text-sm text-muted-foreground">{user?.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoading}
          className="text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>{isLoading ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <header className="sticky top-0 z-[100] border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-[1400px] items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-0">
            <Image
                        src="/logo black line.svg"
                        alt="iLOcate logo"
                        width={45}
                        height={80}
                        className="object-contain"
            />
            <span className="truncate text-base font-bold text-foreground sm:text-lg">
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
                  className={`flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
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

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted md:hidden"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? "Close dashboard menu" : "Open dashboard menu"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <UserMenu />
          </div>
        </div>

        <div className="border-t border-border px-4 py-2 md:hidden">
          <div className="flex items-center gap-1 overflow-x-auto">
          {dashNavLinks.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
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
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-[95] bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="ml-auto flex h-full w-[min(88vw,320px)] flex-col border-l border-border bg-background p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <nav className="flex flex-col gap-2" aria-label="Dashboard mobile drawer">
              {dashNavLinks.map((link) => {
                const isActive = pathname === link.href
                const Icon = link.icon
                return (
                  <Link
                    key={`drawer-${link.href}`}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  )
}
