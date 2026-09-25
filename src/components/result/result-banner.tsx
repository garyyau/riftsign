import type { ReactNode } from 'react'

/** A thin notice above the hero: a shared result, or a result from an older Question set. */
export function ResultBanner({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border-strong bg-panel px-4 py-3 text-small text-secondary-text">
      <span aria-hidden className="size-2 shrink-0 rotate-45 bg-amber" />
      <p className="min-w-0 flex-1">{children}</p>
      {action}
    </div>
  )
}
