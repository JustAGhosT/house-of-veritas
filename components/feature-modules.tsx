"use client"

import { useMotion } from "@/lib/motion-context"
import { motion, useInView } from "framer-motion"
import {
  AlertTriangle,
  Bell,
  Car,
  ClipboardList,
  Clock,
  DollarSign,
  FileSignature,
  Package,
} from "lucide-react"
import { startTransition, useEffect, useRef, useState } from "react"

const getContainerVariants = (motionEnabled: boolean) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionEnabled ? 0.1 : 0,
    },
  },
})

const getItemVariants = (motionEnabled: boolean) => ({
  hidden: { opacity: motionEnabled ? 0 : 1, y: motionEnabled ? 20 : 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: motionEnabled ? {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    } : { duration: 0 },
  },
})

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
            className={`h-2 w-2 rounded-full ${alert.status === "green"
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

function BudgetChart({ motionEnabled }: { motionEnabled: boolean }) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) startTransition(() => setAnimated(true))
  }, [isInView])

  return (
    <div ref={ref} className="space-y-3">
      <div className="mb-2 flex justify-between text-xs text-zinc-500">
        <span>Budget vs Actual</span>
        <span>85%</span>
      </div>
      {[
        { label: "Materials", value: 75, color: "bg-blue-500" },
        { label: "Labor", value: 90, color: "bg-green-500" },
        { label: "Equipment", value: 60, color: "bg-orange-500" },
      ].map((item, i) => (
        <div key={i}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-zinc-400">{item.label}</span>
            <span className="text-zinc-500">{item.value}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <motion.div
              className={`h-full ${item.color}`}
              initial={{ width: 0 }}
              animate={{ width: animated ? `${item.value}%` : 0 }}
              transition={motionEnabled ? { duration: 1, delay: i * 0.2 } : { duration: 0 }}
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
  const { motionEnabled } = useMotion()
  const containerVariants = getContainerVariants(motionEnabled)
  const itemVariants = getItemVariants(motionEnabled)

  return (
    <section id="features" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={motionEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={motionEnabled ? { duration: 0.6 } : { duration: 0 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 [font-family:var(--font-inter)] text-3xl font-bold text-white sm:text-4xl">
            Complete Governance Platform
          </h2>
          <p className="mx-auto max-w-2xl text-zinc-400">
            Eight integrated modules covering every aspect of estate management, from legally
            enforceable signatures to operational excellence.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Large card - Document Management */}
          <motion.div
            variants={itemVariants}
            className="group relative rounded-2xl border border-blue-800/50 bg-linear-to-br from-blue-950/50 to-zinc-900 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-blue-600/50 md:col-span-2"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-4 w-fit rounded-lg bg-blue-900/50 p-2">
                  <FileSignature className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Document Management & E-Signatures
                </h3>
                <p className="mb-4 text-sm text-zinc-400">
                  DocuSeal integration for BCEA-compliant e-signatures with cryptographic audit
                  trails. Full version control and multi-signatory workflows.
                </p>
                <div className="flex gap-2">
                  <span className="rounded bg-blue-900/50 px-2 py-1 text-xs text-blue-300">
                    18 Documents
                  </span>
                  <span className="rounded bg-blue-900/50 px-2 py-1 text-xs text-blue-300">
                    100% Compliant
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Tracking */}
          <motion.div
            variants={itemVariants}
            className="group relative rounded-2xl border border-green-800/50 bg-linear-to-br from-green-950/50 to-zinc-900 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-green-600/50"
          >
            <div className="mb-4 w-fit rounded-lg bg-green-900/50 p-2">
              <DollarSign className="h-5 w-5 text-green-400" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Financial Tracking</h3>
            <p className="mb-4 text-sm text-zinc-400">
              Dual-mode expense management with contractor milestone payments and budget tracking.
            </p>
            <BudgetChart motionEnabled={motionEnabled} />
          </motion.div>

          {/* Compliance Alerts */}
          <motion.div
            variants={itemVariants}
            className="group relative rounded-2xl border border-orange-800/50 bg-linear-to-br from-orange-950/50 to-zinc-900 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-orange-600/50"
          >
            <div className="mb-4 w-fit rounded-lg bg-orange-900/50 p-2">
              <Bell className="h-5 w-5 text-orange-400" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Automated Compliance</h3>
            <p className="mb-4 text-sm text-zinc-400">
              Multi-stage alerts (60d/30d/7d) for document expiry, leave accruals, and reviews.
            </p>
            <ComplianceAlerts />
          </motion.div>

          {/* Time Tracking */}
          <motion.div
            variants={itemVariants}
            className="group relative rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-600"
          >
            <div className="mb-4 w-fit rounded-lg bg-zinc-800 p-2">
              <Clock className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Time Tracking</h3>
            <p className="mb-4 text-sm text-zinc-400">
              BCEA-compliant clock-in/out with automatic overtime calculation (&gt;9hrs/day).
            </p>
            <div className="text-sm">
              <div className="mb-1 flex justify-between text-zinc-400">
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
            className="group relative rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-600"
          >
            <div className="mb-4 w-fit rounded-lg bg-zinc-800 p-2">
              <ClipboardList className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Task Management</h3>
            <p className="mb-4 text-sm text-zinc-400">
              Daily and recurring task assignments with time logging and completion tracking.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 rounded bg-zinc-800 p-2 text-center">
                <div className="text-xl font-bold text-white">38</div>
                <div className="text-xs text-zinc-500">Complete</div>
              </div>
              <div className="flex-1 rounded bg-zinc-800 p-2 text-center">
                <div className="text-xl font-bold text-blue-400">6</div>
                <div className="text-xs text-zinc-500">Active</div>
              </div>
            </div>
          </motion.div>

          {/* Asset Registry */}
          <motion.div
            variants={itemVariants}
            className="group relative rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-600"
          >
            <div className="mb-4 w-fit rounded-lg bg-zinc-800 p-2">
              <Package className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Asset Registry</h3>
            <p className="mb-4 text-sm text-zinc-400">
              Complete tracking of tools, vehicles, and equipment with maintenance schedules.
            </p>
            <div className="text-xs text-zinc-500">6 assets • R434,400 total value</div>
          </motion.div>

          {/* Incident Reporting */}
          <motion.div
            variants={itemVariants}
            className="group relative rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-600"
          >
            <div className="mb-4 w-fit rounded-lg bg-zinc-800 p-2">
              <AlertTriangle className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Incident Reporting</h3>
            <p className="mb-4 text-sm text-zinc-400">
              Safety, equipment, and household incident tracking with automated routing.
            </p>
            <div className="flex gap-2 text-xs">
              <span className="rounded bg-red-900/30 px-2 py-1 text-red-400">0 High</span>
              <span className="rounded bg-yellow-900/30 px-2 py-1 text-yellow-400">1 Med</span>
              <span className="rounded bg-green-900/30 px-2 py-1 text-green-400">3 Low</span>
            </div>
          </motion.div>

          {/* Vehicle Logs */}
          <motion.div
            variants={itemVariants}
            className="group relative rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-600"
          >
            <div className="mb-4 w-fit rounded-lg bg-zinc-800 p-2">
              <Car className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Vehicle Logs</h3>
            <p className="mb-4 text-sm text-zinc-400">
              Usage authorization, fuel tracking, and child transport compliance.
            </p>
            <div className="text-sm text-zinc-400">
              <div className="mb-1 flex justify-between">
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
