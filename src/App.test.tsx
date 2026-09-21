// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { QUESTION_SET } from './data'
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
    expect(screen.getByText(STRINGS.quiz.progress(1, QUESTION_SET.questions.length + 1))).toBeTruthy()
  })

  it('keeps in-progress Answers across a reload', () => {
    const first = render(<App />)
    fireEvent.click(screen.getByRole('button', { name: STRINGS.landing.start }))
    fireEvent.click(screen.getAllByRole('radio')[0])
    first.unmount()

    render(<App />)
    expect(screen.getByRole('button', { name: STRINGS.landing.continue })).toBeTruthy()
  })

  it('renders a shared Riftsign from the link fragment without taking the test', () => {
    window.location.hash = '#p=1.2026-09.2s0a1e0a1e1e1e'
    render(<App />)
    expect(screen.getByText(STRINGS.result.sharedNotice, { exact: false })).toBeTruthy()
    expect(screen.getByText('10.0')).toBeTruthy()
    expect(screen.getByText('strongly fast')).toBeTruthy()
  })
})
