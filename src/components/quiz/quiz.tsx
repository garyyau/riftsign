import { ArrowLeft } from 'lucide-react'
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
  onToggleChampion: (champion: string) => void
  onBack: () => void
  onFinish: (skipChampions: boolean) => void
}

export function Quiz({
  questions,
  champions,
  answers,
  favouriteChampions,
  step,
  onAnswer,
  onToggleChampion,
  onBack,
  onFinish,
}: QuizProps) {
  const total = questions.length + 1
  const onChampions = step >= questions.length
  const question = onChampions ? null : questions[step]

  return (
    <div>
      <ProgressBar value={step} max={total} label={STRINGS.quiz.progress(step + 1, total)} />
      <div className="flex items-center justify-between px-6 pt-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-3">
          <ArrowLeft aria-hidden />
          {STRINGS.quiz.back}
        </Button>
        <span className="label-mono text-muted-foreground">{STRINGS.quiz.progress(step + 1, total)}</span>
      </div>
      {question ? (
        <QuestionStep
          key={question.id}
          question={question}
          number={step + 1}
          selected={answers[question.id]}
          onSelect={(answerId) => onAnswer(question.id, answerId)}
        />
      ) : (
        <ChampionStep
          number={total}
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
