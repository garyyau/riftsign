import { RowLogo } from '@/components/brand/logo'
import { PROJECT_TITLE } from '@/lib/strings'

export function SiteHeader({ onHome }: { onHome: () => void }) {
  return (
    <header className="flex h-16 items-center px-6 md:h-20 md:px-12">
      <button
        type="button"
        onClick={onHome}
        aria-label={PROJECT_TITLE}
        className="cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <RowLogo />
      </button>
    </header>
  )
}
