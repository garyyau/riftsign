/**
 * Post-build step. For every reviewed Legend, writes:
 *   dist/og/<id>.png        1200x630 preview: card image (if present) plus the Legend name
 *   dist/r/<id>/index.html  copy of the built index.html with Open Graph tags for that Legend
 * plus dist/og/default.png for the root page. Share links point at r/<id>/ so chat previews
 * resolve to the top Match while the fragment rebuilds the full result client-side.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp, { type OverlayOptions } from 'sharp'
import { validateLegend } from '../src/lib/schemas'
import { LEGAL_DISCLAIMER, PROJECT_TITLE } from '../src/lib/strings'
import type { Legend } from '../src/lib/types'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const base = process.env.BASE_PATH ?? '/'
const siteUrl = (process.env.SITE_URL ?? '').replace(/\/$/, '')

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html not found. Run vite build first.')
  process.exit(1)
}

const legendDir = path.join(root, 'src/data/legends')
const legends: Legend[] = readdirSync(legendDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => validateLegend(JSON.parse(readFileSync(path.join(legendDir, f), 'utf8'))))
  .flatMap((r) => (r.success && r.data.reviewed ? [r.data] : []))

const WIDTH = 1200
const HEIGHT = 630
const BG = '#0a0a0c'
const FG = '#ededed'
const MUTED = '#8a8a90'
const ACCENT = '#ff4d8d'

const escapeXml = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')

/** Decorative heptagon radar echoing the seven Axes. Allowed only on the share image. */
function radar(cx: number, cy: number, r: number): string {
  const pts = (scale: number) =>
    Array.from({ length: 7 }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7
      return `${(cx + Math.cos(a) * r * scale).toFixed(1)},${(cy + Math.sin(a) * r * scale).toFixed(1)}`
    }).join(' ')
  const rings = [1, 0.66, 0.33].map((s) => `<polygon points="${pts(s)}" fill="none" stroke="#26262a" stroke-width="1"/>`)
  const seed = [0.8, 0.55, 0.7, 0.45, 0.9, 0.6, 0.75]
  const shape = Array.from({ length: 7 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7
    return `${(cx + Math.cos(a) * r * seed[i]).toFixed(1)},${(cy + Math.sin(a) * r * seed[i]).toFixed(1)}`
  }).join(' ')
  return `${rings.join('')}<polygon points="${shape}" fill="${ACCENT}" fill-opacity="0.12" stroke="${ACCENT}" stroke-width="2"/>`
}

function overlaySvg(title: string, subtitle: string, showRadar: boolean): Buffer {
  const lines = wrap(title, 22)
  const titleSize = lines.length > 2 ? 56 : 68
  const text = lines
    .map((line, i) => `<text x="72" y="${300 + i * titleSize * 1.05}" font-size="${titleSize}" font-weight="700" fill="${FG}">${escapeXml(line)}</text>`)
    .join('')
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" font-family="Space Grotesk, Inter, Arial, sans-serif">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="${ACCENT}"/>
  <text x="72" y="120" font-size="22" letter-spacing="3" fill="${MUTED}" font-family="JetBrains Mono, Consolas, monospace">${escapeXml(PROJECT_TITLE.toUpperCase())} / ${escapeXml(subtitle.toUpperCase())}</text>
  ${text}
  <text x="72" y="560" font-size="20" fill="${MUTED}">A playstyle test for Riftbound. Fit, not tier list.</text>
  ${showRadar ? radar(960, 315, 180) : ''}
</svg>`)
}

function wrap(text: string, max: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const w of words) {
    if ((current + ' ' + w).trim().length > max && current) {
      lines.push(current)
      current = w
    } else current = (current + ' ' + w).trim()
  }
  if (current) lines.push(current)
  return lines
}

async function renderOg(file: string, title: string, subtitle: string, cardPath: string | null) {
  const layers: OverlayOptions[] = []
  let hasCard = false
  if (cardPath && existsSync(cardPath)) {
    const cardHeight = 520
    const card = await sharp(cardPath).resize({ height: cardHeight }).png().toBuffer()
    layers.push({ input: card, top: (HEIGHT - cardHeight) / 2, left: WIDTH - 72 - Math.round((cardHeight * 5) / 7) })
    hasCard = true
  }
  await sharp(overlaySvg(title, subtitle, !hasCard))
    .composite(layers)
    .png()
    .toFile(file)
}

const ogDir = path.join(dist, 'og')
mkdirSync(ogDir, { recursive: true })
const indexHtml = readFileSync(path.join(dist, 'index.html'), 'utf8')

function withMeta(html: string, legend: Legend): string {
  const url = `${siteUrl}${base}r/${legend.id}/`
  const image = `${siteUrl}${base}og/${legend.id}.png`
  const title = `${PROJECT_TITLE}: ${legend.name}`
  const description = `My Riftsign matched me with ${legend.name}. Find yours.`
  return html
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeXml(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeXml(description)}" />`)
    .replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${escapeXml(image)}" /><meta property="og:url" content="${escapeXml(url)}" />`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeXml(title)}</title>`)
}

await renderOg(path.join(ogDir, 'default.png'), 'Find the Legends you were made to pilot.', 'Riftbound playstyle test', null)
for (const legend of legends) {
  await renderOg(path.join(ogDir, `${legend.id}.png`), legend.name, legend.archetype, path.join(root, 'public/cards', legend.cardImage))
  const dir = path.join(dist, 'r', legend.id)
  mkdirSync(dir, { recursive: true })
  writeFileSync(path.join(dir, 'index.html'), withMeta(indexHtml, legend))
}
// The disclaimer must be conspicuous on every page; the SPA renders it, this keeps it in the static HTML too.
writeFileSync(path.join(dist, 'index.html'), indexHtml.replace('</body>', `<noscript><p>${escapeXml(LEGAL_DISCLAIMER)}</p></noscript></body>`))
console.log(`Wrote ${legends.length} share page(s) and ${legends.length + 1} preview image(s) to dist/.`)
