import { Coffee } from 'lucide-react'
import { RowLogo } from '@/components/brand/logo'
import { COFFEE_URL, PROJECT_TITLE, STRINGS } from '@/lib/strings'

export function SiteHeader({ onHome }: { onHome: () => void }) {
  return (
    <header className="flex h-16 items-center justify-between px-6 md:h-20 md:px-12">
      <button
        type="button"
        onClick={onHome}
        aria-label={PROJECT_TITLE}
        className="cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <RowLogo />
      </button>
      <a
        href={COFFEE_URL}
        target="_blank"
        rel="noreferrer"
        aria-label={STRINGS.header.coffee}
        className="flex items-center gap-2 rounded-sm text-xs text-faint transition-colors outline-none hover:text-amber focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <Coffee aria-hidden className="size-4" />
        <span className="hidden sm:inline">{STRINGS.header.coffee}</span>
      </a>
    </header>
  )
}
