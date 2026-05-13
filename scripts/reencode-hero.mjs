/**
 * Re-encode hero.mp4 with a keyframe at EVERY frame (-g 1).
 * This makes seek (video.currentTime = X) smooth — browsers can
 * jump to any frame instantly without decoding from a distant keyframe.
 *
 * Run: node scripts/reencode-hero.mjs
 *
 * Output overwrites public/hero-video/hero.mp4. Original is backed up
 * to public/hero-video/hero.original.mp4 on first run.
 */

import { existsSync, copyFileSync, statSync } from "node:fs"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import ffmpegPath from "ffmpeg-static"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")

const input = resolve(root, "public/hero-video/hero.mp4")
const backup = resolve(root, "public/hero-video/hero.original.mp4")
const output = resolve(root, "public/hero-video/hero.tmp.mp4")
const final = input

if (!existsSync(input)) {
  console.error(`❌ Input not found: ${input}`)
  process.exit(1)
}

if (!existsSync(backup)) {
  copyFileSync(input, backup)
  console.log(`📦 Backup salvo: hero.original.mp4`)
}

const inputSize = statSync(backup).size

const args = [
  "-y", // overwrite output
  "-i",
  backup,
  "-c:v",
  "libx264",
  "-preset",
  "fast",
  "-crf",
  "23",
  "-g",
  "1", // keyframe every frame (the magic for scrubbing)
  "-keyint_min",
  "1",
  "-an", // strip audio (não precisamos)
  "-movflags",
  "+faststart", // metadata at start (faster initial load)
  output,
]

console.log(`🎬 Re-encoding ${(inputSize / 1024 / 1024).toFixed(1)}MB → keyframe-every-frame...`)
console.log(`   ${ffmpegPath} ${args.join(" ")}\n`)

const proc = spawn(ffmpegPath, args, { stdio: "inherit" })

proc.on("close", (code) => {
  if (code !== 0) {
    console.error(`\n❌ ffmpeg exited with code ${code}`)
    process.exit(code ?? 1)
  }
  copyFileSync(output, final)
  const outSize = statSync(final).size
  const delta = ((outSize / inputSize) * 100).toFixed(0)
  console.log(`\n✅ Pronto.`)
  console.log(`   Original: ${(inputSize / 1024 / 1024).toFixed(1)}MB`)
  console.log(`   Keyframed: ${(outSize / 1024 / 1024).toFixed(1)}MB (${delta}%)`)
  console.log(`   Backup em: hero.original.mp4`)
})
