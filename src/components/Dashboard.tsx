import { useState } from 'react'
import { RISK_LABELS, daysUntil, fmtTWD, maxDrift, netWorth, totalAssets, type AppState } from '../model'
import { ContactBadge, DriftBadge } from './Badges'

type SortKey = 'name' | 'assets' | 'drift' | 'contact'

export function Dashboard({ state, onOpen, onAdd }: { state: AppState; onOpen: (id: string) => void; onAdd: () => void }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('assets')
  const { clients, settings } = state

  const aum = clients.reduce((s, c) => s + totalAssets(c), 0)
  const needRebalance = clients.filter((c) => maxDrift(c) >= settings.driftThreshold).length
  const dueSoon = clients.filter((c) => {
    const d = daysUntil(c.nextContact)
    return d !== null && d <= 7
  }).length

  const rows = clients
    .filter((c) => c.name.includes(query.trim()))
    .sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name, 'zh-Hant')
        case 'drift':
          return maxDrift(b) - maxDrift(a)
        case 'contact':
          return (daysUntil(a.nextContact) ?? 1e9) - (daysUntil(b.nextContact) ?? 1e9)
        default:
          return totalAssets(b) - totalAssets(a)
      }
    })

  return (
    <>
      <section className="kpis">
        <div className="kpi">
          <span className="muted small">客戶數</span>
          <b>{clients.length}</b>
        </div>
        <div className="kpi">
          <span className="muted small">管理資產總額 (AUM)</span>
          <b>NT$ {fmtTWD(aum)}</b>
        </div>
        <div className="kpi">
          <span className="muted small">需再平衡</span>
          <b>{needRebalance}</b>
        </div>
        <div className="kpi">
          <span className="muted small">7 天內待聯絡</span>
          <b>{dueSoon}</b>
        </div>
      </section>

      <section className="card">
        <div className="toolbar">
          <input placeholder="搜尋客戶" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="排序">
            <option value="assets">依總資產</option>
            <option value="drift">依配置偏離</option>
            <option value="contact">依聯絡日</option>
            <option value="name">依姓名</option>
          </select>
          <button className="primary" onClick={onAdd}>
            ＋ 新增客戶
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>客戶</th>
                <th>風險屬性</th>
                <th className="num">總資產</th>
                <th className="num">淨值</th>
                <th>配置偏離</th>
                <th>下次聯絡</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="clickable" onClick={() => onOpen(c.id)}>
                  <td>
                    <b>{c.name}</b>
                  </td>
                  <td>{RISK_LABELS[c.risk]}</td>
                  <td className="num">{fmtTWD(totalAssets(c))}</td>
                  <td className="num">{fmtTWD(netWorth(c))}</td>
                  <td>
                    <DriftBadge drift={maxDrift(c)} threshold={settings.driftThreshold} />
                  </td>
                  <td>
                    <ContactBadge date={c.nextContact} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    沒有符合的客戶
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
