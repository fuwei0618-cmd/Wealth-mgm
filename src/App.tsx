import { useRef, useState } from 'react'
import { ClientDetail } from './components/ClientDetail'
import { ConfirmButton } from './components/ConfirmButton'
import { Dashboard } from './components/Dashboard'
import { DEFAULT_TARGETS, newId, type Client } from './model'
import { sampleState } from './sampleData'
import { isAppState, useAppState } from './store'

export default function App() {
  const [state, setState] = useAppState()
  const [openId, setOpenId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const open = state.clients.find((c) => c.id === openId)

  const addClient = () => {
    const c: Client = {
      id: newId(),
      name: '新客戶',
      risk: 'balanced',
      target: { ...DEFAULT_TARGETS.balanced },
      holdings: [],
      liabilities: 0,
      notes: '',
      nextContact: '',
    }
    setState((s) => ({ ...s, clients: [...s.clients, c] }))
    setOpenId(c.id)
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `wealth-mgm-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text())
      if (!isAppState(data)) throw new Error()
      setState(data)
      setOpenId(null)
      setNotice(`已匯入 ${data.clients.length} 位客戶，原有資料已被取代。`)
    } catch {
      setNotice('匯入失敗：請選擇由「匯出備份」產生的 JSON 檔。')
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1 onClick={() => setOpenId(null)}>財富管理</h1>
        <div className="row">
          <label className="small muted">
            再平衡門檻
            <input
              className="pct-input"
              type="number"
              min={1}
              max={50}
              value={state.settings.driftThreshold}
              onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, driftThreshold: Number(e.target.value) || 5 } }))}
            />
            %
          </label>
          <button onClick={exportJson}>匯出備份</button>
          <button onClick={() => fileRef.current?.click()} title="會取代目前所有資料">匯入備份</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importJson(f)
              e.target.value = ''
            }}
          />
        </div>
      </header>

      {notice && (
        <div className="notice" role="status">
          {notice}
          <button className="link" onClick={() => setNotice('')}>
            關閉
          </button>
        </div>
      )}

      <main>
        {open ? (
          <ClientDetail
            client={open}
            threshold={state.settings.driftThreshold}
            onBack={() => setOpenId(null)}
            onChange={(c) => setState((s) => ({ ...s, clients: s.clients.map((x) => (x.id === c.id ? c : x)) }))}
            onDelete={() => {
              setState((s) => ({ ...s, clients: s.clients.filter((x) => x.id !== open.id) }))
              setOpenId(null)
            }}
          />
        ) : (
          <Dashboard state={state} onOpen={setOpenId} onAdd={addClient} />
        )}
      </main>

      <footer className="muted small">
        資料只存在這台裝置的瀏覽器中，請定期「匯出備份」。
        <ConfirmButton
          className="link"
          prompt="會清除目前所有資料，再按一次確認"
          onConfirm={() => {
            setState(sampleState())
            setOpenId(null)
          }}
        >
          重設為範例資料
        </ConfirmButton>
      </footer>
    </div>
  )
}
