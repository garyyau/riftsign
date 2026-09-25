import { Layers } from 'lucide-react'
import { deckLink } from '@/lib/deck-links'
import { STRINGS } from '@/lib/strings'
import type { Build, Legend } from '@/lib/types'
import { cn } from '@/lib/utils'

/** The Build's featured deck list, or a browse link to the Legend's decks when none is featured yet. */
export function DeckListBox({ legend, build, className }: { legend: Legend; build: Build; className?: string }) {
  const s = STRINGS.result
  const { featured, url } = deckLink(legend, build)
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'group flex items-center gap-4 rounded-md border bg-panel px-4 py-3 transition-colors outline-none hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <Layers aria-hidden className="size-5 shrink-0 text-secondary-text" />
      <span className="min-w-0">
        <span className="block text-small font-semibold text-foreground">
          {featured ? s.featuredDeck(legend.champion, build.archetype) : s.noFeaturedDeck}
        </span>
        <span className="block text-xs text-primary group-hover:underline">
          {featured ? s.openDeck : s.browseDecks(legend.champion)}
          <span aria-hidden> ↗</span>
        </span>
      </span>
    </a>
  )
}
