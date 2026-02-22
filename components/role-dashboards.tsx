"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Shield, Wrench, Sprout, Home } from "lucide-react"

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
      "User management"
    ]
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
      "Workshop tools access"
    ]
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
      "Garden equipment access"
    ]
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
      "Simplified interface"
    ]
  }
]

const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  blue: {
    bg: "from-blue-950/50 to-zinc-900",
    border: "border-blue-800/50 hover:border-blue-600/50",
    text: "text-blue-400",
    icon: "bg-blue-900/50"
  },
  green: {
    bg: "from-green-950/50 to-zinc-900",
    border: "border-green-800/50 hover:border-green-600/50",
    text: "text-green-400",
    icon: "bg-green-900/50"
  },
  emerald: {
    bg: "from-emerald-950/50 to-zinc-900",
    border: "border-emerald-800/50 hover:border-emerald-600/50",
    text: "text-emerald-400",
    icon: "bg-emerald-900/50"
  },
  orange: {
    bg: "from-orange-950/50 to-zinc-900",
    border: "border-orange-800/50 hover:border-orange-600/50",
    text: "text-orange-400",
    icon: "bg-orange-900/50"
  }
}

export function RoleDashboards() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Role-Based Access Control
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Each user sees only what&apos;s relevant to their role. Granular permissions ensure
            security while maintaining ease of use.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon
            const colors = colorClasses[role.color]

            return (
              <motion.div
                key={role.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`p-6 rounded-2xl bg-linear-to-br ${colors.bg} border ${colors.border} hover:scale-[1.02] transition-all duration-300`}
              >
                <div className={`p-3 rounded-lg ${colors.icon} w-fit mb-4`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{role.name}</h3>
                <p className="text-sm text-zinc-400 mb-4">{role.title}</p>
                <ul className="space-y-2">
                  {role.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                      <span className={`mt-1 w-1 h-1 rounded-full ${colors.text.replace('text', 'bg')} shrink-0`} />
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
