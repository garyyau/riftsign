import type { ReactNode } from 'react'
import { answersOf } from '@/lib/scoring'
import type { Question } from '@/lib/types'
import { cn, stepNumber } from '@/lib/utils'

interface QuestionStepProps {
  question: Question
  selected: string | undefined
  onSelect: (answerId: string) => void
  /** The Back / hint / Next line under the Answers. */
  children?: ReactNode
}

/** Eyebrow and prompt on the left, numbered Answer rows on the right; stacked on narrow screens. */
export function QuestionStep({ question, selected, onSelect, children }: QuestionStepProps) {
  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,520px)_minmax(0,600px)] lg:justify-between lg:gap-x-16">
      <div>
        <p className="eyebrow">{question.eyebrow}</p>
        <h2 className="display-m mt-4 lg:text-[36px] lg:leading-[1.36]">{question.prompt}</h2>
      </div>
      <div className="min-w-0">
        <div role="radiogroup" aria-label={question.prompt} className="flex flex-col gap-4">
          {answersOf(question).map((answer, i) => {
            const active = answer.id === selected
            // An Answer that moves no score is the Player's way out of the Question, drawn dashed and quieter.
            const wayOut = answer.moves.length === 0
            return (
              <button
                key={answer.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(answer.id)}
                className={cn(
                  'flex min-h-[76px] w-full cursor-pointer items-center gap-4 rounded-md border px-7 py-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  wayOut ? 'mt-3 border-dashed border-border-strong hover:border-faint' : 'bg-surface hover:border-border-strong',
                  active && 'border-solid border-primary bg-selected hover:border-primary',
                )}
              >
                <span
                  aria-hidden
                  className={cn('w-7 shrink-0 font-display text-[14px] leading-[1.2]', active ? 'text-primary' : wayOut ? 'text-faint' : 'text-amber')}
                >
                  {stepNumber(i + 1)}
                </span>
                <span className={cn('text-answer', active ? 'font-medium text-foreground' : wayOut ? 'text-muted-foreground' : 'text-secondary-text')}>
                  {answer.text}
                </span>
              </button>
            )
          })}
        </div>
        {children}
      </div>
    </section>
  )
}
