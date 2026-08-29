"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { verifyPasscode, signInWithToken } from "@/lib/firebase"

export default function LoginPage() {
  const [passcode, setPasscode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!passcode) return

    setLoading(true)
    setError("")

    try {
      const token = await verifyPasscode(passcode)
      await signInWithToken(token)
      sessionStorage.setItem("cms-auth", "true")
      router.push("/dashboard")
    } catch (err: any) {
      const msg = err?.message || "Login failed"
      if (msg.includes("not configured") || msg.includes("not set")) {
        setError("Admin not set up yet. Run: node seed-portfolio.js")
      } else if (msg === "Invalid passcode") {
        setError("Invalid passcode")
      } else {
        setError(`Error: ${msg}`)
      }
      setPasscode("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="font-mono text-2xl text-white mb-2">Portfolio CMS</h1>
          <p className="text-white/30 text-sm font-mono">Enter your admin passcode</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm tracking-widest text-center placeholder:text-white/20 focus:border-white/30 focus:outline-none transition-colors rounded-lg"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-mono text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !passcode}
            className="w-full py-3 bg-white text-black font-mono text-xs tracking-[0.15em] uppercase font-medium hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed rounded-lg"
          >
            {loading ? "Verifying..." : "Enter Dashboard"}
          </button>
        </form>

        <p className="text-white/15 text-xs font-mono text-center mt-8">
          Passcode verified securely
        </p>
      </div>
    </div>
  )
}
