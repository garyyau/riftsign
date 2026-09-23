// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { rankLegends } from '@/lib/scoring'
import { STRINGS } from '@/lib/strings'
import { build, CENTER, legend } from '@/lib/test-fixtures'
import { MatchCard } from './match-card'

describe('MatchCard', () => {
  afterEach(cleanup)

  it("shows the matched Build's copy and names the Legend's other reviewed Builds", () => {
    const lux = legend('lux', 'Control', {}, undefined, {
      builds: [
        build('Control', { pace: 1 }, { howItPlays: 'Hold the answers.' }),
        build('Combo', { pace: 9 }, { howItPlays: 'Assemble the loop.' }),
        build('Aggro', { pace: 10 }, { reviewed: false }),
      ],
    })
    const [match] = rankLegends({ ...CENTER, pace: 9 }, [lux])
    render(<MatchCard match={match} rank={1} />)
    expect(screen.getByText('Combo')).toBeTruthy()
    expect(screen.getByText('Assemble the loop.')).toBeTruthy()
    expect(screen.queryByText('Hold the answers.')).toBeNull()
    expect(screen.getByText(STRINGS.result.alsoPlayed(['Control']))).toBeTruthy()
  })
})
