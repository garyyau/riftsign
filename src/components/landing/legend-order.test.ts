import { describe, expect, it } from 'vitest'
import { legend } from '@/lib/test-fixtures'
import { landingOrder } from './legend-order'

describe('landingOrder', () => {
  it('puts the newest Set first and sorts by name within a Set', () => {
    const pool = [
      legend('Zed', 'Aggro', {}, undefined, { set: 'OGN' }),
      legend('Ahri', 'Aggro', {}, undefined, { set: 'OGN' }),
      legend('Viktor', 'Control', {}, undefined, { set: 'VEN' }),
      legend('Jinx', 'Aggro', {}, undefined, { set: 'SFD' }),
      legend('Azir', 'Combo', {}, undefined, { set: 'VEN' }),
    ]
    expect(landingOrder(pool).map((l) => l.id)).toEqual(['Azir', 'Viktor', 'Jinx', 'Ahri', 'Zed'])
    expect(pool[0].id).toBe('Zed')
  })
})
