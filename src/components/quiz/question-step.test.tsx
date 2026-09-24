// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { STRINGS } from '@/lib/strings'
import { answer, scenario } from '@/lib/test-fixtures'
import { QuestionStep } from './question-step'

describe('QuestionStep', () => {
  afterEach(cleanup)

  const plain = scenario('racing', [answer('race', [{ axis: 'stance', weight: 2 }]), answer('wait', [{ axis: 'stance', weight: -2 }])], [
    { axis: 'stance', reverse: false },
  ])
  const scale = { ...plain, scale: true }

  it('shows a scale scenario as four labelled points between its two poles', () => {
    const onSelect = vi.fn()
    render(<QuestionStep question={scale} number={1} selected="wait-leaning" onSelect={onSelect} />)
    const group = screen.getByRole('radiogroup', { name: scale.prompt })
    expect(group).toBeTruthy()
    expect(screen.getByText('Answer race')).toBeTruthy()
    expect(screen.getByText('Answer wait')).toBeTruthy()

    const { scaleStrong, scaleLeaning, scalePoint } = STRINGS.quiz
    const radios = screen.getAllByRole('radio')
    expect(radios.map((r) => r.getAttribute('aria-label'))).toEqual([
      scalePoint(scaleStrong, 'Answer race'),
      scalePoint(scaleLeaning, 'Answer race'),
      scalePoint(scaleLeaning, 'Answer wait'),
      scalePoint(scaleStrong, 'Answer wait'),
    ])
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true', 'false'])

    fireEvent.click(screen.getByRole('radio', { name: scalePoint(scaleLeaning, 'Answer race') }))
    fireEvent.click(screen.getByRole('radio', { name: scalePoint(scaleStrong, 'Answer wait') }))
    expect(onSelect.mock.calls).toEqual([['race-leaning'], ['wait']])
  })

  it('keeps an ordinary scenario as one choice per Answer', () => {
    render(<QuestionStep question={plain} number={1} selected={undefined} onSelect={() => {}} />)
    expect(screen.getAllByRole('radio').map((r) => r.textContent)).toEqual(['Answer race', 'Answer wait'])
  })
})
