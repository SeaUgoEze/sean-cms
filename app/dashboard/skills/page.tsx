"use client"

import { useEffect, useState } from "react"
import { fetchPortfolioData, savePortfolioSection, type PortfolioData } from "@/lib/firebase"

type Skill = PortfolioData["skills"][0]

function emptySkill(): Skill {
  return {
    id: Date.now().toString(),
    name: "",
    category: "Languages",
    icon: "✦",
  }
}

const categories = ["Languages", "Technologies", "Domains", "Tools", "Soft Skills"]
const icons = ["✦", "◈", "◉", "⊕", "◎", "⬡", "🧠", "🌿", "🌱"]

export default function SkillsEditor() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolioData()
      .then((d) => setSkills(d.skills))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await savePortfolioSection("skills", { items: skills })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert("Failed to save. Check your Firebase connection.")
    } finally {
      setSaving(false)
    }
  }

  function updateSkill(id: string, updates: Partial<Skill>) {
    setSkills(skills.map((s) => (s.id === id ? { ...s, ...updates } : s)))
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
          <h1 className="font-mono text-2xl text-white mb-1">Skills</h1>
          <p className="text-white/40 text-sm font-mono">Manage skills and technologies</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSkills([...skills, emptySkill()])}
            className="px-4 py-2.5 border border-white/10 text-white/60 font-mono text-xs tracking-[0.1em] uppercase hover:border-white/30 hover:text-white transition-all rounded-lg"
          >
            + Add Skill
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className="p-5 bg-white/[0.03] border border-white/5 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{skill.icon}</span>
                <input
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                  className="bg-transparent text-white font-mono text-sm focus:outline-none border-b border-white/10 focus:border-white/30 pb-1"
                  placeholder="Skill name"
                />
              </div>
              <button
                onClick={() => setSkills(skills.filter((s) => s.id !== skill.id))}
                className="text-xs font-mono text-white/20 hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1">Category</label>
                <select
                  value={skill.category}
                  onChange={(e) => updateSkill(skill.id, { category: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white font-mono text-sm focus:border-white/30 focus:outline-none rounded-lg"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 font-mono mb-1">Icon</label>
                <div className="flex gap-2">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => updateSkill(skill.id, { icon })}
                      className={`w-8 h-8 flex items-center justify-center rounded border transition-all ${
                        skill.icon === icon
                          ? "border-white/40 bg-white/10 text-white"
                          : "border-white/10 text-white/30 hover:border-white/20"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
