import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { STRINGS } from '@/lib/strings'
import type { Answers, Question } from '@/lib/types'
import { ChampionStep } from './champion-step'
import { ProgressBar } from './progress-bar'
import { QuestionStep } from './question-step'

interface QuizProps {
  questions: Question[]
  champions: string[]
  answers: Answers
  favouriteChampions: string[]
  /** 0-based; equal to questions.length on the champion step. */
  step: number
  onAnswer: (questionId: string, answerId: string) => void
  onNext: () => void
  onToggleChampion: (champion: string) => void
  onBack: () => void
  onFinish: (skipChampions: boolean) => void
}

/** How long a picked Answer stays on screen before the next Question, so the Player sees what they chose. */
export const ANSWER_PAUSE_MS = 250

export function Quiz({
  questions,
  champions,
  answers,
  favouriteChampions,
  step,
  onAnswer,
  onNext,
  onToggleChampion,
  onBack,
  onFinish,
}: QuizProps) {
  const s = STRINGS.quiz
  // The optional champion step sits after the Questions and is left out of the count.
  const total = questions.length
  const onChampions = step >= questions.length
  const question = onChampions ? null : questions[step]
  const progress = onChampions ? s.optionalStep : s.progress(step + 1, total)

  // Leaving the step (Back, Next, or the timer itself) cancels a pending advance.
  const advance = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(advance.current), [step])
  const select = (questionId: string, answerId: string) => {
    onAnswer(questionId, answerId)
    window.clearTimeout(advance.current)
    advance.current = window.setTimeout(onNext, ANSWER_PAUSE_MS)
  }

  return (
    <div>
      <ProgressBar value={Math.min(step, total)} max={total} label={progress} />
      <div className="flex items-center justify-between gap-3 px-6 pt-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-3">
          <ArrowLeft aria-hidden />
          {s.back}
        </Button>
        <div className="flex items-center gap-3">
          <span className="label-mono text-muted-foreground">{progress}</span>
          {question && question.id in answers && (
            <Button variant="ghost" size="sm" onClick={onNext} className="-mr-3">
              {s.next}
              <ArrowRight aria-hidden />
            </Button>
          )}
        </div>
      </div>
      {question ? (
        <QuestionStep
          key={question.id}
          question={question}
          number={step + 1}
          selected={answers[question.id]}
          onSelect={(answerId) => select(question.id, answerId)}
        />
      ) : (
        <ChampionStep
          champions={champions}
          selected={favouriteChampions}
          onToggle={onToggleChampion}
          onSkip={() => onFinish(true)}
          onDone={() => onFinish(false)}
        />
      )}
    </div>
  )
}
