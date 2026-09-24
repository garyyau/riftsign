import { describe, expect, it } from 'vitest'
import { SCORE_IDS } from './axes'
import { validateLegend, validateQuestionSet } from './schemas'
import { answer, build, legend, scenario, smallQuestionSet } from './test-fixtures'
import type { Question } from './types'

const issuesOf = (result: { success: boolean; issues?: string[] }) => (result.success ? [] : result.issues!)

describe('validateLegend', () => {
  const good = legend('darius', 'Aggro', { pace: 8 }, ['Fury', 'Order'])
  const [goodBuild] = good.builds
  const withBuild = (changes: Record<string, unknown>) => ({ ...good, builds: [{ ...goodBuild, ...changes }] })

  it('accepts a well-formed Legend', () => {
    expect(validateLegend(good)).toEqual({ success: true, data: good })
  })

  it('accepts up to three Builds with different Archetypes', () => {
    const three = { ...good, builds: [goodBuild, build('Tempo', {}), build('Midrange', {})] }
    expect(validateLegend(three).success).toBe(true)
  })

  it('rejects more than three Builds, none, or two sharing an Archetype', () => {
    const four = { ...good, builds: [goodBuild, build('Tempo', {}), build('Midrange', {}), build('Combo', {})] }
    expect(issuesOf(validateLegend(four)).join('\n')).toMatch(/builds/)
    expect(issuesOf(validateLegend({ ...good, builds: [] })).join('\n')).toMatch(/builds/)
    const twin = { ...good, builds: [goodBuild, build('Aggro', {})] }
    expect(issuesOf(validateLegend(twin)).join('\n')).toMatch(/different archetype/)
  })

  it('rejects a Domain coordinate stored on a Build, naming the Build, since Domains come from the Legend', () => {
    const tempo = build('Tempo', {})
    const bad = { ...good, builds: [goodBuild, { ...tempo, coordinates: { ...tempo.coordinates, 'fury-calm': -5 } }] }
    expect(issuesOf(validateLegend(bad)).join('\n')).toMatch(/builds\.1\.coordinates.*fury-calm/)
  })

  it('rejects a Legend with two identical Domains', () => {
    expect(issuesOf(validateLegend({ ...good, domains: ['Fury', 'Fury'] })).join('\n')).toMatch(/domains/)
  })

  it('rejects a playstyle coordinate outside 0-10 and names the field', () => {
    const bad = withBuild({ coordinates: { ...goodBuild.coordinates, pace: 11 } })
    expect(issuesOf(validateLegend(bad)).join('\n')).toMatch(/coordinates\.pace/)
  })

  it('rejects an unknown Archetype', () => {
    expect(issuesOf(validateLegend(withBuild({ archetype: 'Ramp' }))).join('\n')).toMatch(/archetype/)
  })

  it('rejects a missing required field', () => {
    const { whyYou: _dropped, ...rest } = goodBuild
    expect(issuesOf(validateLegend({ ...good, builds: [rest] })).join('\n')).toMatch(/whyYou/)
  })
})

describe('validateQuestionSet', () => {
  it('rejects a Domain whose every load is reverse-keyed, since a zero-sum choice always lists it second', () => {
    const set = fullCoverageSet()
    for (const q of set.questions) if (q.id.startsWith('fury-')) q.loads = [{ axis: 'fury', reverse: true }]
    swapReverseAnswers(set)
    const issues = issuesOf(validateQuestionSet(set)).join('\n')
    expect(issues).toMatch(/fury: no forward-keyed/)
    expect(issues).not.toMatch(/pace: no forward-keyed/)
  })

  it('accepts a zero-sum Domain choice that loads both Domains, one each way', () => {
    const set = fullCoverageSet()
    swapReverseAnswers(set)
    set.questions.push(
      scenario(
        'fury-or-calm',
        [
          answer('fury', [{ axis: 'fury', weight: 2 }, { axis: 'calm', weight: -2 }]),
          answer('calm', [{ axis: 'fury', weight: -2 }, { axis: 'calm', weight: 2 }]),
        ],
        [
          { axis: 'fury', reverse: false },
          { axis: 'calm', reverse: true },
        ],
      ),
    )
    expect(validateQuestionSet(set).success).toBe(true)
  })

  it('accepts a set that loads every score at least three times with a reverse-keyed Question each', () => {
    const set = fullCoverageSet()
    swapReverseAnswers(set)
    expect(validateQuestionSet(set)).toEqual({ success: true, data: set })
  })

  it('rejects an Axis with fewer than three loading Questions', () => {
    expect(issuesOf(validateQuestionSet(smallQuestionSet())).join('\n')).toMatch(/stance.*1 Question/)
  })

  it('rejects an Axis with no reverse-keyed Question', () => {
    const set = fullCoverageSet()
    swapReverseAnswers(set)
    for (const q of set.questions) q.loads = q.loads.map((l) => (l.axis === 'variance' ? { ...l, reverse: false } : l))
    expect(issuesOf(validateQuestionSet(set)).join('\n')).toMatch(/variance.*reverse/)
  })

  it('rejects a Question that claims to load an Axis none of its Answers move', () => {
    const set = fullCoverageSet()
    swapReverseAnswers(set)
    set.questions[0].loads.push({ axis: 'complexity', reverse: false })
    expect(issuesOf(validateQuestionSet(set)).join('\n')).toMatch(/pace-1.*complexity/)
  })

  it('rejects duplicate Question ids', () => {
    const set = fullCoverageSet()
    swapReverseAnswers(set)
    set.questions.push({ ...set.questions[0] })
    expect(issuesOf(validateQuestionSet(set)).join('\n')).toMatch(/pace-1.*duplicate/i)
  })

  it('rejects a reverse-keyed scenario whose first Answer points high', () => {
    const set = fullCoverageSet()
    const q = set.questions[2] // pace-3, reverse: true, first Answer is +2
    expect(q.loads[0].reverse).toBe(true)
    expect(issuesOf(validateQuestionSet(set)).join('\n')).toMatch(/pace-3.*reverse/)
  })

  it('rejects a statement whose reverse flag disagrees with the sign of agreeing', () => {
    const set = fullCoverageSet()
    swapReverseAnswers(set)
    set.questions.push({
      id: 'stance-s',
      kind: 'statement',
      eyebrow: 'x',
      prompt: 'x',
      loads: [{ axis: 'stance', reverse: false }],
      agreeMoves: [{ axis: 'stance', weight: -2 }],
    })
    expect(issuesOf(validateQuestionSet(set)).join('\n')).toMatch(/stance-s.*reverse/)
  })

  it('counts an Axis listed twice in one Question only once', () => {
    const set = fullCoverageSet()
    swapReverseAnswers(set)
    set.questions[0].loads.push({ axis: 'pace', reverse: false })
    expect(issuesOf(validateQuestionSet(set)).join('\n')).toMatch(/pace-1.*pace.*twice/)
  })

  it('accepts a two-Answer scale scenario and rejects one with more Answers', () => {
    const set = fullCoverageSet()
    swapReverseAnswers(set)
    const q = set.questions[0]
    if (q.kind !== 'scenario') throw new Error('expected a scenario')
    set.questions[0] = { ...q, scale: true }
    expect(validateQuestionSet(set).success).toBe(true)
    set.questions[0] = { ...q, scale: true, answers: [...q.answers, answer('middle', [{ axis: 'pace', weight: 1 }])] }
    expect(issuesOf(validateQuestionSet(set)).join('\n')).toMatch(/answers.*scale scenario needs exactly two/)
  })

  it('checks scale keying both ways and requires the poles to oppose each other', () => {
    const set = fullCoverageSet()
    swapReverseAnswers(set)
    const q = set.questions[0] // pace-1, not reverse, high pole first
    if (q.kind !== 'scenario') throw new Error('expected a scenario')
    set.questions[0] = { ...q, scale: true, answers: [...q.answers].reverse() }
    expect(issuesOf(validateQuestionSet(set)).join('\n')).toMatch(/pace-1.*not marked reverse.*first pole/)
    set.questions[0] = { ...q, scale: true, answers: [q.answers[0], answer('also-high', [{ axis: 'pace', weight: 1 }])] }
    expect(issuesOf(validateQuestionSet(set)).join('\n')).toMatch(/pace-1.*opposite directions/)
  })

  it('rejects a scale scenario whose expanded points collide with a pole id', () => {
    const set = fullCoverageSet()
    swapReverseAnswers(set)
    const q = set.questions[0]
    if (q.kind !== 'scenario') throw new Error('expected a scenario')
    set.questions[0] = { ...q, scale: true, answers: [q.answers[0], { ...q.answers[1], id: `${q.answers[0].id}-leaning` }] }
    expect(issuesOf(validateQuestionSet(set)).join('\n')).toMatch(/pace-1.*duplicate Answer id/)
  })

  it('rejects a scenario with a single Answer', () => {
    const set = fullCoverageSet()
    const q = set.questions[0]
    if (q.kind === 'scenario') q.answers = [q.answers[0]]
    expect(issuesOf(validateQuestionSet(set)).join('\n')).toMatch(/answers/)
  })
})

/** Puts the low-pointing Answer first on every reverse-keyed scenario, as the gate requires. */
function swapReverseAnswers(set: ReturnType<typeof fullCoverageSet>) {
  for (const q of set.questions) {
    if (q.kind === 'scenario' && q.loads.some((l) => l.reverse)) q.answers.reverse()
  }
}

/** Three Questions per score, the third flagged reverse-keyed (Answers still high-first; see swapReverseAnswers). */
function fullCoverageSet() {
  const questions: Question[] = []
  for (const axis of SCORE_IDS) {
    for (const n of [1, 2, 3]) {
      questions.push(
        scenario(
          `${axis}-${n}`,
          [answer('high', [{ axis, weight: 2 }]), answer('low', [{ axis, weight: -2 }])],
          [{ axis, reverse: n === 3 }],
        ),
      )
    }
  }
  return { version: 'test-1', questions }
}
