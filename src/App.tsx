import { useEffect, useMemo, useState } from 'react'
import { BUILTIN_CLIPS, CALC_TITLES, CATEGORIES, type CalcId, type Clip } from './clips'
import { Calculator } from './components/Calculators'
import { ConfirmButton } from './components/ConfirmButton'

type Mode = 'story' | 'pro'
type View = 'clips' | 'tools'

const MY = '我的剪報'

function useStored<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw) as T
    } catch {
      // storage unavailable: use default
    }
    return initial
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v))
    } catch {
      // ignore
    }
  }, [key, v])
  return [v, setV] as const
}

export default function App() {
  const [mode, setMode] = useStored<Mode>('clips:mode', 'story')
  const [view, setView] = useState<View>('clips')
  const [custom, setCustom] = useStored<Clip[]>('clips:custom', [])
  const [cat, setCat] = useState('全部')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const all = useMemo(() => [...BUILTIN_CLIPS, ...custom], [custom])
  const cats = ['全部', ...CATEGORIES, ...(custom.length ? [MY] : [])]
  const q = query.trim()
  const shown = all.filter((c) => {
    if (cat === MY && !c.custom) return false
    if (cat !== '全部' && cat !== MY && c.category !== cat) return false
    if (!q) return true
    return [c.title, c.takeaway, ...c.story, ...c.pro].some((t) => t.includes(q))
  })

  return (
    <div className={`app mode-${mode}`}>
      <header className="masthead">
        <div>
          <p className="eyebrow">理財觀念剪報</p>
          <h1>我為你做的財務規劃，一次說清楚</h1>
        </div>
        <div className="mode-switch" role="radiogroup" aria-label="說明方式">
          <button role="radio" aria-checked={mode === 'story'} className={mode === 'story' ? 'on' : ''} onClick={() => setMode('story')}>
            故事版
          </button>
          <button role="radio" aria-checked={mode === 'pro'} className={mode === 'pro' ? 'on' : ''} onClick={() => setMode('pro')}>
            專業版
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button className={view === 'clips' ? 'on' : ''} onClick={() => setView('clips')}>
          觀念剪報 <span className="count">{all.length}</span>
        </button>
        <button className={view === 'tools' ? 'on' : ''} onClick={() => setView('tools')}>
          試算工具 <span className="count">3</span>
        </button>
      </nav>

      {view === 'tools' ? (
        <main className="tools">
          {(Object.keys(CALC_TITLES) as CalcId[]).map((id) => (
            <section key={id} className="tool">
              <h2>{CALC_TITLES[id]}</h2>
              <Calculator id={id} />
            </section>
          ))}
        </main>
      ) : (
        <main>
          <div className="filters">
            <div className="chips">
              {cats.map((c) => (
                <button key={c} className={`chip${cat === c ? ' on' : ''}`} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="filter-actions">
              <input id="search" type="search" placeholder="搜尋觀念" value={query} onChange={(e) => setQuery(e.target.value)} />
              <button className="primary" onClick={() => setAdding(true)}>
                ＋ 新增剪報
              </button>
            </div>
          </div>

          {adding && (
            <ClipForm
              onCancel={() => setAdding(false)}
              onSave={(c) => {
                setCustom((xs) => [...xs, c])
                setAdding(false)
                setOpenId(c.id)
              }}
            />
          )}

          <div className="clips">
            {shown.map((c) => (
              <ClipCard
                key={c.id}
                clip={c}
                mode={mode}
                open={openId === c.id}
                onToggle={() => setOpenId(openId === c.id ? null : c.id)}
                onDelete={c.custom ? () => setCustom((xs) => xs.filter((x) => x.id !== c.id)) : undefined}
              />
            ))}
            {shown.length === 0 && <p className="empty">沒有符合的剪報。</p>}
          </div>

          <aside className="upcoming">
            <p className="eyebrow">整理中</p>
            <h2>CFP 客戶財富管理流程</h2>
            <p>從了解客戶、蒐集資料、分析現況、提出建議、執行到定期檢視的完整步驟，整理好後會加入這裡。</p>
          </aside>
        </main>
      )}

      <footer>
        <p>內容整理自王伯達《人生財務規劃學》課程；歷史報酬不代表未來表現，試算結果僅供規劃參考。</p>
        <a className="home-link" href="https://fuwei0618-cmd.github.io/Entry/map/">
          ↖ 回到 Origina
        </a>
      </footer>
    </div>
  )
}

function ClipCard({ clip, mode, open, onToggle, onDelete }: { clip: Clip; mode: Mode; open: boolean; onToggle: () => void; onDelete?: () => void }) {
  const body = mode === 'story' ? clip.story : clip.pro
  return (
    <article className={`clip${open ? ' open' : ''}`}>
      <button className="clip-head" onClick={onToggle} aria-expanded={open}>
        <span className="clip-cat">{clip.category}</span>
        <h3>{clip.title}</h3>
        <p><span className="takeaway">{clip.takeaway}</span></p>
        <span className="more">{open ? '收合' : mode === 'story' ? '看故事' : '看架構'}</span>
      </button>
      {open && (
        <div className="clip-body">
          {mode === 'story' ? (
            body.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <ul>
              {body.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}
          {clip.table && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {clip.table.head.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clip.table.rows.map((r) => (
                    <tr key={r[0]}>
                      {r.map((c, i) => (
                        <td key={i}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {clip.calc && (
            <div className="inline-calc">
              <h4>{CALC_TITLES[clip.calc]}</h4>
              <Calculator id={clip.calc} />
            </div>
          )}
          <div className="clip-foot">
            <span className="source">出處：{clip.source}</span>
            {onDelete && (
              <ConfirmButton className="link" prompt="確定刪除？再按一次" onConfirm={onDelete}>
                刪除
              </ConfirmButton>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

function ClipForm({ onSave, onCancel }: { onSave: (c: Clip) => void; onCancel: () => void }) {
  const [f, setF] = useState({ title: '', category: CATEGORIES[0] as string, takeaway: '', story: '', pro: '', source: '' })
  const lines = (s: string) =>
    s
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean)
  const ok = f.title.trim() && (f.story.trim() || f.pro.trim())
  return (
    <form
      className="clip-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (!ok) return
        onSave({
          id: `my-${Date.now().toString(36)}`,
          title: f.title.trim(),
          category: f.category,
          takeaway: f.takeaway.trim(),
          story: lines(f.story),
          pro: lines(f.pro),
          source: f.source.trim() || '自行整理',
          custom: true,
        })
      }}
    >
      <h2>新增剪報</h2>
      <label htmlFor="f-title">
        標題
        <input id="f-title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      </label>
      <label htmlFor="f-cat">
        分類
        <select id="f-cat" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label htmlFor="f-take">
        一句話重點
        <input id="f-take" value={f.takeaway} onChange={(e) => setF({ ...f, takeaway: e.target.value })} />
      </label>
      <label htmlFor="f-story">
        故事版（每段一行）
        <textarea id="f-story" rows={4} value={f.story} onChange={(e) => setF({ ...f, story: e.target.value })} />
      </label>
      <label htmlFor="f-pro">
        專業版（每個重點一行）
        <textarea id="f-pro" rows={4} value={f.pro} onChange={(e) => setF({ ...f, pro: e.target.value })} />
      </label>
      <label htmlFor="f-src">
        出處
        <input id="f-src" value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} placeholder="例：CFP 課程第 2 章" />
      </label>
      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          取消
        </button>
        <button type="submit" className="primary" disabled={!ok}>
          儲存
        </button>
      </div>
      <p className="hint">新增的剪報只存在這台裝置的瀏覽器中。</p>
    </form>
  )
}
