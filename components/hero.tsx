"use client"

import { Button } from "@/components/ui/button"
import { useLoginModal } from "@/lib/login-modal-context"
import { useMotion } from "@/lib/motion-context"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

const getTextRevealVariants = (motionEnabled: boolean) => ({
  hidden: { y: motionEnabled ? "100%" : 0 },
  visible: (i: number) => ({
    y: 0,
    transition: motionEnabled
      ? {
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1] as const,
          delay: i * 0.1,
        }
      : { duration: 0 },
  }),
})

export function Hero() {
  const { openLoginModal } = useLoginModal()
  const { motionEnabled } = useMotion()
  const textRevealVariants = getTextRevealVariants(motionEnabled)

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-zinc-950 via-zinc-950 to-zinc-900" />

      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-blue-900/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Badge */}
        <motion.div
          initial={motionEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionEnabled ? { duration: 0.6, delay: 0.2 } : { duration: 0 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-800/50 bg-zinc-900 px-4 py-2"
        >
          <span className="pulse-glow h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-sm text-zinc-400">Azure-Powered Platform</span>
        </motion.div>

        {/* Headline with text mask animation */}
        <h1
          className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              variants={textRevealVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              Governance Made Simple.
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block bg-linear-to-r from-blue-400 via-green-400 to-emerald-400 bg-clip-text text-transparent"
              variants={textRevealVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              Operations Made Transparent.
            </motion.span>
          </span>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={motionEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionEnabled ? { duration: 0.6, delay: 0.5 } : { duration: 0 }}
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl"
        >
          The complete platform for estate management, document compliance, and operational
          accountability. Everything you need for legally enforceable governance.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={motionEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionEnabled ? { duration: 0.6, delay: 0.6 } : { duration: 0 }}
          className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            className="shimmer-btn h-12 cursor-pointer rounded-full bg-blue-600 px-8 text-base font-medium text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
            data-testid="access-documents-btn"
            onClick={openLoginModal}
          >
            Access Documents
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 cursor-pointer rounded-full border-zinc-700 bg-transparent px-8 text-base font-medium text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
            data-testid="view-dashboard-btn"
            onClick={openLoginModal}
          >
            View Operations Dashboard
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
