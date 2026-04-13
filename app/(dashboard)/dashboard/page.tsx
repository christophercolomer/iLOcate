"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Maximize2, Star, MapPin, ArrowRight, Compass, Heart } from "lucide-react"
import dynamic from "next/dynamic"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { landmarks } from "@/lib/landmarks"
import { auth, db } from "@/lib/firebase"

type LikedItem = {
  id: string
  name: string
  category: "Place" | "Food"
  image: string
  rating?: number
  label?: string
}

const LIKES_STORAGE_KEY = "ilocate-liked-items"
const LIKES_UPDATED_EVENT = "ilocate-likes-updated"

const MapComponent = dynamic(() => import("@/components/map-leaflet"), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-secondary">Loading map...</div>,
})

const MAP_CENTER: [number, number] = [10.6969, 122.5644]
const MAP_ZOOM = 13

const HOME_PREVIEW_ROUTES = [
  {
    id: 1,
    name: "CPU - SM City Iloilo",
    code: "Jaro Route",
    stops: ["CPU", "Jaro Plaza", "Tagbak Terminal", "SM City Iloilo"],
    fare: "PHP 12",
    time: "~20 min",
  },
  {
    id: 2,
    name: "Molo - La Paz",
    code: "Molo Route",
    stops: ["Molo Church", "Iznart St", "JM Basa", "La Paz Market"],
    fare: "PHP 10",
    time: "~15 min",
  },
  {
    id: 3,
    name: "City Proper - Mandurriao",
    code: "Mandurriao Route",
    stops: ["Plazoleta Gay", "Ledesma St", "Diversion Rd", "SM Starmall"],
    fare: "PHP 11",
    time: "~18 min",
  },
  {
    id: 4,
    name: "Arevalo - City Proper",
    code: "Arevalo Route",
    stops: ["Villa Arevalo", "Molo", "General Luna St", "City Proper"],
    fare: "PHP 10",
    time: "~22 min",
  },
]

// Helper: assign placeholder images and ratings
const getImage = (name: string, type: string) => {
  if (type === "Food") return "/images/food/Local Food/iloilo-food.jpg"
  if (type === "Cafe") return "/images/food/Cafes/cafe.jpg"
  if (type === "Church") return "/images/places/Churches/miagao-church.jpg"
  if (type === "Museum") return "/images/places/Museums/ilomoca museum.webp"
  if (type === "Heritage" || type === "Urban") return "/images/places/Attractions/esplanade.jpg"
  if (type === "Mall") return "/images/banners/hero-iloilo(1).svg"
  return "/images/icons/placeholder.jpg"
}
const getRating = (type: string) => {
  if (type === "Food" || type === "Cafe") return 4.5
  if (type === "Heritage" || type === "Church") return 4.7
  if (type === "Museum") return 4.6
  if (type === "Urban") return 4.6
  if (type === "Mall") return 4.4
  return 4.0
}

const preferenceToLandmarkTypes: Record<string, string[]> = {
  "coffee-shops": ["Cafe"],
  restaurants: ["Food"],
  churches: ["Church"],
  museums: ["Museum"],
  "city-landmarks": ["Urban", "Heritage"],
  beaches: [],
  malls: ["Mall"],
}

function toLandmarkSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function parseLikedItems(raw: string | null): LikedItem[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is LikedItem => {
      return Boolean(
        item &&
          typeof item === "object" &&
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.image === "string"
      )
    })
  } catch {
    return []
  }
}

function readLikedItems() {
  if (typeof window === "undefined") return []
  return parseLikedItems(window.localStorage.getItem(LIKES_STORAGE_KEY))
}

const exploreCategories = [
  {
    name: "Mall",
    description: "Shopping and lifestyle hubs around Iloilo",
    image: "/images/places/Malls/sm city iloilo.jpg",
    href: "/dashboard/places?category=malls",
  },
  {
    name: "Churches",
    description: "Historic churches and spiritual destinations",
    image: "/images/places/Churches/miagao-church.jpg",
    href: "/dashboard/places?category=churches",
  },
  {
    name: "Museum",
    description: "Culture, heritage, and local history",
    image: "/images/places/Museums/ilomoca museum.webp",
    href: "/dashboard/places?category=museum",
  },
  {
    name: "City Landmark & Attraction",
    description: "Must-visit landmarks and iconic spots",
    image: "/images/places/Attractions/esplanade.jpg",
    href: "/dashboard/places?category=city-landmark-attraction",
  },
  {
    name: "Beaches",
    description: "Sun, sand, and scenic coastal getaways",
    image: "/images/places/Beach/sea garden.jpg",
    href: "/dashboard/places?category=beaches",
  },
  {
    name: "Local Food",
    description: "Beloved Iloilo flavors and specialties",
    image: "/images/food/Local Food/alicia's lapaz food.jpg",
    href: "/dashboard/food?category=local-food",
  },
  {
    name: "Cafes",
    description: "Coffee spots and cozy cafe experiences",
    image: "/images/food/Cafes/madge lapaz cafe.jpg",
    href: "/dashboard/food?category=cafes",
  },
  {
    name: "Restaurant",
    description: "Dining places for every craving",
    image: "/images/food/Restaurant/tytche food.jpg",
    href: "/dashboard/food?category=restaurants",
  },
]

function PlaceCard({
  place,
  isLiked,
  onSelect,
  onToggleLike,
}: {
  place: {
    name: string
    image: string
    category: string
    rating: number
    likeId: string
    landmarkSlug: string
    likeCategory: "Place" | "Food"
    label: string
  }
  isLiked: boolean
  onSelect: () => void
  onToggleLike: (event: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <article
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      role="button"
      tabIndex={0}
      className="group relative w-full flex-shrink-0 overflow-hidden rounded-2xl bg-card text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
        <div className="relative h-32 w-full overflow-hidden">
          <Image
            src={place.image}
            alt={place.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute left-2 top-2 rounded-full bg-black/55 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {place.category}
          </div>
          <button
            type="button"
            onClick={onToggleLike}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
            aria-label={isLiked ? `Unlike ${place.name}` : `Like ${place.name}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
          </button>
        </div>
        <div className="p-2.5">
          <h3
            className="text-sm font-semibold leading-snug text-foreground"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {place.name}
          </h3>
          <div className="mt-1.5 flex items-center">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-muted-foreground">{place.rating}</span>
            </div>
          </div>
        </div>
    </article>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const recommendedScrollRef = useRef<HTMLDivElement>(null)
  const autoScrollRafRef = useRef<number | null>(null)
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoTickingRef = useRef(false)
  const autoScrollUntilRef = useRef(0)
  const isPointerDownRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartScrollLeftRef = useRef(0)

  const [isAutoPaused, setIsAutoPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [preferences, setPreferences] = useState<string[]>([])
  const [likedItems, setLikedItems] = useState<LikedItem[]>([])
  const [selectedRecommendation, setSelectedRecommendation] = useState<{
    name: string
    image: string
    category: string
    rating: number
    likeId: string
    landmarkSlug: string
    likeCategory: "Place" | "Food"
    label: string
  } | null>(null)

  useEffect(() => {
    setLikedItems(readLikedItems())

    const syncLikes = () => setLikedItems(readLikedItems())
    window.addEventListener("storage", syncLikes)
    window.addEventListener(LIKES_UPDATED_EVENT, syncLikes)

    return () => {
      window.removeEventListener("storage", syncLikes)
      window.removeEventListener(LIKES_UPDATED_EVENT, syncLikes)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setPreferences([])
        return
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid))
        const savedPreferences = snap.data()?.preferences

        if (Array.isArray(savedPreferences)) {
          setPreferences(savedPreferences.filter((value): value is string => typeof value === "string"))
          return
        }
      } catch {
        // Fall back to default recommendations when preferences can't be loaded.
      }

      setPreferences([])
    })

    return () => unsubscribe()
  }, [])

  const selectedTypes = new Set(
    preferences.flatMap((preference) => preferenceToLandmarkTypes[preference] ?? [])
  )

  const shuffleLandmarks = (arr: typeof landmarks) => {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  const sourceLandmarks =
    selectedTypes.size > 0
      ? landmarks.filter((landmark) => selectedTypes.has(landmark.type))
      : shuffleLandmarks(landmarks)

  const recommendedLandmarks = sourceLandmarks.length > 0 ? sourceLandmarks : shuffleLandmarks(landmarks)
  const foodHotspots = landmarks.filter((landmark) => landmark.type === "Food" || landmark.type === "Cafe").length
  const culturalSpots = landmarks.filter((landmark) => ["Church", "Museum", "Heritage"].includes(landmark.type)).length
  const likedIds = new Set(likedItems.map((item) => item.id))

  const categoryPlaces = recommendedLandmarks.slice(0, 12).map((landmark) => ({
    name: landmark.name,
    image: landmark.imageUrl || getImage(landmark.name, landmark.type),
    category: landmark.type,
    rating: getRating(landmark.type),
    likeId: `${landmark.type === "Food" || landmark.type === "Cafe" ? "food" : "place"}-${toLandmarkSlug(landmark.name)}`,
    landmarkSlug: toLandmarkSlug(landmark.name),
    likeCategory: landmark.type === "Food" || landmark.type === "Cafe" ? "Food" as const : "Place" as const,
    label: landmark.type,
  }))

  // Duplicate for infinite scroll
  const scrollPlaces = [...categoryPlaces, ...categoryPlaces]

  const pauseAutoScroll = (resumeAfterMs = 2500) => {
    setIsAutoPaused(true)
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current)
    }
    resumeTimeoutRef.current = setTimeout(() => {
      if (!isPointerDownRef.current) {
        setIsAutoPaused(false)
      }
    }, resumeAfterMs)
  }

  useEffect(() => {
    const scroller = recommendedScrollRef.current
    if (!scroller) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return
      }

      event.preventDefault()
      scroller.scrollLeft += event.deltaY
      pauseAutoScroll()
    }

    scroller.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      scroller.removeEventListener("wheel", handleWheel)
    }
  }, [])

  useEffect(() => {
    const scroller = recommendedScrollRef.current
    if (!scroller) {
      return
    }

    let previousTimestamp = 0
    const pixelsPerSecond = 20

    const step = (timestamp: number) => {
      if (!previousTimestamp) {
        previousTimestamp = timestamp
      }

      if (!isAutoPaused) {
        const delta = timestamp - previousTimestamp
        const distance = (pixelsPerSecond * delta) / 1000
        const halfWidth = scroller.scrollWidth / 2

        if (halfWidth > 0) {
          autoTickingRef.current = true
          autoScrollUntilRef.current = performance.now() + 120
          if (scroller.scrollLeft >= halfWidth) {
            scroller.scrollLeft -= halfWidth
          }
          scroller.scrollLeft += distance
          autoTickingRef.current = false
        }
      }

      previousTimestamp = timestamp
      autoScrollRafRef.current = requestAnimationFrame(step)
    }

    autoScrollRafRef.current = requestAnimationFrame(step)

    return () => {
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current)
      }
    }
  }, [isAutoPaused])

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current)
      }
    }
  }, [])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroller = recommendedScrollRef.current
    if (!scroller) {
      return
    }

    isPointerDownRef.current = true
    pauseAutoScroll()

    dragStartXRef.current = event.clientX
    dragStartScrollLeftRef.current = scroller.scrollLeft
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroller = recommendedScrollRef.current
    if (!scroller || !isPointerDownRef.current) {
      return
    }

    const deltaX = event.clientX - dragStartXRef.current

    if (!isDragging && Math.abs(deltaX) < 6) {
      return
    }

    if (!isDragging) {
      setIsDragging(true)
      scroller.setPointerCapture(event.pointerId)
    }

    scroller.scrollLeft = dragStartScrollLeftRef.current - deltaX
    pauseAutoScroll()
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const scroller = recommendedScrollRef.current
    if (scroller?.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId)
    }

    isPointerDownRef.current = false
    setIsDragging(false)
    pauseAutoScroll()
  }

  const handlePointerCancel = () => {
    isPointerDownRef.current = false
    setIsDragging(false)
    pauseAutoScroll()
  }

  const handleManualScroll = () => {
    if (autoTickingRef.current) {
      return
    }
    if (performance.now() < autoScrollUntilRef.current) {
      return
    }
    pauseAutoScroll()
  }

  const toggleLike = (
    place: (typeof categoryPlaces)[number],
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation()

    const isAlreadyLiked = likedIds.has(place.likeId)
    const nextItems = isAlreadyLiked
      ? likedItems.filter((item) => item.id !== place.likeId)
      : [
          ...likedItems,
          {
            id: place.likeId,
            name: place.name,
            category: place.likeCategory,
            image: place.image,
            rating: place.rating,
            label: place.label,
          },
        ]

    setLikedItems(nextItems)
    window.localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(nextItems))
    window.dispatchEvent(new Event(LIKES_UPDATED_EVENT))
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-20 bg-[url('/images/banners/hero-iloilo(1).svg')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 -z-10 bg-white/20 backdrop-blur-md" />
      <div className="relative min-h-screen">
      {/* Map Section */}
      <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-secondary/80 via-secondary/50 to-secondary/0">
        <div className="relative h-[35vh] min-h-[300px] overflow-hidden lg:h-[40vh]">
          <MapComponent
            center={MAP_CENTER}
            zoom={MAP_ZOOM}
            routes={HOME_PREVIEW_ROUTES}
            landmarks={landmarks}
            selectedRoute={null}
            selectedLandmarkName={null}
            focusedLandmarkNames={[]}
            showLandmarks={false}
            showCenterMarker={false}
            showCurrentLocation={false}
            showLocateControl={false}
            requireClickToZoom={true}
          />

          <div className="pointer-events-none absolute inset-0 z-[450] bg-transparent" />

          <div className="pointer-events-none absolute left-4 right-4 top-4 z-[500] sm:left-auto sm:max-w-sm">
            <div className="rounded-2xl border border-white/35 bg-white/88 p-3.5 shadow-xl backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">City Navigator</p>
              <h1 className="mt-1 text-lg font-bold leading-tight text-foreground sm:text-xl">Explore Iloilo with Live Route Context</h1>
              <p className="mt-2 text-[13px] text-muted-foreground sm:text-sm">
                Preview key landmarks, food districts, and commute directions before opening the full interactive planner.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">{landmarks.length} spots mapped</span>
                <span className="rounded-full bg-accent/20 px-2 py-1 text-[11px] font-medium text-foreground">{foodHotspots} food hotspots</span>
                <span className="rounded-full bg-secondary px-2 py-1 text-[11px] font-medium text-foreground">{culturalSpots} cultural sites</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-[500] flex flex-wrap items-center gap-2 sm:right-auto sm:max-w-xl">
            <Link href="/dashboard/map" className="inline-flex">
              <Button size="sm" className="h-10 gap-2 rounded-xl bg-primary px-4 text-primary-foreground shadow-lg hover:bg-primary/90">
                <Maximize2 className="h-4 w-4" />
                Open Full Map
              </Button>
            </Link>
            <Link href="/dashboard/map" className="inline-flex">
              <Button size="sm" variant="outline" className="h-10 gap-2 rounded-xl border-white/60 bg-white/90 px-4 text-foreground hover:bg-white">
                <Compass className="h-4 w-4" />
                What's near?
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Infinite Scroll Categories */}
      <div className="mx-auto max-w-[2400px] px-4 py-8 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Recommended For You</h2>
            <p className="mt-1 text-sm text-muted-foreground">Based on your preferences</p>
          </div>
          <Link href="/dashboard/places" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {/* Horizontal infinite scroll */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-secondary/95 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-secondary/95 to-transparent" />
          <div
            ref={recommendedScrollRef}
            className={`flex gap-4 overflow-x-auto overflow-y-hidden px-3 py-1 pb-3 scroll-smooth [scrollbar-width:thin] [scrollbar-color:hsl(var(--primary)/0.45)_transparent] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/45 hover:[&::-webkit-scrollbar-thumb]:bg-primary/65 ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ scrollSnapType: "x mandatory" }}
            onMouseEnter={() => setIsAutoPaused(true)}
            onMouseLeave={() => pauseAutoScroll(1800)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onScroll={handleManualScroll}
          >
            {scrollPlaces.map((place, i) => (
              <div key={`scroll-${i}`} className="w-[240px] flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
                <PlaceCard
                  place={place}
                  isLiked={likedIds.has(place.likeId)}
                  onSelect={() => setSelectedRecommendation(place)}
                  onToggleLike={(event) => toggleLike(place, event)}
                />
              </div>
            ))}
          </div>
        </div>

        {selectedRecommendation && (
          <div className="fixed inset-0 z-[3000] overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:flex sm:items-center sm:justify-center" onClick={() => setSelectedRecommendation(null)}>
            <div className="relative z-[3001] mx-auto mt-6 max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl sm:mt-0" onClick={(event) => event.stopPropagation()}>
              <div className="mb-4 flex items-center gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                  <Image src={selectedRecommendation.image} alt={selectedRecommendation.name} fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedRecommendation.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedRecommendation.category}</p>
                </div>
              </div>

              <div className="mb-4 rounded-xl bg-secondary p-4">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Route Details</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>From: Your Location</span>
                    <span>To: {selectedRecommendation.name}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span>Estimated Commute:</span>
                    <span className="font-semibold text-foreground">~20 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estimated Cost:</span>
                    <span className="font-semibold text-foreground">PHP 10 - PHP 30</span>
                  </div>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-border p-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">Suggested Route</p>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Your Location</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span>{selectedRecommendation.name}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  className="h-11 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    const target = selectedRecommendation.landmarkSlug
                    setSelectedRecommendation(null)
                    router.push(`/dashboard/map?landmark=${target}&go=1`)
                  }}
                >
                  Go to this place
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-border text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedRecommendation(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Category Grid */}
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-foreground">Explore by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {exploreCategories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-28 w-full overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
