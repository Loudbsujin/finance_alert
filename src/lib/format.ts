/** 원 단위 정수를 "1,500,000원" 형태로 */
export function formatWon(won: number): string {
  return `${Math.round(won).toLocaleString('ko-KR')}원`
}

/** 원 -> "150만 원" 형태 (만 단위 우선, 큰 금액은 억 표기) */
export function formatManwon(won: number): string {
  if (won === 0) return '0원'
  const eok = Math.floor(won / 100_000_000)
  const man = Math.floor((won % 100_000_000) / 10_000)
  const rest = won % 10_000
  const parts: string[] = []
  if (eok > 0) parts.push(`${eok.toLocaleString('ko-KR')}억`)
  if (man > 0) parts.push(`${man.toLocaleString('ko-KR')}만`)
  if (rest > 0 || parts.length === 0) parts.push(`${rest.toLocaleString('ko-KR')}`)
  return `${parts.join(' ')}원`
}

/** 원 -> 만원 단위 숫자 (입력 필드용) */
export function wonToMan(won: number): number {
  return won / 10_000
}

/** 만원 단위 숫자 -> 원 */
export function manToWon(man: number): number {
  return Math.round(man * 10_000)
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}
