// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STRINGS } from '@/lib/strings'
import { answer, scenario } from '@/lib/test-fixtures'
import type { Answers } from '@/lib/types'
import { ADVANCE_DELAY_MS, Quiz } from './quiz'

const questions = ['one', 'two', 'three'].map((id) =>
  scenario(
    id,
    [answer('a', [{ axis: 'pace', weight: 2 }]), answer('b', [{ axis: 'pace', weight: -2 }]), answer('c', [])],
    [{ axis: 'pace', reverse: false }],
  ),
)

function show(step: number, answers: Answers = {}) {
  const handlers = { onAnswer: vi.fn(), onNext: vi.fn(), onBack: vi.fn(), onJump: vi.fn(), onFinish: vi.fn() }
  render(<Quiz questions={questions} answers={answers} step={step} {...handlers} />)
  return handlers
}

describe('Quiz', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('saves a picked Answer and moves on after a short beat', () => {
    const { onAnswer, onNext } = show(0)
    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(onAnswer).toHaveBeenCalledWith('one', 'a')
    vi.advanceTimersByTime(ADVANCE_DELAY_MS - 1)
    expect(onNext).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('moves on once when the Answer changes during the beat', () => {
    const { onAnswer, onNext } = show(0)
    fireEvent.click(screen.getAllByRole('radio')[0])
    fireEvent.click(screen.getAllByRole('radio')[1])
    vi.advanceTimersByTime(ADVANCE_DELAY_MS)
    expect(onAnswer).toHaveBeenLastCalledWith('one', 'b')
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('does not move on when Back is pressed during the beat', () => {
    const { onNext, onBack } = show(0)
    fireEvent.click(screen.getAllByRole('radio')[0])
    fireEvent.click(screen.getByRole('button', { name: STRINGS.quiz.back }))
    vi.advanceTimersByTime(ADVANCE_DELAY_MS)
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onNext).not.toHaveBeenCalled()
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

  it('moves on with Enter only once an Answer is picked', () => {
    const first = show(0)
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(first.onNext).not.toHaveBeenCalled()
    cleanup()
    const { onNext } = show(0, { one: 'a' })
    // On a focused Answer, Enter is the button's own click, so it picks rather than skipping ahead.
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

  it('waits for its own button on the last Question', () => {
    show(2)
    expect((screen.getByRole('button', { name: STRINGS.quiz.finish }) as HTMLButtonElement).disabled).toBe(true)
    cleanup()
    const { onNext, onFinish } = show(2, { three: 'a' })
    expect(screen.getByText(STRINGS.quiz.progress(3, 3))).toBeTruthy()
    fireEvent.click(screen.getAllByRole('radio')[1])
    vi.advanceTimersByTime(ADVANCE_DELAY_MS)
    expect(onFinish).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: STRINGS.quiz.finish }))
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onFinish).toHaveBeenCalledTimes(2)
    expect(onNext).not.toHaveBeenCalled()
  })

  it('shows its finish button only on the last Question', () => {
    show(0, { one: 'a' })
    expect(screen.queryByRole('button', { name: STRINGS.quiz.finish })).toBeNull()
  })

  it('shows the key hint on the first Question only', () => {
    show(0)
    expect(screen.getByText(STRINGS.quiz.keyHint(3))).toBeTruthy()
    cleanup()
    show(1, { one: 'a' })
    expect(screen.queryByText(STRINGS.quiz.keyHint(3))).toBeNull()
  })

  it('jumps from the trail to any Question up to the first unanswered one', () => {
    const jump = (n: number) => screen.getByRole('button', { name: STRINGS.quiz.jumpTo(n) }) as HTMLButtonElement
    const { onJump, onNext } = show(0, { one: 'a' })
    expect(jump(1).disabled).toBe(true)
    expect(jump(3).disabled).toBe(true)
    fireEvent.click(screen.getAllByRole('radio')[0])
    fireEvent.click(jump(2))
    vi.advanceTimersByTime(ADVANCE_DELAY_MS)
    expect(onJump).toHaveBeenCalledWith(1)
    expect(onNext).not.toHaveBeenCalled()
  })

  it('goes Back through its handler', () => {
    const { onBack } = show(0)
    fireEvent.click(screen.getByRole('button', { name: STRINGS.quiz.back }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
