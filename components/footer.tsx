"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

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
      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-8"
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-3 mb-4">
              <img src="/hv-logo-small.svg" alt="House of Veritas" className="w-10 h-10" />
              <span className="font-semibold text-white">House of Veritas</span>
            </a>
            <p className="text-sm text-zinc-500 mb-4">Secure estate management and digital governance platform.</p>
            {/* System Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-glow" />
              <span className="text-xs text-zinc-400">All Systems Operational</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
                      {link}
                    </a>
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
          className="mt-16 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} House of Veritas. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Documentation
            </a>
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Support
            </a>
            <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
