"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import {
  FileSignature,
  DollarSign,
  Bell,
  Clock,
  ClipboardList,
  Package,
  AlertTriangle,
  Car
} from "lucide-react"

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

function ComplianceAlerts() {
  const alerts = [
    { days: 128, status: "green", doc: "House Rules" },
    { days: 54, status: "yellow", doc: "Employment Contract" },
    { days: 23, status: "orange", doc: "Safety Manual" },
  ]

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div key={i} className="flex items-center gap-3 text-sm">
          <div
            className={`w-2 h-2 rounded-full ${
              alert.status === "green"
                ? "bg-green-500"
                : alert.status === "yellow"
                ? "bg-yellow-500"
                : "bg-orange-500"
            }`}
          />
          <span className="text-zinc-400">{alert.doc}</span>
          <span className="ml-auto text-zinc-500">{alert.days}d</span>
        </div>
      ))}
    </div>
  )
}

function BudgetChart() {
  const [animated, setAnimated] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) setAnimated(true)
  }, [isInView])

  return (
    <div ref={ref} className="space-y-3">
      <div className="flex justify-between text-xs text-zinc-500 mb-2">
        <span>Budget vs Actual</span>
        <span>85%</span>
      </div>
      {[
        { label: "Materials", value: 75, color: "bg-blue-500" },
        { label: "Labor", value: 90, color: "bg-green-500" },
        { label: "Equipment", value: 60, color: "bg-orange-500" },
      ].map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-400">{item.label}</span>
            <span className="text-zinc-500">{item.value}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${item.color}`}
              initial={{ width: 0 }}
              animate={{ width: animated ? `${item.value}%` : 0 }}
              transition={{ duration: 1, delay: i * 0.2 }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FeatureModules() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Complete Governance Platform
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Eight integrated modules covering every aspect of estate management, from legally
            enforceable signatures to operational excellence.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* Large card - Document Management */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 group relative p-6 rounded-2xl bg-gradient-to-br from-blue-950/50 to-zinc-900 border border-blue-800/50 hover:border-blue-600/50 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="p-2 rounded-lg bg-blue-900/50 w-fit mb-4">
                  <FileSignature className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Document Management & E-Signatures
                </h3>
                <p className="text-zinc-400 text-sm mb-4">
                  DocuSeal integration for BCEA-compliant e-signatures with cryptographic audit
                  trails. Full version control and multi-signatory workflows.
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 text-xs bg-blue-900/50 rounded text-blue-300">
                    18 Documents
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-900/50 rounded text-blue-300">
                    100% Compliant
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Tracking */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-gradient-to-br from-green-950/50 to-zinc-900 border border-green-800/50 hover:border-green-600/50 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-green-900/50 w-fit mb-4">
              <DollarSign className="w-5 h-5 text-green-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Financial Tracking</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Dual-mode expense management with contractor milestone payments and budget tracking.
            </p>
            <BudgetChart />
          </motion.div>

          {/* Compliance Alerts */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-gradient-to-br from-orange-950/50 to-zinc-900 border border-orange-800/50 hover:border-orange-600/50 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-orange-900/50 w-fit mb-4">
              <Bell className="w-5 h-5 text-orange-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Automated Compliance</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Multi-stage alerts (60d/30d/7d) for document expiry, leave accruals, and reviews.
            </p>
            <ComplianceAlerts />
          </motion.div>

          {/* Time Tracking */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <Clock className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Time Tracking</h3>
            <p className="text-zinc-400 text-sm mb-4">
              BCEA-compliant clock-in/out with automatic overtime calculation (&gt;9hrs/day).
            </p>
            <div className="text-sm">
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>This Week</span>
                <span className="text-emerald-400">42.5 hrs</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Overtime</span>
                <span className="text-orange-400">0.5 hrs</span>
              </div>
            </div>
          </motion.div>

          {/* Task Management */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <ClipboardList className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Task Management</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Daily and recurring task assignments with time logging and completion tracking.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 text-center p-2 bg-zinc-800 rounded">
                <div className="text-xl font-bold text-white">38</div>
                <div className="text-xs text-zinc-500">Complete</div>
              </div>
              <div className="flex-1 text-center p-2 bg-zinc-800 rounded">
                <div className="text-xl font-bold text-blue-400">6</div>
                <div className="text-xs text-zinc-500">Active</div>
              </div>
            </div>
          </motion.div>

          {/* Asset Registry */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <Package className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Asset Registry</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Complete tracking of tools, vehicles, and equipment with maintenance schedules.
            </p>
            <div className="text-xs text-zinc-500">
              6 assets • R434,400 total value
            </div>
          </motion.div>

          {/* Incident Reporting */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <AlertTriangle className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Incident Reporting</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Safety, equipment, and household incident tracking with automated routing.
            </p>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded">0 High</span>
              <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded">1 Med</span>
              <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded">3 Low</span>
            </div>
          </motion.div>

          {/* Vehicle Logs */}
          <motion.div
            variants={itemVariants}
            className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
              <Car className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Vehicle Logs</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Usage authorization, fuel tracking, and child transport compliance.
            </p>
            <div className="text-sm text-zinc-400">
              <div className="flex justify-between mb-1">
                <span>Distance</span>
                <span className="text-white">171 km</span>
              </div>
              <div className="flex justify-between">
                <span>Fuel Cost</span>
                <span className="text-white">R1,237</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
