"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import {
  Search,
  ArrowRightLeft,
  MapPin,
  Navigation,
  Bus,
  ChevronRight,
  ChevronLeft,
  Info,
  ArrowLeft,
  Locate,
  X,
  Clock,
  Route,
  Crosshair,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import Image from "next/image"
import { landmarks } from "@/lib/landmarks"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, getFirestore } from "firebase/firestore"
import { loadAndDecodeRoutes, type DecodedRoute } from "@/lib/route-decoder"
import { getDirections, formatDistance, formatDuration, type DirectionsResult } from "@/lib/osrm"
import type { DirectionsRoute } from "@/components/map-leaflet"

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

const CURRENT_LOCATION_LABEL = "Current Location"
const PINNED_LOCATION_LABEL = "📍 Pinned Location"

function isSubsequenceMatch(query: string, target: string) {
  let queryIndex = 0
  for (let i = 0; i < target.length && queryIndex < query.length; i++) {
    if (target[i] === query[queryIndex]) queryIndex += 1
  }
  return queryIndex === query.length
}

function getSuggestionScore(query: string, target: string) {
  if (!query) return 999
  if (target === query) return 0
  if (target.startsWith(query)) return 1
  if (target.split(/\s+/).some((word) => word.startsWith(query))) return 2
  if (target.includes(query)) return 3
  if (isSubsequenceMatch(query, target)) return 4
  return Number.POSITIVE_INFINITY
}

function FullScreenMapPageContent() {
  const searchParams = useSearchParams()
  const [from, setFrom] = useState(CURRENT_LOCATION_LABEL)
  const [to, setTo] = useState("")
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationLoading, setLocationLoading] = useState(true)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [routeMode, setRouteMode] = useState<"Palihog Bayad" | "Sa Lugar">("Palihog Bayad")
  const [showRoutes, setShowRoutes] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [showAllPujRoutes, setShowAllPujRoutes] = useState(false)
  const [selectedRouteDirection, setSelectedRouteDirection] = useState<"goingTo" | "returning" | null>(null)
  const [showMapSidebar, setShowMapSidebar] = useState(true)
  const [selectedLandmarkSection, setSelectedLandmarkSection] = useState<string | null>(null)
  const [selectedLandmarkName, setSelectedLandmarkName] = useState<string | null>(null)
  const [focusedLandmarkNames, setFocusedLandmarkNames] = useState<string[]>([])
  const [showLandmarksPanel, setShowLandmarksPanel] = useState(true)
  const [userPreferences, setUserPreferences] = useState<string[]>([])
  const [routes, setRoutes] = useState<DecodedRoute[]>([])
  const [loadingRoutes, setLoadingRoutes] = useState(true)
  const [directionsRoute, setDirectionsRoute] = useState<DirectionsRoute | null>(null)
  const [directionsLoading, setDirectionsLoading] = useState(false)
  const [directionsError, setDirectionsError] = useState<string | null>(null)
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null)
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null)
  const [activeSuggestionField, setActiveSuggestionField] = useState<"from" | "to" | null>(null)
  const [pendingGoToLandmark, setPendingGoToLandmark] = useState<string | null>(null)
  const [isPinDropMode, setIsPinDropMode] = useState(false)
  const [pinnedCoords, setPinnedCoords] = useState<[number, number] | null>(null)
  const { user } = useAuth()

  // Get user's current location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setLocationLoading(false)
      setFrom("") // Clear default if geolocation not available
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude]
        setUserLocation(coords)
        setLocationLoading(false)
        setLocationError(null)
      },
      (error) => {
        setLocationError("Unable to get your location")
        setLocationLoading(false)
        setFrom("") // Clear default if location access denied
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [])

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

    if (searchParams.get("go") === "1") {
      setPendingGoToLandmark(matchedLandmark.name)
    }
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

    return []
  }, [focusedLandmarkNames, selectedLandmarkName])

  const selectedLandmark = useMemo(() => {
    if (!selectedLandmarkName) return null
    return landmarks.find((landmark) => landmark.name === selectedLandmarkName) ?? null
  }, [selectedLandmarkName])

  const locationSuggestions = useMemo(() => {
    const baseSuggestions = landmarks.map((landmark) => ({
      label: landmark.name,
      subtitle: landmark.type,
    }))

    if (userLocation) {
      return [
        { label: CURRENT_LOCATION_LABEL, subtitle: "Use your live location" },
        ...baseSuggestions,
      ]
    }

    return baseSuggestions
  }, [userLocation])

  const findBestSuggestions = (query: string) => {
    const normalizedQuery = query.toLowerCase().trim()
    if (!normalizedQuery) return locationSuggestions.slice(0, 8)

    return locationSuggestions
      .map((suggestion) => ({
        ...suggestion,
        score: getSuggestionScore(normalizedQuery, suggestion.label.toLowerCase()),
      }))
      .filter((suggestion) => Number.isFinite(suggestion.score))
      .sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score
        return a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
      })
      .slice(0, 8)
  }

  const fromSuggestions = useMemo(() => findBestSuggestions(from), [from, locationSuggestions])
  const toSuggestions = useMemo(() => findBestSuggestions(to), [to, locationSuggestions])

  const applySuggestion = (field: "from" | "to", value: string) => {
    if (field === "from") {
      setFrom(value)
    } else {
      setTo(value)
    }
    setActiveSuggestionField(null)
  }

  const swapLocations = () => {
    setFrom(to)
    setTo(from)
    // Also swap the coordinates
    const tempOrigin = originCoords
    setOriginCoords(destinationCoords)
    setDestinationCoords(tempOrigin)
  }

  // Find landmark by name (case-insensitive partial match)
  const findLandmarkByName = (name: string) => {
    const normalizedName = name.toLowerCase().trim()
    return landmarks.find(
      (lm) =>
        lm.name.toLowerCase() === normalizedName ||
        lm.name.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(lm.name.toLowerCase())
    )
  }

  const searchRoute = async (originValue: string, destinationValue: string) => {
    const normalizedFrom = originValue.trim()
    const normalizedTo = destinationValue.trim()

    if (!normalizedFrom || !normalizedTo) {
      setDirectionsError("Please enter both origin and destination")
      return
    }

    setDirectionsLoading(true)
    setDirectionsError(null)
    setDirectionsRoute(null)
    setShowRoutes(true)

    let originLatLng: [number, number]
    let destLatLng: [number, number]

    // Handle "Current Location" as origin
    const isFromCurrentLocation = normalizedFrom.toLowerCase() === CURRENT_LOCATION_LABEL.toLowerCase()
    
    if (isFromCurrentLocation) {
      if (!userLocation) {
        setDirectionsError("Current location not available. Please enter a location or enable location access.")
        setDirectionsLoading(false)
        return
      }
      originLatLng = userLocation
    } else {
      const fromLandmark = findLandmarkByName(normalizedFrom)
      if (!fromLandmark) {
        setDirectionsError(`Could not find location: "${normalizedFrom}". Try selecting from Landmarks.`)
        setDirectionsLoading(false)
        return
      }
      originLatLng = fromLandmark.coordinates
    }

    // Handle "Current Location" as destination
    const isToCurrentLocation = normalizedTo.toLowerCase() === CURRENT_LOCATION_LABEL.toLowerCase()
    const isPinnedDestination = normalizedTo === PINNED_LOCATION_LABEL

    if (isPinnedDestination) {
      if (!pinnedCoords) {
        setDirectionsError("No pin placed. Click 'Pick on map' to pin your destination.")
        setDirectionsLoading(false)
        return
      }
      destLatLng = pinnedCoords
    } else if (isToCurrentLocation) {
      if (!userLocation) {
        setDirectionsError("Current location not available. Please enter a location or enable location access.")
        setDirectionsLoading(false)
        return
      }
      destLatLng = userLocation
    } else {
      const toLandmark = findLandmarkByName(normalizedTo)
      if (!toLandmark) {
        setDirectionsError(`Could not find location: "${normalizedTo}". Try selecting from Landmarks.`)
        setDirectionsLoading(false)
        return
      }
      destLatLng = toLandmark.coordinates
    }

    setOriginCoords(originLatLng)
    setDestinationCoords(destLatLng)

    try {
      const result = await getDirections(
        { lat: originLatLng[0], lng: originLatLng[1] },
        { lat: destLatLng[0], lng: destLatLng[1] }
      )

      if (result.success && result.route) {
        setDirectionsRoute(result.route)
        setDirectionsError(null)
        // Clear selected PUJ route when showing directions
        setSelectedRoute(null)
        setShowAllPujRoutes(false)
      } else {
        setDirectionsError(result.error || "Failed to get directions")
        setDirectionsRoute(null)
      }
    } catch (error) {
      setDirectionsError("An error occurred while fetching directions")
      setDirectionsRoute(null)
    } finally {
      setDirectionsLoading(false)
    }
  }

  // Handle route search from the manual fields
  const handleSearchRoute = async () => {
    await searchRoute(from, to)
  }

  const handleGoToLandmark = async (landmarkName: string) => {
    const destination = landmarkName.trim()
    if (!destination) return

    const origin = userLocation ? CURRENT_LOCATION_LABEL : from.trim()

    if (!origin) {
      setDirectionsError("Current location not available. Please allow location access or enter an origin manually.")
      return
    }

    setSelectedLandmarkName(destination)
    setSelectedLandmarkSection(null)
    setFocusedLandmarkNames([])
    setFrom(origin)
    setTo(destination)
    setShowRoutes(true)

    await searchRoute(origin, destination)
  }

  useEffect(() => {
    if (!pendingGoToLandmark) return
    if (locationLoading) return

    if (!userLocation) {
      setDirectionsError("Current location not available. Please allow location access and try again.")
      setPendingGoToLandmark(null)
      return
    }

    void handleGoToLandmark(pendingGoToLandmark)
    setPendingGoToLandmark(null)
  }, [pendingGoToLandmark, locationLoading, userLocation])

  // Clear only the computed route data
  const clearDirections = () => {
    setDirectionsRoute(null)
    setDirectionsError(null)
    setOriginCoords(null)
    setDestinationCoords(null)
    setShowRoutes(false)
    setFrom(userLocation ? CURRENT_LOCATION_LABEL : "")
    setTo("")
    setPinnedCoords(null)
    setIsPinDropMode(false)
  }

  // Exit route mode completely (used by cancel/close actions)
  const handleExitRoute = () => {
    clearDirections()
    setPendingGoToLandmark(null)
    setSelectedLandmarkName(null)
    setSelectedLandmarkSection(null)
    setFocusedLandmarkNames([])
    setSelectedRoute(null)
    setShowAllPujRoutes(false)
    setSelectedRouteDirection(null)
  }

  // Handle route click - show direction choice
  const handleRouteClick = (routeId: string | number) => {
    const routeIdString = String(routeId)
    if (selectedRoute === routeIdString) {
      // If clicking same route, clear selection
      setSelectedRoute(null)
      setSelectedRouteDirection(null)
    } else {
      // Show direction choice for new route
      setSelectedRoute(routeIdString)
      setSelectedRouteDirection(null) // User must choose direction
    }
  }

  // Handle direction selection
  const handleDirectionSelect = (direction: "goingTo" | "returning") => {
    setSelectedRouteDirection(direction)
  }

  // Pin drop handlers
  const handlePinDropped = (coords: [number, number]) => {
    setPinnedCoords(coords)
  }

  const handlePinDone = () => {
    if (!pinnedCoords) return
    setIsPinDropMode(false)
    setTo(PINNED_LOCATION_LABEL)
    void searchRoute(from, PINNED_LOCATION_LABEL)
  }

  const handlePinCancel = () => {
    setIsPinDropMode(false)
    setPinnedCoords(null)
    if (to === PINNED_LOCATION_LABEL) setTo("")
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:flex-row">
      {/* Sidebar */}
      {showMapSidebar && (
      <div className="relative w-full flex-shrink-0 overflow-y-auto border-b border-border bg-background p-4 lg:w-[380px] lg:border-b-0 lg:border-r">
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
                onFocus={() => setActiveSuggestionField("from")}
                onBlur={() => setTimeout(() => setActiveSuggestionField(null), 120)}
                placeholder={locationLoading ? "Getting your location…" : "From"}
                disabled={locationLoading}
                className={`w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 ${
                  from === CURRENT_LOCATION_LABEL ? "text-primary font-medium" : ""
                }`}
              />
              {activeSuggestionField === "from" && fromSuggestions.length > 0 && !locationLoading && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-56 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg">
                  {fromSuggestions.map((suggestion) => (
                    <button
                      key={`from-${suggestion.label}`}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        applySuggestion("from", suggestion.label)
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-muted"
                    >
                      <span className="truncate text-sm text-foreground">{suggestion.label}</span>
                      <span className="ml-2 flex-shrink-0 text-[11px] text-muted-foreground">{suggestion.subtitle}</span>
                    </button>
                  ))}
                </div>
              )}
              {/* Right-side indicator: spinner while loading, reset button otherwise */}
              {locationLoading ? (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent block" />
                </span>
              ) : userLocation && from !== CURRENT_LOCATION_LABEL ? (
                <button
                  type="button"
                  onClick={() => setFrom(CURRENT_LOCATION_LABEL)}
                  title="Use my current location"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Locate className="h-4 w-4" />
                </button>
              ) : from === CURRENT_LOCATION_LABEL ? (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" title="Using your current location">
                  <Locate className="h-4 w-4" />
                </span>
              ) : null}
            </div>
            {locationError && from === "" && (
              <p className="text-xs text-destructive -mt-1">{locationError} Enter a location manually.</p>
            )}
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
                onChange={(e) => {
                  setTo(e.target.value)
                  if (pinnedCoords && e.target.value !== PINNED_LOCATION_LABEL) {
                    setPinnedCoords(null)
                  }
                }}
                onFocus={() => setActiveSuggestionField("to")}
                onBlur={() => setTimeout(() => setActiveSuggestionField(null), 120)}
                placeholder="To"
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {activeSuggestionField === "to" && toSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-56 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg">
                  {toSuggestions.map((suggestion) => (
                    <button
                      key={`to-${suggestion.label}`}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        applySuggestion("to", suggestion.label)
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-muted"
                    >
                      <span className="truncate text-sm text-foreground">{suggestion.label}</span>
                      <span className="ml-2 flex-shrink-0 text-[11px] text-muted-foreground">{suggestion.subtitle}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPinDropMode(true)
                setPinnedCoords(null)
              }}
              className={`flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                isPinDropMode
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              <Crosshair className="h-3.5 w-3.5" />
              Pick on map
            </button>
            <Button 
              onClick={handleSearchRoute} 
              disabled={directionsLoading}
              className="mt-1 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {directionsLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Finding Route...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Route
                </>
              )}
            </Button>
            {directionsError && (
              <p className="mt-2 text-xs text-destructive">{directionsError}</p>
            )}
            {(directionsRoute || directionsError) && (
              <Button 
                onClick={clearDirections} 
                variant="outline"
                className="mt-2 w-full rounded-xl"
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* PUJ Routes */}
        <div className="mt-4 rounded-2xl bg-secondary p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">PUJ Routes</h3>
            <Bus className="h-4 w-4 text-primary" />
          </div>
          {selectedRoute !== null && (
            <button
              type="button"
              onClick={() => {
                setSelectedRoute(null)
                setShowAllPujRoutes(false)
                setSelectedRouteDirection(null)
              }}
              className="mb-2 w-full rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              Unselect current route
            </button>
          )}
          <div className="flex flex-col gap-2">
            {loadingRoutes ? (
              <p className="text-xs text-muted-foreground">Loading routes...</p>
            ) : routes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No routes available</p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoute(null)
                    setShowAllPujRoutes((prev) => !prev)
                    setSelectedRouteDirection(null)
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    showAllPujRoutes ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Show All Routes</p>
                      <p className="text-xs text-muted-foreground">Display every PUJ route on the map</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showAllPujRoutes ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {routes.map((route) => (
                  <button
                    type="button"
                    key={route.id}
                    onClick={() => {
                      handleRouteClick(route.id)
                      setShowAllPujRoutes(false)
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${
                      selectedRoute === String(route.id) ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{route.routeNumber} - {route.routeName}</p>
                        <p className="text-xs text-muted-foreground">{route.vehicleTypeName}</p>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedRoute === String(route.id) ? "rotate-90" : ""}`} />
                    </div>
                    {selectedRoute === String(route.id) && (
                      <div className="mt-3 border-t border-border pt-3">
                        <p className="mb-2 text-xs font-medium text-foreground">Select direction:</p>
                        <div className="mb-3 grid grid-cols-2 gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDirectionSelect("goingTo")
                            }}
                            variant={selectedRouteDirection === "goingTo" ? "default" : "outline"}
                            className={`h-9 rounded-lg text-xs font-medium ${
                              selectedRouteDirection === "goingTo"
                                ? "bg-primary text-primary-foreground"
                                : "border-border hover:bg-primary/10 hover:text-primary"
                            }`}
                          >
                            <Navigation className="mr-1.5 h-3.5 w-3.5" />
                            Going To
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDirectionSelect("returning")
                            }}
                            variant={selectedRouteDirection === "returning" ? "default" : "outline"}
                            className={`h-9 rounded-lg text-xs font-medium ${
                              selectedRouteDirection === "returning"
                                ? "bg-primary text-primary-foreground"
                                : "border-border hover:bg-primary/10 hover:text-primary"
                            }`}
                          >
                            <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
                            Returning
                          </Button>
                        </div>
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
                ))}
              </>
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

        <div className="mt-4 rounded-2xl bg-secondary p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Landmarks Panel</h3>
              <p className="text-xs text-muted-foreground">Use the side arrow tabs to collapse or expand panels.</p>
            </div>
          </div>
        </div>

      </div>
      )}

      {/* Map */}
      <div className="relative flex-1">
        <MapComponent
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          showCenterMarker={false}
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
          showAllRoutes={showAllPujRoutes}
          selectedRouteDirection={selectedRouteDirection}
          showAllRoutes={showAllPujRoutes}
          selectedLandmarkName={selectedLandmarkName}
          focusedLandmarkNames={focusedLandmarkNames}
          decodedRoutes={routes}
          directionsRoute={directionsRoute}
          originMarker={originCoords}
          destinationMarker={destinationCoords}
          pinDropMode={isPinDropMode}
          onPinDropped={handlePinDropped}
        />
        {/* Pin drop mode overlay */}
        {isPinDropMode && (
          <div className="absolute left-1/2 top-4 z-[2200] flex -translate-x-1/2 items-center gap-3 rounded-xl bg-card/95 px-4 py-3 shadow-lg backdrop-blur-sm">
            <Crosshair className="h-4 w-4 flex-shrink-0 animate-pulse text-primary" />
            <p className="text-sm font-medium text-foreground">
              {pinnedCoords ? "Drag the pin to adjust" : "Click anywhere to set your destination"}
            </p>
            {pinnedCoords ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handlePinDone}
                  disabled={directionsLoading}
                  className="h-7 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {directionsLoading ? "Finding..." : "Done"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePinCancel}
                  className="h-7 rounded-lg px-3 text-xs"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePinCancel}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Cancel pin drop"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowMapSidebar((prev) => !prev)}
          aria-label={showMapSidebar ? "Collapse interactive map sidebar" : "Expand interactive map sidebar"}
          className="absolute left-0 top-1/2 z-[700] hidden h-12 w-7 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-border bg-background text-muted-foreground shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground lg:flex"
        >
          {showMapSidebar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => setShowLandmarksPanel((prev) => !prev)}
          aria-label={showLandmarksPanel ? "Collapse landmarks panel" : "Expand landmarks panel"}
          className="absolute right-0 top-1/2 z-[700] hidden h-12 w-7 -translate-y-1/2 items-center justify-center rounded-l-md border border-r-0 border-border bg-background text-muted-foreground shadow-sm transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground lg:flex"
        >
          {showLandmarksPanel ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        {showRoutes && directionsRoute && (
          <div className="absolute bottom-4 right-4 z-[2200] max-w-sm rounded-xl bg-card/95 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Navigation className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Directions</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatDistance(directionsRoute.distance)}</span>
                    <span>|</span>
                    <span>{formatDuration(directionsRoute.duration)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleExitRoute}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Exit route"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
            {directionsRoute.steps.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto border-t border-border pt-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Turn-by-turn directions:</p>
                <div className="flex flex-col gap-2">
                  {directionsRoute.steps.slice(0, 8).map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${i === 0 ? "bg-green-500" : i === Math.min(7, directionsRoute.steps.length - 1) ? "bg-red-500" : "bg-border"}`} />
                      <div className="flex-1">
                        <p className="text-xs text-foreground">{step.instruction}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDistance(step.distance)}</p>
                      </div>
                    </div>
                  ))}
                  {directionsRoute.steps.length > 8 && (
                    <p className="text-xs text-muted-foreground">+{directionsRoute.steps.length - 8} more steps</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedLandmark && (
          <div className={`absolute left-4 z-[2200] w-[min(92vw,380px)] rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur-sm ${directionsRoute ? "bottom-48" : "bottom-4"}`}>
            <div className="mb-3 flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border">
                <Image
                  src={selectedLandmark.imageUrl && selectedLandmark.imageUrl !== "/images/icons/placeholder.jpg" ? selectedLandmark.imageUrl : "/images/icons/placeholder.jpg"}
                  alt={selectedLandmark.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{selectedLandmark.name}</p>
                <p className="text-xs text-muted-foreground">Explore this destination</p>
              </div>
            </div>

            <div className="mb-3 rounded-xl bg-secondary p-3">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Route Details</span>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <span>From: Your Location</span>
                  <span className="truncate">To: {selectedLandmark.name}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5">
                  <span>Estimated Commute:</span>
                  <span className="font-semibold text-foreground">~25 min</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                className="h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={() => void handleGoToLandmark(selectedLandmark.name)}
                disabled={directionsLoading}
              >
                {directionsLoading ? "Finding..." : "Go to this place"}
              </Button>
              <Button
                variant="outline"
                className="h-9 rounded-lg border-border px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleExitRoute}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {showLandmarksPanel && (
        <div className="relative w-full flex-shrink-0 overflow-y-auto border-t border-border bg-background p-4 lg:w-[360px] lg:border-l lg:border-t-0">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">Landmarks</h3>
          </div>
          {selectedLandmarkName && (
            <div className="mb-3 rounded-xl border border-border bg-secondary p-3">
              <p className="truncate text-xs text-muted-foreground">Selected: {selectedLandmarkName}</p>
              <Button
                className="mt-2 h-9 w-full rounded-lg bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={() => void handleGoToLandmark(selectedLandmarkName)}
                disabled={directionsLoading}
              >
                {directionsLoading ? "Finding Route..." : "Go to this place"}
              </Button>
            </div>
          )}
          <div className="flex max-h-[calc(100vh-170px)] flex-col gap-2 overflow-y-auto pr-1">
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
      )}
    </div>
  )
}

export default function FullScreenMapPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-64px)] w-full bg-background" />}>
      <FullScreenMapPageContent />
    </Suspense>
  )
}
