import { answersOf, SCALE_POINTS } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import type { Answer, Question } from '@/lib/types'
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

/** A picked statement or scale point: an inset ring and accent text, so the choice reads before the step advances. */
const activePoint = 'bg-primary/10 text-primary ring-1 ring-primary ring-inset'

export function QuestionStep({ question, number, selected, onSelect }: QuestionStepProps) {
  const answers = answersOf(question)
  const isStatement = question.kind === 'statement'
  return (
    <StepRail number={number} eyebrow={question.eyebrow} title={question.prompt}>
      {question.kind === 'scenario' && question.scale ? (
        <ScalePoints prompt={question.prompt} points={answers} selected={selected} onSelect={onSelect} />
      ) : (
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
      )}
    </StepRail>
  )
}

interface ScalePointsProps {
  prompt: string
  /** The four expanded points, first pole strong to second pole strong. */
  points: Answer[]
  selected: string | undefined
  onSelect: (answerId: string) => void
}

/**
 * A two-pole scenario: the pole texts sit at the ends, four strength points between them.
 * On mobile the first pole sits above the row and the second below, each by its own end.
 */
function ScalePoints({ prompt, points, selected, onSelect }: ScalePointsProps) {
  const s = STRINGS.quiz
  const poleClass = 'col-span-2 text-base leading-snug text-foreground/90 sm:col-span-1'
  return (
    <div role="radiogroup" aria-label={prompt} className="grid grid-cols-2 gap-x-6 gap-y-4">
      <p aria-hidden className={poleClass}>
        {points[0].text}
      </p>
      <p aria-hidden className={cn(poleClass, 'order-last text-right sm:order-none')}>
        {points[points.length - 1].text}
      </p>
      <div className="col-span-2 grid grid-cols-4 divide-x border">
        {points.map((point, i) => {
          const active = point.id === selected
          const strong = SCALE_POINTS[i].strength === 'strong'
          const label = strong ? s.scaleStrong : s.scaleLeaning
          return (
            <button
              key={point.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={s.scalePoint(label, point.text)}
              onClick={() => onSelect(point.id)}
              className={cn(
                pointClass,
                'label-mono flex min-h-16 flex-col items-center justify-center gap-2.5 px-1 py-4 text-center normal-case tracking-normal hover:bg-accent',
                active ? activePoint : 'text-foreground/90',
              )}
            >
              {/* A fixed box keeps both marker sizes on one baseline, so every label lines up. */}
              <span aria-hidden className="flex size-3 items-center justify-center">
                <span
                  className={cn(
                    'rounded-sm border',
                    strong ? 'size-3' : 'size-2',
                    active ? 'border-primary bg-primary' : 'border-muted-foreground',
                  )}
                />
              </span>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
