"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useLoginModal } from "@/lib/login-modal-context"
import { useMotion } from "@/lib/motion-context"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, X, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRef, useState } from "react"

const navItems = [
  { label: "Compliance", href: "#compliance" },
  { label: "Operations", href: "#features" },
  { label: "Reports", href: "#dashboard" },
  { label: "Help", href: "#help" },
]

export function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { motionEnabled, setMotionEnabled } = useMotion()
  const { openLoginModal } = useLoginModal()
  const navRef = useRef<HTMLDivElement>(null)

  return (
    <motion.header
      initial={motionEnabled ? { y: -100, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={motionEnabled ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } : { duration: 0 }}
      className="fixed top-0 left-0 right-0 z-50 w-full min-w-full"
    >
      <nav
        ref={navRef}
        className="flex w-full min-w-full max-w-none items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8"
      >
        {/* Logo */}
        <Link href="/" className="flex cursor-pointer items-center gap-3">
          <Image src="/hv-logo-small.svg" alt="House of Veritas" width={40} height={40} />
          <span className="hidden font-semibold text-white sm:block">House of Veritas</span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="relative hidden items-center gap-1 md:flex">
          {navItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative cursor-pointer px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {hoveredIndex === index && (
                <motion.div
                  layoutId={motionEnabled ? "navbar-hover" : undefined}
                  className="absolute inset-0 rounded-full bg-zinc-800"
                  initial={false}
                  transition={motionEnabled ? { type: "spring", stiffness: 500, damping: 30 } : { duration: 0 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Motion Toggle */}
          <div className="flex items-center gap-2 border-r border-zinc-700 pr-3">
            <Zap size={14} className={motionEnabled ? "text-yellow-400" : "text-zinc-500"} />
            <Switch
              checked={motionEnabled}
              onCheckedChange={setMotionEnabled}
              className="scale-75"
              aria-label="Toggle animations"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-zinc-400 hover:bg-zinc-800 hover:text-white"
            onClick={openLoginModal}
          >
            Login
          </Button>
          <Button
            size="sm"
            className="shimmer-btn cursor-pointer rounded-full bg-blue-600 px-4 text-white hover:bg-blue-700"
            onClick={openLoginModal}
          >
            Access Documents
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="cursor-pointer p-2 text-zinc-400 hover:text-white md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={motionEnabled ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={motionEnabled ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
            transition={motionEnabled ? undefined : { duration: 0 }}
            className="absolute top-full right-0 left-0 border-b border-zinc-800 bg-zinc-900/98 p-4 backdrop-blur-md"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="cursor-pointer rounded-lg px-4 py-3 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-2 border-zinc-800" />
              <Button
                variant="ghost"
                className="cursor-pointer justify-start text-zinc-400 hover:text-white"
                onClick={() => {
                  openLoginModal()
                  setMobileMenuOpen(false)
                }}
              >
                Login
              </Button>
              <Button
                className="shimmer-btn cursor-pointer rounded-full bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  openLoginModal()
                  setMobileMenuOpen(false)
                }}
              >
                Access Documents
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.header>
  )
}
