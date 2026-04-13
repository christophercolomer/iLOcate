"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Star, Bookmark, X, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { landmarks } from "@/lib/landmarks"
import { useAuth } from "@/lib/auth-context"
import { loadAndDecodeRoutes, type DecodedRoute } from "@/lib/route-decoder"

const MapLeaflet = dynamic(() => import("@/components/map-leaflet"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
})

// Group landmarks by type
const churches = landmarks.filter(l => l.type === "Church")
const foodPlaces = landmarks.filter(l => l.type === "Food")
const cafes = landmarks.filter(l => l.type === "Cafe")
const heritages = landmarks.filter(l => l.type === "Heritage")

function getImage(name: string, type: string, imageUrl?: string) {
  if (imageUrl && imageUrl !== "/images/icons/placeholder.jpg") return imageUrl
  if (type === "Food") return "/images/food/Local Food/iloilo-food.jpg"
  if (type === "Cafe") return "/images/food/Cafes/cafe.jpg"
  if (type === "Church") return "/images/places/Churches/miagao-church.jpg"
  if (type === "Museum") return "/images/places/Museums/ilomoca museum.webp"
  if (type === "Heritage" || type === "Urban") return "/images/places/Attractions/esplanade.jpg"
  return "/images/icons/placeholder.jpg"
}
function getRating(type: string) {
  if (type === "Food" || type === "Cafe") return 4.5
  if (type === "Heritage" || type === "Church") return 4.7
  if (type === "Urban") return 4.6
  return 4.0
}

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
  const [pujRoutes, setPujRoutes] = useState<DecodedRoute[]>([])
  const [allRoutes, setAllRoutes] = useState<DecodedRoute[]>([])
  const [loadingRoutes, setLoadingRoutes] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const routeListRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // Load PUJ routes from data.json
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoadingRoutes(true)
      try {
        const decodedRoutes = await loadAndDecodeRoutes()
        const sortedRoutes = [...decodedRoutes].sort((a, b) => {
          const aNum = Number.parseInt(a.routeNumber.replace(/[^0-9]/g, ""), 10)
          const bNum = Number.parseInt(b.routeNumber.replace(/[^0-9]/g, ""), 10)

          if (aNum !== bNum) {
            return aNum - bNum
          }

          return a.routeNumber.localeCompare(b.routeNumber)
        })

        setAllRoutes(sortedRoutes)
        setPujRoutes(sortedRoutes)
      } catch (error) {
        console.error("Error loading PUJ routes:", error)
        setAllRoutes([])
        setPujRoutes([])
      } finally {
        setLoadingRoutes(false)
      }
    }

    fetchRoutes()
  }, [])

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
  const pujRouteCount = allRoutes.length
  const foodSpotCount = landmarks.filter((landmark) => landmark.type === "Food" || landmark.type === "Cafe").length
  const placeSpotCount = landmarks.filter((landmark) => landmark.type !== "Food" && landmark.type !== "Cafe").length

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY)
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  useEffect(() => {
    if (!showMapModal) return

    const { style } = document.body
    const previousOverflow = style.overflow
    const previousPaddingRight = style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    style.overflow = "hidden"
    if (scrollbarWidth > 0) {
      style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      style.overflow = previousOverflow
      style.paddingRight = previousPaddingRight
    }
  }, [showMapModal])

  useEffect(() => {
    if (!showMapModal) return
    routeListRef.current?.scrollTo({ top: 0 })
  }, [showMapModal])

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
            src="/images/banners/hero-iloilo(1).svg"
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
        
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1300px] items-center px-4 pt-[12px] lg:px-8 xl:px-10">
          <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="flex max-w-lg flex-1 flex-col rounded-3xl border border-white/15 bg-white/[0.06] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.28)] backdrop-blur-sm md:p-7">
              <Link
                href="/dashboard"
                className="mb-4 inline-flex w-fit items-center gap-0 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                <Image
                  src="/ilocate No BG.svg"
                  alt="iLOcate logo"
                  width={50}
                  height={50}
                  className="h-6 w-6 object-contain"
                />
                <span className="text-xs font-medium text-white/90">Navigation Tool for Iloilo</span>
              </Link>

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
                <p className="mx-auto mt-2 inline-flex w-fit -translate-x-2 whitespace-nowrap rounded-full border border-primary/60 bg-primary/20 px-4 py-2 text-xs font-semibold tracking-wide text-primary backdrop-blur-sm sm:text-sm md:text-base">
                  Find your way. Feel the Love. Your gentle guide in Iloilo
                </p>
              </div>

              <p className="mt-6 max-w-md text-pretty text-sm leading-relaxed text-white/75 md:text-base">
                Navigate Iloilo with confidence. Discover the best routes, places, food, and hidden gems. View PUJ routes instantly or sign in to unlock personalized recommendations.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
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
                  <p className="text-3xl font-bold text-white">{loadingRoutes ? "..." : `20+`}</p>
                  <p className="text-xs text-white/50">PUJ Routes</p>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div>
                  <p className="text-3xl font-bold text-white">{`50+`}</p>
                  <p className="text-xs text-white/50">Places Spots</p>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div>
                  <p className="text-3xl font-bold text-white">{`40+`}</p>
                  <p className="text-xs text-white/50">Food Spots</p>
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
                      image={getImage(dest.name, dest.type, dest.imageUrl)}
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
                      image={getImage(dest.name, dest.type, dest.imageUrl)}
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
                  image={getImage(dest.name, dest.type, dest.imageUrl)}
                  rating={getRating(dest.type)}
                  size="default"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
      </section>

      {/* Map & Routes Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-card shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setShowMapModal(false)
                setSelectedRouteId(null)
              }}
              className="absolute right-4 top-4 z-10 rounded-full bg-muted p-2 text-foreground transition-colors hover:bg-muted/80"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="grid h-[620px] gap-6 p-6 md:grid-cols-2">
              {/* Map Side */}
              <div className="relative h-full rounded-xl overflow-hidden bg-muted">
                <MapLeaflet
                  center={[10.7202, 122.5621]}
                  zoom={13}
                  routes={[]}
                  landmarks={[]}
                  selectedRoute={selectedRouteId}
                  showAllRoutes={selectedRouteId === null}
                  showLandmarks={false}
                  showCenterMarker={false}
                  showCurrentLocation={false}
                  showLocateControl={false}
                  requireClickToZoom={false}
                  decodedRoutes={allRoutes}
                />
              </div>

              {/* Routes List */}
              <div className="flex h-full min-h-0 flex-col gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">PUJ Routes in Iloilo</h2>
                  <p className="mt-1 text-muted-foreground">
                    Click a route to view it on the map
                  </p>
                  {!loadingRoutes && pujRoutes.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">Showing {pujRoutes.length} routes</p>
                  )}
                </div>

                <div
                  ref={routeListRef}
                  className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.45)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/45 hover:[&::-webkit-scrollbar-thumb]:bg-primary/65"
                >
                  {loadingRoutes ? (
                    <p className="text-sm text-muted-foreground">Loading routes...</p>
                  ) : pujRoutes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No routes available</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {pujRoutes.map((route) => (
                      <button
                        type="button"
                        key={route.id}
                        onClick={() => setSelectedRouteId(selectedRouteId === route.id ? null : route.id)}
                        className={`rounded-lg border p-4 text-left transition-all ${
                          selectedRouteId === route.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-muted/50 hover:border-primary hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: route.routeColor || "#3b82f6" }}
                          />
                          <h3 className="font-semibold text-foreground">{route.routeNumber} - {route.routeName}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{route.vehicleTypeName}</p>
                      </button>
                      ))}
                    </div>
                  )}
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

    </>
  )
}
