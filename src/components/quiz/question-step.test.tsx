// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { QUESTION_SET } from '@/data'
import { answer, scenario } from '@/lib/test-fixtures'
import { QuestionStep } from './question-step'

describe('QuestionStep', () => {
  afterEach(cleanup)

  const radioNames = () => screen.getAllByRole('radio').map((r) => r.getAttribute('aria-checked') + ' ' + r.textContent)

  it('shows each committed scenario as one numbered choice per Answer', () => {
    for (const q of QUESTION_SET.questions) {
      if (q.kind !== 'scenario') continue
      render(<QuestionStep question={q} selected={undefined} onSelect={() => {}} />)
      expect(radioNames(), q.id).toEqual(q.answers.map((a, i) => `false 0${i + 1}${a.text}`))
      cleanup()
    }
  })

  it('marks the picked Answer as checked', () => {
    const q = scenario('racing', [answer('race', [{ axis: 'stance', weight: 2 }]), answer('wait', [])], [{ axis: 'stance', reverse: false }])
    render(<QuestionStep question={q} selected="wait" onSelect={() => {}} />)
    expect(radioNames()).toEqual(['false 01Answer race', 'true 02Answer wait'])
    expect(screen.getByRole('radio', { name: 'Answer wait' })).toBeTruthy()
  })

  it('holds off the hover look until the pointer moves, so a new Question never opens looking picked', () => {
    const q = scenario('racing', [answer('race', [{ axis: 'stance', weight: 2 }]), answer('wait', [])], [{ axis: 'stance', reverse: false }])
    render(<QuestionStep question={q} selected={undefined} onSelect={() => {}} />)
    const row = screen.getByRole('radio', { name: 'Answer race' })
    expect(row.className).not.toContain('hover:bg-selected')
    fireEvent.pointerMove(row)
    expect(row.className).toContain('hover:bg-selected')
  })
})
