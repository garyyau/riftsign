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
                'cursor-pointer text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isStatement
                  ? 'label-mono flex-1 border px-3 py-4 text-center leading-snug normal-case tracking-normal sm:border-0 hover:bg-accent'
                  : 'rounded-md border px-5 py-4 text-base leading-snug hover:border-foreground',
                active ? 'border-primary bg-primary/10 text-foreground sm:bg-primary/10' : 'text-foreground/90',
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
