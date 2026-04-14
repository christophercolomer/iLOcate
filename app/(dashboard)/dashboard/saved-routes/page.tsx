"use client"

import { useState } from "react"
import { BookmarkCheck, Clock, DollarSign, Trash2, Eye, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

type SavedRoute = {
  id: number
  from: string
  to: string
  fare: string
  time: string
  date: string
  savedAgo: string
}

const initialRoutes: SavedRoute[] = [
  { id: 1, from: "CPU", to: "SM City Iloilo", fare: "PHP 11 - PHP 41", time: "~20 min", date: "May 28", savedAgo: "Saved 3 days ago" },
  { id: 2, from: "Molo Church", to: "La Paz Market", fare: "PHP 10 - PHP 30", time: "~15 min", date: "May 25", savedAgo: "Saved 6 days ago" },
  { id: 3, from: "City Proper", to: "SM Starmall", fare: "PHP 11 - PHP 35", time: "~18 min", date: "May 22", savedAgo: "Saved 9 days ago" },
  { id: 4, from: "Jaro Cathedral", to: "Iloilo Esplanade", fare: "PHP 12 - PHP 38", time: "~22 min", date: "May 20", savedAgo: "Saved 11 days ago" },
  { id: 5, from: "Arevalo", to: "Plazoleta Gay", fare: "PHP 10 - PHP 32", time: "~25 min", date: "May 18", savedAgo: "Saved 13 days ago" },
]

export default function SavedRoutesPage() {
  const [routes, setRoutes] = useState(initialRoutes)
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null)

  const removeRoute = (id: number) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Saved Routes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {routes.length} {routes.length === 1 ? "route" : "routes"} bookmarked
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {routes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-card py-16 text-center shadow-sm">
            <BookmarkCheck className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <h3 className="text-lg font-semibold text-foreground">No saved routes</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Routes you bookmark from the map will appear here.
            </p>
          </div>
        ) : (
          routes.map((route) => (
            <div
              key={route.id}
              className="overflow-hidden rounded-2xl bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="p-5">
                {/* Route Header */}
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-base font-bold text-foreground">
                    {route.from} <span className="text-primary">-{'>'}</span> {route.to}
                  </h3>
                </div>

                {/* Route Meta */}
                <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                    <span>{route.fare}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{route.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>{route.date}</span>
                  </div>
                </div>

                <p className="mb-4 text-sm text-muted-foreground">{route.savedAgo}</p>

                {/* Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-border text-foreground"
                    onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View Activity
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
                    onClick={() => removeRoute(route.id)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>

                {/* Expanded Activity */}
                {selectedRoute === route.id && (
                  <div className="mt-4 rounded-xl border border-border bg-secondary p-4">
                    <p className="mb-2 text-sm font-semibold text-muted-foreground">Route Stops</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        <span className="text-sm text-foreground">{route.from}</span>
                        <span className="text-sm text-muted-foreground">(Start)</span>
                      </div>
                      <div className="ml-1 h-6 w-px border-l-2 border-dashed border-border" />
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                        <span className="text-sm text-foreground">Tagbak Terminal</span>
                        <span className="text-sm text-muted-foreground">(Transfer)</span>
                      </div>
                      <div className="ml-1 h-6 w-px border-l-2 border-dashed border-border" />
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                        <span className="text-sm text-foreground">{route.to}</span>
                        <span className="text-sm text-muted-foreground">(End)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
