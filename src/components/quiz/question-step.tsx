import { useState, type ReactNode } from 'react'
import { answersOf } from '@/lib/scoring'
import type { Question } from '@/lib/types'
import { cn, stepNumber } from '@/lib/utils'

interface QuestionStepProps {
  question: Question
  selected: string | undefined
  onSelect: (answerId: string) => void
  /** The line under the Answers: the key hint, plus the finish button on the last Question. */
  children?: ReactNode
}

/** Eyebrow and prompt on the left, numbered Answer rows on the right; stacked on narrow screens. */
export function QuestionStep({ question, selected, onSelect, children }: QuestionStepProps) {
  // The pointer is still over the row just picked when the next Question shows, so hover waits for it to move.
  const [hoverable, setHoverable] = useState(false)
  return (
    <section
      onPointerMove={hoverable ? undefined : () => setHoverable(true)}
      className="grid gap-10 lg:grid-cols-[minmax(0,520px)_minmax(0,600px)] lg:justify-between lg:gap-x-16">
      <div>
        <p className="eyebrow">{question.eyebrow}</p>
        <h2 className="display-m mt-4 lg:text-[36px] lg:leading-[1.36]">{question.prompt}</h2>
      </div>
      <div className="min-w-0">
        <div role="radiogroup" aria-label={question.prompt} className="flex flex-col gap-4">
          {answersOf(question).map((answer, i) => {
            const active = answer.id === selected
            // Hover looks like selected: picking moves on at once, so this is the only preview of the choice.
            const hover = hoverable && !active
            return (
              <button
                key={answer.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(answer.id)}
                className={cn(
                  'group flex min-h-[76px] w-full cursor-pointer items-center gap-4 rounded-md border px-7 py-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  active ? 'border-primary bg-selected' : 'bg-surface', hover && 'hover:border-primary hover:bg-selected',
                )}
              >
                <span
                  aria-hidden
                  className={cn('w-7 shrink-0 font-display text-[14px] leading-[1.2]', active ? 'text-primary' : 'text-amber', hover && 'group-hover:text-primary')}
                >
                  {stepNumber(i + 1)}
                </span>
                <span className={cn('text-answer', active ? 'font-medium text-foreground' : 'text-secondary-text', hover && 'group-hover:text-foreground')}>
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
