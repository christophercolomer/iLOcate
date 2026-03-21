import Link from "next/link"
import { MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-[1200px] px-4 py-12 lg:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">
                iLO<span className="text-primary">cate</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your ultimate tourism discovery platform for Iloilo City, Philippines. Explore places, food, events, and more.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">Explore</h4>
            <nav className="flex flex-col gap-2" aria-label="Explore links">
              <Link href="/#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-primary">How it Works</Link>
              <Link href="/#faqs" className="text-sm text-muted-foreground transition-colors hover:text-primary">FAQs</Link>
              <Link href="/premium" className="text-sm text-muted-foreground transition-colors hover:text-primary">Premium</Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <nav className="flex flex-col gap-2" aria-label="Company links">
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">About Us</Link>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contact</Link>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">Privacy Policy</Link>
              <Link href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">Terms of Service</Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">Connect</h4>
            <nav className="flex flex-col gap-2" aria-label="Social links">
              <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">Facebook</a>
              <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">Instagram</a>
              <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">Twitter</a>
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} iLOcate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
