interface Props {
  ratio: number
  success?: boolean
}

export default function ProgressBar({ ratio, success }: Props) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100
  return (
    <div className="progress-track">
      <div
        className={`progress-fill${success ? ' success' : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
