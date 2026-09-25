import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Button } from '@/components/ui/button'
import { answersOf } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import type { Answers, Question } from '@/lib/types'
import { ProgressTrail } from './progress-trail'
import { QuestionStep } from './question-step'

/** How long a picked Answer stays lit before the next Question shows, so the Player sees what they chose. */
export const ADVANCE_DELAY_MS = 300

interface QuizProps {
  questions: Question[]
  answers: Answers
  /** 0-based index of the Question on screen. */
  step: number
  onAnswer: (questionId: string, answerId: string) => void
  onNext: () => void
  onBack: () => void
  /** Goes straight to a Question from the progress trail. */
  onJump: (step: number) => void
  /** Called instead of onNext after the last Question. */
  onFinish: () => void
}

export function Quiz({ questions, answers, step, onAnswer, onNext, onBack, onJump, onFinish }: QuizProps) {
  const s = STRINGS.quiz
  const total = questions.length
  const question = questions[step]
  const options = answersOf(question)
  const last = step === total - 1
  const picked = question.id in answers
  const next = last ? onFinish : onNext

  // Which way the last move went, so the new Question slides in from that side. The first one only fades, with the page.
  const [shown, setShown] = useState({ step, dir: 0 })
  if (shown.step !== step) setShown({ step, dir: step > shown.step ? 1 : -1 })

  // Picking an Answer moves on after a short beat. The last Question waits for "Show my Legends" instead.
  const advance = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(advance.current), [step])
  const pick = (answerId: string) => {
    onAnswer(question.id, answerId)
    window.clearTimeout(advance.current)
    if (!last) advance.current = window.setTimeout(onNext, ADVANCE_DELAY_MS)
  }
  const leave = (go: () => void) => {
    window.clearTimeout(advance.current)
    go()
  }

  // Number keys pick an Answer. Enter moves on from a Question that already has one, such as after going Back.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.repeat) return
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest('input, textarea, select, [contenteditable]')) return
      const n = Number(e.key)
      if (Number.isInteger(n) && n >= 1 && n <= options.length) {
        e.preventDefault()
        pick(options[n - 1].id)
      } else if (e.key === 'Enter' && picked) {
        // A focused button answers Enter itself: an Answer row picks that Answer, Back and Finish act.
        if (target?.closest('a, button')) return
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="px-6 pt-8 pb-8 md:pt-12 xl:px-0">
      <ProgressTrail
        step={step}
        answered={questions.map((q) => q.id in answers)}
        onJump={(to) => leave(() => onJump(to))}
      />
      <Button
        variant="link"
        className="-mx-2 mt-8 gap-2 px-2 py-2 text-body lg:mt-16"
        onClick={() => leave(onBack)}
      >
        <svg viewBox="0 0 10 16" fill="none" aria-hidden className="h-4 w-2.5">
          <path d="M8 2L2 8l6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {s.back}
      </Button>
      <div
        key={question.id}
        className="mt-6 step-in lg:mt-8"
        style={{ '--step-dir': shown.dir } as CSSProperties}
      >
        <QuestionStep question={question} selected={answers[question.id]} onSelect={pick}>
          <div className="mt-6 flex items-center justify-between gap-4">
            {/* The hint shows once, on the first Question. Number keys mean nothing on a phone, so only from sm up. */}
            {step === 0 && <p className="text-[13px] leading-[1.2] text-faint max-sm:hidden">{s.keyHint(options.length)}</p>}
            {last && (
              <Button size="lg" forward className="ml-auto" disabled={!picked} onClick={onFinish}>
                {s.finish}
              </Button>
            )}
          </div>
        </QuestionStep>
      </div>
    </div>
  )
}
