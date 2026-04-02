"use client"

import { useState } from "react"
import {
  Search,
  ArrowRightLeft,
  MapPin,
  Navigation,
  Bus,
  ChevronRight,
  Info,
  ArrowLeft,
  Locate,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import dynamic from "next/dynamic"
import { landmarks } from "@/lib/landmarks"

const MapComponent = dynamic(() => import("@/components/map-leaflet"), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-secondary">Loading map...</div>,
})

const routes = [
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

export default function FullScreenMapPage() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [showRoutes, setShowRoutes] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null)

  const swapLocations = () => {
    setFrom(to)
    setTo(from)
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full flex-shrink-0 overflow-y-auto border-b border-border bg-background p-4 lg:w-[380px] lg:border-b-0 lg:border-r">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/dashboard" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="text-lg font-bold text-foreground">Interactive Map</h2>
        </div>

        {/* Search Form */}
        <div className="rounded-2xl bg-secondary p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Find a Route</h3>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="From"
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex justify-center">
              <button onClick={swapLocations} className="rounded-full border border-border p-1.5 text-muted-foreground hover:border-primary hover:text-primary" aria-label="Swap locations">
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="To"
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button onClick={() => setShowRoutes(true)} className="mt-1 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              <Search className="mr-2 h-4 w-4" />
              Search Route
            </Button>
          </div>
        </div>

        {/* PUJ Routes */}
        <div className="mt-4 rounded-2xl bg-secondary p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">PUJ Routes</h3>
            <Bus className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                className={`w-full rounded-xl border p-3 text-left transition-all ${
                  selectedRoute === route.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{route.name}</p>
                    <p className="text-xs text-muted-foreground">{route.code} - {route.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">{route.fare}</span>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedRoute === route.id ? "rotate-90" : ""}`} />
                  </div>
                </div>
                {selectedRoute === route.id && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Stops:</p>
                    <div className="flex flex-col gap-1.5">
                      {route.stops.map((stop, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${i === 0 ? "bg-primary" : i === route.stops.length - 1 ? "bg-accent" : "bg-border"}`} />
                          <span className="text-xs text-foreground">{stop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Landmarks */}
        <div className="mt-4 rounded-2xl bg-secondary p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Landmarks</h3>
          <div className="flex flex-col gap-2">
            {landmarks.map((lm) => (
              <div key={lm.name} className="flex items-center justify-between rounded-lg px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm text-foreground">{lm.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{lm.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <MapComponent
          center={[10.6969, 122.5644]}
          zoom={13}
          routes={routes}
          landmarks={landmarks}
          selectedRoute={selectedRoute}
        />
        {showRoutes && (
          <div className="absolute bottom-4 right-4 max-w-xs rounded-xl bg-card/95 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Route Found</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {from && to ? `Showing directions from "${from}" to "${to}". Multiple PUJ routes available.` : "Enter both locations to see available routes."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
