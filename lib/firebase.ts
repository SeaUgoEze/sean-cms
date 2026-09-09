"use client"

import { initializeApp, getApps } from "firebase/app"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { getAuth, signInWithCustomToken, signInAnonymously } from "firebase/auth"
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

export { db, auth, storage }

export async function verifyPasscode(passcode: string): Promise<string> {
  const projectId = firebaseConfig.projectId
  try {
    const url = `https://us-central1-${projectId}.cloudfunctions.net/verifyPasscode`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: { passcode } }), signal: controller.signal })
    clearTimeout(timeout)
    if (response.ok) {
      const result = await response.json()
      if (result.result?.token) return result.result.token
    }
  } catch { /* Fall through to the Firestore hash check. */ }

  try {
    const configDoc = await getDoc(doc(db, "config", "admin"))
    if (!configDoc.exists()) throw new Error("Firestore not set up. Run the seed script first.")
    const { passcodeHash } = configDoc.data()
    if (!passcodeHash) throw new Error("Admin passcode not set. Run the seed script first.")
    const bcryptModule = await import("bcryptjs")
    const bcrypt = bcryptModule.default || bcryptModule
    if (!(await bcrypt.compare(passcode, passcodeHash))) throw new Error("Invalid passcode")
    const credential = await signInAnonymously(auth)
    const uid = credential.user.uid
    await setDoc(doc(db, "adminSessions", uid), { role: "admin", createdAt: Date.now(), expiresAt: Date.now() + 86400000 })
    return `admin-session:${uid}`
  } catch (err: any) {
    if (["Firestore not set up", "Admin passcode not set", "Invalid passcode"].some((message) => err.message?.includes(message))) throw err
    throw new Error("Could not connect to Firestore: " + (err.message || "unknown error"))
  }
}

export async function signInWithToken(token: string) {
  if (token.startsWith("admin-session:")) return
  await signInWithCustomToken(auth, token)
}

export interface PortfolioEntry {
  id: string
  title: string
  label: string
  body: string
  tags: string[]
  imageUrl: string
  url: string
  order: number
}

export interface PortfolioSection {
  id: string
  title: string
  slug: string
  intro: string
  visible: boolean
  order: number
  entries: PortfolioEntry[]
  builtIn?: boolean
}

export interface PortfolioData {
  hero: { name: string; firstName: string; lastName: string; tagline: string; pills: string[]; backgroundArt: string }
  about: { paragraphs: string[]; portraitUrl: string; quote: string }
  projects: any[]
  experience: any[]
  skills: any[]
  leadership: any[]
  contact: any
  sections: PortfolioSection[]
}

const builtInSectionNames = ["projects", "experience", "education", "research", "skills", "leadership", "about", "contact"]

function makeEntry(id: string, title: string, label: string, body: string, tags: string[] = [], url = "", imageUrl = "", order = 0): PortfolioEntry {
  return { id, title, label, body, tags, url, imageUrl, order }
}

function legacyBookSections(data: Record<string, any>): PortfolioSection[] {
  const projects = Array.isArray(data.projects) ? data.projects : []
  const experience = Array.isArray(data.experience) ? data.experience : []
  const skills = Array.isArray(data.skills) ? data.skills : []
  const leadership = Array.isArray(data.leadership) ? data.leadership : []
  const about = data.about || {}
  const contact = data.contact || {}
  return [
    { id: "projects", title: "Projects", slug: "projects", intro: "Selected work shaped by curiosity, utility, and the discipline of making things clear.", visible: true, order: 1, builtIn: true, entries: projects.map((item: any, index: number) => makeEntry(item.id || `project-${index}`, item.title || "Untitled project", item.category || "Project", item.description || "", item.languages || [], item.githubUrl || "", item.imageUrl || "", index)) },
    { id: "experience", title: "Experience", slug: "experience", intro: "Places where I have learned to work with people, constraints, and responsibility.", visible: true, order: 2, builtIn: true, entries: experience.map((item: any, index: number) => makeEntry(item.id || `experience-${index}`, item.role || "Experience", item.org || "", item.description || "", [item.startDate, item.endDate].filter(Boolean), "", "", index)) },
    { id: "education", title: "Education", slug: "education", intro: "The formal and informal study behind the work.", visible: true, order: 3, builtIn: true, entries: [makeEntry("queens", "Bachelor of Computing", "Queen's University", "Studying computer science with a focus on artificial intelligence, backend systems, cybersecurity, and thoughtful software development.", ["Computer Science", "Artificial Intelligence"])] },
    { id: "research", title: "Research", slug: "research", intro: "", visible: true, order: 4, builtIn: true, entries: [] },
    { id: "skills", title: "Skills", slug: "skills", intro: "Tools and practices I use to move an idea from question to working software.", visible: true, order: 5, builtIn: true, entries: skills.map((item: any, index: number) => makeEntry(item.id || `skill-${index}`, item.name || "Skill", item.category || "", `A working part of my toolkit across ${(item.category || "software development").toLowerCase()}.`, [], "", "", index)) },
    { id: "leadership", title: "Leadership", slug: "leadership", intro: "Community work that has taught me to listen, organize, and make room for others.", visible: true, order: 6, builtIn: true, entries: leadership.map((item: any, index: number) => makeEntry(item.id || `leadership-${index}`, item.role || "Leadership", item.org || "", item.description || "", [], "", "", index)) },
    { id: "about", title: "About", slug: "about", intro: "A little context behind the person making the work.", visible: true, order: 7, builtIn: true, entries: (about.paragraphs || []).map((paragraph: string, index: number) => makeEntry(`about-${index}`, index === 0 ? "A short introduction" : `Notes, ${index + 1}`, "About me", paragraph, [], "", index === 0 ? about.portraitUrl || "" : "", index)) },
    { id: "contact", title: "Contact", slug: "contact", intro: "For internships, research opportunities, collaborations, and good questions.", visible: true, order: 8, builtIn: true, entries: [makeEntry("contact", "Send a message", contact.email || "", "I am always glad to hear from people building useful things. Reach me by email or find my work online.", contact.chips || [], contact.email ? `mailto:${contact.email}` : "")] },
  ]
}

export async function fetchPortfolioData(): Promise<PortfolioData> {
  const names = ["hero", "about", "projects", "experience", "skills", "leadership", "contact"]
  const data: Record<string, any> = { hero: {}, about: {}, projects: [], experience: [], skills: [], leadership: [], contact: {}, sections: [] }
  const snapshots = await Promise.all(names.map((name) => getDoc(doc(db, "portfolio", name))))
  snapshots.forEach((snapshot, index) => {
    if (!snapshot.exists()) return
    const name = names[index]
    const value = snapshot.data()
    data[name] = ["projects", "experience", "skills", "leadership"].includes(name) ? (value.items || []) : value
  })
  const sectionDoc = await getDoc(doc(db, "portfolio", "sections"))
  data.sections = sectionDoc.exists() && Array.isArray(sectionDoc.data().items) ? sectionDoc.data().items : legacyBookSections(data)
  data.sections = data.sections.map((section: PortfolioSection) => ({ ...section, entries: (section.entries || []).filter((item: PortfolioEntry) => !(section.id === "research" && item.id === "research-interests")) }))
  return data as PortfolioData
}

function toBookEntries(section: string, data: any): PortfolioEntry[] {
  const items = Array.isArray(data?.items) ? data.items : []
  if (section === "projects") return items.map((item: any, index: number) => ({ id: item.id || `project-${index}`, title: item.title || "Untitled project", label: item.category || "Project", body: item.description || "", tags: item.languages || [], imageUrl: item.imageUrl || "", url: item.githubUrl || "", order: index }))
  if (section === "experience") return items.map((item: any, index: number) => ({ id: item.id || `experience-${index}`, title: item.role || "Experience", label: item.org || "", body: item.description || "", tags: [item.startDate, item.endDate].filter(Boolean), imageUrl: item.imageUrl || "", url: item.url || "", order: index }))
  if (section === "skills") return items.map((item: any, index: number) => ({ id: item.id || `skill-${index}`, title: item.name || "Skill", label: item.category || "", body: item.description || `A working part of my toolkit across ${(item.category || "software development").toLowerCase()}.`, tags: [], imageUrl: item.imageUrl || "", url: item.url || "", order: index }))
  if (section === "leadership") return items.map((item: any, index: number) => ({ id: item.id || `leadership-${index}`, title: item.role || "Leadership", label: item.org || "", body: item.description || "", tags: [], imageUrl: item.imageUrl || "", url: item.url || "", order: index }))
  return []
}

function aboutEntries(data: any): PortfolioEntry[] {
  return (data?.paragraphs || []).map((body: string, index: number) => ({ id: `about-${index}`, title: index === 0 ? "A short introduction" : `Notes, ${index + 1}`, label: "About me", body, tags: [], imageUrl: index === 0 ? data?.portraitUrl || "" : "", url: "", order: index }))
}

function contactEntries(data: any): PortfolioEntry[] {
  return [{ id: "contact", title: "Send a message", label: data?.email || "", body: "I am always glad to hear from people building useful things. Reach me by email or find my work online.", tags: data?.chips || [], imageUrl: "", url: data?.email ? `mailto:${data.email}` : "", order: 0 }]
}

async function syncLegacyIntoBook(section: string, data: any) {
  if (!(section === "projects" || section === "experience" || section === "skills" || section === "leadership" || section === "about" || section === "contact")) return
  const snapshot = await getDoc(doc(db, "portfolio", "sections"))
  if (!snapshot.exists() || !Array.isArray(snapshot.data().items)) return
  const entries = section === "about" ? aboutEntries(data) : section === "contact" ? contactEntries(data) : toBookEntries(section, data)
  const items = snapshot.data().items.map((item: PortfolioSection) => item.id === section ? { ...item, entries } : item)
  await setDoc(doc(db, "portfolio", "sections"), { items }, { merge: true })
}

async function syncBookIntoLegacy(sections: PortfolioSection[]) {
  const writes: Promise<void>[] = []
  const projects = sections.find((section) => section.id === "projects")
  if (projects) writes.push(setDoc(doc(db, "portfolio", "projects"), { items: projects.entries.map((entry) => ({ id: entry.id, title: entry.title, category: entry.label, description: entry.body, languages: entry.tags, imageUrl: entry.imageUrl, videoUrl: "", githubUrl: entry.url, highlights: [] })) }, { merge: true }))
  const experience = sections.find((section) => section.id === "experience")
  if (experience) writes.push(setDoc(doc(db, "portfolio", "experience"), { items: experience.entries.map((entry) => ({ id: entry.id, org: entry.label, role: entry.title, description: entry.body, startDate: entry.tags[0] || "", endDate: entry.tags[1] || "" })) }, { merge: true }))
  const skills = sections.find((section) => section.id === "skills")
  if (skills) writes.push(setDoc(doc(db, "portfolio", "skills"), { items: skills.entries.map((entry) => ({ id: entry.id, name: entry.title, category: entry.label, icon: "" })) }, { merge: true }))
  const leadership = sections.find((section) => section.id === "leadership")
  if (leadership) writes.push(setDoc(doc(db, "portfolio", "leadership"), { items: leadership.entries.map((entry) => ({ id: entry.id, org: entry.label, role: entry.title, description: entry.body })) }, { merge: true }))
  const about = sections.find((section) => section.id === "about")
  if (about) writes.push(setDoc(doc(db, "portfolio", "about"), { paragraphs: about.entries.map((entry) => entry.body), portraitUrl: about.entries[0]?.imageUrl || "" }, { merge: true }))
  await Promise.all(writes)
}

export async function savePortfolioSection(section: string, data: any) {
  await setDoc(doc(db, "portfolio", section), data, { merge: true })
  if (section === "sections") {
    await syncBookIntoLegacy(Array.isArray(data.items) ? data.items : [])
  } else {
    await syncLegacyIntoBook(section, data)
  }
}

export function makeSectionId(title: string) {
  const base = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section"
  return `${base}-${Date.now().toString(36)}`
}

export async function uploadPortfolioImage(file: File, path: string, onProgress?: (progress: number) => void) {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.")
  if (file.size > 8 * 1024 * 1024) throw new Error("Images must be 8 MB or smaller.")
  const upload = uploadBytesResumable(ref(storage, path), file, { contentType: file.type, cacheControl: "public,max-age=31536000" })
  return new Promise<string>((resolve, reject) => {
    upload.on("state_changed", (snapshot) => onProgress?.(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100)), (error) => reject(error), async () => resolve(await getDownloadURL(upload.snapshot.ref)))
  })
}

export async function removePortfolioImage(url: string) {
  if (!url || !url.startsWith("https://firebasestorage.googleapis.com/")) return
  await deleteObject(ref(storage, url)).catch(() => undefined)
}

export { builtInSectionNames }
