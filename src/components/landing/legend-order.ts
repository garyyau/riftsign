import { SET_CODES, type Legend } from '@/lib/types'

/** The landing row's order: newest Set first (SET_CODES is release order), then by name within a Set. */
export function landingOrder(legends: Legend[]): Legend[] {
  const release = (l: Legend) => SET_CODES.indexOf(l.set)
  return [...legends].sort((a, b) => release(b) - release(a) || a.name.localeCompare(b.name))
}
