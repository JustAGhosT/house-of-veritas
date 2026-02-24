"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { logger } from "@/lib/logger"

interface Stats {
  users?: { total: number; active: number; names: string[] }
  tasks?: { total: number; completed: number; inProgress: number; overdue: number }
  expenses?: { thisMonth: number; pending: number; approved: number }
  budget?: { allocated: number; spent: number; remaining: number; percentage: number }
}

export function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => logger.error('Failed to fetch stats', { error: err instanceof Error ? err.message : String(err) }))
  }, [])

  if (!stats) return null

  const users = stats.users ?? { total: 0, active: 0, names: [] }
  const tasks = stats.tasks ?? { total: 0, completed: 0, inProgress: 0, overdue: 0 }
  const budget = stats.budget ?? { allocated: 0, spent: 0, remaining: 0, percentage: 0 }

  const statsData = [
    {
      value: tasks.total,
      label: "Tasks",
      sublabel: `${tasks.completed} completed`,
      color: "text-blue-400"
    },
    {
      value: users.active,
      label: "Active Users",
      sublabel: users.names?.join(", ") ?? "—",
      color: "text-green-400"
    },
    {
      value: `${budget.percentage}%`,
      label: "Budget Used",
      sublabel: `R${budget.spent?.toLocaleString() ?? 0} of R${budget.allocated?.toLocaleString() ?? 0}`,
      color: "text-emerald-400"
    },
    {
      value: tasks.overdue,
      label: "Overdue Tasks",
      sublabel: "Requires attention",
      color: tasks.overdue > 0 ? "text-amber-400" : "text-blue-500"
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
