import { useState } from 'react'
import { compound, fmtWan, retirementNeed } from '../calc'
import type { CalcId } from '../clips'

function Num({ id, label, value, onChange, unit, step = 1 }: { id: string; label: string; value: number; onChange: (v: number) => void; unit: string; step?: number }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <span className="field-input">
        <input id={id} type="number" inputMode="decimal" step={step} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
        <span className="unit">{unit}</span>
      </span>
    </label>
  )
}

function RetireCalc() {
  const [monthly, setMonthly] = useState(3)
  const [years, setYears] = useState(35)
  const [infl, setInfl] = useState(1.5)
  const r = retirementNeed(monthly * 10_000, years, infl)
  return (
    <div className="calc">
      <div className="calc-inputs">
        <Num id="rc-monthly" label="現在每月生活費" value={monthly} onChange={setMonthly} unit="萬" step={0.5} />
        <Num id="rc-years" label="距離退休" value={years} onChange={setYears} unit="年" />
        <Num id="rc-infl" label="年通膨率" value={infl} onChange={setInfl} unit="%" step={0.1} />
      </div>
      <div className="calc-result">
        <span className="result-label">退休時需要準備</span>
        <span className="result-big">{fmtWan(r.need)}</span>
        <span className="result-note">
          通膨係數 {r.factor.toFixed(2)}，退休第一年可提領約 {fmtWan(r.firstYear)}（每月約 {fmtWan(r.firstYear / 12)}）
        </span>
      </div>
    </div>
  )
}

function CompoundCalc() {
  const [p1, setP1] = useState(23.1)
  const [r1, setR1] = useState(10)
  const [p2, setP2] = useState(100)
  const [r2, setR2] = useState(5)
  const [years, setYears] = useState(30)
  const a = compound(p1 * 10_000, r1, years)
  const b = compound(p2 * 10_000, r2, years)
  return (
    <div className="calc">
      <div className="calc-inputs">
        <Num id="cc-p1" label="A 的本金" value={p1} onChange={setP1} unit="萬" step={0.1} />
        <Num id="cc-r1" label="A 的年報酬" value={r1} onChange={setR1} unit="%" step={0.5} />
        <Num id="cc-p2" label="B 的本金" value={p2} onChange={setP2} unit="萬" step={0.1} />
        <Num id="cc-r2" label="B 的年報酬" value={r2} onChange={setR2} unit="%" step={0.5} />
        <Num id="cc-years" label="投資期間" value={years} onChange={setYears} unit="年" />
      </div>
      <div className="calc-result two">
        <div>
          <span className="result-label">A</span>
          <span className={`result-big${a >= b ? ' win' : ''}`}>{fmtWan(a)}</span>
        </div>
        <div>
          <span className="result-label">B</span>
          <span className={`result-big${b > a ? ' win' : ''}`}>{fmtWan(b)}</span>
        </div>
      </div>
    </div>
  )
}

function FeeCalc() {
  const [gross, setGross] = useState(10)
  const [fee, setFee] = useState(1.8)
  const [years, setYears] = useState(20)
  const low = compound(1, gross, years)
  const high = compound(1, gross - fee, years)
  return (
    <div className="calc">
      <div className="calc-inputs">
        <Num id="fc-gross" label="年報酬（低成本）" value={gross} onChange={setGross} unit="%" step={0.5} />
        <Num id="fc-fee" label="每年多收的費用" value={fee} onChange={setFee} unit="%" step={0.1} />
        <Num id="fc-years" label="投資期間" value={years} onChange={setYears} unit="年" />
      </div>
      <div className="calc-result two">
        <div>
          <span className="result-label">低成本，1 元變成</span>
          <span className="result-big win">{low.toFixed(2)} 元</span>
        </div>
        <div>
          <span className="result-label">高成本，1 元變成</span>
          <span className="result-big">{high.toFixed(2)} 元</span>
        </div>
      </div>
      <span className="result-note">少了 {(((low - high) / low) * 100).toFixed(0)}% 的最終資產</span>
    </div>
  )
}

export function Calculator({ id }: { id: CalcId }) {
  if (id === 'retire') return <RetireCalc />
  if (id === 'compound') return <CompoundCalc />
  return <FeeCalc />
}
