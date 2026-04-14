import { UserPlus, SlidersHorizontal, Compass } from "lucide-react"

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your free account in seconds to unlock personalized travel recommendations and exclusive features.",
  },
  {
    step: 2,
    icon: SlidersHorizontal,
    title: "Choose Preferences",
    description: "Tell us what you love - beaches, food, culture, nightlife - and we'll curate the perfect Iloilo itinerary.",
  },
  {
    step: 3,
    icon: Compass,
    title: "Enjoy Exploring",
    description: "Discover hidden gems, popular attractions, and local favorites. Navigate easily with our interactive map.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-secondary py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-medium text-primary">Getting Started</p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground">
            Start your Iloilo adventure in three easy steps. It&apos;s simple, fast, and fun.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.step}
              className="group relative flex flex-col items-center rounded-2xl bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"
            >
              {/* Step Badge */}
              <div className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {step.step}
              </div>
              <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
