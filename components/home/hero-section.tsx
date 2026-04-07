"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Star, Bookmark, MapPin, X, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { landmarks } from "@/lib/landmarks"
import { useAuth } from "@/lib/auth-context"

// Group landmarks by type
const churches = landmarks.filter(l => l.type === "Church")
const foodPlaces = landmarks.filter(l => l.type === "Food")
const cafes = landmarks.filter(l => l.type === "Cafe")
const heritages = landmarks.filter(l => l.type === "Heritage")

function getImage(type: string) {
  if (type === "Food" || type === "Cafe") return "/images/iloilo-food.jpg"
  if (type === "Heritage" || type === "Church") return "/images/miagao-church.jpg"
  if (type === "Urban") return "/images/esplanade.jpg"
  return "/images/placeholder.jpg"
}
function getRating(type: string) {
  if (type === "Food" || type === "Cafe") return 4.5
  if (type === "Heritage" || type === "Church") return 4.7
  if (type === "Urban") return 4.6
  return 4.0
}

const pujRoutes = [
  { name: "Molo Route", fare: "₱8-10", stops: "City - Molo Church" },
  { name: "Jaro Route", fare: "₱8-10", stops: "City - Jaro Cathedral" },
  { name: "Mandurriao Route", fare: "₱10-12", stops: "City - Mandurriao District" },
  { name: "Lapuz Route", fare: "₱12-15", stops: "City - Lapuz Coastal" },
  { name: "Arevalo Route", fare: "₱10-12", stops: "City - Arevalo District" },
  { name: "Gibon-Garlite Route", fare: "₱15-20", stops: "City - Gibon Market" },
]

function DestinationCard({
  name,
  location,
  image,
  rating,
  size = "default",
}: {
  name: string
  location: string
  image: string
  rating: number
  size?: "default" | "large"
}) {
  const isLarge = size === "large"
  return (
    <div
      className={`group relative flex-shrink-0 overflow-hidden rounded-2xl ${
        isLarge ? "h-[280px] w-[220px] md:h-[320px] md:w-[260px]" : "h-[200px] w-[160px] md:h-[240px] md:w-[200px]"
      }`}
    >
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="260px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <button
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/40"
        aria-label={`Bookmark ${name}`}
      >
        <Bookmark className="h-4 w-4 text-white" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-sm font-semibold text-white md:text-base">{name}</h3>
        <p className="mt-0.5 text-xs text-white/70">{location}</p>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-white/30 text-white/30"}`}
            />
          ))}
          <span className="ml-1 text-xs text-white/70">{rating}</span>
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0)
  const [showMapModal, setShowMapModal] = useState(false)
  const { user } = useAuth()

  // For guests, show a mix of suggestions from all categories (limit to 8, round-robin)
  const guestSuggestions = []
  const maxSuggestions = 8
  let i = 0
  while (guestSuggestions.length < maxSuggestions) {
    if (churches[i]) guestSuggestions.push(churches[i])
    if (foodPlaces[i]) guestSuggestions.push(foodPlaces[i])
    if (cafes[i]) guestSuggestions.push(cafes[i])
    if (heritages[i]) guestSuggestions.push(heritages[i])
    i++
    if (!churches[i] && !foodPlaces[i] && !cafes[i] && !heritages[i]) break
  }
  const guestSuggestionsLimited = guestSuggestions.slice(0, maxSuggestions)

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  return (
    <>
      <section className="relative -mt-[72px] h-screen min-h-[600px] w-full overflow-hidden">
        {/* Animated Map Background */}
        <div className="absolute inset-0 opacity-[0.08]">
          <svg
            viewBox="0 0 1200 800"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="map-grid"
                x="0"
                y="0"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-primary"
                />
              </pattern>
            </defs>
            <rect width="1200" height="800" fill="url(#map-grid)" />
          </svg>
        </div>

        {/* Floating Map Markers */}
        <div className="pointer-events-none absolute inset-0">
          {[
            { top: "20%", left: "15%", delay: "0s" },
            { top: "40%", left: "25%", delay: "0.2s" },
            { top: "60%", left: "35%", delay: "0.4s" },
            { top: "30%", left: "65%", delay: "0.6s" },
            { top: "50%", left: "75%", delay: "0.8s" },
            { top: "70%", left: "55%", delay: "1s" },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute h-3 w-3 rounded-full bg-primary/30 animate-pulse"
              style={{
                top: pos.top,
                left: pos.left,
                animationDelay: pos.delay,
              }}
            >
              <div className="absolute inset-0 h-3 w-3 rounded-full bg-primary/50 animate-ping" />
            </div>
          ))}
        </div>

        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <Image
            src="/images/hero-iloilo(1).svg"
            alt="Stunning view of Iloilo City, Philippines"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={90}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/50 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1200px] items-center px-4 pt-[12px] lg:px-6">
          <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="flex max-w-xl flex-1 flex-col">
              {/* Navigation Tool Badge */}
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-white/90">Navigation Tool for Iloilo</span>
              </div>

              {/* Main Heading - Emphasize iLOcate */}
              <div className="space-y-1">
                <h1 className="text-6xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl">
                  <span className="block bg-primary bg-clip-text text-transparent">
                    iLOcate
                  </span>
                </h1>
                <h2 className="text-3xl font-semibold text-white/90 sm:text-4xl">
                  Explore Iloilo Like a Local
                </h2>
              </div>

              <p className="mt-6 max-w-md text-pretty text-sm leading-relaxed text-white/75 md:text-base">
                Navigate Iloilo with confidence. Discover the best routes, places, food, and hidden gems. View PUJ routes instantly or sign in to unlock personalized recommendations.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={() => setShowMapModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
                >
                  <Map className="h-5 w-5" />
                  View Routes
                </button>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="rounded-xl bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 border border-white/20"
                  >
                    Explore More
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-sm text-white/70">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
                  Log in
                </Link>
              </p>

              <div className="mt-10 flex items-center gap-8">
                <div>
                  <p className="text-3xl font-bold text-white">50+</p>
                  <p className="text-xs text-white/50">Destinations</p>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div>
                  <p className="text-3xl font-bold text-white">100+</p>
                  <p className="text-xs text-white/50">Food Spots</p>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div>
                  <p className="text-3xl font-bold text-white">20+</p>
                  <p className="text-xs text-white/50">Events</p>
                </div>
              </div>
            </div>

            <div className="hidden flex-shrink-0 items-end gap-4 lg:flex">
              <div className="relative h-[480px] overflow-hidden">
                <div className="absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="animate-scroll-up flex flex-col gap-4">
                  {(user ? landmarks : guestSuggestionsLimited).map((dest, i) => (
                    <DestinationCard
                      key={`col1-${dest.name}-${dest.type}-${i}`}
                      name={dest.name}
                      location="Iloilo"
                      image={getImage(dest.type)}
                      rating={getRating(dest.type)}
                      size="large"
                    />
                  ))}
                </div>
              </div>

              <div className="relative h-[480px] overflow-hidden">
                <div className="absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="animate-scroll-down flex flex-col gap-4">
                  {(user ? [...landmarks].reverse() : [...guestSuggestionsLimited].reverse()).map((dest, i) => (
                    <DestinationCard
                      key={`col2-${dest.name}-${dest.type}-${i}`}
                      name={dest.name}
                      location="Iloilo"
                      image={getImage(dest.type)}
                      rating={getRating(dest.type)}
                      size="default"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 lg:hidden">
              {(user ? landmarks.slice(0, 8) : guestSuggestionsLimited).map((dest, i) => (
                <DestinationCard
                  key={`mobile-${dest.name}-${dest.type}-${i}`}
                  name={dest.name}
                  location="Iloilo"
                  image={getImage(dest.type)}
                  rating={getRating(dest.type)}
                  size="default"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Map & Routes Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-card shadow-2xl">
            <button
              onClick={() => setShowMapModal(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-muted p-2 text-foreground transition-colors hover:bg-muted/80"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Map Side */}
              <div className="relative h-96 rounded-xl overflow-hidden bg-muted md:h-auto">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=122.54,10.69,122.60,10.74&layer=mapnik"
                  className="h-full w-full"
                  title="Iloilo City Map"
                  style={{ border: "none" }}
                />
              </div>

              {/* Routes List */}
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">PUJ Routes in Iloilo</h2>
                  <p className="mt-1 text-muted-foreground">
                    Popular transportation routes for exploring the city
                  </p>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto max-h-80">
                  {pujRoutes.map((route, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-muted/50 p-4 transition-all hover:border-primary hover:bg-muted"
                    >
                      <h3 className="font-semibold text-foreground">{route.name}</h3>
                      <p className="text-sm text-muted-foreground">{route.stops}</p>
                      <p className="mt-2 text-sm font-semibold text-primary">Fare: {route.fare}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-4">
                  <Link href="/signup" className="w-full">
                    <Button className="w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                      Sign Up for Detailed Routes
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Destinations Section */}
      {user && (
        <section className="py-12 bg-background">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4 text-primary">Churches</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {churches.map((l, i) => (
                <DestinationCard
                  key={`${l.name}-${l.type}-${i}`}
                  name={l.name}
                  location="Iloilo"
                  image={getImage(l.type)}
                  rating={getRating(l.type)}
                />
              ))}
            </div>
            <h2 className="text-2xl font-bold mb-4 text-primary">Food</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {foodPlaces.map((l, i) => (
                <DestinationCard
                  key={`${l.name}-${l.type}-${i}`}
                  name={l.name}
                  location="Iloilo"
                  image={getImage(l.type)}
                  rating={getRating(l.type)}
                />
              ))}
            </div>
            <h2 className="text-2xl font-bold mb-4 text-primary">Cafes</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {cafes.map((l, i) => (
                <DestinationCard
                  key={`${l.name}-${l.type}-${i}`}
                  name={l.name}
                  location="Iloilo"
                  image={getImage(l.type)}
                  rating={getRating(l.type)}
                />
              ))}
            </div>
            <h2 className="text-2xl font-bold mb-4 text-primary">Heritage Sites</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {heritages.map((l, i) => (
                <DestinationCard
                  key={`${l.name}-${l.type}-${i}`}
                  name={l.name}
                  location="Iloilo"
                  image={getImage(l.type)}
                  rating={getRating(l.type)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
