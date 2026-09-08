"use client"

import { useEffect, useState } from "react"
import { ImageUpload } from "@/components/image-upload"
import { fetchPortfolioData, makeSectionId, savePortfolioSection, type PortfolioEntry, type PortfolioSection } from "@/lib/firebase"

const builtIns = [
  { id: "projects", title: "Projects", intro: "Selected work shaped by curiosity, utility, and the discipline of making things clear." },
  { id: "experience", title: "Experience", intro: "Places where I have learned to work with people, constraints, and responsibility." },
  { id: "education", title: "Education", intro: "The formal and informal study behind the work." },
  { id: "research", title: "Research", intro: "Questions I am currently interested in exploring." },
  { id: "skills", title: "Skills", intro: "Tools and practices I use to move an idea from question to working software." },
  { id: "leadership", title: "Leadership", intro: "Community work that has taught me to listen, organize, and make room for others." },
  { id: "about", title: "About", intro: "A little context behind the person making the work." },
  { id: "contact", title: "Contact", intro: "For internships, research opportunities, collaborations, and good questions." },
]

function newEntry(): PortfolioEntry { return { id: `entry-${Date.now()}`, title: "New entry", label: "", body: "", tags: [], imageUrl: "", url: "", order: 0 } }
function normalize(section: PortfolioSection, index: number): PortfolioSection { return { ...section, order: section.order ?? index, visible: section.visible !== false, entries: (section.entries || []).map((entry, i) => ({ ...entry, label: entry.label || "", body: entry.body || "", tags: entry.tags || [], imageUrl: entry.imageUrl || "", url: entry.url || "", order: entry.order ?? i })) } }

export default function SectionsEditor() {
  const [sections, setSections] = useState<PortfolioSection[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchPortfolioData().then((data) => {
      const current = data.sections.length ? data.sections : builtIns.map((item, index) => ({ ...item, slug: item.id, visible: true, order: index + 1, entries: [], builtIn: true }))
      const normalized = current.map(normalize)
      setSections(normalized)
      setSelectedId(normalized[0]?.id || "")
    }).catch(() => setMessage("Could not load sections. Check your Firebase connection.")).finally(() => setLoading(false))
  }, [])

  const selected = sections.find((section) => section.id === selectedId)
  function updateSelected(updates: Partial<PortfolioSection>) { setSections((items) => items.map((item) => item.id === selectedId ? { ...item, ...updates } : item)) }
  function updateEntry(entryId: string, updates: Partial<PortfolioEntry>) { updateSelected({ entries: selected?.entries.map((entry) => entry.id === entryId ? { ...entry, ...updates } : entry) || [] }) }
  function addSection() { const title = window.prompt("Section name")?.trim(); if (!title) return; const section: PortfolioSection = { id: makeSectionId(title), title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), intro: "", visible: true, order: sections.length + 1, entries: [], builtIn: false }; setSections([...sections, section]); setSelectedId(section.id) }
  function removeSelected() { if (!selected || selected.builtIn || !window.confirm(`Delete ${selected.title}?`)) return; setSections(sections.filter((section) => section.id !== selected.id)); setSelectedId(sections.find((section) => section.id !== selected.id)?.id || "") }
  async function save() { setSaving(true); setMessage(""); try { await savePortfolioSection("sections", { items: sections.map((section, index) => normalize({ ...section, order: index + 1 }, index)) }); setMessage("Saved to the book.") } catch { setMessage("Save failed. Check your Firebase connection.") } finally { setSaving(false) } }

  if (loading) return <div className="text-white/50 font-mono text-sm">Loading sections…</div>
  return <div>
    <div className="flex flex-wrap gap-4 items-start justify-between mb-8"><div><h1 className="font-mono text-2xl text-white mb-1">Book sections</h1><p className="text-white/40 text-sm font-mono">Create chapters and edit the entries visitors turn through.</p></div><div className="flex gap-3"><button onClick={addSection} className="px-4 py-2.5 border border-white/15 text-white/70 font-mono text-xs rounded-lg">+ New section</button><button onClick={save} disabled={saving} className="px-5 py-2.5 bg-white text-black font-mono text-xs rounded-lg disabled:opacity-50">{saving ? "Saving…" : "Save book"}</button></div></div>
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
      <nav className="space-y-1">{sections.map((section) => <button key={section.id} onClick={() => setSelectedId(section.id)} className={`w-full text-left px-3 py-2.5 rounded font-mono text-xs ${selectedId === section.id ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80"}`}>{section.title}</button>)}</nav>
      {selected ? <div className="space-y-6"><div className="grid grid-cols-2 gap-4"><label className="text-xs text-white/45 font-mono">Title<input value={selected.title} onChange={(e) => updateSelected({ title: e.target.value })} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white font-mono" /></label><label className="text-xs text-white/45 font-mono">Slug<input value={selected.slug} onChange={(e) => updateSelected({ slug: e.target.value })} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white font-mono" /></label></div><label className="text-xs text-white/45 font-mono block">Introduction<textarea value={selected.intro} onChange={(e) => updateSelected({ intro: e.target.value })} rows={3} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white font-mono" /></label><label className="flex items-center gap-2 text-xs text-white/60 font-mono"><input type="checkbox" checked={selected.visible} onChange={(e) => updateSelected({ visible: e.target.checked })} /> Show this chapter in the book</label>
        <div className="border-t border-white/10 pt-6"><div className="flex justify-between items-center mb-4"><h2 className="text-white font-mono">Entries</h2><button onClick={() => updateSelected({ entries: [...selected.entries, { ...newEntry(), order: selected.entries.length }] })} className="text-xs text-white/60 font-mono underline underline-offset-4">+ Add entry</button></div>{selected.entries.map((entry) => <div key={entry.id} className="border border-white/10 rounded-lg p-5 mb-4 space-y-4"><div className="flex justify-between"><span className="text-white/35 text-xs font-mono">Entry</span><button onClick={() => updateSelected({ entries: selected.entries.filter((item) => item.id !== entry.id) })} className="text-red-300/70 text-xs font-mono">Delete</button></div><div className="grid grid-cols-2 gap-4"><label className="text-xs text-white/45 font-mono">Title<input value={entry.title} onChange={(e) => updateEntry(entry.id, { title: e.target.value })} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white font-mono" /></label><label className="text-xs text-white/45 font-mono">Label / date<input value={entry.label} onChange={(e) => updateEntry(entry.id, { label: e.target.value })} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white font-mono" /></label></div><label className="text-xs text-white/45 font-mono block">Body<textarea value={entry.body} onChange={(e) => updateEntry(entry.id, { body: e.target.value })} rows={5} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white font-mono" /></label><label className="text-xs text-white/45 font-mono block">Tags, comma separated<input value={entry.tags.join(", ")} onChange={(e) => updateEntry(entry.id, { tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white font-mono" /></label><label className="text-xs text-white/45 font-mono block">Link<input value={entry.url} onChange={(e) => updateEntry(entry.id, { url: e.target.value })} className="mt-2 w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white font-mono" /></label><ImageUpload value={entry.imageUrl} path={`portfolio/sections/${selected.id}/${entry.id}`} label="Entry image" onChange={(imageUrl) => updateEntry(entry.id, { imageUrl })} /></div>)}</div>{!selected.builtIn && <button onClick={removeSelected} className="text-xs font-mono text-red-300/70">Delete section</button>}{message && <p className="text-sm font-mono text-white/60">{message}</p>}</div> : <p className="text-white/50 font-mono">No section selected.</p>}
    </div>
  </div>
}
