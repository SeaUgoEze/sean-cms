"use client"

import { useEffect, useState } from "react"
import { fetchPortfolioData, savePortfolioSection, type PortfolioData } from "@/lib/firebase"

type Project = PortfolioData["projects"][0]

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
          <p className="text-white/40 text-sm font-mono">Manage your project cards with hover effects</p>
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
