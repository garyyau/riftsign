// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { STRINGS } from '@/lib/strings'
import { answer, scenario } from '@/lib/test-fixtures'
import type { Answers } from '@/lib/types'
import { Quiz } from './quiz'

const questions = ['one', 'two'].map((id) =>
  scenario(
    id,
    [answer('a', [{ axis: 'pace', weight: 2 }]), answer('b', [{ axis: 'pace', weight: -2 }]), answer('c', [])],
    [{ axis: 'pace', reverse: false }],
  ),
)

function show(step: number, answers: Answers = {}) {
  const handlers = { onAnswer: vi.fn(), onNext: vi.fn(), onBack: vi.fn(), onFinish: vi.fn() }
  render(<Quiz questions={questions} answers={answers} step={step} {...handlers} />)
  return handlers
}

const nextButton = () => screen.getByRole('button', { name: STRINGS.quiz.next })

describe('Quiz', () => {
  afterEach(cleanup)

  it('saves a picked Answer without moving on', () => {
    const { onAnswer, onNext } = show(0)
    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(onAnswer).toHaveBeenCalledWith('one', 'a')
    expect(onNext).not.toHaveBeenCalled()
  })

  it('keeps Next disabled until the Question has an Answer', () => {
    show(0)
    expect((nextButton() as HTMLButtonElement).disabled).toBe(true)
    cleanup()
    const { onNext } = show(0, { one: 'b' })
    expect((nextButton() as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(nextButton())
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('picks Answers with the number keys and ignores keys out of range or with modifiers', () => {
    const { onAnswer } = show(0)
    expect(screen.getByText(STRINGS.quiz.keyHint(3))).toBeTruthy()
    fireEvent.keyDown(window, { key: '3' })
    expect(onAnswer).toHaveBeenLastCalledWith('one', 'c')
    fireEvent.keyDown(window, { key: '4' })
    fireEvent.keyDown(window, { key: '1', ctrlKey: true })
    expect(onAnswer).toHaveBeenCalledTimes(1)
  })

  it('presses Next on Enter only once an Answer is picked', () => {
    const first = show(0)
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(first.onNext).not.toHaveBeenCalled()
    cleanup()
    const { onNext } = show(0, { one: 'a' })
    // On a focused Answer, Enter picks that Answer (the button's own click) rather than moving on.
    fireEvent.keyDown(screen.getAllByRole('radio')[1], { key: 'Enter' })
    expect(onNext).not.toHaveBeenCalled()
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('stops listening for keys once the Quiz is gone', () => {
    const { onAnswer } = show(0)
    cleanup()
    fireEvent.keyDown(window, { key: '1' })
    expect(onAnswer).not.toHaveBeenCalled()
  })

  it('finishes from the last Question under its own label', () => {
    const { onNext, onFinish } = show(1, { two: 'a' })
    expect(screen.getByText(STRINGS.quiz.progress(2, 2))).toBeTruthy()
    expect(screen.queryByRole('button', { name: STRINGS.quiz.next })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: STRINGS.quiz.finish }))
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onFinish).toHaveBeenCalledTimes(2)
    expect(onNext).not.toHaveBeenCalled()
  })

  it('goes Back through its handler', () => {
    const { onBack } = show(0)
    fireEvent.click(screen.getByRole('button', { name: STRINGS.quiz.back }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
