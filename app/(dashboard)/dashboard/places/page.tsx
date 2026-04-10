"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, Star, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { landmarks } from "@/lib/landmarks"

function getImage(name: string, type: string, imageUrl?: string) {
  if (imageUrl && imageUrl !== "/images/icons/placeholder.jpg") return imageUrl;
  if (type === "Food") return "/images/food/iloilo-food.jpg";
  if (type === "Cafe") return "/images/food/cafe.jpg";
  if (type === "Church" || type === "Museum") {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `/images/places/${slug}.jpg`;
  }
  return "/images/icons/placeholder.jpg";
}

const allPlaces = landmarks.map((l, i) => ({
  id: i + 1,
  name: l.name,
  image: getImage(l.name, l.type, l.imageUrl),
  category: l.type,
  rating: getRating(l.type),
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

const categories = ["All", "Malls", "Churches", "Museum", "City Landmark & Attraction"]

const mallKeywords = ["mall", "sm ", "robinsons", "gaisano", "festive", "megaworld", "ayala", "central", "city mall", "mall of", "shangri-la"]

export default function PlacesPage() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [search, setSearch] = useState("")
  const [showRouteModal, setShowRouteModal] = useState<{ name: string; image: string } | null>(null)

  const filtered = allPlaces.filter((p) => {
    if (p.category === "Food" || p.category === "Cafe") return false

    const normalizedCategory = p.category.toLowerCase().trim()
    const normalizedActive = activeCategory.toLowerCase().trim()

    const matchesCategory =
      normalizedActive === "all" ||
      (normalizedActive === "churches" && normalizedCategory === "church") ||
      (normalizedActive === "museum" && normalizedCategory === "museum") ||
      (normalizedActive === "city landmark & attraction" &&
        (normalizedCategory === "church" || normalizedCategory === "museum")) ||
      (normalizedActive === "malls" && mallKeywords.some((keyword) => p.name.toLowerCase().includes(keyword)))

    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Popular Places</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} destinations to explore</p>
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
          <button
            key={place.id}
            onClick={() => setShowRouteModal({ name: place.name, image: place.image })}
            className="group overflow-hidden rounded-2xl bg-card text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <Image src={place.image} alt={place.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              <div className="absolute left-2 top-2 rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">{place.category}</div>
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
          </button>
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
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-12 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90" onClick={() => setShowRouteModal(null)}>Palihog Bayad</Button>
              <Button variant="outline" className="h-12 rounded-xl border-primary text-sm font-semibold text-primary hover:bg-primary/5" onClick={() => setShowRouteModal(null)}>Sa Lugar</Button>
            </div>
            <button onClick={() => setShowRouteModal(null)} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
