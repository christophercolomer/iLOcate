"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react"
import { auth, db } from "@/lib/firebase"
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null)
  const [authing, setAuthing] = useState(false)
  const redirectRef = useRef<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user && !authing && !redirectRef.current) {
      router.push("/dashboard")
    }
  }, [user, router, authing])

  const validate = () => {
    const newErrors: { fullName?: string; email?: string; password?: string } = {}
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required."
    }
    if (!email) {
      newErrors.email = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address."
    }
    if (!password) {
      newErrors.password = "Password is required."
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters."
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    if (!validate()) return

    setLoading(true)
    setAuthing(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: fullName })
      
      // Save user information to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName: fullName,
        email: email,
        uid: userCredential.user.uid,
        createdAt: new Date().toISOString(),
        preferences: [],
        preferencesSet: false,
      })
      
      redirectRef.current = "/preferences"
      router.push("/preferences")
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === "auth/email-already-in-use") {
        setErrors({ email: "An account with this email already exists." })
      } else if (code === "auth/invalid-email") {
        setErrors({ email: "Please enter a valid email address." })
      } else if (code === "auth/weak-password") {
        setErrors({ password: "Password is too weak. Use at least 8 characters." })
      } else {
        setErrors({ general: "Something went wrong. Please try again." })
      }
    } finally {
      setLoading(false)
      setAuthing(false)
    }
  }

  const handleGoogleSignup = async () => {
    setErrors({})
    setSocialLoading("google")
    setAuthing(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Save user information to Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        fullName: result.user.displayName || "",
        email: result.user.email || "",
        uid: result.user.uid,
        createdAt: new Date().toISOString(),
        preferences: [],
        preferencesSet: false,
      }, { merge: true })
      
      redirectRef.current = "/preferences"
      router.push("/preferences")
    } catch {
      setErrors({ general: "Google sign-up failed. Please try again." })
    } finally {
      setSocialLoading(null)
      setAuthing(false)
    }
  }

  const handleFacebookSignup = async () => {
    setErrors({})
    setSocialLoading("facebook")
    setAuthing(true)
    try {
      const provider = new FacebookAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Save user information to Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        fullName: result.user.displayName || "",
        email: result.user.email || "",
        uid: result.user.uid,
        createdAt: new Date().toISOString(),
        preferences: [],
        preferencesSet: false,
      }, { merge: true })
      
      redirectRef.current = "/preferences"
      router.push("/preferences")
    } catch {
      setErrors({ general: "Facebook sign-up failed. Please try again." })
    } finally {
      setSocialLoading(null)
      setAuthing(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-4">
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Back to home
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join iLOcate and start discovering the best of Iloilo
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5" noValidate>
        {errors.general && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errors.general}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fullName"
              type="text"
              placeholder="Juan Dela Cruz"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`rounded-xl border-border pl-10 ${errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}`}
              disabled={loading}
            />
          </div>
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`rounded-xl border-border pl-10 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
              disabled={loading}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`rounded-xl border-border pl-10 pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password
            ? <p className="text-xs text-destructive">{errors.password}</p>
            : <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
          }
        </div>

        <Button
          type="submit"
          className="h-11 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <span className="relative bg-background px-3 text-xs text-muted-foreground">or sign up with</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-border text-foreground"
            onClick={handleGoogleSignup}
            disabled={!!socialLoading || loading}
          >
            {socialLoading === "google" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-border text-foreground"
            onClick={handleFacebookSignup}
            disabled={!!socialLoading || loading}
          >
            {socialLoading === "facebook" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  )
}
