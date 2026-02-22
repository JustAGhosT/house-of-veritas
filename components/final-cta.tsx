"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-24 px-4">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Ready to transform your governance?
        </h2>
        <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          Join House of Veritas in achieving 100% digital compliance with legally enforceable e-signatures and complete operational transparency.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="shimmer-btn bg-blue-600 text-white hover:bg-blue-700 rounded-full px-8 h-14 text-base font-medium shadow-lg shadow-blue-600/20"
            data-testid="final-cta-access-btn"
          >
            Access Platform
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 h-14 text-base font-medium border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 bg-transparent"
            data-testid="final-cta-contact-btn"
          >
            Contact Administrator
          </Button>
        </div>

        <p className="mt-8 text-sm text-zinc-500">Azure-powered • BCEA Compliant • 99.9% Uptime SLA</p>
      </motion.div>
    </section>
  )
}
