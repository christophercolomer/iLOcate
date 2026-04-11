"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#faqs", label: "FAQs" },
  { href: "/premium", label: "Premium" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeHash, setActiveHash] = useState("")
  const pathname = usePathname()
  const isHome = pathname === "/"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash)
    syncHash()
    window.addEventListener("hashchange", syncHash)
    return () => window.removeEventListener("hashchange", syncHash)
  }, [pathname])

  const isTransparent = isHome && !isScrolled
  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/" && (activeHash === "" || activeHash === "#")
    if (href.startsWith("/#")) return pathname === "/" && activeHash === href.slice(1)
    return pathname === href
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isTransparent
          ? "bg-transparent"
          : "bg-background/95 shadow-sm backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-0">
          <Image
            src={isTransparent ? "/ilocate No BG.svg" : "/logo black line.svg"}
            alt="iLOcate logo"
            width={45}
            height={70}
            className="object-contain"
          />
          <span className={`text-2xl md:text-3xl font-bold tracking-tight ${isTransparent ? "text-white" : "text-foreground"}`}>
            iLO<span className={isTransparent ? "text-primary" : "text-primary"}>cate</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  if (link.href.startsWith("/#")) setActiveHash(link.href.slice(1))
                  if (link.href === "/") setActiveHash("")
                }}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  isTransparent
                    ? isActive
                      ? "text-white after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:rounded-full after:bg-white"
                      : "text-white/70 hover:text-white"
                    : isActive
                      ? "text-primary after:absolute after:bottom-0 after:left-4 after:right-4 after:h-0.5 after:rounded-full after:bg-primary"
                      : "text-muted-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button
              variant="outline"
              className={`rounded-xl ${
                isTransparent
                  ? "border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                  : "border-border text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              Sign Up
            </Button>
          </Link>
        </div>

        <button
          className={`md:hidden ${isTransparent ? "text-white" : "text-foreground"}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-2" role="navigation" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (link.href.startsWith("/#")) setActiveHash(link.href.slice(1))
                    if (link.href === "/") setActiveHash("")
                    setIsMobileMenuOpen(false)
                  }}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full rounded-xl border-border text-foreground">
                Log In
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full rounded-xl bg-primary text-primary-foreground">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
