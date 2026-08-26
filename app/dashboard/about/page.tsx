"use client"

import { useEffect, useState } from "react"
import { fetchPortfolioData, savePortfolioSection, type PortfolioData } from "@/lib/firebase"

export default function AboutEditor() {
  const [data, setData] = useState<PortfolioData["about"] | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioData()
      .then((d) => setData(d.about))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    if (!data) return
    setSaving(true)
    try {
      await savePortfolioSection("about", data)
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
          <h1 className="font-mono text-2xl text-white mb-1">About</h1>
          <p className="text-white/40 text-sm font-mono">Edit your bio paragraphs and ASCII art</p>
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
        {/* Bio paragraphs */}
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-3">Bio Paragraphs</label>
          {data.paragraphs.map((p, i) => (
            <div key={i} className="flex gap-2 mb-3">
              <textarea
                value={p}
                onChange={(e) => {
                  const newP = [...data.paragraphs]
                  newP[i] = e.target.value
                  setData({ ...data, paragraphs: newP })
                }}
                rows={3}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg resize-y"
              />
              <button
                onClick={() => setData({ ...data, paragraphs: data.paragraphs.filter((_, j) => j !== i) })}
                className="px-3 py-2.5 text-white/20 hover:text-red-400 transition-colors font-mono text-sm self-start"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => setData({ ...data, paragraphs: [...data.paragraphs, "New paragraph..."] })}
            className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
          >
            + Add Paragraph
          </button>
        </div>

        {/* ASCII Art */}
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-2">ASCII Art</label>
          <p className="text-white/20 text-xs font-mono mb-3">Paste your ASCII art below. It will render in monospace font on the site.</p>
          <textarea
            value={data.asciiArt}
            onChange={(e) => setData({ ...data, asciiArt: e.target.value })}
            rows={15}
            placeholder="Paste your ASCII art here..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-white/30 focus:outline-none rounded-lg resize-y whitespace-pre"
          />
          {data.asciiArt && (
            <div className="mt-4 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/20 font-mono mb-2">Preview</p>
              <pre className="font-mono text-[0.4rem] leading-none text-white/30 whitespace-pre overflow-x-auto">
                {data.asciiArt}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
