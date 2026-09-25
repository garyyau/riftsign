// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { LEGENDS, QUESTION_SET } from './data'
import { LEGAL_DISCLAIMER, STRINGS } from './lib/strings'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    window.scrollTo = () => {}
    window.location.hash = ''
  })
  afterEach(cleanup)

  it('lands on the start page with the disclaimer and starts the test in one tap', () => {
    render(<App />)
    expect(screen.getByText(LEGAL_DISCLAIMER)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: STRINGS.landing.start }))
    expect(screen.getByText(QUESTION_SET.questions[0].prompt)).toBeTruthy()
    expect(screen.getByRole('progressbar', { name: STRINGS.quiz.progressLabel(1, QUESTION_SET.questions.length) })).toBeTruthy()
  })

  it('shows every Legend in the landing row, with the real count', () => {
    render(<App />)
    expect(screen.getByText(STRINGS.landing.rowLabel(LEGENDS.length))).toBeTruthy()
  })

  it('waits for Next after each pick, takes number keys and Enter, and finishes from the last Question', () => {
    const questions = QUESTION_SET.questions
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: STRINGS.landing.start }))
    const next = () => screen.getByRole('button', { name: STRINGS.quiz.next }) as HTMLButtonElement
    expect(next().disabled).toBe(true)
    fireEvent.click(screen.getAllByRole('radio')[0])
    expect(screen.getByText(questions[0].prompt)).toBeTruthy()
    expect(next().disabled).toBe(false)
    fireEvent.click(next())
    expect(screen.getByText(questions[1].prompt)).toBeTruthy()

    for (let i = 1; i < questions.length; i++) {
      fireEvent.keyDown(window, { key: '2' })
      expect(screen.getAllByRole('radio')[1].getAttribute('aria-checked')).toBe('true')
      if (i < questions.length - 1) fireEvent.keyDown(window, { key: 'Enter' })
    }
    expect(screen.getByText(questions[questions.length - 1].prompt)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: STRINGS.quiz.finish }))
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.queryByRole('radiogroup')).toBeNull()
  })

  it('goes home from Back on the first Question', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: STRINGS.landing.start }))
    fireEvent.click(screen.getByRole('button', { name: STRINGS.quiz.back }))
    expect(screen.getByRole('button', { name: STRINGS.landing.start })).toBeTruthy()
  })

  it('keeps in-progress Answers across a reload', () => {
    const first = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: STRINGS.landing.start }))
    fireEvent.click(screen.getAllByRole('radio')[0])
    first.unmount()

    render(<App />)
    expect(screen.getByRole('button', { name: STRINGS.landing.continue })).toBeTruthy()
  })

  it('renders a shared result from the link fragment without taking the test', () => {
    window.location.hash = '#p=1.2026-09.2s0a1e0a1e1e1e'
    render(<App />)
    expect(screen.getByText(STRINGS.result.sharedNotice, { exact: false })).toBeTruthy()
    expect(screen.getByText('10.0')).toBeTruthy()
    expect(screen.getByText('strongly fast')).toBeTruthy()
  })
})
