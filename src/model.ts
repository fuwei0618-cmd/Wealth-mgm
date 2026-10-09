export const ASSET_CLASSES = ['stock', 'fund', 'bond', 'insurance', 'realEstate', 'cash'] as const
export type AssetClass = (typeof ASSET_CLASSES)[number]

export const ASSET_LABELS: Record<AssetClass, string> = {
  stock: '股票',
  fund: '基金/ETF',
  bond: '債券',
  insurance: '保險',
  realEstate: '不動產',
  cash: '現金/存款',
}

export type RiskProfile = 'conservative' | 'balanced' | 'aggressive'

export const RISK_LABELS: Record<RiskProfile, string> = {
  conservative: '保守型',
  balanced: '穩健型',
  aggressive: '積極型',
}

/** Default target weights (%) per risk profile; each sums to 100. */
export const DEFAULT_TARGETS: Record<RiskProfile, Allocation> = {
  conservative: { stock: 10, fund: 15, bond: 35, insurance: 15, realEstate: 10, cash: 15 },
  balanced: { stock: 25, fund: 20, bond: 20, insurance: 10, realEstate: 15, cash: 10 },
  aggressive: { stock: 40, fund: 25, bond: 10, insurance: 5, realEstate: 15, cash: 5 },
}

export type Allocation = Record<AssetClass, number>

export interface Holding {
  id: string
  name: string
  assetClass: AssetClass
  /** Market value in TWD */
  value: number
}

export interface Client {
  id: string
  name: string
  risk: RiskProfile
  /** Target weights in percent */
  target: Allocation
  holdings: Holding[]
  /** Total liabilities in TWD (mortgages, loans) */
  liabilities: number
  notes: string
  /** ISO date (yyyy-mm-dd) of next planned contact, or '' */
  nextContact: string
}

export interface Settings {
  /** Percentage-point drift that triggers a rebalance flag */
  driftThreshold: number
}

export interface AppState {
  clients: Client[]
  settings: Settings
}

export const newId = () => Math.random().toString(36).slice(2, 10)

export function totalAssets(c: Client): number {
  return c.holdings.reduce((s, h) => s + h.value, 0)
}

export function netWorth(c: Client): number {
  return totalAssets(c) - c.liabilities
}

/** Actual weights in percent; all zero when the client has no assets. */
export function actualAllocation(c: Client): Allocation {
  const total = totalAssets(c)
  const out = Object.fromEntries(ASSET_CLASSES.map((k) => [k, 0])) as Allocation
  if (total <= 0) return out
  for (const h of c.holdings) out[h.assetClass] += h.value
  for (const k of ASSET_CLASSES) out[k] = (out[k] / total) * 100
  return out
}

export interface DriftRow {
  assetClass: AssetClass
  actual: number
  target: number
  /** actual - target, in percentage points */
  drift: number
  /** TWD to buy (+) or sell (-) to return to target */
  rebalance: number
}

export function driftRows(c: Client): DriftRow[] {
  const total = totalAssets(c)
  const actual = actualAllocation(c)
  return ASSET_CLASSES.map((k) => ({
    assetClass: k,
    actual: actual[k],
    target: c.target[k],
    drift: actual[k] - c.target[k],
    rebalance: total > 0 ? ((c.target[k] - actual[k]) / 100) * total : 0,
  }))
}

export function maxDrift(c: Client): number {
  if (totalAssets(c) <= 0) return 0
  return Math.max(...driftRows(c).map((r) => Math.abs(r.drift)))
}

export function targetSum(a: Allocation): number {
  return ASSET_CLASSES.reduce((s, k) => s + (a[k] || 0), 0)
}

/** Days from `today` to the client's next contact; null when unset. */
export function daysUntil(date: string, today: Date = new Date()): number | null {
  if (!date) return null
  const [y, m, d] = date.split('-').map(Number)
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((new Date(y, m - 1, d).getTime() - t.getTime()) / 86_400_000)
}

/** 12,345,678 -> "1,234.6萬"; values ≥ 1億 shown in 億. */
export function fmtTWD(v: number): string {
  const sign = v < 0 ? '-' : ''
  const a = Math.abs(v)
  if (a >= 1e8) return `${sign}${(a / 1e8).toLocaleString('zh-TW', { maximumFractionDigits: 2 })}億`
  if (a >= 1e4) return `${sign}${(a / 1e4).toLocaleString('zh-TW', { maximumFractionDigits: 1 })}萬`
  return `${sign}${a.toLocaleString('zh-TW')}`
}

export const fmtPct = (v: number, digits = 1) => `${v.toFixed(digits)}%`
