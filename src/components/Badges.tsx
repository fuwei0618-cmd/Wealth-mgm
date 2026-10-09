import { daysUntil, fmtPct } from '../model'

/** Drift status: icon + label so color never carries meaning alone. */
export function DriftBadge({ drift, threshold }: { drift: number; threshold: number }) {
  if (drift >= threshold) return <span className="badge critical">▲ 需再平衡 {fmtPct(drift)}</span>
  if (drift >= threshold * 0.6) return <span className="badge warning">● 留意 {fmtPct(drift)}</span>
  return <span className="badge good">✓ 正常 {fmtPct(drift)}</span>
}

export function ContactBadge({ date }: { date: string }) {
  const d = daysUntil(date)
  if (d === null) return <span className="muted">未排定</span>
  if (d < 0) return <span className="badge critical">逾期 {-d} 天</span>
  if (d === 0) return <span className="badge warning">今天</span>
  if (d <= 7) return <span className="badge warning">{d} 天後</span>
  return <span className="muted">{date}</span>
}
