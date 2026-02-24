"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const navItems = [
  { label: "Documents", href: "#documents" },
  { label: "Operations", href: "#features" },
  { label: "Reports", href: "#dashboard" },
  { label: "Help", href: "#help" },
]

export function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className="fixed top-0 right-0 left-0 z-50 w-full"
    >
      <nav
        ref={navRef}
        className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8"
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
                  layoutId="navbar-hover"
                  className="absolute inset-0 rounded-full bg-zinc-800"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer text-zinc-400 hover:bg-zinc-800 hover:text-white"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            size="sm"
            className="shimmer-btn cursor-pointer rounded-full bg-blue-600 px-4 text-white hover:bg-blue-700"
            asChild
          >
            <Link href="/login">Access Documents</Link>
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
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
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
              asChild
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              className="shimmer-btn cursor-pointer rounded-full bg-blue-600 text-white hover:bg-blue-700"
              asChild
            >
              <Link href="/login">Access Documents</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
