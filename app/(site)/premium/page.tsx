"use client"

import { Check, X, Crown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for casual explorers",
    features: [
      { text: "Browse all places & food spots", included: true },
      { text: "View the interactive map", included: true },
      { text: "Itinerary Planner (3 trials)", included: true },
      { text: "Ad-free experience", included: false },
      { text: "Translator (3 Translations)", included: true },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Premium",
    price: "49",
    period: "/month",
    description: "For the ultimate Iloilo explorer",
    features: [
      { text: "Browse all places & food spots", included: true },
      { text: "View the interactive map", included: true },
      { text: "Itinerary Planner", included: true },
      { text: "Ad-free experience", included: true },
      { text: "Translator", included: true },
    ],
    cta: "Upgrade Now",
    popular: true,
  },
]

export default function PremiumPage() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            <Crown className="h-4 w-4" />
            Premium Plans
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Unlock the Full Iloilo Experience
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base lg:text-lg">
            Choose the plan that fits your exploration style. Upgrade anytime to access exclusive features and premium content.
          </p>
        </div>

        {/* Plans */}
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-2 transition-shadow hover:shadow-lg ${
                plan.popular
                  ? "border-primary shadow-md"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="pb-4 pt-8 text-center">
                <CardTitle className="text-xl font-bold text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-sm text-muted-foreground">PHP</span>
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      ) : (
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                          <X className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup">
                  <Button
                    className={`min-h-11 w-full rounded-xl ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-sm text-muted-foreground">
            Have questions about our plans?{" "}
            <Link href="/faqs" className="font-medium text-primary hover:underline">
              Check our FAQs
            </Link>{" "}
            or contact our support team.
          </p>
        </div>
      </div>
    </section>
  )
}
