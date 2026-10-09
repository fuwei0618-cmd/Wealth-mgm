import { describe, expect, it } from 'vitest'
import { compound, fmtWan, retirementNeed } from './calc'

describe('calc', () => {
  it('reproduces the course retirement example (3萬/月, 35年, 1.5%)', () => {
    const r = retirementNeed(30_000, 35, 1.5)
    expect(r.factor).toBeCloseTo(1.68, 2)
    expect(Math.round(r.need / 1e4)).toBe(1515)
  })

  it('reproduces the principal-vs-return example', () => {
    expect(Math.round(compound(1_000_000, 5, 30) / 1e4)).toBe(432)
    expect(Math.round(compound(231_000, 10, 30) / 1e4)).toBe(403)
  })

  it('reproduces the fee example (1 元, 20 年)', () => {
    expect(compound(1, 10, 20)).toBeCloseTo(6.73, 2)
    expect(compound(1, 8.2, 20)).toBeCloseTo(4.84, 2)
  })

  it('formats 萬 / 億', () => {
    expect(fmtWan(15_150_000)).toBe('1,515 萬')
    expect(fmtWan(250_000_000)).toBe('2.5 億')
  })
})
