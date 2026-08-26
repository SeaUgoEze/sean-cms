import { initializeApp, getApps } from "firebase/app"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { getAuth, signInWithCustomToken } from "firebase/auth"

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

export async function verifyPasscode(passcode: string): Promise<string> {
  // Call the Firebase Cloud Function to verify the passcode
  // The passcode is NEVER exposed to the client — it's verified server-side
  const projectId = firebaseConfig.projectId
  const url = `https://us-central1-${projectId}.cloudfunctions.net/verifyPasscode`

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { passcode } }),
  })

  if (!response.ok) {
    throw new Error("Invalid passcode")
  }

  const result = await response.json()
  return result.result.token
}

export async function signInWithToken(token: string) {
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
