import { useRef, useState } from 'react'
import { useAppData } from '../storage/useAppData'
import {
  notificationPermission,
  notificationSupported,
  requestNotificationPermission,
} from '../lib/notify'
import type { AppData } from '../types/model'

export default function SettingsPage() {
  const { data, setSettings, resetAll, importData } = useAppData()
  const { settings } = data
  const [perm, setPerm] = useState(notificationPermission())
  const fileRef = useRef<HTMLInputElement>(null)

  async function askPermission() {
    const result = await requestNotificationPermission()
    setPerm(result)
    setSettings({ notificationPermissionAsked: true })
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-alert-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData
        importData(parsed)
        alert('데이터를 불러왔어요.')
      } catch {
        alert('파일을 읽을 수 없어요. 올바른 백업 파일인지 확인해주세요.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function confirmReset() {
    if (
      window.confirm(
        '모든 데이터가 삭제되고 처음 상태로 돌아갑니다. 계속할까요?',
      )
    ) {
      resetAll()
    }
  }

  return (
    <div>
      <div className="page-intro">
        <h2>설정</h2>
        <p>리마인더와 데이터를 관리해요.</p>
      </div>

      <div className="section-title">월간 리마인더</div>
      <div className="card">
        <div className="list-row">
          <span>
            <strong>리마인더 켜기</strong>
            <div className="muted">매달 정해진 날에 알려드려요</div>
          </span>
          <button
            type="button"
            className={`toggle${settings.reminderEnabled ? ' on' : ''}`}
            aria-pressed={settings.reminderEnabled}
            onClick={() =>
              setSettings({ reminderEnabled: !settings.reminderEnabled })
            }
          />
        </div>
        {settings.reminderEnabled && (
          <div className="field" style={{ marginTop: 14, marginBottom: 0 }}>
            <label>리마인더 날짜 (매달)</label>
            <select
              value={settings.reminderDayOfMonth}
              onChange={(e) =>
                setSettings({ reminderDayOfMonth: Number(e.target.value) })
              }
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  매달 {d}일
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="section-title">브라우저 알림</div>
      <div className="card">
        {!notificationSupported() ? (
          <p className="muted">이 브라우저는 알림을 지원하지 않아요.</p>
        ) : perm === 'granted' ? (
          <p className="muted">✅ 알림이 허용되어 있어요.</p>
        ) : perm === 'denied' ? (
          <p className="muted">
            알림이 차단되어 있어요. 브라우저 설정에서 허용으로 바꿔주세요.
          </p>
        ) : (
          <button type="button" className="btn btn-primary" onClick={askPermission}>
            알림 권한 요청
          </button>
        )}
        <p className="muted" style={{ marginTop: 10 }}>
          브라우저 알림은 앱을 열었을 때 표시돼요. 앱이 닫혀 있는 동안에는
          알림을 보낼 수 없어, 할 일 탭의 배너가 가장 확실한 알림이에요.
        </p>
      </div>

      <div className="section-title">데이터 관리</div>
      <div className="card">
        <button
          type="button"
          className="btn"
          style={{ marginBottom: 10 }}
          onClick={exportJson}
        >
          백업 내보내기 (JSON)
        </button>
        <button
          type="button"
          className="btn"
          style={{ marginBottom: 10 }}
          onClick={() => fileRef.current?.click()}
        >
          백업 불러오기
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={onImportFile}
        />
        <button type="button" className="btn btn-danger" onClick={confirmReset}>
          모든 데이터 초기화
        </button>
      </div>

      <p className="muted" style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        모든 데이터는 이 브라우저에만 저장돼요.
      </p>
    </div>
  )
}
