import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
} from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const rawConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/**
 * `true` se TODAS as env vars críticas existem.
 * Resto da app checa isso antes de chamar operações reais.
 */
export const firebaseConfigured: boolean = Boolean(
  rawConfig.apiKey && rawConfig.projectId && rawConfig.appId
)

export const ADMIN_UID: string = process.env.NEXT_PUBLIC_ADMIN_UID ?? ""

let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null
let storageInstance: FirebaseStorage | null = null

if (firebaseConfigured) {
  const existing = getApps()[0]
  app =
    existing ??
    initializeApp({
      apiKey: rawConfig.apiKey!,
      authDomain: rawConfig.authDomain!,
      projectId: rawConfig.projectId!,
      storageBucket: rawConfig.storageBucket!,
      messagingSenderId: rawConfig.messagingSenderId!,
      appId: rawConfig.appId!,
    })
  authInstance = getAuth(app)
  // Força long-polling no servidor (Node.js GRPC fica em offline mode com Turbopack).
  // Auto-detect tenta WebChannel primeiro e cai pra long-polling se necessário.
  // No client browser, WebChannel é o default e funciona normalmente.
  if (existing) {
    dbInstance = getFirestore(app)
  } else {
    // No servidor (Node.js do Next), GRPC não funciona — força long-polling
    // que usa HTTP/fetch standard. No browser, HTTP/2 com long-polling
    // também é confiável e bypassa o WebChannel transport.
    dbInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    })
  }
  storageInstance = getStorage(app)
}

export const auth = authInstance
export const db = dbInstance
export const storage = storageInstance
export const firebaseApp = app

/**
 * Helpers que lançam erro descritivo quando o serviço não está configurado.
 * Use no client antes de chamar APIs do Firebase.
 */
export function requireAuth(): Auth {
  if (!authInstance) {
    throw new FirebaseNotConfiguredError("Auth")
  }
  return authInstance
}

export function requireDb(): Firestore {
  if (!dbInstance) {
    throw new FirebaseNotConfiguredError("Firestore")
  }
  return dbInstance
}

export function requireStorage(): FirebaseStorage {
  if (!storageInstance) {
    throw new FirebaseNotConfiguredError("Storage")
  }
  return storageInstance
}

export class FirebaseNotConfiguredError extends Error {
  constructor(service: string) {
    super(
      `Firebase ${service} não configurado. Preencha as variáveis NEXT_PUBLIC_FIREBASE_* em .env.local e reinicie o dev server.`
    )
    this.name = "FirebaseNotConfiguredError"
  }
}
