"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchPortfolioData, type PortfolioData } from "@/lib/firebase"

const sections = [
  { key: "sections", label: "Book Sections", description: "Create chapters and order the pages visitors turn through", href: "/dashboard/sections" },
  { key: "hero", label: "Cover & name", description: "Name, title, and cover artwork", href: "/dashboard/hero" },
  { key: "about", label: "About", description: "Bio and portrait", href: "/dashboard/about" },
  { key: "projects", label: "Projects", description: "Work, links, and images", href: "/dashboard/projects" },
  { key: "experience", label: "Experience", description: "Work and community experience", href: "/dashboard/experience" },
  { key: "skills", label: "Skills", description: "Tools and practices", href: "/dashboard/skills" },
  { key: "leadership", label: "Leadership", description: "Leadership and service", href: "/dashboard/leadership" },
  { key: "contact", label: "Contact", description: "Email and social links", href: "/dashboard/contact" },
]

export default function DashboardPage() {
  const [data, setData] = useState<PortfolioData | null>(null)
  useEffect(() => { fetchPortfolioData().then(setData).catch(console.error) }, [])
  return <div><h1 className="font-mono text-2xl text-white mb-2">Portfolio book</h1><p className="text-white/40 text-sm font-mono mb-8">Manage the chapters and pages visitors turn through.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{sections.map((section) => <Link key={section.key} href={section.href} className="block p-5 bg-white/[0.03] border border-white/5 rounded-xl hover:border-white/15 hover:bg-white/[0.05] transition-colors group"><div className="flex items-center justify-between mb-2"><h3 className="font-mono text-sm text-white group-hover:text-white/90">{section.label}</h3><span className={`w-2 h-2 rounded-full ${data && (data as any)[section.key] ? "bg-green-500/60" : "bg-white/20"}`} /></div><p className="text-white/30 text-xs font-mono">{section.description}</p></Link>)}</div></div>
}
