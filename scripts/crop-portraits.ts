/**
 * Writes public/portraits/<id>.webp, a square portrait cut from each Legend's card with the crop
 * in scripts/portrait-crops.json (x, y, width, height as fractions of the card, from the Penpot
 * Assets board). Run `pnpm portraits` after adding a Legend and its crop; `pnpm validate` fails
 * while a Legend has none.
 */
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { loadLegends } from './lib/load-legends'

const root = path.resolve(import.meta.dirname, '..')
const outDir = path.join(root, 'public/portraits')
const SIZE = 320

const crops: Record<string, [number, number, number, number]> = JSON.parse(readFileSync(path.join(root, 'scripts/portrait-crops.json'), 'utf8'))

mkdirSync(outDir, { recursive: true })
let written = 0
for (const legend of loadLegends(true)) {
  const crop = crops[legend.id]
  if (!crop) {
    console.warn(`No crop for ${legend.id}; skipped.`)
    continue
  }
  const card = sharp(path.join(root, 'public/cards', legend.cardImage))
  const { width = 0, height = 0 } = await card.metadata()
  const [x, y, w, h] = crop
  const left = Math.round(x * width)
  const top = Math.round(y * height)
  await card
    .extract({ left, top, width: Math.min(Math.round(w * width), width - left), height: Math.min(Math.round(h * height), height - top) })
    .resize(SIZE, SIZE, { fit: 'cover' })
    .webp({ quality: 82 })
    .toFile(path.join(outDir, `${legend.id}.webp`))
  written += 1
}
console.log(`Wrote ${written} portrait(s) to public/portraits/.`)
