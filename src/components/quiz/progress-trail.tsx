import { STRINGS } from '@/lib/strings'
import { cn } from '@/lib/utils'

interface ProgressTrailProps {
  /** 0-based index of the Question on screen. */
  step: number
  /** Whether each Question has an Answer. */
  answered: boolean[]
  onJump: (step: number) => void
}

/**
 * One chevron per Question, then the "n of 21" count. Chevrons are lit up to the current Question and dimmer for
 * answered ones past it. Any Question up to the first unanswered one can be jumped to. The chevrons are too small
 * to tab through one by one, so they stay out of the tab order; Back and Enter cover the same moves by keyboard.
 */
export function ProgressTrail({ step, answered, onJump }: ProgressTrailProps) {
  const total = answered.length
  const firstOpen = answered.indexOf(false)
  const reachable = firstOpen === -1 ? total - 1 : firstOpen
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-5">
      <div className="flex">
        {answered.map((done, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            aria-label={STRINGS.quiz.jumpTo(i + 1)}
            aria-current={i === step ? 'step' : undefined}
            disabled={i > reachable || i === step}
            onClick={() => onJump(i)}
            className={cn(
              'group cursor-pointer px-[1.5px] py-2 disabled:cursor-default sm:px-[5px]',
              i <= step ? 'text-primary' : done ? 'text-primary/40' : 'text-dim',
            )}
          >
            <svg
              viewBox="0 0 10 16"
              fill="none"
              aria-hidden
              className="block h-3 w-2 transition-colors group-enabled:group-hover:text-primary-hover sm:h-4 sm:w-2.5"
            >
              <path d="M2 2l6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
      <span
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step + 1}
        aria-label={STRINGS.quiz.progressLabel(step + 1, total)}
        className="text-body leading-[1.2] font-medium text-muted-foreground"
      >
        {STRINGS.quiz.progress(step + 1, total)}
      </span>
    </div>
  )
}
