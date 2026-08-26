"use client"

import { useEffect, useState } from "react"
import { fetchPortfolioData, savePortfolioSection, type PortfolioData } from "@/lib/firebase"

export default function HeroEditor() {
  const [data, setData] = useState<PortfolioData["hero"] | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioData()
      .then((d) => setData(d.hero))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!data) return
    setSaving(true)
    try {
      await savePortfolioSection("hero", data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert("Failed to save. Check your Firebase connection.")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-mono text-2xl text-white mb-1">Hero</h1>
          <p className="text-white/40 text-sm font-mono">Edit your name, tagline, and focus areas</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-white text-black font-mono text-xs tracking-[0.1em] uppercase font-medium hover:bg-white/90 transition-all disabled:opacity-50 rounded-lg"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-2">First Name</label>
            <input
              value={data.firstName}
              onChange={(e) => setData({ ...data, firstName: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-2">Last Name</label>
            <input
              value={data.lastName}
              onChange={(e) => setData({ ...data, lastName: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-2">Tagline</label>
          <input
            value={data.tagline}
            onChange={(e) => setData({ ...data, tagline: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
          />
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-2">Profile Image URL (optional)</label>
          <input
            value={data.imageUrl}
            onChange={(e) => setData({ ...data, imageUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg placeholder:text-white/15"
          />
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-3">Focus Pills</label>
          {data.pills.map((pill, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                value={pill}
                onChange={(e) => {
                  const newPills = [...data.pills]
                  newPills[i] = e.target.value
                  setData({ ...data, pills: newPills })
                }}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
              />
              <button
                onClick={() => setData({ ...data, pills: data.pills.filter((_, j) => j !== i) })}
                className="px-3 py-2.5 text-white/20 hover:text-red-400 transition-colors font-mono text-sm"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => setData({ ...data, pills: [...data.pills, "New Pill"] })}
            className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors mt-2"
          >
            + Add Pill
          </button>
        </div>
      </div>
    </div>
  )
}
