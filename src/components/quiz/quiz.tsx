import { ArrowLeft } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { STRINGS } from '@/lib/strings'
import type { Answers, Question } from '@/lib/types'
import { ProgressBar } from './progress-bar'
import { QuestionStep } from './question-step'

interface QuizProps {
  questions: Question[]
  answers: Answers
  /** 0-based index of the Question on screen. */
  step: number
  onAnswer: (questionId: string, answerId: string) => void
  onNext: () => void
  onBack: () => void
  /** Called instead of onNext after the last Question. */
  onFinish: () => void
}

/** How long a picked Answer stays on screen before the next Question, so the Player sees what they chose. */
export const ANSWER_PAUSE_MS = 250

export function Quiz({ questions, answers, step, onAnswer, onNext, onBack, onFinish }: QuizProps) {
  const s = STRINGS.quiz
  const total = questions.length
  const question = questions[step]
  const last = step === total - 1
  const next = last ? onFinish : onNext
  const progress = s.progress(step + 1, total)

  // Leaving the step (Back, Next, or the timer itself) cancels a pending advance.
  const advance = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(advance.current), [step])
  const select = (questionId: string, answerId: string) => {
    onAnswer(questionId, answerId)
    window.clearTimeout(advance.current)
    advance.current = window.setTimeout(next, ANSWER_PAUSE_MS)
  }

  return (
    <div>
      <ProgressBar value={step} max={total} label={progress} />
      <div className="flex items-center justify-between gap-3 px-6 pt-4">
        <Button variant="link" onClick={onBack}>
          <ArrowLeft aria-hidden />
          {s.back}
        </Button>
        <div className="flex items-center gap-3">
          <span className="small-caps text-muted-foreground">{progress}</span>
          {question.id in answers && (
            <Button size="sm" forward onClick={next}>
              {last ? s.finish : s.next}
            </Button>
          )}
        </div>
      </div>
      <QuestionStep
        key={question.id}
        question={question}
        number={step + 1}
        selected={answers[question.id]}
        onSelect={(answerId) => select(question.id, answerId)}
      />
    </div>
  )
}
