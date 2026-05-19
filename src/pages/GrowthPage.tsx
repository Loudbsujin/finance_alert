import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAppData } from '../storage/useAppData'
import { todayISO } from '../lib/month'
import { formatManwon, formatWon } from '../lib/format'
import MoneyInput from '../components/MoneyInput'
import EmptyState from '../components/EmptyState'

export default function GrowthPage() {
  const { data, addBalance, removeBalance } = useAppData()
  const [date, setDate] = useState(todayISO())
  const [amount, setAmount] = useState(0)
  const [note, setNote] = useState('')

  const balances = data.balances
  const latest = balances[balances.length - 1]
  const first = balances[0]
  const growth = latest && first ? latest.totalAssets - first.totalAssets : 0

  const chartData = balances.map((b) => ({
    date: b.date.slice(5),
    만원: Math.round(b.totalAssets / 10_000),
  }))

  function submit() {
    if (amount <= 0) return
    addBalance({ date, totalAssets: amount, note: note.trim() || undefined })
    setAmount(0)
    setNote('')
  }

  return (
    <div>
      <div className="page-intro">
        <h2>자산 추적</h2>
        <p>매달 총자산을 기록하면 성장 곡선이 보여요.</p>
      </div>

      {latest && (
        <div className="card">
          <div className="muted">현재 총자산</div>
          <div className="stat-big">{formatManwon(latest.totalAssets)}</div>
          {balances.length > 1 && (
            <div
              className="muted"
              style={{ color: growth >= 0 ? 'var(--success)' : 'var(--danger)' }}
            >
              첫 기록 대비 {growth >= 0 ? '+' : ''}
              {formatManwon(growth)}
            </div>
          )}
        </div>
      )}

      {chartData.length >= 2 && (
        <div className="card">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={48} />
              <Tooltip
                formatter={(v) => [`${Number(v).toLocaleString()}만원`, '총자산']}
              />
              <Line
                type="monotone"
                dataKey="만원"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <div className="field">
          <label>기록 날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label>총자산</label>
          <MoneyInput valueWon={amount} onChangeWon={setAmount} />
        </div>
        <div className="field">
          <label>메모 (선택)</label>
          <input
            value={note}
            placeholder="예: 보너스 입금"
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={amount <= 0}
          onClick={submit}
        >
          기록 추가
        </button>
      </div>

      {balances.length === 0 ? (
        <EmptyState
          emoji="📈"
          title="아직 기록이 없어요"
          description="이번 달 총자산을 입력해 첫 점을 찍어보세요."
        />
      ) : (
        <>
          <div className="section-title">기록 내역</div>
          <div className="card">
            {[...balances].reverse().map((b) => (
              <div key={b.id} className="list-row">
                <span>
                  <strong>{b.date}</strong>
                  {b.note && <span className="muted"> · {b.note}</span>}
                </span>
                <span className="row-between" style={{ gap: 10 }}>
                  <strong>{formatWon(b.totalAssets)}</strong>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => removeBalance(b.id)}
                  >
                    삭제
                  </button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
