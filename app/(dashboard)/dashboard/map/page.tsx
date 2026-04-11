"use client"

import { useEffect, useMemo, useState } from "react"
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
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { landmarks } from "@/lib/landmarks"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, getFirestore } from "firebase/firestore"
import { loadAndDecodeRoutes, type DecodedRoute } from "@/lib/route-decoder"

const MapComponent = dynamic(() => import("@/components/map-leaflet"), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-secondary">Loading map...</div>,
})

const MAP_CENTER: [number, number] = [10.6969, 122.5644]
const MAP_ZOOM = 13

const categoryOrder = [
  "Malls",
  "Churches",
  "Museum",
  "City Landmark & Attraction",
  "Local Food",
  "Cafes",
  "Restaurants",
] as const

type LandmarkCategory = (typeof categoryOrder)[number]

const localFoodKeywords = /batchoy|kansi|roberto|talabahan|seafood|lapaz|la paz|native|iloilo/i
const restaurantKeywords = /restaurant|resto|grill|house|eatery|diner|paluto|payag/i
const mallKeywords = /mall|sm city|robinsons|festive walk|atrium|plaza/i
const cityAttractionKeywords = /park|plaza|esplanade|attraction|landmark|monument|district|boardwalk|beach|heritage|island/i

function toLandmarkSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function getLandmarkKey(prefix: string, index: number, name: string, type: string, coordinates: [number, number]) {
  return `${prefix}-${index}-${toLandmarkSlug(name)}-${toLandmarkSlug(type)}-${coordinates[0]}-${coordinates[1]}`
}

function categorizeLandmark(name: string, type: string): LandmarkCategory {
  if (mallKeywords.test(name)) return "Malls"
  if (type === "Church") return "Churches"
  if (type === "Museum") return "Museum"
  if (type === "Cafe") return "Cafes"
  if (cityAttractionKeywords.test(name) || ["Urban", "Heritage", "Attraction", "Landmark", "Park"].includes(type)) {
    return "City Landmark & Attraction"
  }
  if (type === "Food" && localFoodKeywords.test(name)) return "Local Food"
  if (type === "Food" && restaurantKeywords.test(name)) return "Restaurants"
  if (type === "Food") return "Restaurants"
  return "City Landmark & Attraction"
}

const preferenceCategoryMap: Record<string, LandmarkCategory[]> = {
  "coffee-shops": ["Cafes"],
  restaurants: ["Restaurants", "Local Food"],
  beaches: ["City Landmark & Attraction"],
  heritage: ["Museum", "City Landmark & Attraction"],
  churches: ["Churches"],
  shopping: ["Malls"],
  nightlife: ["City Landmark & Attraction"],
  arts: ["Museum", "City Landmark & Attraction"],
}

export default function FullScreenMapPage() {
  const searchParams = useSearchParams()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [routeMode, setRouteMode] = useState<"Palihog Bayad" | "Sa Lugar">("Palihog Bayad")
  const [showRoutes, setShowRoutes] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [selectedLandmarkSection, setSelectedLandmarkSection] = useState<string | null>(null)
  const [selectedLandmarkName, setSelectedLandmarkName] = useState<string | null>(null)
  const [focusedLandmarkNames, setFocusedLandmarkNames] = useState<string[]>([])
  const [userPreferences, setUserPreferences] = useState<string[]>([])
  const [routes, setRoutes] = useState<DecodedRoute[]>([])
  const [loadingRoutes, setLoadingRoutes] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoadingRoutes(true)
      try {
        const decodedRoutes = await loadAndDecodeRoutes()
        console.log("[v0] Routes loaded:", decodedRoutes.length, decodedRoutes)
        setRoutes(decodedRoutes)
      } catch (error) {
        console.error("Error loading routes:", error)
        setRoutes([])
      } finally {
        setLoadingRoutes(false)
      }
    }

    fetchRoutes()
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchPreferences = async () => {
      if (!user) {
        setUserPreferences([])
        return
      }

      try {
        const snapshot = await getDoc(doc(getFirestore(), "users", user.uid))
        const savedPrefs = snapshot.exists() ? snapshot.data()?.preferences : []
        if (isMounted && Array.isArray(savedPrefs)) {
          setUserPreferences(savedPrefs.filter((pref): pref is string => typeof pref === "string"))
        }
      } catch {
        if (isMounted) setUserPreferences([])
      }
    }

    fetchPreferences()
    return () => {
      isMounted = false
    }
  }, [user])

  useEffect(() => {
    const landmarkParam = searchParams.get("landmark")
    if (!landmarkParam) return

    const decodedParam = decodeURIComponent(landmarkParam).trim()
    if (!decodedParam) return

    const normalizedParam = toLandmarkSlug(decodedParam)
    const matchedLandmark =
      landmarks.find((landmark) => toLandmarkSlug(landmark.name) === normalizedParam) ??
      landmarks.find((landmark) => landmark.name.toLowerCase() === decodedParam.toLowerCase())

    if (!matchedLandmark) return

    setSelectedLandmarkName(matchedLandmark.name)
    setSelectedLandmarkSection(null)
    setFocusedLandmarkNames([])
  }, [searchParams])

  const categorizedLandmarks = useMemo(() => {
    const grouped: Record<LandmarkCategory, typeof landmarks> = {
      "Malls": [],
      "Churches": [],
      "Museum": [],
      "City Landmark & Attraction": [],
      "Local Food": [],
      "Cafes": [],
      "Restaurants": [],
    }

    for (const landmark of landmarks) {
      const category = categorizeLandmark(landmark.name, landmark.type)
      grouped[category].push(landmark)
    }

    return grouped
  }, [])

  const preferredLandmarks = useMemo(() => {
    if (!userPreferences.length) return []

    const selectedCategories = new Set<LandmarkCategory>()
    for (const pref of userPreferences) {
      const mapped = preferenceCategoryMap[pref] ?? []
      mapped.forEach((cat) => selectedCategories.add(cat))
    }

    const uniqueByName = new Map<string, (typeof landmarks)[number]>()
    categoryOrder.forEach((cat) => {
      if (!selectedCategories.has(cat)) return
      categorizedLandmarks[cat].forEach((landmark) => {
        if (!uniqueByName.has(landmark.name)) {
          uniqueByName.set(landmark.name, landmark)
        }
      })
    })

    return Array.from(uniqueByName.values())
  }, [categorizedLandmarks, userPreferences])

  const allPlacesAndFood = useMemo(() => landmarks, [])

  const sectionLandmarkNames = useMemo<Record<string, string[]>>(() => {
    const categoryNames: Record<string, string[]> = {}
    categoryOrder.forEach((category) => {
      categoryNames[category] = categorizedLandmarks[category].map((lm) => lm.name)
    })

    return {
      "All Places & Food": allPlacesAndFood.map((lm) => lm.name),
      "Based on your Preferences": preferredLandmarks.map((lm) => lm.name),
      ...categoryNames,
    }
  }, [allPlacesAndFood, preferredLandmarks, categorizedLandmarks])

  const handleLandmarkSectionToggle = (section: string) => {
    if (selectedLandmarkSection === section) {
      setSelectedLandmarkSection(null)
      setFocusedLandmarkNames([])
      return
    }

    setSelectedLandmarkSection(section)
    setSelectedLandmarkName(null)
    setFocusedLandmarkNames(sectionLandmarkNames[section] ?? [])
  }

  const visibleLandmarks = useMemo(() => {
    if (selectedLandmarkName) {
      return landmarks.filter((lm) => lm.name === selectedLandmarkName)
    }

    if (focusedLandmarkNames.length > 0) {
      const focusedSet = new Set(focusedLandmarkNames)
      return landmarks.filter((lm) => focusedSet.has(lm.name))
    }

    return landmarks
  }, [focusedLandmarkNames, selectedLandmarkName])

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
            {loadingRoutes ? (
              <p className="text-xs text-muted-foreground">Loading routes...</p>
            ) : routes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No routes available</p>
            ) : (
              routes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    selectedRoute === route.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{route.routeNumber} - {route.routeName}</p>
                      <p className="text-xs text-muted-foreground">{route.vehicleTypeName}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedRoute === route.id ? "rotate-90" : ""}`} />
                  </div>
                  {selectedRoute === route.id && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Stops ({route.stops.length}):</p>
                      <div className="max-h-40 flex flex-col gap-1.5 overflow-y-auto pr-2">
                        {route.stops.slice(0, 10).map((stop, i) => (
                          <div key={`${route.id}-${stop.id}`} className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full flex-shrink-0 ${i === 0 ? "bg-primary" : i === Math.min(9, route.stops.length - 1) ? "bg-accent" : "bg-border"}`} />
                            <span className="text-xs text-foreground truncate">{stop.address}</span>
                          </div>
                        ))}
                        {route.stops.length > 10 && (
                          <p className="text-xs text-muted-foreground">+{route.stops.length - 10} more stops</p>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Route Mode */}
        <div className="mt-4 rounded-2xl bg-secondary p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setRouteMode("Palihog Bayad")}
              className={`h-10 rounded-xl text-sm font-semibold ${
                routeMode === "Palihog Bayad"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-primary bg-background text-primary hover:bg-primary/5"
              }`}
            >
              Palihog Bayad
            </Button>
            <Button
              onClick={() => setRouteMode("Sa Lugar")}
              className={`h-10 rounded-xl text-sm font-semibold ${
                routeMode === "Sa Lugar"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-primary bg-background text-primary hover:bg-primary/5"
              }`}
            >
              Sa Lugar
            </Button>
          </div>
        </div>

        {/* Landmarks */}
        <div className="mt-4 rounded-2xl bg-secondary p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Landmarks</h3>
          <div className="flex max-h-[360px] flex-col gap-2 overflow-y-auto pr-1">
            <button
              onClick={() => handleLandmarkSectionToggle("All Places & Food")}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                selectedLandmarkSection === "All Places & Food"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">All Places & Food</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{allPlacesAndFood.length}</span>
                  <ChevronRight
                    className={`h-4 w-4 text-muted-foreground transition-transform ${selectedLandmarkSection === "All Places & Food" ? "rotate-90" : ""}`}
                  />
                </div>
              </div>

              {selectedLandmarkSection === "All Places & Food" && (
                <div className="mt-3 border-t border-border pt-3">
                  <div className="flex flex-col gap-2">
                    {allPlacesAndFood.map((lm, index) => (
                      <div
                        key={getLandmarkKey("all", index, lm.name, lm.type, lm.coordinates)}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedLandmarkName(lm.name)
                          setFocusedLandmarkNames([])
                        }}
                        className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition-colors ${
                          selectedLandmarkName === lm.name ? "bg-primary/10" : "hover:bg-muted/60"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm text-foreground">{lm.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{lm.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>

            <button
              onClick={() => handleLandmarkSectionToggle("Based on your Preferences")}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                selectedLandmarkSection === "Based on your Preferences"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Based on your Preferences</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{preferredLandmarks.length}</span>
                  <ChevronRight
                    className={`h-4 w-4 text-muted-foreground transition-transform ${selectedLandmarkSection === "Based on your Preferences" ? "rotate-90" : ""}`}
                  />
                </div>
              </div>

              {selectedLandmarkSection === "Based on your Preferences" && (
                <div className="mt-3 border-t border-border pt-3">
                  {preferredLandmarks.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {preferredLandmarks.map((lm, index) => (
                        <div
                          key={getLandmarkKey("pref", index, lm.name, lm.type, lm.coordinates)}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLandmarkName(lm.name)
                            setFocusedLandmarkNames([])
                          }}
                          className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition-colors ${
                            selectedLandmarkName === lm.name ? "bg-primary/10" : "hover:bg-muted/60"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm text-foreground">{lm.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{categorizeLandmark(lm.name, lm.type)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground">Set your preferences to get personalized landmark suggestions.</p>
                  )}
                </div>
              )}
            </button>

            {categoryOrder.map((category) => (
              <button
                key={category}
                onClick={() => handleLandmarkSectionToggle(category)}
                className={`w-full rounded-xl border p-3 text-left transition-all ${
                  selectedLandmarkSection === category
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{categorizedLandmarks[category].length}</span>
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground transition-transform ${selectedLandmarkSection === category ? "rotate-90" : ""}`}
                    />
                  </div>
                </div>

                {selectedLandmarkSection === category && (
                  <div className="mt-3 border-t border-border pt-3">
                    {categorizedLandmarks[category].length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {categorizedLandmarks[category].map((lm, index) => (
                          <div
                            key={getLandmarkKey(category, index, lm.name, lm.type, lm.coordinates)}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedLandmarkName(lm.name)
                              setFocusedLandmarkNames([])
                            }}
                            className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition-colors ${
                              selectedLandmarkName === lm.name ? "bg-primary/10" : "hover:bg-muted/60"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-primary" />
                              <span className="text-sm text-foreground">{lm.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{lm.type}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="px-2 py-1.5 text-xs text-muted-foreground">No landmarks available yet.</p>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <MapComponent
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          routes={routes.map((route) => ({
            id: route.id,
            name: `${route.routeNumber} - ${route.routeName}`,
            code: route.vehicleTypeName,
            stops: route.stops.map((s) => s.address),
            fare: "",
            time: "",
          }))}
          landmarks={visibleLandmarks}
          selectedRoute={selectedRoute}
          selectedLandmarkName={selectedLandmarkName}
          focusedLandmarkNames={focusedLandmarkNames}
          decodedRoutes={routes}
        />
        {showRoutes && (
          <div className="absolute bottom-4 right-4 max-w-xs rounded-xl bg-card/95 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Route Found</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {from && to
                    ? `Showing ${routeMode.toLowerCase()} directions from "${from}" to "${to}". Multiple PUJ routes available.`
                    : "Enter both locations to see available routes."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
