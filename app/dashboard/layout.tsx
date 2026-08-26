"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

const navItems = [
  { label: "Overview", href: "/dashboard" },
  { label: "Hero", href: "/dashboard/hero" },
  { label: "About", href: "/dashboard/about" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Experience", href: "/dashboard/experience" },
  { label: "Skills", href: "/dashboard/skills" },
  { label: "Leadership", href: "/dashboard/leadership" },
  { label: "Contact", href: "/dashboard/contact" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem("cms-auth")
    if (!auth) {
      router.push("/")
    } else {
      setAuthorized(true)
    }
  }, [router])

  if (!authorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link href="/dashboard" className="font-mono text-sm text-white font-semibold">
            Portfolio CMS
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 text-sm font-mono transition-colors rounded-lg ${
                pathname === item.href
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <a
            href="https://seaugoeze.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2.5 text-sm font-mono text-white/30 hover:text-white/60 transition-colors"
          >
            View Live Site ↗
          </a>
          <button
            onClick={() => {
              sessionStorage.removeItem("cms-auth")
              router.push("/")
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-mono text-white/30 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
