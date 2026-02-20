"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Shield, Lock, FileCheck, Activity, Database, Clock } from "lucide-react"

const trustIndicators = [
  {
    icon: FileCheck,
    title: "BCEA Compliant",
    description: "Employment records meet Basic Conditions of Employment Act requirements"
  },
  {
    icon: Shield,
    title: "POPIA Compliant",
    description: "Data protection standards aligned with Protection of Personal Information Act"
  },
  {
    icon: Lock,
    title: "ECT Act Signatures",
    description: "Digital signatures comply with Electronic Communications and Transactions Act"
  },
  {
    icon: Database,
    title: "Full Audit Trail",
    description: "Complete version control and audit logs for all actions and documents"
  },
  {
    icon: Activity,
    title: "99.9% Uptime SLA",
    description: "Azure-backed infrastructure with enterprise-grade reliability"
  },
  {
    icon: Clock,
    title: "4-Hour Recovery",
    description: "Documented disaster recovery procedures with <4hr RTO"
  }
]

export function ComplianceSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-24 px-4 bg-zinc-950/50">
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
            Trust & Compliance
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Built on enterprise-grade infrastructure with full legal compliance and audit readiness.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustIndicators.map((indicator, index) => {
            const Icon = indicator.icon
            return (
              <motion.div
                key={indicator.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all duration-300"
              >
                <div className="p-2 rounded-lg bg-emerald-900/20 w-fit mb-4">
                  <Icon className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{indicator.title}</h3>
                <p className="text-sm text-zinc-400">{indicator.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Security Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-emerald-950/20 to-zinc-900/50 border border-emerald-900/30"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">AES-256</div>
              <div className="text-sm text-zinc-400">Encryption at Rest</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">TLS 1.2+</div>
              <div className="text-sm text-zinc-400">In-Transit Security</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">Azure</div>
              <div className="text-sm text-zinc-400">Enterprise Infrastructure</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
