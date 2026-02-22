"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

interface TutorialStep {
  target?: string
  title: string
  body: string
}

export function OnboardingTutorial({
  steps,
  onComplete,
}: {
  steps: TutorialStep[]
  onComplete: () => void
}) {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  const current = steps[step]
  const isLast = step === steps.length - 1

  const handleNext = () => {
    if (isLast) {
      onComplete()
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#0d0d12] border border-white/20 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 text-blue-400 mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Guided Tour</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{current?.title}</h3>
          <p className="text-white/70 text-sm leading-relaxed">{current?.body}</p>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === step ? "bg-blue-500" : "bg-white/30"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-white/60" onClick={handleSkip}>
              Skip
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleNext}>
              {isLast ? "Finish" : "Next"}
              {!isLast && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

