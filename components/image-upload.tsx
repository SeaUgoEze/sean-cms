"use client"

import { useRef, useState } from "react"
import { removePortfolioImage, uploadPortfolioImage } from "@/lib/firebase"

interface ImageUploadProps {
  value?: string
  path: string
  label: string
  onChange: (url: string) => void
}

export function ImageUpload({ value = "", path, label, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

  async function handleFile(file?: File) {
    if (!file) return
    setError("")
    setProgress(1)
    try {
      const url = await uploadPortfolioImage(file, path, setProgress)
      onChange(url)
      setProgress(100)
    } catch (err: any) {
      setProgress(0)
      setError(err?.message || "Upload failed. Try again.")
    }
  }

  async function handleRemove() {
    if (value) await removePortfolioImage(value)
    onChange("")
    setProgress(0)
  }

  return (
    <div className="space-y-2">
      <label className="block text-[10px] tracking-[0.2em] uppercase text-white/45 font-mono">{label}</label>
      {value ? (
        <div className="flex gap-3 items-start">
          <img src={value} alt="Selected upload preview" className="h-24 w-24 rounded object-cover border border-white/15" />
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => inputRef.current?.click()} className="text-xs font-mono text-white/65 underline underline-offset-4">Replace</button>
            <button type="button" onClick={handleRemove} className="text-xs font-mono text-red-300/70 underline underline-offset-4">Remove</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className="w-full min-h-24 border border-dashed border-white/15 rounded-lg text-white/45 text-xs font-mono hover:border-white/35 hover:text-white/70 transition-colors">
          Choose image · JPG, PNG, WebP · max 8 MB
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
      {progress > 0 && progress < 100 && <div className="text-xs font-mono text-white/45">Uploading {progress}%</div>}
      {error && <p className="text-xs font-mono text-red-300">{error}</p>}
    </div>
  )
}
