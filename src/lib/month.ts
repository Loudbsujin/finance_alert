import type { ISOMonth, ISODate } from '../types/model'

export function currentMonth(d: Date = new Date()): ISOMonth {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function todayISO(d: Date = new Date()): ISODate {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

/** "2026-05" -> {year:2026, month:5} */
function parse(m: ISOMonth): { year: number; month: number } {
  const [y, mo] = m.split('-').map(Number)
  return { year: y, month: mo }
}

/** offset 개월만큼 이동한 ISOMonth 반환 (음수 가능) */
export function addMonths(m: ISOMonth, offset: number): ISOMonth {
  const { year, month } = parse(m)
  const total = year * 12 + (month - 1) + offset
  const ny = Math.floor(total / 12)
  const nm = (total % 12) + 1
  return `${ny}-${String(nm).padStart(2, '0')}`
}

/** a가 b보다 이전이면 음수, 같으면 0, 이후면 양수 (개월 차) */
export function monthsBetween(a: ISOMonth, b: ISOMonth): number {
  const pa = parse(a)
  const pb = parse(b)
  return pb.year * 12 + (pb.month - 1) - (pa.year * 12 + (pa.month - 1))
}

export function compareMonth(a: ISOMonth, b: ISOMonth): number {
  return monthsBetween(b, a)
}

/** "2026-05" -> "2026년 5월" */
export function formatMonthKo(m: ISOMonth): string {
  const { year, month } = parse(m)
  return `${year}년 ${month}월`
}

/** "2026-05" -> "5월" */
export function formatMonthShort(m: ISOMonth): string {
  return `${parse(m).month}월`
}

export function monthYear(m: ISOMonth): number {
  return parse(m).year
}
