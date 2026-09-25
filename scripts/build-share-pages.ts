/**
 * Post-build step. For every reviewed Legend, writes:
 *   dist/og/<id>.png        1200x630 preview: card image (if present) plus the Legend name
 *   dist/r/<id>/index.html  copy of the built index.html with Open Graph tags for that Legend
 * plus dist/og/default.png for the root page. Share links point at r/<id>/ so chat previews
 * resolve to the top Match while the fragment rebuilds the full result client-side.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp, { type OverlayOptions } from 'sharp'
import { SCORE_IDS } from '../src/lib/axes'
import { LEGAL_DISCLAIMER, PROJECT_TITLE, STRINGS } from '../src/lib/strings'
import type { Legend } from '../src/lib/types'
import { loadLegends } from './lib/load-legends'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const base = process.env.BASE_PATH ?? '/'
const siteUrl = (process.env.SITE_URL ?? '').replace(/\/$/, '')

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html not found. Run vite build first.')
  process.exit(1)
}

const legends: Legend[] = loadLegends()

const WIDTH = 1200
const HEIGHT = 630
// The Riftward foundations (src/index.css). Sharp renders with system fonts, so the faces fall back.
const BG = '#0A0C12'
const FG = '#ECEEF2'
const MUTED = '#7F8797'
const BORDER = '#222838'
const CYAN = '#3BE8D0'
const AMBER = '#E8B04B'

const escapeXml = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')

/** Decorative radar with one spoke per Profile score (ten since ADR 0005). Allowed only on the share image. */
function radar(cx: number, cy: number, r: number): string {
  const n = SCORE_IDS.length
  const pts = (scale: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
      return `${(cx + Math.cos(a) * r * scale).toFixed(1)},${(cy + Math.sin(a) * r * scale).toFixed(1)}`
    }).join(' ')
  const rings = [1, 0.66, 0.33].map((s) => `<polygon points="${pts(s)}" fill="none" stroke="${BORDER}" stroke-width="1"/>`)
  const seed = [0.8, 0.55, 0.7, 0.45, 0.9, 0.6, 0.75, 0.5, 0.85, 0.65]
  const shape = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return `${(cx + Math.cos(a) * r * seed[i % seed.length]).toFixed(1)},${(cy + Math.sin(a) * r * seed[i % seed.length]).toFixed(1)}`
  }).join(' ')
  return `${rings.join('')}<polygon points="${shape}" fill="${CYAN}" fill-opacity="0.12" stroke="${CYAN}" stroke-width="2"/>`
}

function overlaySvg(title: string, subtitle: string, showRadar: boolean): Buffer {
  // Michroma runs wide, so lines stay short enough to clear the card on the right.
  const lines = wrap(title, 16)
  const titleSize = lines.length > 2 ? 44 : 52
  const text = lines
    .map((line, i) => `<text x="72" y="${280 + i * titleSize * 1.3}" font-size="${titleSize}" fill="${FG}" font-family="Michroma, Arial, sans-serif">${escapeXml(line)}</text>`)
    .join('')
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" font-family="Manrope, Arial, sans-serif">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="${CYAN}"/>
  <text x="72" y="120" font-size="22" font-weight="600" letter-spacing="4" fill="${AMBER}">${escapeXml(PROJECT_TITLE.toUpperCase())} / ${escapeXml(subtitle.toUpperCase())}</text>
  ${text}
  <text x="72" y="560" font-size="20" fill="${MUTED}">${escapeXml(STRINGS.og.tagline)}</text>
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
// The disclaimer must be conspicuous on every page; the SPA renders it, this keeps it in the static HTML too.
const indexHtml = readFileSync(path.join(dist, 'index.html'), 'utf8').replace(
  '</body>',
  `<noscript><p>${escapeXml(LEGAL_DISCLAIMER)}</p></noscript></body>`,
)

interface PageMeta {
  title: string
  description: string
  /** Path under the site base, e.g. "og/default.png" or "r/jinx/". */
  imagePath: string
  pagePath: string
}

/** Vite leaves <meta content> untouched, so absolute Open Graph URLs are stamped here for every page. */
function withMeta(html: string, meta: PageMeta): string {
  const abs = (p: string) => `${siteUrl}${base}${p}`
  return html
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeXml(meta.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeXml(meta.description)}" />`)
    .replace(
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${escapeXml(abs(meta.imagePath))}" /><meta property="og:url" content="${escapeXml(abs(meta.pagePath))}" />`,
    )
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeXml(meta.title)}</title>`)
}

await renderOg(path.join(ogDir, 'default.png'), STRINGS.landing.title, STRINGS.og.defaultSubtitle, null)
writeFileSync(
  path.join(dist, 'index.html'),
  withMeta(indexHtml, { title: STRINGS.og.title, description: STRINGS.og.description, imagePath: 'og/default.png', pagePath: '' }),
)
for (const legend of legends) {
  await renderOg(path.join(ogDir, `${legend.id}.png`), legend.name, legend.builds.map((b) => b.archetype).join(' / '), path.join(root, 'public/cards', legend.cardImage))
  const dir = path.join(dist, 'r', legend.id)
  mkdirSync(dir, { recursive: true })
  writeFileSync(
    path.join(dir, 'index.html'),
    withMeta(indexHtml, {
      title: STRINGS.og.legendTitle(legend.name),
      description: STRINGS.og.legendDescription(legend.name),
      imagePath: `og/${legend.id}.png`,
      pagePath: `r/${legend.id}/`,
    }),
  )
}
console.log(`Wrote ${legends.length} share page(s) and ${legends.length + 1} preview image(s) to dist/.`)
