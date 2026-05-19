import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppData,
  BalanceEntry,
  Bucket,
  ISOMonth,
  Settings,
  Strategy,
} from '../types/model'
import { instantiatePreset, newBucketId } from '../data/presets'
import { currentMonth, todayISO } from '../lib/month'
import {
  STORAGE_KEY,
  defaultAppData,
  loadAppData,
  migrate,
  saveAppData,
} from './schema'

interface AppDataContextValue {
  data: AppData
  activeStrategy: Strategy | undefined
  update: (producer: (draft: AppData) => AppData) => void
  toggleCheck: (month: ISOMonth, bucketId: string) => void
  startStrategyFromPreset: (presetId: 'growth' | 'dividend') => void
  setActiveStrategy: (strategyId: string) => void
  updateBucket: (bucketId: string, patch: Partial<Bucket>) => void
  addBucket: () => void
  removeBucket: (bucketId: string) => void
  renameStrategy: (name: string) => void
  setStartMonth: (month: ISOMonth) => void
  addBalance: (entry: Omit<BalanceEntry, 'id'>) => void
  removeBalance: (id: string) => void
  setSettings: (patch: Partial<Settings>) => void
  resetAll: () => void
  importData: (data: AppData) => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

function genId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 변경 시 디바운스 저장
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveAppData(data), 300)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [data])

  // 다른 탭과 동기화
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return
      try {
        setData(e.newValue ? migrate(JSON.parse(e.newValue)) : defaultAppData())
      } catch {
        /* 무시 */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const update = useCallback((producer: (draft: AppData) => AppData) => {
    setData((prev) => producer(structuredClone(prev)))
  }, [])

  const activeStrategy = useMemo(
    () => data.strategies.find((s) => s.id === data.activeStrategyId),
    [data.strategies, data.activeStrategyId],
  )

  const toggleCheck = useCallback(
    (month: ISOMonth, bucketId: string) => {
      update((draft) => {
        let record = draft.records.find((r) => r.month === month)
        if (!record) {
          record = { month, checks: {} }
          draft.records.push(record)
        }
        const cur = record.checks[bucketId]
        const nextDone = !cur?.done
        record.checks[bucketId] = {
          done: nextDone,
          contributedAmount: cur?.contributedAmount,
          completedAt: nextDone ? todayISO() : undefined,
        }
        return draft
      })
    },
    [update],
  )

  const startStrategyFromPreset = useCallback(
    (presetId: 'growth' | 'dividend') => {
      update((draft) => {
        const strategy = instantiatePreset(presetId, currentMonth())
        draft.strategies.push(strategy)
        draft.activeStrategyId = strategy.id
        return draft
      })
    },
    [update],
  )

  const setActiveStrategy = useCallback(
    (strategyId: string) => {
      update((draft) => {
        draft.activeStrategyId = strategyId
        return draft
      })
    },
    [update],
  )

  const updateBucket = useCallback(
    (bucketId: string, patch: Partial<Bucket>) => {
      update((draft) => {
        const strategy = draft.strategies.find((s) => s.id === draft.activeStrategyId)
        const bucket = strategy?.buckets.find((b) => b.id === bucketId)
        if (bucket) Object.assign(bucket, patch)
        return draft
      })
    },
    [update],
  )

  const addBucket = useCallback(() => {
    update((draft) => {
      const strategy = draft.strategies.find((s) => s.id === draft.activeStrategyId)
      if (!strategy) return draft
      strategy.buckets.push({
        id: newBucketId(),
        order: strategy.buckets.length,
        name: '새 항목',
        accountType: 'other',
        monthlyAmount: 100_000,
      })
      return draft
    })
  }, [update])

  const removeBucket = useCallback(
    (bucketId: string) => {
      update((draft) => {
        const strategy = draft.strategies.find((s) => s.id === draft.activeStrategyId)
        if (!strategy) return draft
        strategy.buckets = strategy.buckets
          .filter((b) => b.id !== bucketId)
          .map((b, i) => ({ ...b, order: i }))
        return draft
      })
    },
    [update],
  )

  const renameStrategy = useCallback(
    (name: string) => {
      update((draft) => {
        const strategy = draft.strategies.find((s) => s.id === draft.activeStrategyId)
        if (strategy) strategy.name = name
        return draft
      })
    },
    [update],
  )

  const setStartMonth = useCallback(
    (month: ISOMonth) => {
      update((draft) => {
        const strategy = draft.strategies.find((s) => s.id === draft.activeStrategyId)
        if (strategy) strategy.startMonth = month
        return draft
      })
    },
    [update],
  )

  const addBalance = useCallback(
    (entry: Omit<BalanceEntry, 'id'>) => {
      update((draft) => {
        draft.balances.push({ ...entry, id: genId() })
        draft.balances.sort((a, b) => a.date.localeCompare(b.date))
        return draft
      })
    },
    [update],
  )

  const removeBalance = useCallback(
    (id: string) => {
      update((draft) => {
        draft.balances = draft.balances.filter((b) => b.id !== id)
        return draft
      })
    },
    [update],
  )

  const setSettings = useCallback(
    (patch: Partial<Settings>) => {
      update((draft) => {
        draft.settings = { ...draft.settings, ...patch }
        return draft
      })
    },
    [update],
  )

  const resetAll = useCallback(() => {
    setData(defaultAppData())
  }, [])

  const importData = useCallback((imported: AppData) => {
    setData(migrate(imported))
  }, [])

  const value: AppDataContextValue = {
    data,
    activeStrategy,
    update,
    toggleCheck,
    startStrategyFromPreset,
    setActiveStrategy,
    updateBucket,
    addBucket,
    removeBucket,
    renameStrategy,
    setStartMonth,
    addBalance,
    removeBalance,
    setSettings,
    resetAll,
    importData,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData는 AppDataProvider 안에서만 사용할 수 있습니다')
  return ctx
}
