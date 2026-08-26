"use client"

import { useEffect, useState } from "react"
import { fetchPortfolioData, savePortfolioSection, type PortfolioData } from "@/lib/firebase"

type Experience = PortfolioData["experience"][0]

function emptyExperience(): Experience {
  return {
    id: Date.now().toString(),
    org: "",
    role: "",
    description: "",
    startDate: "",
    endDate: "",
  }
}

export default function ExperienceEditor() {
  const [items, setItems] = useState<Experience[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioData()
      .then((d) => setItems(d.experience))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await savePortfolioSection("experience", { items })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert("Failed to save. Check your Firebase connection.")
    } finally {
      setSaving(false)
    }
  }

  function updateItem(id: string, updates: Partial<Experience>) {
    setItems(items.map((i) => (i.id === id ? { ...i, ...updates } : i)))
  }

  if (loading) {
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
          <h1 className="font-mono text-2xl text-white mb-1">Experience</h1>
          <p className="text-white/40 text-sm font-mono">Manage your work experience timeline</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setItems([...items, emptyExperience()])}
            className="px-4 py-2.5 border border-white/10 text-white/60 font-mono text-xs tracking-[0.1em] uppercase hover:border-white/30 hover:text-white transition-all rounded-lg"
          >
            + Add Item
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-white text-black font-mono text-xs tracking-[0.1em] uppercase font-medium hover:bg-white/90 transition-all disabled:opacity-50 rounded-lg"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={item.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-mono text-sm text-white/50">Item {index + 1}</h3>
              <button
                onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                className="text-xs font-mono text-white/20 hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">Organization</label>
                  <input
                    value={item.org}
                    onChange={(e) => updateItem(item.id, { org: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">Role</label>
                  <input
                    value={item.role}
                    onChange={(e) => updateItem(item.id, { role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">Description</label>
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">Start Date</label>
                  <input
                    value={item.startDate}
                    onChange={(e) => updateItem(item.id, { startDate: e.target.value })}
                    placeholder="e.g. Sep 2025"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg placeholder:text-white/15"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">End Date</label>
                  <input
                    value={item.endDate}
                    onChange={(e) => updateItem(item.id, { endDate: e.target.value })}
                    placeholder="Leave empty for Present"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg placeholder:text-white/15"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
