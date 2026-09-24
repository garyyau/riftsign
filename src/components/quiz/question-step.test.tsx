// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { QUESTION_SET } from '@/data'
import { answer, scenario } from '@/lib/test-fixtures'
import { QuestionStep } from './question-step'

describe('QuestionStep', () => {
  afterEach(cleanup)

  const plain = scenario('racing', [answer('race', [{ axis: 'stance', weight: 2 }]), answer('wait', [{ axis: 'stance', weight: -2 }])], [
    { axis: 'stance', reverse: false },
  ])

  it('shows each committed scenario as one choice per Answer, each with its own copy', () => {
    for (const q of QUESTION_SET.questions) {
      if (q.kind !== 'scenario') continue
      render(<QuestionStep question={q} number={1} selected={undefined} onSelect={() => {}} />)
      expect(screen.getAllByRole('radio').map((r) => r.textContent), q.id).toEqual(q.answers.map((a) => a.text))
      cleanup()
    }
  })

  it('keeps an ordinary scenario as one choice per Answer', () => {
    render(<QuestionStep question={plain} number={1} selected={undefined} onSelect={() => {}} />)
    expect(screen.getAllByRole('radio').map((r) => r.textContent)).toEqual(['Answer race', 'Answer wait'])
  })
})
