import type { Bucket } from '../types/model'
import { formatManwon } from '../lib/format'

interface Props {
  bucket: Bucket
  done: boolean
  onToggle: () => void
}

export default function ActionItem({ bucket, done, onToggle }: Props) {
  return (
    <button
      type="button"
      className={`action-item${done ? ' done' : ''}`}
      onClick={onToggle}
      aria-pressed={done}
    >
      <span className="action-check">{done ? '✓' : ''}</span>
      <span className="action-body">
        <span className="row-between">
          <span className="action-name">{bucket.name}</span>
          <span className="action-amount">{formatManwon(bucket.monthlyAmount)}</span>
        </span>
        {bucket.assetNote && <span className="action-note">{bucket.assetNote}</span>}
      </span>
    </button>
  )
}
