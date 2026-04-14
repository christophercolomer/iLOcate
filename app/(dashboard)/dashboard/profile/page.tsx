"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Award,
  CalendarCheck2,
  Church,
  Coffee,
  Heart,
  HeartOff,
  Landmark,
  Loader2,
  MapPin,
  Pencil,
  ShoppingBag,
  Sparkles,
  Star,
  Utensils,
  UtensilsCrossed,
  Waves,
} from "lucide-react"
import { getDoc, getFirestore, doc, setDoc } from "firebase/firestore"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { landmarks } from "@/lib/landmarks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type LikedItem = {
  id: string
  name: string
  category: "Place" | "Food"
  image: string
  rating?: number
  label?: string
}

const STORAGE_KEYS = ["ilocate-liked-items", "likedItems", "favorites"]
const LIKES_STORAGE_KEY = "ilocate-liked-items"
const LIKES_UPDATED_EVENT = "ilocate-likes-updated"
const PREFERENCE_CATEGORIES = [
  { id: "coffee-shops", label: "Coffee Shops", icon: Coffee },
  { id: "restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { id: "beaches", label: "Beaches", icon: Waves },
  { id: "churches", label: "Churches", icon: Church },
  { id: "malls", label: "Malls", icon: ShoppingBag },
  { id: "city-landmarks", label: "City Landmarks & Attractions", icon: Landmark },
  { id: "museums", label: "Museums", icon: Landmark },
] as const

function toLandmarkSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function getFallbackImage(category: LikedItem["category"]) {
  return category === "Food"
    ? "/images/food/Local Food/iloilo-food.jpg"
    : "/images/places/Churches/miagao-church.jpg"
}

function findLandmarkImage(name: string) {
  const normalizedName = name.trim().toLowerCase()
  const matchingLandmark = landmarks.find((landmark) => landmark.name.trim().toLowerCase() === normalizedName)

  if (matchingLandmark?.imageUrl && matchingLandmark.imageUrl !== "/images/icons/placeholder.jpg") {
    return matchingLandmark.imageUrl
  }

  return null
}

function normalizeItem(input: unknown, idx: number): LikedItem | null {
  if (!input || typeof input !== "object") return null

  const source = input as Record<string, unknown>
  const name = typeof source.name === "string" ? source.name.trim() : ""
  if (!name) return null

  const rawCategory =
    typeof source.category === "string"
      ? source.category.toLowerCase()
      : typeof source.type === "string"
        ? source.type.toLowerCase()
        : ""

  const category: LikedItem["category"] =
    rawCategory === "food" || rawCategory === "cafe" ? "Food" : "Place"

  const storedImage =
    typeof source.image === "string"
      ? source.image
      : typeof source.imageUrl === "string"
        ? source.imageUrl
        : ""

  const resolvedLandmarkImage = findLandmarkImage(name)
  const image =
    resolvedLandmarkImage ||
    (storedImage && storedImage !== "/images/icons/placeholder.jpg" ? storedImage : getFallbackImage(category))

  const rating =
    typeof source.rating === "number" && Number.isFinite(source.rating)
      ? source.rating
      : undefined

  const label = typeof source.label === "string" ? source.label : undefined
  const id =
    typeof source.id === "string" && source.id.length > 0
      ? source.id
      : `liked-${idx}-${name.toLowerCase().replace(/\s+/g, "-")}`

  return {
    id,
    name,
    category,
    image,
    rating,
    label,
  }
}

function parseLikedItems(raw: string | null): LikedItem[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item, idx) => normalizeItem(item, idx))
      .filter((item): item is LikedItem => Boolean(item))
  } catch {
    return []
  }
}

function loadLikedItemsFromStorage(): LikedItem[] {
  if (typeof window === "undefined") return []

  for (const key of STORAGE_KEYS) {
    const items = parseLikedItems(window.localStorage.getItem(key))
    if (items.length > 0) return items
  }

  return []
}

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [likedItems, setLikedItems] = useState<LikedItem[]>([])
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([])
  const [loadingPreferences, setLoadingPreferences] = useState(true)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [selectedLikedItem, setSelectedLikedItem] = useState<LikedItem | null>(null)

  const handleUnlike = (id: string) => {
    setLikedItems((prev) => {
      const nextItems = prev.filter((item) => item.id !== id)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(nextItems))
        window.dispatchEvent(new Event(LIKES_UPDATED_EVENT))
      }
      return nextItems
    })
  }

  const togglePreference = (id: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSavePreferences = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) return

    setSavingPreferences(true)
    try {
      await setDoc(
        doc(getFirestore(), "users", currentUser.uid),
        {
          preferences: selectedPreferences,
          preferencesUpdatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setSavingPreferences(false)
    }
  }

  useEffect(() => {
    const storedItems = loadLikedItemsFromStorage()
    setLikedItems(storedItems)

    const syncLikes = () => {
      const nextItems = loadLikedItemsFromStorage()
      setLikedItems(nextItems)
    }

    window.addEventListener("storage", syncLikes)
    window.addEventListener(LIKES_UPDATED_EVENT, syncLikes)

    return () => {
      window.removeEventListener("storage", syncLikes)
      window.removeEventListener(LIKES_UPDATED_EVENT, syncLikes)
    }
  }, [])

  useEffect(() => {
    const fetchPreferences = async () => {
      const currentUser = auth.currentUser
      if (!currentUser) {
        setLoadingPreferences(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(getFirestore(), "users", currentUser.uid))
        const preferences = userDoc.data()?.preferences
        if (Array.isArray(preferences)) {
          setSelectedPreferences(
            preferences.filter((value): value is string => typeof value === "string")
          )
        }
      } catch (error) {
        console.error("Error fetching preferences:", error)
      } finally {
        setLoadingPreferences(false)
      }
    }

    fetchPreferences()
  }, [])

  const userName = useMemo(() => {
    if (user?.displayName && user.displayName.trim().length > 0) {
      return user.displayName
    }
    if (user?.email) {
      return user.email.split("@")[0]
    }
    return "ILocate Explorer"
  }, [user?.displayName, user?.email])

  const userEmail = user?.email || "explorer@ilocate.app"

  const userInitial = useMemo(() => {
    return userName.charAt(0).toUpperCase()
  }, [userName])

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-6">
      <div className="space-y-6">
        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-border">
                  <AvatarImage src={user?.photoURL || undefined} alt={userName} />
                  <AvatarFallback className="bg-primary/15 text-lg font-semibold text-primary">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                    {userName}
                  </h1>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-border/70 bg-background/60 px-4"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle>Your Preferences</CardTitle>
            </div>
            <CardDescription>
              Update what you like so recommendations stay relevant.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {loadingPreferences ? (
              <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your saved preferences...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {PREFERENCE_CATEGORIES.map((category) => {
                    const Icon = category.icon
                    const isSelected = selectedPreferences.includes(category.id)

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => togglePreference(category.id)}
                        className={`flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/70 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">{category.label}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSavePreferences}
                    disabled={savingPreferences || !user}
                    className="rounded-xl px-5"
                  >
                    {savingPreferences ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <CardTitle>Liked Places & Food</CardTitle>
            </div>
            <CardDescription>
              Your saved favorites across destinations and food spots.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {likedItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-background/40 p-8 text-center">
                <Heart className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">No liked items yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {likedItems.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => setSelectedLikedItem(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        setSelectedLikedItem(item)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="group overflow-hidden rounded-xl border border-border/70 bg-background/50 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute left-2 top-2">
                        <Badge
                          variant={item.category === "Food" ? "secondary" : "default"}
                          className="rounded-full"
                        >
                          {item.category === "Food" ? (
                            <Utensils className="h-3 w-3" />
                          ) : (
                            <MapPin className="h-3 w-3" />
                          )}
                          {item.category}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 p-4">
                      <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                        {item.name}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.label || "Saved favorite"}</span>
                        {typeof item.rating === "number" ? (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {item.rating.toFixed(1)}
                          </span>
                        ) : null}
                      </div>

                      <div className="pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleUnlike(item.id)
                          }}
                        >
                          <HeartOff className="h-3.5 w-3.5" />
                          Unlike
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedLikedItem && (
          <div
            className="fixed inset-0 z-[3000] overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:flex sm:items-center sm:justify-center"
            onClick={() => setSelectedLikedItem(null)}
          >
            <div
              className="relative z-[3001] mx-auto mt-6 max-h-[calc(100vh-3rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl sm:mt-0"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                  <Image
                    src={selectedLikedItem.image}
                    alt={selectedLikedItem.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedLikedItem.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedLikedItem.label || selectedLikedItem.category}</p>
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
                    <span>To: {selectedLikedItem.name}</span>
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
                  <span>{selectedLikedItem.name}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  className="h-11 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    const target = toLandmarkSlug(selectedLikedItem.name)
                    setSelectedLikedItem(null)
                    router.push(`/dashboard/map?landmark=${target}&go=1`)
                  }}
                >
                  Go to this place
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-border text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedLikedItem(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4 text-primary" />
              <CardTitle>Travel History</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
              Coming soon - This feature will show your visited places and trips.
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <CardTitle>Achievements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full px-3 py-1">Explorer</Badge>
              <Badge className="rounded-full px-3 py-1" variant="secondary">
                Foodie
              </Badge>
              <Badge className="rounded-full px-3 py-1" variant="outline">
                <Sparkles className="h-3 w-3" />
                First Trip
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Achievements will be unlocked based on your activity (coming soon)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
