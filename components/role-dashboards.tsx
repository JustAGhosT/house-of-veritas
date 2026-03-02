"use client"

import { useMotion } from "@/lib/motion-context"
import { motion, useInView } from "framer-motion"
import { Home, Shield, Sprout, Wrench } from "lucide-react"
import { useRef } from "react"

const roles = [
  {
    name: "Hans",
    title: "Owner/Administrator",
    icon: Shield,
    color: "blue",
    features: [
      "Complete oversight dashboard",
      "Approval workflows",
      "Financial tracking",
      "Compliance monitoring",
      "User management",
    ],
  },
  {
    name: "Charl",
    title: "Workshop Operator",
    icon: Wrench,
    color: "green",
    features: [
      "My tasks dashboard",
      "Asset management",
      "Time logging",
      "Incident reporting",
      "Workshop tools access",
    ],
  },
  {
    name: "Lucky",
    title: "Gardener/Handyman",
    icon: Sprout,
    color: "emerald",
    features: [
      "Daily task list",
      "Expense submission",
      "Time tracking",
      "Vehicle logs",
      "Garden equipment access",
    ],
  },
  {
    name: "Irma",
    title: "Resident/Household",
    icon: Home,
    color: "orange",
    features: [
      "Household tasks",
      "Resident agreement",
      "Incident reporting",
      "Child-related logs",
      "Simplified interface",
    ],
  },
]

const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  blue: {
    bg: "from-blue-950/50 to-zinc-900",
    border: "border-blue-800/50 hover:border-blue-600/50",
    text: "text-blue-400",
    icon: "bg-blue-900/50",
  },
  green: {
    bg: "from-green-950/50 to-zinc-900",
    border: "border-green-800/50 hover:border-green-600/50",
    text: "text-green-400",
    icon: "bg-green-900/50",
  },
  emerald: {
    bg: "from-emerald-950/50 to-zinc-900",
    border: "border-emerald-800/50 hover:border-emerald-600/50",
    text: "text-emerald-400",
    icon: "bg-emerald-900/50",
  },
  orange: {
    bg: "from-orange-950/50 to-zinc-900",
    border: "border-orange-800/50 hover:border-orange-600/50",
    text: "text-orange-400",
    icon: "bg-orange-900/50",
  },
}

export function RoleDashboards() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { motionEnabled } = useMotion()

  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={motionEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={motionEnabled ? { duration: 0.6 } : { duration: 0 }}
          className="mb-16 text-center"
        >
          <h2
            className="mb-4 text-3xl font-bold text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Role-Based Access Control
          </h2>
          <p className="mx-auto max-w-2xl text-zinc-400">
            Each user sees only what&apos;s relevant to their role. Granular permissions ensure
            security while maintaining ease of use.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {roles.map((role, index) => {
            const Icon = role.icon
            const colors = colorClasses[role.color]

            return (
              <motion.div
                key={role.name}
                initial={motionEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={motionEnabled ? { duration: 0.6, delay: index * 0.1 } : { duration: 0 }}
                className={`rounded-2xl bg-linear-to-br p-6 ${colors.bg} border ${colors.border} transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className={`rounded-lg p-3 ${colors.icon} mb-4 w-fit`}>
                  <Icon className={`h-6 w-6 ${colors.text}`} strokeWidth={1.5} />
                </div>
                <h3 className="mb-1 text-xl font-bold text-white">{role.name}</h3>
                <p className="mb-4 text-sm text-zinc-400">{role.title}</p>
                <ul className="space-y-2">
                  {role.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                      <span
                        className={`mt-1 h-1 w-1 rounded-full ${colors.text.replace("text", "bg")} shrink-0`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
