"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Search, Star, MapPin, ArrowRight, Heart } from "lucide-react"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { landmarks } from "@/lib/landmarks"
import { auth, db } from "@/lib/firebase"

function toLandmarkSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

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

function getImage(name: string, type: string, imageUrl?: string) {
  if (imageUrl && imageUrl !== "/images/icons/placeholder.jpg") return imageUrl;
  if (type === "Food") return "/images/food/Local Food/iloilo-food.jpg";
  if (type === "Cafe") return "/images/food/Cafes/cafe.jpg";
  if (type === "Church") return "/images/places/Churches/miagao-church.jpg";
  if (type === "Museum") return "/images/places/Museums/ilomoca museum.webp";
  if (type === "Heritage" || type === "Urban") return "/images/places/Attractions/esplanade.jpg";
  return "/images/icons/placeholder.jpg";
}

const allPlaces = landmarks.map((l, i) => ({
  id: i + 1,
  likeId: `place-${i + 1}-${l.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  landmarkSlug: toLandmarkSlug(l.name),
  name: l.name,
  image: getImage(l.name, l.type, l.imageUrl),
  category: l.type,
  rating: getRating(l.type),
  label: l.type,
  location: getLocation(l.name),
}))

// Helper: assign placeholder images, ratings, and locations
function getRating(type: string) {
  if (type === "Food" || type === "Cafe") return 4.5
  if (type === "Heritage" || type === "Church") return 4.7
  if (type === "Urban") return 4.6
  return 4.0
}
function getLocation(name: string) {
  // Optionally parse location from name or set a default
  return "Iloilo"
}

const categories = ["All", "Malls", "Churches", "Museum", "City Landmark & Attraction", "Beaches"]

const mallKeywords = ["mall", "sm ", "robinsons", "gaisano", "festive", "megaworld", "ayala", "central", "city mall", "mall of", "shangri-la"]

const preferenceToLandmarkTypes: Record<string, string[]> = {
  "coffee-shops": ["Cafe"],
  restaurants: ["Food"],
  churches: ["Church"],
  museums: ["Museum"],
  "city-landmarks": ["Urban", "Heritage"],
  beaches: ["Beach"],
  malls: [],
}

export default function PlacesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [showRouteModal, setShowRouteModal] = useState<{ name: string; image: string; landmarkSlug: string } | null>(null)
  const [likedItems, setLikedItems] = useState<LikedItem[]>([])
  const [preferences, setPreferences] = useState<string[]>([])

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
        // Keep the default Places behavior if preferences cannot be loaded.
      }

      setPreferences([])
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const category = searchParams.get("category")?.toLowerCase().trim()
    if (!category) {
      return
    }

    const categoryFromQuery: Record<string, string> = {
      malls: "Malls",
      churches: "Churches",
      museum: "Museum",
      museums: "Museum",
      "city-landmark-attraction": "City Landmark & Attraction",
      "city-landmarks": "City Landmark & Attraction",
      beaches: "Beaches",
      beach: "Beaches",
    }

    const resolvedCategory = categoryFromQuery[category]
    if (resolvedCategory) {
      setActiveCategory(resolvedCategory)
    }
  }, [searchParams])

  const likedIds = new Set(likedItems.map((item) => item.id))
  const preferredTypes = new Set(preferences.flatMap((preference) => preferenceToLandmarkTypes[preference] ?? []))
  const hasPreferredTypes = preferredTypes.size > 0

  const toggleLike = (place: (typeof allPlaces)[number], event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    const isAlreadyLiked = likedIds.has(place.likeId)
    const nextItems: LikedItem[] = isAlreadyLiked
      ? likedItems.filter((item) => item.id !== place.likeId)
      : [
          ...likedItems,
          {
            id: place.likeId,
            name: place.name,
            category: "Place",
            image: place.image,
            rating: place.rating,
            label: place.label,
          },
        ]

    setLikedItems(nextItems)
    window.localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(nextItems))
    window.dispatchEvent(new Event(LIKES_UPDATED_EVENT))
  }

  const filtered = allPlaces.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())

    if (p.category === "Food" || p.category === "Cafe") return false

    const normalizedCategory = p.category.toLowerCase().trim()
    const normalizedActive = activeCategory.toLowerCase().trim()

    const matchesCategory =
      normalizedActive === "all" ||
      (normalizedActive === "churches" && normalizedCategory === "church") ||
      (normalizedActive === "museum" && normalizedCategory === "museum") ||
      (normalizedActive === "city landmark & attraction" &&
        (normalizedCategory === "urban" || normalizedCategory === "heritage")) ||
      (normalizedActive === "beaches" && normalizedCategory === "beach") ||
      (normalizedActive === "malls" &&
        (normalizedCategory === "mall" || mallKeywords.some((keyword) => p.name.toLowerCase().includes(keyword))))

    return matchesCategory && matchesSearch
  })

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Popular Places</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasPreferredTypes && activeCategory === "All"
              ? `${filtered.length} destinations to explore (showing all places)`
              : `${filtered.length} destinations to explore`}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search places..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((place) => (
          <article
            key={place.id}
            onClick={() => setShowRouteModal({ name: place.name, image: place.image, landmarkSlug: place.landmarkSlug })}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                setShowRouteModal({ name: place.name, image: place.image, landmarkSlug: place.landmarkSlug })
              }
            }}
            role="button"
            tabIndex={0}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-card text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <Image src={place.image} alt={place.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              <div className="absolute left-2 top-2 rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">{place.category}</div>
              <button
                type="button"
                onClick={(event) => toggleLike(place, event)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
                aria-label={likedIds.has(place.likeId) ? `Unlike ${place.name}` : `Like ${place.name}`}
              >
                <Heart className={`h-4 w-4 ${likedIds.has(place.likeId) ? "fill-red-500 text-red-500" : "text-white"}`} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground">{place.name}</h3>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{place.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-muted-foreground">{place.rating}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Route Explorer Modal */}
      {showRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowRouteModal(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                <Image src={showRouteModal.image} alt={showRouteModal.name} fill className="object-cover" sizes="64px" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{showRouteModal.name}</h3>
                <p className="text-sm text-muted-foreground">Explore this destination</p>
              </div>
            </div>
            <div className="mb-4 rounded-xl bg-secondary p-4">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Route Details</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>From: Your Location</span><span>To: {showRouteModal.name}</span></div>
                <div className="flex justify-between border-t border-border pt-2"><span>Estimated Commute:</span><span className="font-semibold text-foreground">~25 min</span></div>
                <div className="flex justify-between"><span>Estimated Cost:</span><span className="font-semibold text-foreground">PHP 15 - PHP 45</span></div>
              </div>
            </div>
            <div className="mb-4 rounded-xl border border-border p-4">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Suggested Route</p>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Your Location</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span>Tagbak Terminal</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span>{showRouteModal.name}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                className="h-11 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  const target = showRouteModal?.landmarkSlug
                  if (!target) return
                  setShowRouteModal(null)
                  router.push(`/dashboard/map?landmark=${target}&go=1`)
                }}
              >
                Go to this place
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl border-border text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setShowRouteModal(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
