import type { PresetId, Strategy } from '../types/model'

interface PresetTemplate {
  id: PresetId
  name: string
  tagline: string
  description: string
  buckets: Array<{
    name: string
    accountType: Strategy['buckets'][number]['accountType']
    monthlyAmount: number
    targetCap?: number
    assetNote?: string
  }>
}

export const PRESETS: PresetTemplate[] = [
  {
    id: 'growth',
    name: '성장형 빅테크',
    tagline: '40살로 돌아간다면 이렇게 투자한다',
    description:
      '비상금을 먼저 쌓고, 미국 빅테크와 장기 ETF로 자산을 적극적으로 키우는 6년 루틴입니다.',
    buckets: [
      {
        name: '비상금 (CMA)',
        accountType: 'cma',
        monthlyAmount: 150_000,
        targetCap: 2_000_000,
        assetNote: 'CMA 계좌에 적립, 200만 원 채우면 중단',
      },
      {
        name: 'ISA (3~5년 단기)',
        accountType: 'isa',
        monthlyAmount: 400_000,
        assetNote: 'S&P500·나스닥100 ETF 중심',
      },
      {
        name: '미국 빅테크 + 장기 ETF',
        accountType: 'etf',
        monthlyAmount: 500_000,
        assetNote: '애플·엔비디아·테슬라 + QQQ·SOXX (10년)',
      },
      {
        name: '연금저축',
        accountType: 'pension',
        monthlyAmount: 150_000,
        assetNote: '세액공제 받으며 적립, 환급금 전액 재투자',
      },
      {
        name: 'IRP',
        accountType: 'irp',
        monthlyAmount: 100_000,
        assetNote: '연금저축 한도 채운 뒤 여유 있을 때 추가 투자',
      },
    ],
  },
  {
    id: 'dividend',
    name: '배당나무형',
    tagline: '6년만 키우면 제2의 월급이 들어온다',
    description:
      '파킹통장으로 리스크를 막고, 배당 ETF로 매달 현금흐름을 만드는 은퇴 준비 루틴입니다.',
    buckets: [
      {
        name: '파킹통장 (비상금 방패)',
        accountType: 'parking',
        monthlyAmount: 300_000,
        targetCap: 5_000_000,
        assetNote: '토스/카뱅 파킹통장, 500만 원 채우면 중단',
      },
      {
        name: 'ISA (절세 치트키)',
        accountType: 'isa',
        monthlyAmount: 500_000,
        assetNote: '한국판 SCHD 꾸준히 매수',
      },
      {
        name: '월배당 ETF (현금흐름 엔진)',
        accountType: 'etf',
        monthlyAmount: 400_000,
        assetNote: '국내 상장형 월배당 ETF 분산 투자',
      },
      {
        name: '연금저축 (세금 환급기)',
        accountType: 'pension',
        monthlyAmount: 150_000,
        assetNote: '미국 S&P500(국내상장) 적립, 환급금 전액 재투자',
      },
      {
        name: 'IRP (최후의 수비대)',
        accountType: 'irp',
        monthlyAmount: 100_000,
        assetNote: '예금+채권으로 안정성 확보, 노후 자금 방어',
      },
    ],
  },
]

let counter = 0
function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  counter += 1
  return `id-${Date.now()}-${counter}`
}

/** 프리셋을 새 Strategy 인스턴스로 복제 */
export function instantiatePreset(presetId: PresetId, startMonth: string): Strategy {
  const preset = PRESETS.find((p) => p.id === presetId)
  if (!preset) throw new Error(`알 수 없는 프리셋: ${presetId}`)
  return {
    id: uid(),
    name: preset.name,
    basedOnPreset: preset.id,
    durationMonths: 72,
    startMonth,
    buckets: preset.buckets.map((b, i) => ({
      id: uid(),
      order: i,
      name: b.name,
      accountType: b.accountType,
      monthlyAmount: b.monthlyAmount,
      targetCap: b.targetCap,
      assetNote: b.assetNote,
    })),
  }
}

export function newBucketId(): string {
  return uid()
}
