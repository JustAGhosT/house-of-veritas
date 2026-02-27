import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] p-6">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-8xl font-bold text-white/10">404</h1>
        <h2 className="mb-2 text-2xl font-semibold text-white">Page not found</h2>
        <p className="mb-8 text-white/60">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/?login=true"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
