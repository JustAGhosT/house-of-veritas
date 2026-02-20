"use client"

import { WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-amber-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">You're Offline</h1>
        <p className="text-white/60 mb-8">
          It looks like you've lost your internet connection. 
          Some features may be limited until you're back online.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-white font-medium mb-2">Available Offline:</h3>
            <ul className="text-white/60 text-sm space-y-1 text-left">
              <li>• View cached dashboard data</li>
              <li>• Review saved tasks</li>
              <li>• Access downloaded documents</li>
            </ul>
          </div>
        </div>

        <p className="text-white/40 text-sm mt-8">
          House of Veritas • Digital Governance Platform
        </p>
      </div>
    </div>
  )
}
