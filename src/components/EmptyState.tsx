interface Props {
  emoji: string
  title: string
  description?: string
}

export default function EmptyState({ emoji, title, description }: Props) {
  return (
    <div className="empty-state">
      <div className="emoji">{emoji}</div>
      <p style={{ fontWeight: 700, marginTop: 8 }}>{title}</p>
      {description && <p className="muted">{description}</p>}
    </div>
  )
}
