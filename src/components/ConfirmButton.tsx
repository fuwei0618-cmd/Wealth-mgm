import { useEffect, useState, type ReactNode } from 'react'

/** Two-step button: first click arms it, second click within 4s runs the action. */
export function ConfirmButton({ onConfirm, children, prompt = '再按一次確認', className }: { onConfirm: () => void; children: ReactNode; prompt?: string; className?: string }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 4000)
    return () => clearTimeout(t)
  }, [armed])
  return (
    <button
      className={`${className ?? ''}${armed ? ' armed' : ''}`}
      onClick={() => {
        if (armed) {
          setArmed(false)
          onConfirm()
        } else setArmed(true)
      }}
    >
      {armed ? prompt : children}
    </button>
  )
}
