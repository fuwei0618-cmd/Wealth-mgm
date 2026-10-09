/** 通膨係數 = (1 + inflation)^years */
export const inflationFactor = (inflationPct: number, years: number) => Math.pow(1 + inflationPct / 100, years)

/** 退休所需資產 = 現在年支出 × 通膨係數 × 25 (4% rule) */
export function retirementNeed(monthlyExpense: number, years: number, inflationPct: number) {
  const factor = inflationFactor(inflationPct, years)
  const firstYear = monthlyExpense * 12 * factor
  return { factor, firstYear, need: firstYear * 25 }
}

export const compound = (principal: number, ratePct: number, years: number) => principal * Math.pow(1 + ratePct / 100, years)

/** 10,155,000 -> "1,015.5 萬"; ≥1億 shown in 億 */
export function fmtWan(v: number): string {
  if (Math.abs(v) >= 1e8) return `${(v / 1e8).toLocaleString('zh-TW', { maximumFractionDigits: 2 })} 億`
  if (Math.abs(v) >= 1e4) return `${(v / 1e4).toLocaleString('zh-TW', { maximumFractionDigits: 1 })} 萬`
  return Math.round(v).toLocaleString('zh-TW')
}
