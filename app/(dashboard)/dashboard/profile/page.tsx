"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Coffee, UtensilsCrossed, Waves, Landmark, Church, ShoppingBag, Music, Palette, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/firebase"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { useAuth } from "@/lib/auth-context"

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

export default function ProfilePage() {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const fetchPreferences = async () => {
      const currentUser = auth.currentUser
      if (!currentUser) {
        router.push("/login")
        return
      }

      try {
        const userDoc = await getDoc(doc(getFirestore(), "users", currentUser.uid))
        if (userDoc.exists() && userDoc.data().preferences) {
          setSelected(userDoc.data().preferences)
        }
      } catch (error) {
        console.error("Error fetching preferences:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [router])

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleSavePreferences = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      router.push("/login")
      return
    }

    setSaving(true)
    try {
      await setDoc(
        doc(getFirestore(), "users", currentUser.uid),
        {
          preferences: selected,
          preferencesUpdatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="mb-8 rounded-xl border border-border bg-background p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Account Information</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium text-foreground">{user?.displayName || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="rounded-xl border border-border bg-background p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Your Preferences</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Select the categories that interest you. We will personalize your experience based on your preferences.
        </p>

        <div className="flex flex-col gap-3">
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
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="h-3 w-3 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
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
          onClick={handleSavePreferences}
          disabled={saving}
          className="mt-6 h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  )
}
