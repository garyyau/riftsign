import { answersOf } from '@/lib/scoring'
import type { Question } from '@/lib/types'
import { cn } from '@/lib/utils'
import { StepRail } from './step-rail'

interface QuestionStepProps {
  question: Question
  number: number
  selected: string | undefined
  onSelect: (answerId: string) => void
}

const pointClass =
  'cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/** A picked statement point: an inset ring and accent text, so the choice reads before the step advances. */
const activePoint = 'bg-primary/10 text-primary ring-1 ring-primary ring-inset'

export function QuestionStep({ question, number, selected, onSelect }: QuestionStepProps) {
  const answers = answersOf(question)
  const isStatement = question.kind === 'statement'
  return (
    <StepRail number={number} eyebrow={question.eyebrow} title={question.prompt}>
      <div
        role="radiogroup"
        aria-label={question.prompt}
        className={cn('flex flex-col gap-2', isStatement && 'sm:flex-row sm:gap-0 sm:divide-x sm:border')}
      >
        {answers.map((answer) => {
          const active = answer.id === selected
          return (
            <button
              key={answer.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(answer.id)}
              className={cn(
                pointClass,
                'text-left',
                // Statements carry their own border only on mobile; from sm the row's divide-x draws them.
                isStatement
                  ? 'label-mono flex-1 px-3 py-4 text-center leading-snug normal-case tracking-normal max-sm:border hover:bg-accent'
                  : 'rounded-md border px-5 py-4 text-base leading-snug hover:border-foreground',
                active
                  ? isStatement
                    ? cn(activePoint, 'max-sm:border-primary')
                    : 'border-primary bg-primary/10 text-foreground'
                  : 'text-foreground/90',
              )}
            >
              {answer.text}
            </button>
          )
        })}
      </div>
    </StepRail>
  )
}
