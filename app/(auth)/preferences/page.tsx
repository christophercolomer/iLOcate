"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Coffee, UtensilsCrossed, Waves, Landmark, Church, ShoppingBag, Music, Palette, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { auth } from "@/lib/firebase"
import { getFirestore, doc, setDoc } from "firebase/firestore"

const categories = [
  { id: "coffee-shops", label: "Coffee Shops", icon: Coffee },
  { id: "restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { id: "beaches", label: "Beaches", icon: Waves },
  { id: "heritage", label: "Heritage Sites", icon: Landmark },
  { id: "churches", label: "Churches", icon: Church },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "nightlife", label: "Nightlife & Events", icon: Music },
  { id: "arts", label: "Arts & Culture", icon: Palette },
]

export default function PreferencesPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleContinue = async () => {
    const user = auth.currentUser
    if (!user) { router.push("/login"); return }

    setLoading(true)
    try {
      const db = getFirestore()
      // Save preferences to Firestore under the user's ID
      await setDoc(doc(db, "users", user.uid), {
        preferences: selected,
        preferencesSet: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true })

      router.push("/dashboard")
    } catch {
      // Still proceed to dashboard even if saving fails
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-2 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold text-primary">iLOcate</span>
      </div>

      <h1 className="mt-4 text-2xl font-bold text-foreground">What are your likings?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Select the categories that interest you. We will personalize your experience based on your preferences.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {categories.map((cat) => {
          const isSelected = selected.includes(cat.id)
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all ${
                isSelected ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"
              }`}
            >
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                isSelected ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background"
              }`}>
                {isSelected && (
                  <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                {cat.label}
              </span>
            </button>
          )
        })}
      </div>

      <Button
        onClick={handleContinue}
        disabled={selected.length === 0 || loading}
        className="mt-8 h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Continue"}
      </Button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        You can always change your preferences later in settings.
      </p>
    </div>
  )
}
