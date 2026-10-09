import { useEffect, useState } from 'react'
import type { AppState } from './model'
import { sampleState } from './sampleData'

const KEY = 'wealth-mgm:v1'

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as AppState
  } catch {
    // storage blocked or corrupt: fall back to demo data
  }
  return sampleState()
}

/** App state persisted to this browser's localStorage only. */
export function useAppState() {
  const [state, setState] = useState<AppState>(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // ignore quota / private-mode errors
    }
  }, [state])
  return [state, setState] as const
}

export function isAppState(x: unknown): x is AppState {
  const s = x as AppState
  return !!s && Array.isArray(s.clients) && typeof s.settings?.driftThreshold === 'number'
}
