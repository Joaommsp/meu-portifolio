import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  type User,
  type Unsubscribe,
} from "firebase/auth"

import { requireAuth, ADMIN_UID } from "./config"

export type AuthUser = User

/**
 * Login com email/senha. Persiste sessão em localStorage
 * (usuário continua logado entre refreshes/aba fechada).
 */
export async function signIn(email: string, password: string): Promise<User> {
  const auth = requireAuth()
  await setPersistence(auth, browserLocalPersistence)
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function signOut(): Promise<void> {
  const auth = requireAuth()
  await firebaseSignOut(auth)
}

/**
 * Subscribe a mudanças de auth state. Retorna função de cleanup.
 * Use dentro de useEffect no AuthContext.
 */
export function watchAuth(callback: (user: User | null) => void): Unsubscribe {
  const auth = requireAuth()
  return onAuthStateChanged(auth, callback)
}

/**
 * Verifica se um UID é o admin autorizado (vs. NEXT_PUBLIC_ADMIN_UID).
 * Tripla verificação: além das security rules do Firestore,
 * o client também checa antes de mostrar UI de admin.
 */
export function isAdminUid(uid: string | undefined | null): boolean {
  if (!uid || !ADMIN_UID) return false
  return uid === ADMIN_UID
}
