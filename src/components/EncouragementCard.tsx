const MESSAGES = [
  '오늘도 미래의 나에게 선물을 보냈어요 🎁',
  '완벽해요! 이번 달도 돈나무가 자랐어요 🌳',
  '꾸준함이 결국 이깁니다. 정말 잘했어요 👏',
  '6년 뒤의 내가 지금의 나에게 고마워할 거예요 💙',
  '한 달 치 루틴 끝! 이제 마음 편히 쉬어요 😌',
]

/** 월이 바뀌어도 같은 달에는 같은 메시지가 나오도록 month 기반 선택 */
export default function EncouragementCard({ month }: { month: string }) {
  const seed = month.split('-').reduce((s, p) => s + Number(p), 0)
  const msg = MESSAGES[seed % MESSAGES.length]
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.2rem' }}>🎉</div>
      <div className="encouragement">이번 달 완주!</div>
      <p className="muted" style={{ marginTop: 4 }}>
        {msg}
      </p>
    </div>
  )
}
