interface Props {
  current: number
  best: number
}

export default function StreakBanner({ current, best }: Props) {
  return (
    <div className="streak-banner">
      <div className="big">🔥 {current}개월 연속</div>
      <div className="label">
        {current === 0
          ? '이번 달을 완주하면 스트릭이 시작돼요'
          : `잘하고 있어요! 최고 기록은 ${best}개월이에요`}
      </div>
    </div>
  )
}
