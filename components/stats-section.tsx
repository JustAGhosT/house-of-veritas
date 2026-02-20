"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Stats {
  documents: {
    total: number
    digitized: number
    compliance: number
  }
  users: {
    total: number
    active: number
    names: string[]
  }
  uptime: {
    percentage: number
  }
}

export function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats:', err))
  }, [])

  if (!stats) return null

  const statsData = [
    {
      value: stats.documents.digitized,
      label: "Governance Documents",
      sublabel: "Digitized",
      color: "text-blue-400"
    },
    {
      value: `${stats.users.active}`,
      label: "Active Users",
      sublabel: stats.users.names.join(", "),
      color: "text-green-400"
    },
    {
      value: `${stats.documents.compliance}%`,
      label: "Document Compliance",
      sublabel: "Fully compliant",
      color: "text-emerald-400"
    },
    {
      value: `${stats.uptime.percentage}%`,
      label: "System Uptime",
      sublabel: "Last 30 days",
      color: "text-blue-500"
    }
  ]

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all duration-300"
            >
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-zinc-300 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-zinc-500">
                  {stat.sublabel}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
