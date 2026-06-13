import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth"
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"

import { requireAuth, requireDb } from "./config"
import type {
  GuestbookEntry,
  GuestbookEntryDoc,
} from "@/types/guestbook"

const GUESTBOOK_COLLECTION = "guestbook"
const MAX_MESSAGE_LENGTH = 280

/* ─────────────────────────────────────────────────────────── */
/* Auth                                                        */
/* ─────────────────────────────────────────────────────────── */

export async function signInWithGitHub(): Promise<User> {
  const auth = requireAuth()
  const provider = new GithubAuthProvider()
  provider.setCustomParameters({ allow_signup: "true" })
  const cred = await signInWithPopup(auth, provider)
  return cred.user
}

export async function signInWithGoogle(): Promise<User> {
  const auth = requireAuth()
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  return cred.user
}

export async function signOutGuestbook(): Promise<void> {
  const auth = requireAuth()
  await fbSignOut(auth)
}

/* ─────────────────────────────────────────────────────────── */
/* CRUD                                                        */
/* ─────────────────────────────────────────────────────────── */

function toEntry(id: string, data: Omit<GuestbookEntryDoc, "id">): GuestbookEntry {
  return {
    ...data,
    id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  }
}

/** Lista todas as entradas (mais recentes primeiro). */
export async function listGuestbookEntries(): Promise<GuestbookEntry[]> {
  const db = requireDb()
  const q = query(
    collection(db, GUESTBOOK_COLLECTION),
    orderBy("createdAt", "desc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) =>
    toEntry(d.id, d.data() as Omit<GuestbookEntryDoc, "id">)
  )
}

/**
 * Cria ou atualiza a entrada do user (1 por user — usa UID como doc ID).
 * Substitui a mensagem anterior se já existir.
 */
export async function upsertGuestbookEntry(
  user: User,
  message: string
): Promise<void> {
  const trimmed = message.trim()
  if (!trimmed) throw new Error("Mensagem não pode estar vazia")
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Máximo ${MAX_MESSAGE_LENGTH} caracteres`)
  }

  const db = requireDb()
  const ref = doc(db, GUESTBOOK_COLLECTION, user.uid)
  const providerData = user.providerData[0]

  await setDoc(
    ref,
    {
      userId: user.uid,
      name:
        user.displayName ??
        providerData?.displayName ??
        user.email?.split("@")[0] ??
        "Anônimo",
      photoURL: user.photoURL ?? providerData?.photoURL ?? null,
      providerId: providerData?.providerId ?? "unknown",
      message: trimmed,
      // Mantém createdAt se já existir; sempre atualiza updatedAt.
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

/** Deleta a própria entrada (user remove a mensagem dele mesmo). */
export async function deleteOwnGuestbookEntry(userId: string): Promise<void> {
  const db = requireDb()
  await deleteDoc(doc(db, GUESTBOOK_COLLECTION, userId))
}

export { Timestamp, MAX_MESSAGE_LENGTH }
