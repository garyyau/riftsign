/**
 * The 1200x630 share images. Text is drawn as SVG paths from the site's own font files, because sharp's
 * SVG renderer only sees system fonts and would swap Michroma and Manrope for Arial.
 */
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import opentype from 'opentype.js'
import sharp from 'sharp'
import type { Domain } from '../../src/lib/axes'
import type { Legend } from '../../src/lib/types'

const require = createRequire(import.meta.url)
const loadFont = (file: string) => {
  const buf = readFileSync(require.resolve(file))
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
}
const MICHROMA = loadFont('@fontsource/michroma/files/michroma-latin-400-normal.woff')
const MANROPE = loadFont('@fontsource/manrope/files/manrope-latin-500-normal.woff')
const MANROPE_SEMIBOLD = loadFont('@fontsource/manrope/files/manrope-latin-600-normal.woff')

export const WIDTH = 1200
export const HEIGHT = 630

// The Riftward foundations (src/index.css).
const BG = '#0A0C12'
const FG = '#ECEEF2'
const CREAM = '#F4F1EA'
const SECONDARY = '#BFC5D0'
const MUTED = '#7F8797'
const DIM = '#3A4358'
const HEX_FILL = '#12151F'
const CYAN = '#3BE8D0'
const AMBER = '#E8B04B'
const DOMAIN_COLOUR: Record<Domain, string> = {
  Fury: '#E5484D',
  Calm: '#3FBF7F',
  Mind: '#4C8DF6',
  Body: '#F08A3C',
  Chaos: '#9D5CF0',
  Order: '#E8C547',
}
/** Chevron opacities from the mark outward, as in the logo. */
const TRAIL = [0.7, 0.45, 0.2]

interface TextOptions {
  font?: opentype.Font
  size: number
  fill: string
  /** Extra space after each glyph, in px, like CSS letter-spacing. */
  tracking?: number
  anchor?: 'start' | 'middle'
}

/**
 * Lays glyphs out one by one with pair kerning. opentype.js's own shaping chokes on a Manrope substitution
 * table, and Latin text needs nothing more than this.
 */
function layout(str: string, x: number, y: number, { font = MANROPE, size, tracking = 0 }: TextOptions) {
  const scale = size / font.unitsPerEm
  const paths: string[] = []
  let cursor = x
  let prev: opentype.Glyph | null = null
  for (const ch of str) {
    const glyph = font.charToGlyph(ch)
    if (prev) cursor += font.getKerningValue(prev, glyph) * scale + tracking
    paths.push(glyph.getPath(cursor, y, size).toPathData(2))
    cursor += (glyph.advanceWidth ?? 0) * scale
    prev = glyph
  }
  return { d: paths.join(''), width: cursor - x }
}

const width = (str: string, opts: TextOptions) => layout(str, 0, 0, opts).width

/** One line of text as a filled path. `y` is the baseline. */
function text(str: string, x: number, y: number, opts: TextOptions): string {
  const start = opts.anchor === 'middle' ? x - width(str, opts) / 2 : x
  return `<path d="${layout(str, start, y, opts).d}" fill="${opts.fill}"/>`
}

/** Splits into two lines of the most even width, or keeps one line when it fits. */
function balance(str: string, max: number, opts: TextOptions): string[] {
  if (width(str, opts) <= max) return [str]
  const words = str.split(' ')
  let best = [str]
  let bestWidth = Infinity
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(' '), words.slice(i).join(' ')]
    const w = Math.max(...lines.map((l) => width(l, opts)))
    if (w < bestWidth) [best, bestWidth] = [lines, w]
  }
  return best
}

/** The hex and chevron trail at the wordmark's cap height (the header logo), scaled to `h` tall. */
function rowMark(x: number, y: number, h: number): string {
  const trail = TRAIL.map(
    (o, i) =>
      `<g stroke="${CYAN}" stroke-width="3.28" stroke-opacity="${o}"><path d="M${43.78 - i * 15.05},1.64L${31.74 - i * 15.05},13.68L${43.78 - i * 15.05},25.72"/><path d="M${148.3 + i * 15.05},1.64L${160.34 + i * 15.05},13.68L${148.3 + i * 15.05},25.72"/></g>`,
  ).join('')
  return `<g transform="translate(${x} ${y}) scale(${h / 27.36})" fill="none">${trail}<path d="M67.31,2.05L124.77,2.05L136.39,13.68L124.77,25.31L67.31,25.31L55.68,13.68Z" fill="${HEX_FILL}" stroke="${AMBER}" stroke-width="4.1"/></g>`
}

/** The landing's column logo: beam, chevrons and hex. Drawn in its own 113..287 x 0..160 space, centred on `cx`. */
function columnMark(cx: number, y: number, scale: number): string {
  const trail = TRAIL.map(
    (o, i) =>
      `<g stroke="${CYAN}" stroke-width="1.5" stroke-opacity="${o}"><path d="M${148 - i * 12},136L${138 - i * 12},146L${148 - i * 12},156"/><path d="M${252 + i * 12},136L${262 + i * 12},146L${252 + i * 12},156"/></g>`,
  ).join('')
  return `<g transform="translate(${cx} ${y}) scale(${scale}) translate(-200 0)" fill="none">
    <rect x="192" y="0" width="16" height="136" fill="url(#beam)" filter="url(#glow)"/>
    ${trail}
    <path d="M170,134L230,134L242,146L230,158L170,158L158,146Z" fill="${HEX_FILL}" stroke="${AMBER}" stroke-width="3"/>
  </g>`
}

/** A tag chip like the site's badge: tinted fill, small tracked caps. Returns the markup and its width. */
function tag(label: string, x: number, y: number, colour: string, fill: string, fillOpacity: number): [string, number] {
  const opts: TextOptions = { font: MANROPE_SEMIBOLD, size: 15, fill: colour, tracking: 2.5 }
  const w = width(label.toUpperCase(), opts) + 32
  return [
    `<rect x="${x}" y="${y}" width="${w.toFixed(1)}" height="36" rx="3" fill="${fill}" fill-opacity="${fillOpacity}"/>${text(label.toUpperCase(), x + 16, y + 23.5, opts)}`,
    w,
  ]
}

const DEFS = `<defs>
  <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${CYAN}" stop-opacity="0"/><stop offset="1" stop-color="${CYAN}"/></linearGradient>
  <filter id="glow" x="-200%" y="-20%" width="500%" height="140%"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="halo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
  <radialGradient id="wash" cx="0.5" cy="0" r="0.75"><stop offset="0" stop-color="${CYAN}" stop-opacity="0.10"/><stop offset="1" stop-color="${CYAN}" stop-opacity="0"/></radialGradient>
  <linearGradient id="fade-x" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${BG}"/><stop offset="0.16" stop-color="${BG}" stop-opacity="0"/><stop offset="0.84" stop-color="${BG}" stop-opacity="0"/><stop offset="1" stop-color="${BG}"/></linearGradient>
  <linearGradient id="fade-y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BG}" stop-opacity="0"/><stop offset="1" stop-color="${BG}" stop-opacity="0.85"/></linearGradient>
</defs>`

async function cardDataUri(file: string, w: number): Promise<string> {
  const jpg = await sharp(file).resize({ width: w * 2 }).jpeg({ quality: 82 }).toBuffer()
  return `data:image/jpeg;base64,${jpg.toString('base64')}`
}

function card(href: string, x: number, y: number, w: number, id: string): string {
  const h = Math.round((w * 7) / 5)
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${(w * 0.045).toFixed(1)}"/></clipPath><image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`
}

const svg = (body: string) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${HEIGHT}">${DEFS}<rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>${body}</svg>`)

const write = (file: string, body: string) => sharp(svg(body)).png().toFile(file)

export interface DefaultOgCopy {
  eyebrow: string
  title: string
}

/** The root page: the landing hero in miniature, with the Legend card row rising from the bottom edge. */
export async function renderDefaultOg(file: string, copy: DefaultOgCopy, cardFiles: string[]): Promise<void> {
  const cx = WIDTH / 2
  const titleOpts: TextOptions = { font: MICHROMA, size: 46, fill: FG, anchor: 'middle' }
  const lines = balance(copy.title, 1000, titleOpts)

  const cardW = 138
  const gap = 14
  const shown = cardFiles.filter(existsSync)
  const count = Math.min(shown.length, Math.ceil(WIDTH / (cardW + gap)) + 1)
  const rowW = count * (cardW + gap) - gap
  const hrefs = await Promise.all(shown.slice(0, count).map((f) => cardDataUri(f, cardW)))
  const cardsTop = 452
  const cards = hrefs.map((h, i) => card(h, cx - rowW / 2 + i * (cardW + gap), cardsTop, cardW, `c${i}`)).join('')

  await write(
    file,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wash)"/>
    ${columnMark(cx, -4, 0.82)}
    ${text('RIFTWARD', cx + 3, 190, { font: MICHROMA, size: 22, fill: CREAM, tracking: 5.5, anchor: 'middle' })}
    <g transform="translate(${cx - 100} 204)"><path d="M0,5H86M114,5H200" stroke="${DIM}" stroke-width="1.5"/><path d="M100,0L105,5L100,10L95,5Z" fill="${AMBER}"/></g>
    ${text(copy.eyebrow.toUpperCase(), cx + 2, 270, { font: MANROPE_SEMIBOLD, size: 16, fill: AMBER, tracking: 4.5, anchor: 'middle' })}
    ${lines.map((l, i) => text(l, cx, 336 + i * 60, titleOpts)).join('')}
    ${cards}
    <rect y="${cardsTop}" width="${WIDTH}" height="${HEIGHT - cardsTop}" fill="url(#fade-y)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#fade-x)"/>`,
  )
}

export interface LegendOgCopy {
  eyebrow: string
  tagline: string
}

/** A shared result: the top Legend's name, Domains and archetypes beside its card, framed by the chevron trail. */
export async function renderLegendOg(file: string, legend: Legend, cardFile: string, copy: LegendOgCopy): Promise<void> {
  const [champion, ...rest] = legend.name.split(', ')
  const epithet = rest.join(', ')
  const left = 80
  const maxText = 500

  let nameSize = 76
  while (width(champion, { font: MICHROMA, size: nameSize, fill: FG }) > maxText) nameSize -= 2

  const tags: string[] = []
  let tagX = left
  const push = ([markup, w]: [string, number]) => {
    tags.push(markup)
    tagX += w + 10
  }
  for (const d of legend.domains) push(tag(d, tagX, 404, DOMAIN_COLOUR[d], DOMAIN_COLOUR[d], 0.18))
  for (const a of [...new Set(legend.builds.map((b) => b.archetype))]) push(tag(a, tagX, 404, FG, SECONDARY, 0.1))

  // The card stands in for the logo's hex, with the chevron trail running out from either side.
  const cardW = 316
  const cardH = Math.round((cardW * 7) / 5)
  const cardX = 736
  const cardY = (HEIGHT - cardH) / 2
  const midY = HEIGHT / 2
  const chevrons = TRAIL.map((o, i) => {
    const l = cardX - 30 - i * 26
    const r = cardX + cardW + 30 + i * 26
    return `<g fill="none" stroke="${CYAN}" stroke-width="4" stroke-opacity="${o}"><path d="M${l},${midY - 28}L${l - 22},${midY}L${l},${midY + 28}"/><path d="M${r},${midY - 28}L${r + 22},${midY}L${r},${midY + 28}"/></g>`
  }).join('')
  const href = existsSync(cardFile) ? await cardDataUri(cardFile, cardW) : null

  await write(
    file,
    `<ellipse cx="${cardX + cardW / 2}" cy="${midY}" rx="${cardW * 0.62}" ry="${cardH * 0.5}" fill="${CYAN}" fill-opacity="0.16" filter="url(#halo)"/>
    ${rowMark(left, 72, 17)}
    ${text('RIFTWARD', left + 146, 89, { font: MICHROMA, size: 22, fill: CREAM, tracking: 5.5 })}
    ${text(copy.eyebrow.toUpperCase(), left, 218, { font: MANROPE_SEMIBOLD, size: 17, fill: AMBER, tracking: 4.5 })}
    ${text(champion, left, 308, { font: MICHROMA, size: nameSize, fill: FG })}
    ${epithet ? text(epithet, left, 362, { font: MANROPE, size: 30, fill: SECONDARY }) : ''}
    ${tags.join('')}
    ${text(copy.tagline, left, 560, { font: MANROPE, size: 20, fill: MUTED })}
    ${chevrons}
    ${href ? card(href, cardX, cardY, cardW, 'hero') : `<rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="14" fill="${HEX_FILL}" stroke="${AMBER}" stroke-width="3"/>`}`,
  )
}
