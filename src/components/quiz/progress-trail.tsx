import { STRINGS } from '@/lib/strings'
import { cn } from '@/lib/utils'

/** One chevron per Question, lit up to and including the current one, then the "n of 21" count. */
export function ProgressTrail({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-5">
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={STRINGS.quiz.progressLabel(current, total)}
        className="flex gap-[3px] sm:gap-2.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 10 16"
            fill="none"
            aria-hidden
            className={cn('h-3 w-2 transition-colors sm:h-4 sm:w-2.5', i < current ? 'text-primary' : 'text-dim')}
          >
            <path d="M2 2l6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ))}
      </div>
      <span className="text-body leading-[1.2] font-medium text-muted-foreground">{STRINGS.quiz.progress(current, total)}</span>
    </div>
  )
}
