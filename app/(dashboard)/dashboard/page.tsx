"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Maximize2, Star, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const categoryPlaces = [
  { name: "Miag-ao Church", image: "/images/miagao-church.jpg", category: "Heritage", rating: 4.9 },
  { name: "Islas de Gigantes", image: "/images/gigantes-island.jpg", category: "Beach", rating: 4.8 },
  { name: "Garin Farm", image: "/images/garin-farm.jpg", category: "Nature", rating: 4.7 },
  { name: "Iloilo Esplanade", image: "/images/esplanade.jpg", category: "Urban", rating: 4.6 },
  { name: "La Paz Batchoy", image: "/images/iloilo-food.jpg", category: "Food", rating: 4.8 },
  { name: "Cafe Panay", image: "/images/cafe.jpg", category: "Coffee Shops", rating: 4.5 },
  { name: "Dinagyang Festival", image: "/images/dinagyang-festival.jpg", category: "Events", rating: 5.0 },
  { name: "Seafood Market", image: "/images/restaurant.jpg", category: "Restaurants", rating: 4.4 },
  { name: "Paraw Regatta", image: "/images/paraw-regatta.jpg", category: "Events", rating: 4.7 },
  { name: "Street Eats", image: "/images/street-food.jpg", category: "Street Food", rating: 4.3 },
  { name: "Night Market", image: "/images/food-festival.jpg", category: "Nightlife", rating: 4.6 },
  { name: "Heritage Walk", image: "/images/miagao-church.jpg", category: "Heritage", rating: 4.5 },
]

// Duplicate for infinite scroll
const scrollPlaces = [...categoryPlaces, ...categoryPlaces]

function PlaceCard({ name, image, category, rating }: { name: string; image: string; category: string; rating: number }) {
  const [showRouteModal, setShowRouteModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowRouteModal(true)}
        className="group flex-shrink-0 overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg text-left"
      >
        <div className="relative h-36 w-full overflow-hidden sm:h-40">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute left-2 top-2 rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            {category}
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
          <div className="mt-1 flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-muted-foreground">{rating}</span>
          </div>
        </div>
      </button>

      {/* Route Explorer Modal */}
      {showRouteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowRouteModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                <Image src={image} alt={name} fill className="object-cover" sizes="64px" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{name}</h3>
                <p className="text-sm text-muted-foreground">{category}</p>
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
                  <span>To: {name}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span>Estimated Commute:</span>
                  <span className="font-semibold text-foreground">~25 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated Cost:</span>
                  <span className="font-semibold text-foreground">PHP 15 - PHP 45</span>
                </div>
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
                <span>{name}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                className="h-12 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={() => setShowRouteModal(false)}
              >
                Palihog Bayad
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl border-primary text-sm font-semibold text-primary hover:bg-primary/5"
                onClick={() => setShowRouteModal(false)}
              >
                Sa Lugar
              </Button>
            </div>

            <button
              onClick={() => setShowRouteModal(false)}
              className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function DashboardPage() {
  return (
    <div>
      {/* Map Section */}
      <div className="relative">
        <div className="relative h-[45vh] min-h-[320px] overflow-hidden">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=122.4800%2C10.6200%2C122.6500%2C10.7600&layer=mapnik&marker=10.6969%2C122.5644"
            className="h-full w-full border-0"
            title="Interactive map of Iloilo City"
            loading="lazy"
          />
        </div>
        <Link href="/dashboard/map">
          <Button
            size="sm"
            className="absolute bottom-4 right-4 z-10 gap-2 rounded-xl bg-card/95 text-foreground shadow-lg backdrop-blur-sm hover:bg-card"
          >
            <Maximize2 className="h-4 w-4" />
            Full Screen Map
          </Button>
        </Link>
      </div>

      {/* Infinite Scroll Categories */}
      <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
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
        <div className="relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-secondary to-transparent" />
          <div className="absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-secondary to-transparent" />
          <div className="animate-infinite-scroll-x flex gap-4">
            {scrollPlaces.map((place, i) => (
              <div key={`scroll-${i}`} className="w-[200px] flex-shrink-0 sm:w-[220px]">
                <PlaceCard {...place} />
              </div>
            ))}
          </div>
        </div>

        {/* Category Grid */}
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-foreground">Explore by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categoryPlaces.slice(0, 8).map((place) => (
              <PlaceCard key={place.name} {...place} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
