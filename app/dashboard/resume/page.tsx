"use client"

import { useEffect, useRef, useState } from "react"
import { fetchPortfolioData, removeResume, saveResume, uploadResume } from "@/lib/firebase"

export default function ResumeEditor() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [resume, setResume] = useState({ url: "", fileName: "", updatedAt: 0 })
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchPortfolioData().then((data) => setResume({ url: data.resume?.url || "", fileName: data.resume?.fileName || "", updatedAt: data.resume?.updatedAt || 0 })).catch(() => setMessage("Could not load the resume.")).finally(() => setLoading(false))
  }, [])

  async function handleFile(file?: File) {
    if (!file) return
    setMessage("")
    setProgress(1)
    setSaving(true)
    try {
      const url = await uploadResume(file, setProgress)
      const next = { url, fileName: file.name, updatedAt: Date.now() }
      await saveResume(next)
      setResume(next)
      setMessage("Resume uploaded and added to the book.")
    } catch (error: any) {
      setProgress(0)
      setMessage(error?.message || "Upload failed. Check your Firebase connection.")
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    if (!resume.url || !window.confirm("Remove the resume from the book?")) return
    setSaving(true)
    try {
      await removeResume(resume.url)
      const next = { url: "", fileName: "", updatedAt: Date.now() }
      await saveResume(next)
      setResume(next)
      setProgress(0)
      setMessage("Resume removed from the book.")
    } catch {
      setMessage("Could not remove the resume.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-white/50 font-mono text-sm">Loading resume…</div>
  return <div>
    <div className="flex items-center justify-between mb-8"><div><h1 className="font-mono text-2xl text-white mb-1">Resume</h1><p className="text-white/40 text-sm font-mono">Upload the PDF visitors can view or download from the book.</p></div></div>
    <div className="max-w-xl p-6 bg-white/[0.03] border border-white/5 rounded-xl space-y-5">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
      {resume.url ? <div className="flex items-center justify-between gap-4 p-4 border border-white/10 rounded-lg"><div><p className="text-white font-mono text-sm">{resume.fileName || "Resume PDF"}</p><p className="text-white/35 font-mono text-xs mt-1">Published to the Resume chapter</p></div><div className="flex gap-3"><a href={resume.url} target="_blank" rel="noreferrer" className="text-white/65 font-mono text-xs underline underline-offset-4">View</a><button onClick={handleRemove} disabled={saving} className="text-red-300/70 font-mono text-xs underline underline-offset-4">Remove</button></div></div> : <p className="text-white/45 font-mono text-sm">No resume PDF is published yet.</p>}
      <button type="button" onClick={() => inputRef.current?.click()} disabled={saving} className="w-full min-h-24 border border-dashed border-white/15 rounded-lg text-white/55 text-xs font-mono hover:border-white/35 hover:text-white/80 transition-colors disabled:opacity-40">{saving ? `Uploading ${progress}%…` : resume.url ? "Replace resume PDF" : "Choose resume PDF · max 8 MB"}</button>
      {message && <p className="text-xs font-mono text-white/60">{message}</p>}
    </div>
  </div>
}
