"use client"

import { initializeApp, getApps } from "firebase/app"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { getAuth, signInWithCustomToken, signInAnonymously } from "firebase/auth"

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

export { db, auth }

/**
 * Verify passcode using Cloud Function (primary) or Firestore hash (fallback).
 * The passcode is NEVER stored or logged client-side.
 */
export async function verifyPasscode(passcode: string): Promise<string> {
  const projectId = firebaseConfig.projectId

  // Strategy 1: Try Cloud Function (most secure — passcode never leaves server)
  try {
    const url = `https://us-central1-${projectId}.cloudfunctions.net/verifyPasscode`
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: { passcode } }),
    })

    if (response.ok) {
      const result = await response.json()
      if (result.result?.token) {
        return result.result.token
      }
    }
    // Cloud Function exists but returned error — fall through to fallback
  } catch {
    // Cloud Function not deployed or unreachable — use fallback
  }

  // Strategy 2: Fallback — read bcrypt hash from Firestore and verify client-side
  // This works without deploying Cloud Functions
  try {
    const configDoc = await getDoc(doc(db, "config", "admin"))
    if (!configDoc.exists()) {
      throw new Error("Admin not configured. Run the seed script first.")
    }

    const { passcodeHash } = configDoc.data()
    if (!passcodeHash) {
      throw new Error("Admin passcode not set. Run the setup script.")
    }

    // Dynamic import bcryptjs to keep bundle small
    const bcryptModule = await import("bcryptjs")
    const bcrypt = bcryptModule.default || bcryptModule
    const isValid = await bcrypt.compare(passcode, passcodeHash)

    if (!isValid) {
      throw new Error("Invalid passcode")
    }

    // Generate a client-side auth token using anonymous sign-in
    // Then write admin role claim to Firestore for rules to check
    const userCredential = await signInAnonymously(auth)
    const uid = userCredential.user.uid

    // Store admin session marker in Firestore (protected by rules)
    await setDoc(doc(db, "adminSessions", uid), {
      role: "admin",
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    })

    return `admin-session:${uid}`
  } catch (err: any) {
    if (err.message?.includes("not configured") || err.message?.includes("not set")) {
      throw err
    }
    throw new Error("Invalid passcode")
  }
}

export async function signInWithToken(token: string) {
  // If it's a Cloud Function token, use it directly
  if (token.startsWith("admin-session:")) {
    // Already signed in via anonymous auth from fallback
    return
  }
  await signInWithCustomToken(auth, token)
}

// Portfolio data interfaces
export interface PortfolioData {
  hero: {
    name: string
    firstName: string
    lastName: string
    tagline: string
    pills: string[]
    imageUrl: string
  }
  about: {
    paragraphs: string[]
    asciiArt: string
  }
  projects: {
    id: string
    title: string
    category: string
    description: string
    languages: string[]
    imageUrl: string
    videoUrl: string
    githubUrl: string
    highlights: string[]
  }[]
  experience: {
    id: string
    org: string
    role: string
    description: string
    startDate: string
    endDate: string
  }[]
  skills: {
    id: string
    name: string
    category: string
    icon: string
  }[]
  leadership: {
    id: string
    org: string
    role: string
    description: string
  }[]
  contact: {
    email: string
    github: string
    githubUsername: string
    linkedin: string
    linkedinUsername: string
    chips: string[]
  }
}

export async function fetchPortfolioData(): Promise<PortfolioData> {
  const sections = ["hero", "about", "projects", "experience", "skills", "leadership", "contact"]
  const data: Record<string, any> = {}

  for (const section of sections) {
    const docSnap = await getDoc(doc(db, "portfolio", section))
    if (docSnap.exists()) {
      data[section] = docSnap.data()
    }
  }

  return data as PortfolioData
}

export async function savePortfolioSection(section: string, data: any) {
  await setDoc(doc(db, "portfolio", section), data, { merge: true })
}
