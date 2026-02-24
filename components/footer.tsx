"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"

const footerLinks = {
  Platform: ["Documents", "Operations", "Reports", "Dashboards", "Compliance"],
  Resources: ["Documentation", "User Guides", "Training", "Support", "API"],
  Company: ["About", "Contact", "Privacy", "Terms", "Security"],
  Legal: ["BCEA Compliance", "POPIA", "ECT Act", "Audit Logs", "Certifications"],
}

export function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <footer ref={ref} className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-8 md:grid-cols-5"
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex cursor-pointer items-center gap-3">
              <Image src="/hv-logo-small.svg" alt="House of Veritas" width={40} height={40} />
              <span className="font-semibold text-white">House of Veritas</span>
            </Link>
            <p className="mb-4 text-sm text-zinc-500">
              Secure estate management and digital governance platform.
            </p>
            {/* System Status */}
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5">
              <span className="pulse-glow h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-400">All Systems Operational</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold text-white">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="cursor-pointer text-sm text-zinc-500 transition-colors hover:text-white"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 sm:flex-row"
        >
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} House of Veritas. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="cursor-pointer text-sm text-zinc-500 transition-colors hover:text-white"
            >
              Documentation
            </Link>
            <Link
              href="#"
              className="cursor-pointer text-sm text-zinc-500 transition-colors hover:text-white"
            >
              Support
            </Link>
            <Link
              href="#"
              className="cursor-pointer text-sm text-zinc-500 transition-colors hover:text-white"
            >
              Contact
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
