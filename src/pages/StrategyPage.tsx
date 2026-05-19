import { useState } from 'react'
import { useAppData } from '../storage/useAppData'
import { PRESETS } from '../data/presets'
import { formatManwon } from '../lib/format'
import type { AccountType, Bucket } from '../types/model'
import MoneyInput from '../components/MoneyInput'

const ACCOUNT_LABELS: Record<AccountType, string> = {
  cma: 'CMA',
  isa: 'ISA',
  etf: 'ETF',
  pension: '연금저축',
  irp: 'IRP',
  parking: '파킹통장',
  other: '기타',
}

function BucketEditor({
  bucket,
  onChange,
  onRemove,
}: {
  bucket: Bucket
  onChange: (patch: Partial<Bucket>) => void
  onRemove: () => void
}) {
  const hasCap = bucket.targetCap != null
  return (
    <div className="card">
      <div className="field">
        <label>항목 이름</label>
        <input
          value={bucket.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>
      <div className="field">
        <label>계좌 종류</label>
        <select
          value={bucket.accountType}
          onChange={(e) => onChange({ accountType: e.target.value as AccountType })}
        >
          {Object.entries(ACCOUNT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>매달 적립액</label>
        <MoneyInput
          valueWon={bucket.monthlyAmount}
          onChangeWon={(won) => onChange({ monthlyAmount: won })}
        />
      </div>
      <div className="field">
        <div className="row-between" style={{ marginBottom: 6 }}>
          <label style={{ margin: 0 }}>목표 상한 (채우면 중단)</label>
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              onChange({ targetCap: hasCap ? undefined : 2_000_000 })
            }
          >
            {hasCap ? '끄기' : '설정'}
          </button>
        </div>
        {hasCap && (
          <MoneyInput
            valueWon={bucket.targetCap ?? 0}
            onChangeWon={(won) => onChange({ targetCap: won })}
          />
        )}
      </div>
      <div className="field">
        <label>자산 메모</label>
        <input
          value={bucket.assetNote ?? ''}
          placeholder="예: S&P500 ETF"
          onChange={(e) => onChange({ assetNote: e.target.value })}
        />
      </div>
      <button type="button" className="btn btn-danger" onClick={onRemove}>
        이 항목 삭제
      </button>
    </div>
  )
}

export default function StrategyPage() {
  const {
    data,
    activeStrategy,
    startStrategyFromPreset,
    setActiveStrategy,
    updateBucket,
    addBucket,
    removeBucket,
    renameStrategy,
    setStartMonth,
  } = useAppData()
  const [editing, setEditing] = useState(false)

  // 최초 실행 또는 활성 전략 없음 → 프리셋 선택
  if (!activeStrategy) {
    return (
      <div>
        <div className="page-intro">
          <h2>투자 루틴 고르기</h2>
          <p>두 가지 전략 중 하나로 시작해요. 나중에 자유롭게 바꿀 수 있어요.</p>
        </div>
        {PRESETS.map((preset) => (
          <div key={preset.id} className="preset-card">
            <h3>{preset.name}</h3>
            <div className="tagline">{preset.tagline}</div>
            <p className="desc">{preset.description}</p>
            {preset.buckets.map((b) => (
              <div key={b.name} className="preset-bucket-line">
                <span>{b.name}</span>
                <span>{formatManwon(b.monthlyAmount)}</span>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 14 }}
              onClick={() => startStrategyFromPreset(preset.id)}
            >
              이 전략으로 시작하기
            </button>
          </div>
        ))}
      </div>
    )
  }

  const sortedBuckets = [...activeStrategy.buckets].sort((a, b) => a.order - b.order)
  const monthlyTotal = sortedBuckets.reduce((s, b) => s + b.monthlyAmount, 0)
  const otherStrategies = data.strategies.filter((s) => s.id !== activeStrategy.id)

  return (
    <div>
      <div className="page-intro">
        <h2>내 전략</h2>
        <p>매달 총 {formatManwon(monthlyTotal)}을 적립하는 루틴이에요.</p>
      </div>

      <div className="card">
        <div className="field">
          <label>전략 이름</label>
          <input
            value={activeStrategy.name}
            onChange={(e) => renameStrategy(e.target.value)}
          />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>시작 월</label>
          <input
            type="month"
            value={activeStrategy.startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="row-between" style={{ margin: '4px 4px 8px' }}>
        <strong>항목 {sortedBuckets.length}개</strong>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? '편집 완료' : '편집하기'}
        </button>
      </div>

      {editing
        ? sortedBuckets.map((b) => (
            <BucketEditor
              key={b.id}
              bucket={b}
              onChange={(patch) => updateBucket(b.id, patch)}
              onRemove={() => removeBucket(b.id)}
            />
          ))
        : sortedBuckets.map((b) => (
            <div key={b.id} className="card">
              <div className="row-between">
                <strong>{b.name}</strong>
                <span className="action-amount">
                  {formatManwon(b.monthlyAmount)}
                </span>
              </div>
              <div className="muted" style={{ marginTop: 2 }}>
                {ACCOUNT_LABELS[b.accountType]}
                {b.targetCap ? ` · 목표 ${formatManwon(b.targetCap)}` : ''}
                {b.assetNote ? ` · ${b.assetNote}` : ''}
              </div>
            </div>
          ))}

      {editing && (
        <button type="button" className="btn" onClick={addBucket}>
          + 항목 추가
        </button>
      )}

      {otherStrategies.length > 0 && (
        <>
          <div className="section-title">다른 전략으로 전환</div>
          {otherStrategies.map((s) => (
            <div key={s.id} className="list-row">
              <span>{s.name}</span>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setActiveStrategy(s.id)}
              >
                전환
              </button>
            </div>
          ))}
        </>
      )}

      <div className="section-title">새 전략 만들기</div>
      {PRESETS.map((preset) => (
        <div key={preset.id} className="list-row">
          <span>{preset.name} 프리셋</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => startStrategyFromPreset(preset.id)}
          >
            추가
          </button>
        </div>
      ))}
    </div>
  )
}
