import { LEGAL_DISCLAIMER, STRINGS } from '@/lib/strings'

export function SiteFooter() {
  return (
    <footer className="border-t px-6 py-10 text-xs leading-relaxed text-muted-foreground">
      <p className="max-w-2xl">{STRINGS.footer.about}</p>
      <p className="mt-4 max-w-2xl">{LEGAL_DISCLAIMER}</p>
    </footer>
  )
}
