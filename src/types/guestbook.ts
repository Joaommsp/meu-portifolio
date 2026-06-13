import type { Timestamp } from "firebase/firestore"

export type GuestbookEntryDoc = {
  id: string
  /** UID do user no Firebase Auth (chave da entrada — 1 por user). */
  userId: string
  /** Nome display do user (GitHub: login, Google: nome). */
  name: string
  /** Avatar URL do provider. */
  photoURL: string | null
  /** Provider usado: "github.com" ou "google.com". */
  providerId: string
  /** Texto da mensagem. */
  message: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type GuestbookEntry = Omit<
  GuestbookEntryDoc,
  "createdAt" | "updatedAt"
> & {
  createdAt: Date
  updatedAt: Date
}
