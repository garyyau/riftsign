import { PROJECT_TITLE, STRINGS } from '@/lib/strings'

export function SiteHeader({ onHome }: { onHome: () => void }) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <button type="button" onClick={onHome} className="label-mono flex cursor-pointer items-center gap-2 text-foreground">
        <span aria-hidden className="inline-block size-2 rotate-45 border border-primary" />
        {PROJECT_TITLE}
      </button>
      <a
        href="https://www.piltoverarchive.com"
        target="_blank"
        rel="noreferrer"
        className="label-mono text-muted-foreground transition-colors hover:text-foreground"
      >
        {STRINGS.header.archive}
        <span aria-hidden className="ml-1">↗</span>
      </a>
    </header>
  )
}
