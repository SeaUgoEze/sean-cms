"use client"

import { useEffect, useState } from "react"
import { fetchPortfolioData, savePortfolioSection, type PortfolioData } from "@/lib/firebase"

type Project = PortfolioData["projects"][0]

const MAP_REGIONS = [
  "The North",
  "The Neck",
  "The Vale",
  "The Riverlands",
  "The Westerlands",
  "The Crownlands",
  "The Reach",
  "The Stormlands",
  "Dorne",
] as const

function emptyProject(): Project {
  return {
    id: Date.now().toString(),
    title: "",
    category: "",
    description: "",
    languages: [],
    imageUrl: "",
    videoUrl: "",
    githubUrl: "",
    highlights: [],
    location: { x: 480, y: 700, region: "The Crownlands" },
  }
}

export default function ProjectsEditor() {
  const [projects, setProjects] = useState<Project[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioData()
      .then((d) => setProjects(d.projects))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await savePortfolioSection("projects", { items: projects })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert("Failed to save. Check your Firebase connection.")
    } finally {
      setSaving(false)
    }
  }

  function updateProject(id: string, updates: Partial<Project>) {
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  function removeProject(id: string) {
    setProjects(projects.filter((p) => p.id !== id))
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
          <h1 className="font-mono text-2xl text-white mb-1">Projects</h1>
          <p className="text-white/40 text-sm font-mono">Manage your projects — each one is pinned to a region of the map</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setProjects([...projects, emptyProject()])}
            className="px-4 py-2.5 border border-white/10 text-white/60 font-mono text-xs tracking-[0.1em] uppercase hover:border-white/30 hover:text-white transition-all rounded-lg"
          >
            + Add Project
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

      <div className="space-y-8">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="p-6 bg-white/[0.03] border border-white/5 rounded-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-mono text-sm text-white/50">
                Project {index + 1}
              </h3>
              <button
                onClick={() => removeProject(project.id)}
                className="text-xs font-mono text-white/20 hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">Title</label>
                  <input
                    value={project.title}
                    onChange={(e) => updateProject(project.id, { title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">Category</label>
                  <input
                    value={project.category}
                    onChange={(e) => updateProject(project.id, { category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">Description</label>
                <textarea
                  value={project.description}
                  onChange={(e) => updateProject(project.id, { description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">Image URL (optional)</label>
                  <input
                    value={project.imageUrl}
                    onChange={(e) => updateProject(project.id, { imageUrl: e.target.value })}
                    placeholder="https://... (leave empty for default)"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg placeholder:text-white/15"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">Video URL (optional)</label>
                  <input
                    value={project.videoUrl}
                    onChange={(e) => updateProject(project.id, { videoUrl: e.target.value })}
                    placeholder="https://... (for hover effect)"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg placeholder:text-white/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">GitHub URL</label>
                <input
                  value={project.githubUrl}
                  onChange={(e) => updateProject(project.id, { githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg placeholder:text-white/15"
                />
              </div>

              {/* Map location */}
              <div className="p-4 border border-white/5 rounded-lg bg-white/[0.02]">
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-3">Map Location — where this project sits on the realm map</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] tracking-[0.15em] uppercase text-white/20 font-mono mb-1.5">Region</label>
                    <select
                      value={project.location?.region || "The Crownlands"}
                      onChange={(e) =>
                        updateProject(project.id, {
                          location: {
                            x: project.location?.x ?? 480,
                            y: project.location?.y ?? 700,
                            region: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
                    >
                      {MAP_REGIONS.map((r) => (
                        <option key={r} value={r} className="bg-neutral-900">
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] tracking-[0.15em] uppercase text-white/20 font-mono mb-1.5">X (50–950)</label>
                    <input
                      type="number"
                      min={50}
                      max={950}
                      value={project.location?.x ?? 480}
                      onChange={(e) =>
                        updateProject(project.id, {
                          location: {
                            x: Number(e.target.value),
                            y: project.location?.y ?? 700,
                            region: project.location?.region || "The Crownlands",
                          },
                        })
                      }
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] tracking-[0.15em] uppercase text-white/20 font-mono mb-1.5">Y (80–1250)</label>
                    <input
                      type="number"
                      min={80}
                      max={1250}
                      value={project.location?.y ?? 700}
                      onChange={(e) =>
                        updateProject(project.id, {
                          location: {
                            x: project.location?.x ?? 480,
                            y: Number(e.target.value),
                            region: project.location?.region || "The Crownlands",
                          },
                        })
                      }
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
                    />
                  </div>
                </div>
                {/* Mini map preview */}
                <div className="relative mt-4 h-40 border border-white/10 rounded overflow-hidden bg-black">
                  <svg viewBox="0 0 1000 1400" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
                    <path
                      d="M 420 60 C 500 40, 620 50, 700 90 C 740 120, 730 170, 700 200 C 680 260, 720 300, 700 340 C 690 420, 640 460, 660 520 C 670 580, 620 600, 610 650 C 640 700, 660 740, 640 790 C 620 850, 640 900, 600 940 C 560 990, 480 990, 440 1020 C 400 1060, 420 1120, 380 1150 C 340 1180, 300 1140, 290 1090 C 270 1040, 290 980, 270 930 C 250 880, 280 840, 260 800 C 240 750, 260 700, 240 660 C 220 620, 250 570, 230 530 C 210 480, 250 440, 240 390 C 230 330, 280 300, 300 250 C 320 180, 360 100, 420 60 Z"
                      fill="#141008"
                      stroke="rgba(215,152,58,0.4)"
                      strokeWidth="3"
                    />
                    {projects.map((p, pi) => {
                      const loc = p.location || { x: 480, y: 700 }
                      const isCurrent = p.id === project.id
                      return (
                        <rect
                          key={p.id}
                          x={loc.x - (isCurrent ? 14 : 8)}
                          y={loc.y - (isCurrent ? 14 : 8)}
                          width={isCurrent ? 28 : 16}
                          height={isCurrent ? 28 : 16}
                          transform={`rotate(45 ${loc.x} ${loc.y})`}
                          fill={isCurrent ? "#d7983a" : "rgba(215,152,58,0.3)"}
                          stroke="#d7983a"
                          strokeWidth="2"
                        />
                      )
                    })}
                  </svg>
                  <p className="absolute bottom-1 right-2 text-[9px] font-mono text-white/25">Your project is the large gold diamond</p>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">Languages / Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {project.languages.map((lang, li) => (
                    <span key={li} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-white/50 text-xs font-mono rounded">
                      {lang}
                      <button
                        onClick={() => updateProject(project.id, { languages: project.languages.filter((_, j) => j !== li) })}
                        className="text-white/20 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    id={`lang-${project.id}`}
                    placeholder="Add a language..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg placeholder:text-white/15"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        if (input.value.trim()) {
                          updateProject(project.id, { languages: [...project.languages, input.value.trim()] })
                          input.value = ""
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1.5">Highlights</label>
                {project.highlights.map((hl, hi) => (
                  <div key={hi} className="flex gap-2 mb-2">
                    <input
                      value={hl}
                      onChange={(e) => {
                        const newHl = [...project.highlights]
                        newHl[hi] = e.target.value
                        updateProject(project.id, { highlights: newHl })
                      }}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
                    />
                    <button
                      onClick={() => updateProject(project.id, { highlights: project.highlights.filter((_, j) => j !== hi) })}
                      className="px-3 text-white/20 hover:text-red-400 transition-colors font-mono text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateProject(project.id, { highlights: [...project.highlights, ""] })}
                  className="text-xs font-mono text-white/30 hover:text-white/60 transition-colors"
                >
                  + Add Highlight
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
