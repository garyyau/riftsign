import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { answersOf } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import type { Answers, Question } from '@/lib/types'
import { ProgressTrail } from './progress-trail'
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

export function Quiz({ questions, answers, step, onAnswer, onNext, onBack, onFinish }: QuizProps) {
  const s = STRINGS.quiz
  const total = questions.length
  const question = questions[step]
  const options = answersOf(question)
  const last = step === total - 1
  const picked = question.id in answers
  const next = last ? onFinish : onNext

  // Number keys pick an Answer and Enter presses Next. Picking never moves on by itself.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.repeat) return
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest('input, textarea, select, [contenteditable]')) return
      const n = Number(e.key)
      if (Number.isInteger(n) && n >= 1 && n <= options.length) {
        e.preventDefault()
        onAnswer(question.id, options[n - 1].id)
      } else if (e.key === 'Enter' && picked) {
        // A focused button answers Enter itself: an Answer row picks that Answer, Back and Next act.
        if (target?.closest('a, button')) return
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [question, options, picked, next, onAnswer])

  return (
    <div className="px-6 pt-8 pb-8 md:pt-12 xl:px-0">
      <ProgressTrail current={step + 1} total={total} />
      <div className="mt-12 lg:mt-[106px]">
        <QuestionStep
          key={question.id}
          question={question}
          selected={answers[question.id]}
          onSelect={(answerId) => onAnswer(question.id, answerId)}
        >
          <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <Button variant="link" className="gap-1.5 justify-self-start text-body" onClick={onBack}>
              <span aria-hidden>←</span>
              {s.back}
            </Button>
            {/* Number keys mean nothing on a phone, so the hint only shows from sm up. */}
            <p className="text-[13px] leading-[1.2] text-faint max-sm:hidden">{s.keyHint(options.length)}</p>
            <Button size="lg" forward className="col-start-3 justify-self-end" disabled={!picked} onClick={next}>
              {last ? s.finish : s.next}
            </Button>
          </div>
        </QuestionStep>
      </div>
    </div>
  )
}
