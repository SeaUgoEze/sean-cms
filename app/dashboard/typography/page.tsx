"use client"

import { useEffect, useState } from "react"
import { defaultTypography, fetchPortfolioData, saveTypographySettings, type TypographySettings } from "@/lib/firebase"

const fields: { key: keyof TypographySettings; label: string; help: string }[] = [
  { key: "coverName", label: "Cover name", help: "Name shown above the closed book" },
  { key: "coverTitle", label: "Cover title", help: "Title printed on the book cover" },
  { key: "coverSubtitle", label: "Cover subtitle", help: "Portfolio year and subtitle" },
  { key: "coverHint", label: "Cover hint", help: "Instruction below the cover" },
  { key: "pageHeading", label: "Page headings", help: "Chapter and entry headings" },
  { key: "pageKicker", label: "Page kickers", help: "Small uppercase labels above headings" },
  { key: "body", label: "Body text", help: "Descriptions and paragraphs" },
  { key: "label", label: "Entry labels", help: "Company, category, and attribution lines" },
  { key: "tags", label: "Tags", help: "Technology and date metadata" },
  { key: "contentsEntry", label: "Contents entries", help: "Chapter names in the contents" },
  { key: "metadata", label: "Metadata", help: "Page numbers, counts, and positions" },
  { key: "navigation", label: "Navigation", help: "Back links and chapter actions" },
  { key: "watchlistTitle", label: "Watchlist titles", help: "Movie and show names" },
  { key: "controls", label: "Book controls", help: "Previous, next, and reader controls" },
]

export default function TypographyEditor() {
  const [settings, setSettings] = useState<TypographySettings>(defaultTypography)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchPortfolioData().then((data) => setSettings({ ...defaultTypography, ...data.typography })).catch(() => setMessage("Could not load typography settings.")).finally(() => setLoading(false))
  }, [])

  function update(key: keyof TypographySettings, value: string) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) setSettings((current) => ({ ...current, [key]: Math.max(8, Math.min(120, parsed)) }))
  }

  async function save() {
    setSaving(true)
    setMessage("")
    try {
      await saveTypographySettings(settings)
      setMessage("Typography saved. Refresh the portfolio to see the changes.")
    } catch {
      setMessage("Save failed. Check your Firebase connection.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-white/50 font-mono text-sm">Loading typography…</div>

  return <div>
    <div className="flex items-start justify-between gap-4 mb-8">
      <div><h1 className="font-mono text-2xl text-white mb-1">Typography</h1><p className="text-white/40 text-sm font-mono">Control the size of every text role in the portfolio book.</p></div>
      <button onClick={save} disabled={saving} className="px-6 py-2.5 bg-white text-black font-mono text-xs tracking-[0.1em] uppercase rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Save Changes"}</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => <label key={field.key} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-white/70 font-mono"><span className="flex items-center justify-between gap-3"><span>{field.label}</span><span className="text-white/30">px</span></span><input type="number" min={8} max={120} step={1} value={settings[field.key]} onChange={(event) => update(field.key, event.target.value)} className="mt-3 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white font-mono" /><span className="block mt-2 text-[10px] text-white/30">{field.help}</span></label>)}
    </div>
    {message && <p className="mt-6 text-sm font-mono text-white/60">{message}</p>}
  </div>
}
