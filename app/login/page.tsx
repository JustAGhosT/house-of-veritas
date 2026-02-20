"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, User, ArrowRight, Shield } from "lucide-react"

// Persona definitions
const PERSONAS = [
  {
    id: "hans",
    name: "Hans",
    role: "Owner & Administrator",
    description: "Full platform access, approvals, and oversight",
    color: "from-blue-600 to-blue-800",
    icon: "👔",
  },
  {
    id: "charl",
    name: "Charl",
    role: "Workshop Operator",
    description: "Tasks, assets, time tracking, vehicle logs",
    color: "from-amber-600 to-amber-800",
    icon: "🔧",
  },
  {
    id: "lucky",
    name: "Lucky",
    role: "Gardener & Handyman",
    description: "Tasks, expenses, vehicle logs, time tracking",
    color: "from-green-600 to-green-800",
    icon: "🌿",
  },
  {
    id: "irma",
    name: "Irma",
    role: "Resident",
    description: "Household tasks, documents, limited access",
    color: "from-purple-600 to-purple-800",
    icon: "🏠",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (personaId: string) => {
    setIsLoading(true)
    setSelectedPersona(personaId)
    
    // Simulate authentication delay
    setTimeout(() => {
      router.push(`/dashboard/${personaId}`)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <span className="text-white font-bold text-lg">HV</span>
            </div>
            <div>
              <h1 className="text-white font-semibold">House of Veritas</h1>
              <p className="text-white/50 text-xs">Digital Governance Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Secure Access</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Select Your Profile
            </h2>
            <p className="text-white/60 max-w-md mx-auto">
              Choose your user profile to access your personalized dashboard with role-specific features and permissions.
            </p>
          </div>

          {/* Persona Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {PERSONAS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => handleLogin(persona.id)}
                disabled={isLoading}
                className={`
                  group relative p-6 rounded-2xl border transition-all duration-300
                  ${selectedPersona === persona.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }
                  ${isLoading && selectedPersona !== persona.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${persona.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${persona.color} flex items-center justify-center text-2xl shrink-0`}>
                    {persona.icon}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {persona.name}
                    </h3>
                    <p className={`text-sm font-medium mb-2 bg-gradient-to-r ${persona.color} bg-clip-text text-transparent`}>
                      {persona.role}
                    </p>
                    <p className="text-white/50 text-sm">
                      {persona.description}
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${selectedPersona === persona.id
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/60"
                    }
                  `}>
                    {isLoading && selectedPersona === persona.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Demo Notice */}
          <div className="mt-12 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-amber-400 font-medium mb-1">Demo Mode</h4>
                <p className="text-white/60 text-sm">
                  This is a demonstration with sample data. In production, users would authenticate via secure login with their credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-white/40 text-sm">
            © 2025 House of Veritas. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
