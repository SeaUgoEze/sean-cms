"use client"

import { useEffect, useState } from "react"
import { fetchPortfolioData, savePortfolioSection, type PortfolioData } from "@/lib/firebase"

export default function ContactEditor() {
  const [data, setData] = useState<PortfolioData["contact"] | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioData()
      .then((d) => setData(d.contact))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!data) return
    setSaving(true)
    try {
      await savePortfolioSection("contact", data)
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
          <h1 className="font-mono text-2xl text-white mb-1">Contact</h1>
          <p className="text-white/40 text-sm font-mono">Edit your contact information and interest chips</p>
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
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-2">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-2">GitHub URL</label>
            <input
              value={data.github}
              onChange={(e) => setData({ ...data, github: e.target.value })}
              placeholder="https://github.com/..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg placeholder:text-white/15"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-2">GitHub Display</label>
            <input
              value={data.githubUsername}
              onChange={(e) => setData({ ...data, githubUsername: e.target.value })}
              placeholder="github.com/username"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg placeholder:text-white/15"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-2">LinkedIn URL</label>
            <input
              value={data.linkedin}
              onChange={(e) => setData({ ...data, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg placeholder:text-white/15"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-2">LinkedIn Display</label>
            <input
              value={data.linkedinUsername}
              onChange={(e) => setData({ ...data, linkedinUsername: e.target.value })}
              placeholder="linkedin.com/in/username"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg placeholder:text-white/15"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-3">Interest Chips</label>
          {data.chips.map((chip, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                value={chip}
                onChange={(e) => {
                  const newChips = [...data.chips]
                  newChips[i] = e.target.value
                  setData({ ...data, chips: newChips })
                }}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
              />
              <button
                onClick={() => setData({ ...data, chips: data.chips.filter((_, j) => j !== i) })}
                className="px-3 py-2.5 text-white/20 hover:text-red-400 transition-colors font-mono text-sm"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => setData({ ...data, chips: [...data.chips, "New Chip"] })}
            className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
          >
            + Add Chip
          </button>
        </div>
      </div>
    </div>
  )
}
