"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchPortfolioData, type PortfolioData } from "@/lib/firebase"

const sections = [
  { key: "hero", label: "Hero", description: "Name, tagline, and focus areas", href: "/dashboard/hero" },
  { key: "about", label: "About", description: "Bio paragraphs and ASCII art", href: "/dashboard/about" },
  { key: "projects", label: "Projects", description: "Project cards with hover effects", href: "/dashboard/projects" },
  { key: "experience", label: "Experience", description: "Work experience timeline", href: "/dashboard/experience" },
  { key: "skills", label: "Skills", description: "Skills and technologies", href: "/dashboard/skills" },
  { key: "leadership", label: "Leadership", description: "Leadership and community roles", href: "/dashboard/leadership" },
  { key: "contact", label: "Contact", description: "Email, social links, and interest chips", href: "/dashboard/contact" },
]

export default function DashboardPage() {
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-mono text-2xl text-white mb-2">Dashboard</h1>
      <p className="text-white/40 text-sm font-mono mb-8">Manage your portfolio content</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((section) => {
          const hasData = data && (data as any)[section.key]
          return (
            <Link
              key={section.key}
              href={section.href}
              className="block p-5 bg-white/[0.03] border border-white/5 rounded-xl hover:border-white/15 hover:bg-white/[0.05] transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-sm text-white group-hover:text-white/90">{section.label}</h3>
                <span
                  className={`w-2 h-2 rounded-full ${
                    hasData ? "bg-green-500/60" : "bg-white/20"
                  }`}
                />
              </div>
              <p className="text-white/30 text-xs font-mono">{section.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
