"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  Award,
  CalendarCheck2,
  Heart,
  HeartOff,
  MapPin,
  Pencil,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
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

  const image =
    typeof source.image === "string"
      ? source.image
      : typeof source.imageUrl === "string"
        ? source.imageUrl
        : category === "Food"
          ? "/images/food/iloilo-food.jpg"
          : "/images/places/miagao-church.jpg"

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
  const { user } = useAuth()
  const [likedItems, setLikedItems] = useState<LikedItem[]>([])

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

  useEffect(() => {
    const storedItems = loadLikedItemsFromStorage()
    setLikedItems(storedItems)

    const syncLikes = () => {
      const nextItems = loadLikedItemsFromStorage()
      setLikedItems(nextItems)
    }

    window.addEventListener("storage", syncLikes)
    window.addEventListener("ilocate-likes-updated", syncLikes)

    return () => {
      window.removeEventListener("storage", syncLikes)
      window.removeEventListener("ilocate-likes-updated", syncLikes)
    }
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
                          onClick={() => handleUnlike(item.id)}
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
