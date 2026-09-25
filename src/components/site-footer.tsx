import { LEGAL_DISCLAIMER } from '@/lib/strings'

/** Riot's policy asks for the legal line, so it sits under a rule-diamond ornament on every screen. */
export function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-[800px] flex-col items-center gap-7 px-6 pt-16 pb-14 text-center">
      <div aria-hidden className="flex w-full max-w-[428px] items-center gap-2">
        <span className="h-px flex-1 bg-dim" />
        <span className="size-[7px] rotate-45 bg-amber" />
        <span className="h-px flex-1 bg-dim" />
      </div>
      <p className="max-w-[428px] text-[11px] leading-[1.3] text-balance text-faint">{LEGAL_DISCLAIMER}</p>
    </footer>
  )
}
