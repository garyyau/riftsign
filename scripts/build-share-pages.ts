/**
 * Post-build step. For every reviewed Legend, writes:
 *   dist/og/<id>.png        1200x630 preview: the Legend's card, name, Domains and archetypes
 *   dist/r/<id>/index.html  copy of the built index.html with Open Graph tags for that Legend
 * plus dist/og/default.png, the landing hero, for the root page. Share links point at r/<id>/ so chat previews
 * resolve to the top Match while the fragment rebuilds the full result client-side.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { landingOrder } from '../src/components/landing/legend-order'
import { LEGAL_DISCLAIMER, STRINGS } from '../src/lib/strings'
import type { Legend } from '../src/lib/types'
import { loadLegends } from './lib/load-legends'
import { renderDefaultOg, renderLegendOg } from './lib/og-image'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const base = process.env.BASE_PATH ?? '/'
const siteUrl = (process.env.SITE_URL ?? '').replace(/\/$/, '')

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html not found. Run vite build first.')
  process.exit(1)
}

const legends: Legend[] = loadLegends()

const escapeXml = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')

const cardPath = (legend: Legend) => path.join(root, 'public/cards', legend.cardImage)

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

await renderDefaultOg(
  path.join(ogDir, 'default.png'),
  { eyebrow: STRINGS.landing.eyebrow, title: STRINGS.landing.title },
  landingOrder(legends).map(cardPath),
)
writeFileSync(
  path.join(dist, 'index.html'),
  withMeta(indexHtml, { title: STRINGS.og.title, description: STRINGS.og.description, imagePath: 'og/default.png', pagePath: '' }),
)
for (const legend of legends) {
  await renderLegendOg(path.join(ogDir, `${legend.id}.png`), legend, cardPath(legend), { eyebrow: STRINGS.og.legendEyebrow, tagline: STRINGS.og.tagline })
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
