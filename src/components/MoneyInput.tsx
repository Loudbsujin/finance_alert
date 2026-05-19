import { manToWon, wonToMan } from '../lib/format'

interface Props {
  /** 원 단위 값 */
  valueWon: number
  onChangeWon: (won: number) => void
  /** 입력 단위: 'man'(만원) | 'won'(원) */
  unit?: 'man' | 'won'
  placeholder?: string
}

export default function MoneyInput({
  valueWon,
  onChangeWon,
  unit = 'man',
  placeholder,
}: Props) {
  const display = unit === 'man' ? wonToMan(valueWon) : valueWon
  return (
    <div className="input-suffix">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={unit === 'man' ? 1 : 10000}
        value={Number.isFinite(display) ? display : 0}
        placeholder={placeholder}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (Number.isNaN(n)) return onChangeWon(0)
          onChangeWon(unit === 'man' ? manToWon(n) : Math.round(n))
        }}
      />
      <span className="suffix">{unit === 'man' ? '만원' : '원'}</span>
    </div>
  )
}
