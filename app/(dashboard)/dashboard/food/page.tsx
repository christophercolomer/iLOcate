"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Star, MapPin, ArrowRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { landmarks } from "@/lib/landmarks"

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

// Helper: assign placeholder images, ratings, and locations
const getImage = (name: string, type: string) => {
  if (type === "Food" || type === "Cafe") return "/images/food/iloilo-food.jpg"
  if (type === "Heritage" || type === "Church") return "/images/places/miagao-church.jpg"
  if (type === "Urban") return "/images/places/esplanade.jpg"
  return "/images/icons/placeholder.jpg"
}
const getFoodImage = (imageUrl: string | undefined, name: string, type: string) => {
  if (imageUrl && imageUrl !== "/images/icons/placeholder.jpg") {
    return imageUrl
  }
  return getImage(name, type)
}
const getRating = (type: string) => {
  if (type === "Food" || type === "Cafe") return 4.5
  if (type === "Heritage" || type === "Church") return 4.7
  if (type === "Urban") return 4.6
  return 4.0
}
const getLocation = (name: string) => {
  return "Iloilo"
}

const getFoodCategory = (name: string, type: string) => {
  const normalizedName = name.toLowerCase()
  const isCafe = type === "Cafe" || /cafe|coffee|coff|latt[eé]|book latté|café/.test(normalizedName)
  const isRestaurant = /restaurant|resto|grill|grill and|seafood|kitchen|house|diner|canteen|eatery|branch|batchoy|kansi|talabahan/.test(normalizedName)
  const isStreetFood = /sari-sari|street|street food|pulutan|tinapay|kakanin|tempura|puso|barbecue|bihon|batchoy/i.test(normalizedName)

  if (type === "Cafe" || (type === "Food" && isCafe && !/restaurant|resto|grill|kitchen|house|branch/.test(normalizedName))) {
    return "Cafes"
  }

  if (type === "Food" && isRestaurant) {
    return "Restaurants"
  }

  if (type === "Food" && isStreetFood) {
    return "Street Food"
  }

  return "Local Food"
}

const allFood = landmarks.filter((l) => l.type === "Food" || l.type === "Cafe").map((l, i) => ({
  id: i + 1,
  likeId: `food-${i + 1}-${l.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  name: l.name,
  image: getFoodImage(l.imageUrl, l.name, l.type),
  category: getFoodCategory(l.name, l.type),
  rating: getRating(l.type),
  label: getFoodCategory(l.name, l.type),
  location: getLocation(l.name),
}))

const categories = ["All", "Local Food", "Cafes", "Restaurants", "Street Food"]

export default function FoodPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [showRouteModal, setShowRouteModal] = useState<{ name: string; image: string } | null>(null)
  const [likedItems, setLikedItems] = useState<LikedItem[]>([])

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
    const category = searchParams.get("category")?.toLowerCase().trim()
    if (!category) {
      return
    }

    const categoryFromQuery: Record<string, string> = {
      "local-food": "Local Food",
      cafes: "Cafes",
      restaurant: "Restaurants",
      restaurants: "Restaurants",
      "street-food": "Street Food",
    }

    const resolvedCategory = categoryFromQuery[category]
    if (resolvedCategory) {
      setActiveCategory(resolvedCategory)
    }
  }, [searchParams])

  const likedIds = new Set(likedItems.map((item) => item.id))

  const toggleLike = (food: (typeof allFood)[number], event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    const isAlreadyLiked = likedIds.has(food.likeId)
    const nextItems = isAlreadyLiked
      ? likedItems.filter((item) => item.id !== food.likeId)
      : [
          ...likedItems,
          {
            id: food.likeId,
            name: food.name,
            category: "Food",
            image: food.image,
            rating: food.rating,
            label: food.label,
          },
        ]

    setLikedItems(nextItems)
    window.localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(nextItems))
    window.dispatchEvent(new Event(LIKES_UPDATED_EVENT))
  }

  const filtered = allFood.filter((f) => {
    const matchesCategory = activeCategory === "All" || f.category === activeCategory
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Popular Restaurants & Food</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} food spots to try</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search food spots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((food) => (
          <article
            key={food.id}
            onClick={() => setShowRouteModal({ name: food.name, image: food.image })}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                setShowRouteModal({ name: food.name, image: food.image })
              }
            }}
            role="button"
            tabIndex={0}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-card text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <Image src={food.image} alt={food.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              <div className="absolute left-2 top-2 rounded-full bg-accent/90 px-2.5 py-0.5 text-[10px] font-semibold text-accent-foreground">{food.category}</div>
              <button
                type="button"
                onClick={(event) => toggleLike(food, event)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
                aria-label={likedIds.has(food.likeId) ? `Unlike ${food.name}` : `Like ${food.name}`}
              >
                <Heart className={`h-4 w-4 ${likedIds.has(food.likeId) ? "fill-red-500 text-red-500" : "text-white"}`} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground">{food.name}</h3>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{food.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-muted-foreground">{food.rating}</span>
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
                <p className="text-sm text-muted-foreground">Explore this food spot</p>
              </div>
            </div>
            <div className="mb-4 rounded-xl bg-secondary p-4">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Route Details</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between"><span>From: Your Location</span><span>To: {showRouteModal.name}</span></div>
                <div className="flex justify-between border-t border-border pt-2"><span>Estimated Commute:</span><span className="font-semibold text-foreground">~15 min</span></div>
                <div className="flex justify-between"><span>Estimated Cost:</span><span className="font-semibold text-foreground">PHP 10 - PHP 30</span></div>
              </div>
            </div>
            <div className="mb-4 rounded-xl border border-border p-4">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Suggested Route</p>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Your Location</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span>{showRouteModal.name}</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                className="h-11 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  const target = showRouteModal?.name
                  if (!target) return
                  setShowRouteModal(null)
                  router.push(`/dashboard/map?landmark=${toLandmarkSlug(target)}`)
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
