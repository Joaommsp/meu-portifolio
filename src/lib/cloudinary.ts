/**
 * Upload helper para Cloudinary via unsigned preset.
 * Sem backend: o browser faz POST direto pra API do Cloudinary.
 * Requer NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.
 *
 * A imagem é comprimida no client antes de subir — poupa cota do plano free
 * (armazenamento + banda) sem perda visível nas dimensões que o site usa.
 */

import imageCompression from "browser-image-compression"

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ""
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ""
const DEFAULT_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER ?? ""

export const cloudinaryConfigured: boolean = Boolean(
  CLOUD_NAME && UPLOAD_PRESET
)

export type CloudinaryUploadProgress = {
  bytesTransferred: number
  totalBytes: number
  percent: number
}

export type CloudinaryUploadResult = {
  url: string
  publicId: string
  width: number
  height: number
  bytes: number
  format: string
}

type UploadOptions = {
  folder?: string
  onProgress?: (progress: CloudinaryUploadProgress) => void
  signal?: AbortSignal
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB no client (Cloudinary aceita até 10MB no plano free)

const COMPRESSION_MAX_SIZE_MB = 1
const COMPRESSION_MAX_DIMENSION = 1920

/**
 * A lib de compressão redesenha o arquivo num canvas, o que achata GIF
 * animado num quadro único. Esses sobem no original.
 */
const SKIP_COMPRESSION_TYPES = ["image/gif"]

export class CloudinaryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CloudinaryError"
  }
}

export function validateImageFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new CloudinaryError(
      "Tipo não suportado. Aceitos: JPG, PNG, WebP, GIF."
    )
  }
  if (file.size > MAX_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1)
    throw new CloudinaryError(
      `Imagem muito grande (${sizeMB}MB) — limite é 10MB.`
    )
  }
}

/**
 * Reduz peso e dimensões antes do upload. A compressão é otimização, não
 * requisito: se falhar, o original sobe do mesmo jeito.
 */
async function compressIfPossible(file: File): Promise<File> {
  if (SKIP_COMPRESSION_TYPES.includes(file.type)) return file
  try {
    return await imageCompression(file, {
      maxSizeMB: COMPRESSION_MAX_SIZE_MB,
      maxWidthOrHeight: COMPRESSION_MAX_DIMENSION,
      useWebWorker: true,
    })
  } catch {
    return file
  }
}

export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  if (!cloudinaryConfigured) {
    throw new CloudinaryError(
      "Cloudinary não configurado. Preencha NEXT_PUBLIC_CLOUDINARY_* em .env.local."
    )
  }

  validateImageFile(file)

  const compressed = await compressIfPossible(file)
  if (options.signal?.aborted) {
    throw new CloudinaryError("Upload cancelado")
  }

  return sendToCloudinary(compressed, options)
}

/**
 * Upload via XHR (necessário pra rastrear progresso — fetch não expõe).
 * Cloudinary aceita unsigned upload via POST multipart pra essa URL.
 */
function sendToCloudinary(
  file: File,
  options: UploadOptions
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    const folder = options.folder ?? DEFAULT_FOLDER

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", UPLOAD_PRESET)
    if (folder) formData.append("folder", folder)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", url)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        options.onProgress?.({
          bytesTransferred: e.loaded,
          totalBytes: e.total,
          percent: (e.loaded / e.total) * 100,
        })
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as {
            secure_url: string
            public_id: string
            width: number
            height: number
            bytes: number
            format: string
          }
          resolve({
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            bytes: data.bytes,
            format: data.format,
          })
        } catch {
          reject(new CloudinaryError("Resposta inválida do Cloudinary"))
        }
      } else {
        let message = `Upload falhou (HTTP ${xhr.status})`
        try {
          const data = JSON.parse(xhr.responseText) as {
            error?: { message?: string }
          }
          if (data.error?.message) message = data.error.message
        } catch {
          /* ignora */
        }
        reject(new CloudinaryError(message))
      }
    }

    xhr.onerror = () => reject(new CloudinaryError("Erro de rede no upload"))
    xhr.onabort = () => reject(new CloudinaryError("Upload cancelado"))

    options.signal?.addEventListener("abort", () => xhr.abort())

    xhr.send(formData)
  })
}
