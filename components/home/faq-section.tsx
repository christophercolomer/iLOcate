"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is iLOcate?",
    answer:
      "iLOcate is a tourism discovery platform designed to help tourists and locals explore the best places, food, events, and experiences in Iloilo City, Philippines.",
  },
  {
    question: "Is iLOcate free to use?",
    answer:
      "Yes! iLOcate offers a free tier with access to place listings, food recommendations, and event information. A Premium plan is available for advanced features like custom itineraries and offline maps.",
  },
  {
    question: "How do I navigate around Iloilo?",
    answer:
      "Use our interactive Map tab to find PUJ (Public Utility Jeepney) routes, commute directions, and nearby points of interest. You can search routes from one location to another.",
  },
  {
    question: "Is the map feature available offline?",
    answer:
      "Offline maps are available for Premium users. Free users can access the interactive map with an internet connection.",
  },
]

export function FaqSection() {
  return (
    <section id="faqs" className="scroll-mt-20 bg-background py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 lg:px-6">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-medium text-primary">Support</p>
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-muted-foreground">
            Got questions? We&apos;ve got answers. If you don&apos;t find what you need, feel free to reach out.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border">
                <AccordionTrigger className="py-5 text-left text-base font-medium text-foreground hover:text-primary hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
