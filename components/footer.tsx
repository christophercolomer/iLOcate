'use client';
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AboutUsModal } from "./about-us-modal";

export function Footer() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <footer className="border-t border-border bg-secondary">
      <AboutUsModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <div className="mx-auto max-w-[1200px] px-4 py-12 lg:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/dashboard" className="flex items-center gap-0">
              <Image
                src="/logo black line.svg"
                alt="iLOcate logo"
                width={50}
                height={50}
                className="h-6 w-6 object-contain"
              />
              <span className="text-lg font-semibold text-primary">iLOcate</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your ultimate tourism discovery platform for Iloilo City, Philippines. Explore places, food, attractions, and more.
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
              <button type="button" onClick={() => setAboutOpen(true)} className="text-left text-sm text-muted-foreground transition-colors hover:text-primary">About Us</button>
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
