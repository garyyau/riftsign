// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STRINGS } from '@/lib/strings'
import { answer, scenario } from '@/lib/test-fixtures'
import type { Answers } from '@/lib/types'
import { ANSWER_PAUSE_MS, Quiz } from './quiz'

const questions = ['one', 'two'].map((id) =>
  scenario(id, [answer('a', [{ axis: 'pace', weight: 2 }]), answer('b', [{ axis: 'pace', weight: -2 }])], [{ axis: 'pace', reverse: false }]),
)

function show(step: number, answers: Answers = {}) {
  const handlers = { onAnswer: vi.fn(), onNext: vi.fn(), onBack: vi.fn(), onFinish: vi.fn() }
  const props = { questions, answers, step, ...handlers }
  const view = render(<Quiz {...props} />)
  return { ...handlers, rerender: (next: number) => view.rerender(<Quiz {...props} step={next} />) }
}

describe('Quiz', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('saves an Answer at once but holds it on screen briefly before advancing', () => {
    const { onAnswer, onNext } = show(0)
    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(onAnswer).toHaveBeenCalledWith('one', 'a')
    act(() => vi.advanceTimersByTime(ANSWER_PAUSE_MS - 1))
    expect(onNext).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('cancels the pending advance when the Player leaves the step first', () => {
    const { onNext, rerender } = show(1)
    fireEvent.click(screen.getAllByRole('radio')[0])
    rerender(0)
    act(() => vi.advanceTimersByTime(ANSWER_PAUSE_MS))
    expect(onNext).not.toHaveBeenCalled()
  })

  it('offers Next only on a Question that already has an Answer', () => {
    show(0)
    expect(screen.queryByRole('button', { name: STRINGS.quiz.next })).toBeNull()
    cleanup()
    const { onNext } = show(0, { one: 'b' })
    fireEvent.click(screen.getByRole('button', { name: STRINGS.quiz.next }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('finishes from the last Question instead of moving on', () => {
    const { onNext, onFinish } = show(1, { two: 'a' })
    expect(screen.getAllByText(STRINGS.quiz.progress(2, 2)).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: STRINGS.quiz.finish }))
    expect(onFinish).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getAllByRole('radio')[1])
    act(() => vi.advanceTimersByTime(ANSWER_PAUSE_MS))
    expect(onFinish).toHaveBeenCalledTimes(2)
    expect(onNext).not.toHaveBeenCalled()
  })
})
