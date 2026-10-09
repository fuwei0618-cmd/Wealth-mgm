import { DEFAULT_TARGETS, type AppState, type Client } from './model'

// Fictional demo clients so the app isn't empty on first open.
const h = (id: string, name: string, assetClass: Client['holdings'][number]['assetClass'], value: number) => ({
  id,
  name,
  assetClass,
  value,
})

function plusDays(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function sampleState(): AppState {
  return {
    settings: { driftThreshold: 5 },
    clients: [
      {
        id: 'demo1',
        name: '範例客戶 A',
        risk: 'balanced',
        target: { ...DEFAULT_TARGETS.balanced },
        holdings: [
          h('a1', '台積電', 'stock', 32_000_000),
          h('a2', '美股科技', 'stock', 18_000_000),
          h('a3', '0050 / VT', 'fund', 15_000_000),
          h('a4', '美國公債 10Y', 'bond', 12_000_000),
          h('a5', '終身壽險', 'insurance', 6_000_000),
          h('a6', '信義區住宅', 'realEstate', 25_000_000),
          h('a7', '台幣活存', 'cash', 4_000_000),
        ],
        liabilities: 8_000_000,
        notes: '偏好科技股，想在三年內規劃子女留學基金。',
        nextContact: plusDays(3),
      },
      {
        id: 'demo2',
        name: '範例客戶 B',
        risk: 'conservative',
        target: { ...DEFAULT_TARGETS.conservative },
        holdings: [
          h('b1', '投資級公司債', 'bond', 28_000_000),
          h('b2', '高股息 ETF', 'fund', 10_000_000),
          h('b3', '儲蓄險', 'insurance', 12_000_000),
          h('b4', '定存', 'cash', 15_000_000),
          h('b5', '店面', 'realEstate', 9_000_000),
          h('b6', '電信股', 'stock', 6_000_000),
        ],
        liabilities: 0,
        notes: '退休族，重視現金流與資產傳承。',
        nextContact: plusDays(-2),
      },
      {
        id: 'demo3',
        name: '範例客戶 C',
        risk: 'aggressive',
        target: { ...DEFAULT_TARGETS.aggressive },
        holdings: [
          h('c1', '美股成長股', 'stock', 60_000_000),
          h('c2', '新興市場基金', 'fund', 22_000_000),
          h('c3', '短債', 'bond', 5_000_000),
          h('c4', '美元存款', 'cash', 20_000_000),
          h('c5', '商辦', 'realEstate', 30_000_000),
        ],
        liabilities: 15_000_000,
        notes: '企業主，近期出售部分股權，現金部位偏高。',
        nextContact: plusDays(12),
      },
    ],
  }
}
