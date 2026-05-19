import type { Badge } from '../lib/streak'

export default function BadgeChip({ badge }: { badge: Badge }) {
  return (
    <div
      className={`badge-chip${badge.earned ? '' : ' locked'}`}
      title={badge.description}
    >
      <div className="emoji">{badge.emoji}</div>
      <div className="label">{badge.label}</div>
    </div>
  )
}
