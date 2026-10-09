import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ASSET_COLOR } from '../colors'
import { ASSET_CLASSES, ASSET_LABELS, fmtPct, fmtTWD, type AssetClass, type Client } from '../model'

interface Slice {
  key: AssetClass
  label: string
  value: number
  pct: number
}

export function AllocationChart({ client }: { client: Client }) {
  const totals = Object.fromEntries(ASSET_CLASSES.map((k) => [k, 0])) as Record<AssetClass, number>
  for (const h of client.holdings) totals[h.assetClass] += h.value
  const sum = Object.values(totals).reduce((a, b) => a + b, 0)
  const data: Slice[] = ASSET_CLASSES.filter((k) => totals[k] > 0).map((k) => ({
    key: k,
    label: ASSET_LABELS[k],
    value: totals[k],
    pct: (totals[k] / sum) * 100,
  }))

  if (sum <= 0) return <p className="muted">尚無持有資產</p>

  return (
    <div className="alloc">
      <div className="alloc-chart" role="img" aria-label="資產配置圓環圖">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={1}
              stroke="var(--surface-1)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={ASSET_COLOR[d.key]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload as Slice
                return (
                  <div className="tip">
                    <span className="swatch" style={{ background: ASSET_COLOR[d.key] }} />
                    {d.label}　<b>{fmtPct(d.pct)}</b>　{fmtTWD(d.value)}
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="alloc-center">
          <span className="muted small">總資產</span>
          <b>{fmtTWD(sum)}</b>
        </div>
      </div>
      <ul className="legend">
        {data.map((d) => (
          <li key={d.key}>
            <span className="swatch" style={{ background: ASSET_COLOR[d.key] }} />
            <span>{d.label}</span>
            <span className="num">{fmtPct(d.pct)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
