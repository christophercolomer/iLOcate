import Image from "next/image"
import Link from "next/link"
import { MapPin } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left: Image */}
      <div className="relative hidden w-1/2 lg:block">
        <Image
          src="/images/hero-iloilo.jpg"
          alt="Beautiful Iloilo scenery"
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/30 to-black/50" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="h-7 w-7 text-white" />
            <span className="text-xl font-bold text-white">
              iLO<span className="text-primary-foreground">cate</span>
            </span>
          </Link>
          <div>
            <h2 className="text-balance text-3xl font-bold leading-tight text-white">
              Discover the beauty of Iloilo
            </h2>
            <p className="mt-3 max-w-sm text-pretty text-sm leading-relaxed text-white/80">
              Join thousands of explorers finding the best places, food, and experiences in the City of Love.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center px-6 py-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">
              iLO<span className="text-primary">cate</span>
            </span>
          </Link>
        </div>
        <main className="flex flex-1 items-center justify-center px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
