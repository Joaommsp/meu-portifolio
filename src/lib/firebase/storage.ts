import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage"
import imageCompression from "browser-image-compression"

import { requireStorage } from "./config"

export type UploadProgress = {
  bytesTransferred: number
  totalBytes: number
  /** 0 a 100. */
  percent: number
}

const DEFAULT_MAX_SIZE_MB = 2
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

export class StorageValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "StorageValidationError"
  }
}

function validateImage(file: File, maxSizeMB: number): void {
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    throw new StorageValidationError(
      `Tipo de arquivo não suportado. Aceitos: JPG, PNG, WebP, GIF.`
    )
  }
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > maxSizeMB) {
    throw new StorageValidationError(
      `Imagem maior que ${maxSizeMB}MB (atual: ${sizeMB.toFixed(2)}MB).`
    )
  }
}

type UploadOptions = {
  /** Pasta dentro do bucket (ex: "posts", "projects"). */
  folder: string
  /** Tamanho máximo em MB antes da compressão. Default 2MB. */
  maxSizeMB?: number
  /** Largura máxima após compressão. Default 1920px. */
  maxWidth?: number
  onProgress?: (progress: UploadProgress) => void
}

/**
 * Upload de imagem com compressão automática + progress.
 * Retorna a URL pública pronta pra salvar no Firestore.
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<string> {
  const storage = requireStorage()
  const maxSizeMB = options.maxSizeMB ?? DEFAULT_MAX_SIZE_MB

  validateImage(file, maxSizeMB)

  // Comprime client-side antes de mandar (poupa bandwidth + storage)
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: options.maxWidth ?? 1920,
    useWebWorker: true,
  })

  const safeName = sanitizeFileName(file.name)
  const path = `${options.folder}/${Date.now()}-${safeName}`
  const fileRef = storageRef(storage, path)

  const task = uploadBytesResumable(fileRef, compressed, {
    contentType: file.type,
    cacheControl: "public, max-age=31536000, immutable",
  })

  return new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const percent =
          snapshot.totalBytes > 0
            ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            : 0
        options.onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percent,
        })
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref)
          resolve(url)
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}

/**
 * Deleta um arquivo a partir da URL pública. Usado quando
 * substituímos a imagem de capa de um post/projeto.
 */
export async function deleteImage(url: string): Promise<void> {
  const storage = requireStorage()
  const path = extractPathFromUrl(url)
  if (!path) return
  await deleteObject(storageRef(storage, path)).catch((err: unknown) => {
    // Ignora se já não existe (404)
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "storage/object-not-found"
    ) {
      return
    }
    throw err
  })
}

function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .toLowerCase()
}

/**
 * Extrai o path do bucket a partir de uma URL gs:// ou https://.
 * Ex: "https://firebasestorage.googleapis.com/.../o/posts%2Fimage.jpg?alt=..."
 *     → "posts/image.jpg"
 */
function extractPathFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const match = parsed.pathname.match(/\/o\/(.+)$/)
    if (!match || !match[1]) return null
    return decodeURIComponent(match[1])
  } catch {
    return null
  }
}
