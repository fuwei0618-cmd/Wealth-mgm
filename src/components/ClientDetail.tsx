import { useState } from 'react'
import {
  ASSET_CLASSES,
  ASSET_LABELS,
  DEFAULT_TARGETS,
  RISK_LABELS,
  driftRows,
  fmtPct,
  fmtTWD,
  maxDrift,
  netWorth,
  newId,
  targetSum,
  totalAssets,
  type AssetClass,
  type Client,
  type Holding,
  type RiskProfile,
} from '../model'
import { ASSET_COLOR } from '../colors'
import { AllocationChart } from './AllocationChart'
import { ContactBadge, DriftBadge } from './Badges'
import { ConfirmButton } from './ConfirmButton'

interface Props {
  client: Client
  threshold: number
  onChange: (c: Client) => void
  onDelete: () => void
  onBack: () => void
}

export function ClientDetail({ client, threshold, onChange, onDelete, onBack }: Props) {
  const set = <K extends keyof Client>(k: K, v: Client[K]) => onChange({ ...client, [k]: v })
  const sumTarget = targetSum(client.target)

  return (
    <>
      <div className="detail-head">
        <button className="link" onClick={onBack}>
          ← 客戶列表
        </button>
        <input className="title-input" value={client.name} onChange={(e) => set('name', e.target.value)} aria-label="客戶姓名" />
        <div className="row">
          <label>
            風險屬性
            <select value={client.risk} onChange={(e) => set('risk', e.target.value as RiskProfile)}>
              {(Object.keys(RISK_LABELS) as RiskProfile[]).map((r) => (
                <option key={r} value={r}>
                  {RISK_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => set('target', { ...DEFAULT_TARGETS[client.risk] })}>套用此屬性的預設目標配置</button>
        </div>
      </div>

      <section className="kpis">
        <div className="kpi">
          <span className="muted small">總資產</span>
          <b>{fmtTWD(totalAssets(client))}</b>
        </div>
        <div className="kpi">
          <span className="muted small">負債</span>
          <b>{fmtTWD(client.liabilities)}</b>
        </div>
        <div className="kpi">
          <span className="muted small">淨值</span>
          <b>{fmtTWD(netWorth(client))}</b>
        </div>
        <div className="kpi">
          <span className="muted small">最大配置偏離</span>
          <DriftBadge drift={maxDrift(client)} threshold={threshold} />
        </div>
      </section>

      <div className="grid2">
        <section className="card">
          <h2>目前資產配置</h2>
          <AllocationChart client={client} />
        </section>

        <section className="card">
          <h2>目標配置與再平衡建議</h2>
          {sumTarget !== 100 && <p className="badge warning">● 目標配置合計 {sumTarget}%，應為 100%</p>}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>資產類別</th>
                  <th className="num">實際</th>
                  <th className="num">目標</th>
                  <th className="num">偏離</th>
                  <th className="num">建議調整</th>
                </tr>
              </thead>
              <tbody>
                {driftRows(client).map((r) => (
                  <tr key={r.assetClass}>
                    <td>
                      <span className="swatch" style={{ background: ASSET_COLOR[r.assetClass] }} />
                      {ASSET_LABELS[r.assetClass]}
                    </td>
                    <td className="num">{fmtPct(r.actual)}</td>
                    <td className="num">
                      <input
                        className="pct-input"
                        type="number"
                        min={0}
                        max={100}
                        value={r.target}
                        onChange={(e) => set('target', { ...client.target, [r.assetClass]: Number(e.target.value) || 0 })}
                        aria-label={`${ASSET_LABELS[r.assetClass]}目標比例`}
                      />
                      %
                    </td>
                    <td className="num">
                      {Math.abs(r.drift) >= threshold ? (
                        <span className="badge critical">
                          {r.drift > 0 ? '▲' : '▼'} {fmtPct(Math.abs(r.drift))}
                        </span>
                      ) : (
                        <span className="muted">
                          {r.drift > 0 ? '+' : ''}
                          {fmtPct(r.drift)}
                        </span>
                      )}
                    </td>
                    <td className="num">
                      {Math.abs(r.rebalance) < 1 ? '—' : r.rebalance > 0 ? `買進 ${fmtTWD(r.rebalance)}` : `賣出 ${fmtTWD(-r.rebalance)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted small">偏離超過 {threshold} 個百分點時標示為需再平衡。</p>
        </section>
      </div>

      <section className="card">
        <h2>持有資產</h2>
        <Holdings holdings={client.holdings} onChange={(hs) => set('holdings', hs)} />
        <label className="inline">
          負債總額（房貸、借款）
          <MoneyInput value={client.liabilities} onChange={(v) => set('liabilities', v)} />
        </label>
      </section>

      <section className="card">
        <h2>客戶紀錄</h2>
        <label className="inline">
          下次聯絡日
          <input type="date" value={client.nextContact} onChange={(e) => set('nextContact', e.target.value)} />
          <ContactBadge date={client.nextContact} />
        </label>
        <textarea rows={5} value={client.notes} onChange={(e) => set('notes', e.target.value)} placeholder="理財目標、家庭狀況、會談紀錄…" />
      </section>

      <div className="danger-zone">
        <ConfirmButton className="danger" prompt={`確定刪除「${client.name}」？再按一次`} onConfirm={onDelete}>
          刪除客戶
        </ConfirmButton>
      </div>
    </>
  )
}

function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className="money">
      NT$
      <input type="number" min={0} step={10000} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </span>
  )
}

function Holdings({ holdings, onChange }: { holdings: Holding[]; onChange: (h: Holding[]) => void }) {
  const [draft, setDraft] = useState<Omit<Holding, 'id'>>({ name: '', assetClass: 'stock', value: 0 })
  const update = (id: string, patch: Partial<Holding>) => onChange(holdings.map((h) => (h.id === id ? { ...h, ...patch } : h)))

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>名稱</th>
            <th>類別</th>
            <th className="num">市值</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.id}>
              <td>
                <input value={h.name} onChange={(e) => update(h.id, { name: e.target.value })} aria-label="資產名稱" />
              </td>
              <td>
                <ClassSelect value={h.assetClass} onChange={(v) => update(h.id, { assetClass: v })} />
              </td>
              <td className="num">
                <MoneyInput value={h.value} onChange={(v) => update(h.id, { value: v })} />
              </td>
              <td>
                <button className="link" onClick={() => onChange(holdings.filter((x) => x.id !== h.id))} aria-label={`刪除 ${h.name}`}>
                  刪除
                </button>
              </td>
            </tr>
          ))}
          <tr className="add-row">
            <td>
              <input placeholder="新增資產名稱" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </td>
            <td>
              <ClassSelect value={draft.assetClass} onChange={(v) => setDraft({ ...draft, assetClass: v })} />
            </td>
            <td className="num">
              <MoneyInput value={draft.value} onChange={(v) => setDraft({ ...draft, value: v })} />
            </td>
            <td>
              <button
                className="primary"
                disabled={!draft.name.trim()}
                onClick={() => {
                  onChange([...holdings, { ...draft, name: draft.name.trim(), id: newId() }])
                  setDraft({ name: '', assetClass: draft.assetClass, value: 0 })
                }}
              >
                新增
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function ClassSelect({ value, onChange }: { value: AssetClass; onChange: (v: AssetClass) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as AssetClass)} aria-label="資產類別">
      {ASSET_CLASSES.map((k) => (
        <option key={k} value={k}>
          {ASSET_LABELS[k]}
        </option>
      ))}
    </select>
  )
}
