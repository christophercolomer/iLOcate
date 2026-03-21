"use client"

import { useState } from "react"
import { ArrowRightLeft, Volume2, Copy, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const sampleTranslations: Record<string, string> = {
  "hello": "Kamusta",
  "thank you": "Salamat",
  "how much is this": "Tag-pila ini?",
  "where is": "Diin ang",
  "good morning": "Maayong aga",
  "good evening": "Maayong gab-i",
  "delicious": "Namit",
  "beautiful": "Matahum",
  "i love iloilo": "Palangga ko ang Iloilo",
  "excuse me": "Palihog",
}

export default function TranslatorPage() {
  const [fromLang, setFromLang] = useState("English")
  const [toLang, setToLang] = useState("Ilonggo")
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
  const charLimit = 500

  const swapLanguages = () => {
    setFromLang(toLang)
    setToLang(fromLang)
    setInputText(outputText)
    setOutputText(inputText)
  }

  const handleTranslate = () => {
    const key = inputText.toLowerCase().trim()
    if (sampleTranslations[key]) {
      setOutputText(sampleTranslations[key])
    } else {
      setOutputText(`[Translation of "${inputText}" to ${toLang}]`)
    }
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(outputText)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Translator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Translate between English and Ilonggo (Hiligaynon) to communicate with locals.
        </p>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-sm">
        {/* Language Selector */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex-1 rounded-xl bg-secondary px-4 py-3">
            <label htmlFor="from-lang" className="sr-only">From language</label>
            <select
              id="from-lang"
              value={fromLang}
              onChange={(e) => setFromLang(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none"
            >
              <option>English</option>
              <option>Ilonggo</option>
              <option>Filipino</option>
            </select>
          </div>

          <button
            onClick={swapLanguages}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            aria-label="Swap languages"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </button>

          <div className="flex-1 rounded-xl bg-secondary px-4 py-3">
            <label htmlFor="to-lang" className="sr-only">To language</label>
            <select
              id="to-lang"
              value={toLang}
              onChange={(e) => setToLang(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none"
            >
              <option>Ilonggo</option>
              <option>English</option>
              <option>Filipino</option>
            </select>
          </div>
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <label htmlFor="translate-input" className="sr-only">Text to translate</label>
          <textarea
            id="translate-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value.slice(0, charLimit))}
            placeholder="Type here..."
            rows={4}
            className="w-full resize-none rounded-xl border border-input bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button className="text-muted-foreground hover:text-foreground" aria-label="Listen to input">
              <Volume2 className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground">
              {inputText.length}/{charLimit}
            </span>
          </div>
        </div>

        {/* Translate Button */}
        <Button
          onClick={handleTranslate}
          disabled={!inputText.trim()}
          className="mb-4 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Translate
        </Button>

        {/* Output */}
        <div className="relative rounded-xl border border-border bg-secondary p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Output</span>
            <div className="flex items-center gap-2">
              <button onClick={copyOutput} className="text-muted-foreground hover:text-foreground" aria-label="Copy translation">
                <Copy className="h-4 w-4" />
              </button>
              <button className="text-muted-foreground hover:text-foreground" aria-label="Listen to translation">
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="min-h-[60px] text-sm text-foreground">
            {outputText || "Translation will appear here..."}
          </p>
        </div>

        {/* Premium upsell */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <Crown className="h-4 w-4 text-accent" />
          <p className="text-xs text-muted-foreground">
            <Link href="/premium" className="font-medium text-accent hover:underline">
              Upgrade to Premium
            </Link>
            {" "}for unlimited translations.
          </p>
        </div>
      </div>
    </div>
  )
}
