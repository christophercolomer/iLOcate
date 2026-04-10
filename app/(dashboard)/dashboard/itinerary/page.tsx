"use client"

import { useState } from "react"
import Image from "next/image"
import { CalendarDays, DollarSign, Plus, Trash2, MapPin, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const popularPlaces = [
  { id: 1, name: "Miag-ao Church", image: "/images/places/miagao-church.jpg", category: "Heritage", rating: 4.9, cost: "Free" },
  { id: 2, name: "Islas de Gigantes", image: "/images/places/gigantes-island.jpg", category: "Beach", rating: 4.8, cost: "PHP 500" },
  { id: 3, name: "Garin Farm", image: "/images/places/garin-farm.jpg", category: "Nature", rating: 4.7, cost: "PHP 150" },
  { id: 4, name: "Iloilo Esplanade", image: "/images/places/esplanade.jpg", category: "Urban", rating: 4.6, cost: "Free" },
  { id: 5, name: "Molo Church", image: "/images/places/miagao-church.jpg", category: "Heritage", rating: 4.5, cost: "Free" },
  { id: 6, name: "La Paz Market", image: "/images/food/iloilo-food.jpg", category: "Food", rating: 4.8, cost: "PHP 50-200" },
]

const suggestedActivities = [
  "Visit Miag-ao Church (UNESCO Heritage)",
  "Try La Paz Batchoy at Ted's Oldtimer",
  "Stroll along Iloilo River Esplanade",
  "Explore Molo Mansion",
  "Island hopping at Islas de Gigantes",
]

type ItineraryItem = {
  id: number
  name: string
  day: number
  time: string
}

export default function ItineraryPage() {
  const [activeTab, setActiveTab] = useState<"planner" | "popular">("planner")
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([
    { id: 1, name: "Miag-ao Church", day: 1, time: "9:00 AM" },
    { id: 2, name: "La Paz Batchoy Lunch", day: 1, time: "12:00 PM" },
    { id: 3, name: "Iloilo Esplanade", day: 1, time: "4:00 PM" },
  ])
  const [totalDays, setTotalDays] = useState(3)
  const [showRouteModal, setShowRouteModal] = useState<{ name: string; image: string } | null>(null)

  const addToItinerary = (name: string) => {
    setItinerary((prev) => [
      ...prev,
      { id: Date.now(), name, day: 1, time: "10:00 AM" },
    ])
  }

  const removeFromItinerary = (id: number) => {
    setItinerary((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 lg:px-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Map Panel */}
        <div className="flex-1">
          <div className="relative h-[400px] overflow-hidden rounded-2xl shadow-sm lg:h-[600px]">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=122.4800%2C10.6200%2C122.6500%2C10.7600&layer=mapnik&marker=10.6969%2C122.5644"
              className="h-full w-full border-0"
              title="Itinerary map view"
              loading="lazy"
            />
          </div>
        </div>

        {/* Planner Panel */}
        <div className="w-full flex-shrink-0 lg:w-[420px]">
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            <h1 className="text-xl font-bold text-foreground">Itinerary Planner</h1>

            {/* Tab switch */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setActiveTab("planner")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "planner"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarDays className="mr-1.5 inline h-4 w-4" />
                Days
              </button>
              <button
                onClick={() => setActiveTab("popular")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                  activeTab === "popular"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <DollarSign className="mr-1.5 inline h-4 w-4" />
                Cost
              </button>
            </div>

            {activeTab === "planner" ? (
              <>
                {/* Suggested Activities */}
                <div className="mt-5 rounded-xl bg-secondary p-4">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Suggested Activities</h3>
                  <div className="flex flex-col gap-2">
                    {suggestedActivities.map((activity) => (
                      <button
                        key={activity}
                        onClick={() => addToItinerary(activity)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      >
                        <Plus className="h-3.5 w-3.5 text-primary" />
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Itinerary */}
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Itinerary</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Days:</span>
                      <select
                        value={totalDays}
                        onChange={(e) => setTotalDays(Number(e.target.value))}
                        className="rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                          <option key={d} value={d}>{d} {d === 1 ? "day" : "days"}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {Array.from({ length: totalDays }).map((_, dayIndex) => {
                      const dayItems = itinerary.filter((item) => item.day === dayIndex + 1)
                      return (
                        <div key={dayIndex} className="rounded-xl border border-border p-3">
                          <p className="mb-2 text-xs font-bold text-primary">Day {dayIndex + 1}</p>
                          {dayItems.length > 0 ? (
                            <div className="flex flex-col gap-1.5">
                              {dayItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-medium text-primary">{item.time}</span>
                                    <span className="text-xs text-foreground">{item.name}</span>
                                  </div>
                                  <button onClick={() => removeFromItinerary(item.id)} className="text-muted-foreground hover:text-destructive" aria-label={`Remove ${item.name}`}>
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No activities planned</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-5">
                <div className="rounded-xl bg-secondary p-4">
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Estimated Cost Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Transportation</span><span className="text-foreground">PHP 200 - 500</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Food</span><span className="text-foreground">PHP 300 - 800</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Entrance Fees</span><span className="text-foreground">PHP 150 - 500</span></div>
                    <div className="flex justify-between border-t border-border pt-2 font-semibold"><span className="text-foreground">Total (est.)</span><span className="text-primary">PHP 650 - 1,800</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Popular Places Button */}
            <Button
              onClick={() => setActiveTab("planner")}
              variant="outline"
              className="mt-5 w-full rounded-xl border-primary text-primary hover:bg-primary/5"
              asChild
            >
              <button onClick={() => {
                const section = document.getElementById("popular-places")
                section?.scrollIntoView({ behavior: "smooth" })
              }}>
                <MapPin className="mr-2 h-4 w-4" />
                Popular Places
              </button>
            </Button>
          </div>
        </div>
      </div>

      {/* Popular Places Grid */}
      <div id="popular-places" className="mt-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold text-foreground">Popular Places in Iloilo</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularPlaces.map((place) => (
            <button
              key={place.id}
              onClick={() => setShowRouteModal({ name: place.name, image: place.image })}
              className="group overflow-hidden rounded-2xl bg-card text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-40 w-full overflow-hidden">
                <Image src={place.image} alt={place.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 33vw" />
                <div className="absolute left-2 top-2 rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">{place.category}</div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{place.name}</h3>
                  <span className="text-xs font-medium text-primary">{place.cost}</span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-muted-foreground">{place.rating}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
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
              <Button className="h-12 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90" onClick={() => setShowRouteModal(null)}>
                Palihog Bayad
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-primary text-sm font-semibold text-primary hover:bg-primary/5" onClick={() => setShowRouteModal(null)}>
                Sa Lugar
              </Button>
            </div>

            <button onClick={() => setShowRouteModal(null)} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
