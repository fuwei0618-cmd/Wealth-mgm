import { describe, expect, it } from 'vitest'
import { DEFAULT_TARGETS, actualAllocation, daysUntil, driftRows, fmtTWD, maxDrift, netWorth, type Client } from './model'

const client: Client = {
  id: 'x',
  name: 't',
  risk: 'balanced',
  target: { ...DEFAULT_TARGETS.balanced },
  holdings: [
    { id: '1', name: 's', assetClass: 'stock', value: 50 },
    { id: '2', name: 'c', assetClass: 'cash', value: 50 },
  ],
  liabilities: 30,
  notes: '',
  nextContact: '',
}

describe('model', () => {
  it('computes allocation and net worth', () => {
    expect(actualAllocation(client).stock).toBe(50)
    expect(actualAllocation(client).bond).toBe(0)
    expect(netWorth(client)).toBe(70)
  })

  it('computes drift and rebalance amounts', () => {
    const stock = driftRows(client).find((r) => r.assetClass === 'stock')!
    expect(stock.drift).toBe(25) // 50 actual vs 25 target
    expect(stock.rebalance).toBe(-25) // sell 25 of 100
    expect(maxDrift(client)).toBe(40) // cash 50 vs 10
  })

  it('handles empty clients', () => {
    expect(maxDrift({ ...client, holdings: [] })).toBe(0)
  })

  it('formats TWD in 萬 / 億', () => {
    expect(fmtTWD(12_345_678)).toBe('1,234.6萬')
    expect(fmtTWD(250_000_000)).toBe('2.5億')
    expect(fmtTWD(800)).toBe('800')
  })

  it('counts days until contact', () => {
    expect(daysUntil('2026-10-12', new Date(2026, 9, 9, 15))).toBe(3)
    expect(daysUntil('')).toBeNull()
  })
})
