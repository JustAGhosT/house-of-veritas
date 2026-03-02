"use client"

import { useMotion } from "@/lib/motion-context"
import { motion, useInView } from "framer-motion"
import { Activity, Clock, Database, FileCheck, Lock, Shield } from "lucide-react"
import { useRef } from "react"

const trustIndicators = [
  {
    icon: FileCheck,
    title: "BCEA Compliant",
    description: "Employment records meet Basic Conditions of Employment Act requirements",
  },
  {
    icon: Shield,
    title: "POPIA Compliant",
    description: "Data protection standards aligned with Protection of Personal Information Act",
  },
  {
    icon: Lock,
    title: "ECT Act Signatures",
    description: "Digital signatures comply with Electronic Communications and Transactions Act",
  },
  {
    icon: Database,
    title: "Full Audit Trail",
    description: "Complete version control and audit logs for all actions and documents",
  },
  {
    icon: Activity,
    title: "99.9% Uptime SLA",
    description: "Azure-backed infrastructure with enterprise-grade reliability",
  },
  {
    icon: Clock,
    title: "4-Hour Recovery",
    description: "Documented disaster recovery procedures with <4hr RTO",
  },
]

export function ComplianceSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { motionEnabled } = useMotion()

  return (
    <section id="compliance" className="bg-zinc-950/50 px-4 py-24">
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
            Trust & Compliance
          </h2>
          <p className="mx-auto max-w-2xl text-zinc-400">
            Built on enterprise-grade infrastructure with full legal compliance and audit readiness.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trustIndicators.map((indicator, index) => {
            const Icon = indicator.icon
            return (
              <motion.div
                key={indicator.title}
                initial={motionEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={motionEnabled ? { duration: 0.6, delay: index * 0.1 } : { duration: 0 }}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700"
              >
                <div className="mb-4 w-fit rounded-lg bg-emerald-900/20 p-2">
                  <Icon className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{indicator.title}</h3>
                <p className="text-sm text-zinc-400">{indicator.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Security Info */}
        <motion.div
          initial={motionEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={motionEnabled ? { duration: 0.6, delay: 0.6 } : { duration: 0 }}
          className="mt-12 rounded-2xl border border-emerald-900/30 bg-linear-to-br from-emerald-950/20 to-zinc-900/50 p-8"
        >
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="mb-2 text-3xl font-bold text-emerald-400">AES-256</div>
              <div className="text-sm text-zinc-400">Encryption at Rest</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-emerald-400">TLS 1.2+</div>
              <div className="text-sm text-zinc-400">In-Transit Security</div>
            </div>
            <div>
              <div className="mb-2 text-3xl font-bold text-emerald-400">Azure</div>
              <div className="text-sm text-zinc-400">Enterprise Infrastructure</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
