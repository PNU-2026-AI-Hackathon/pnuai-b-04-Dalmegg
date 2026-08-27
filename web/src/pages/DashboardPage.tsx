import { ArrowRight, CheckCircle2, CircleAlert, CloudOff } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { getDashboardSummary } from '../api/dashboard'
import { listFlowers } from '../api/flowers'
import { listAdminReservations } from '../api/reservations'
import { getLatestSensorReading, listSensorDevices } from '../api/sensors'
import type { SensorLatestRead } from '../api/types'
import { Modal } from '../components/Modal'
import { ROUTES } from '../constants/routes'
import { flowerInventory, reservations, sensors } from '../mock/dashboard'
import { useAuthStore } from '../store/useAuthStore'
import { useNotificationStore } from '../store/useNotificationStore'
import type { AdminAlert, FlowerInventory, Reservation, SensorData } from '../types/dashboard'

const stateLabel = { normal: '정상', warning: '확인 필요', danger: '즉시 확인' }
const rangePosition = { temperature: 52, humidity: 54, light: 32, soil: 42 }

const sensorDefinition = [
  { id: 'temperature', name: '온도', unit: '°C', key: 'temperature_c', min: 20, max: 26 },
  { id: 'humidity', name: '습도', unit: '%', key: 'humidity_pct', min: 60, max: 75 },
  { id: 'light', name: '조도', unit: 'lx', key: 'light_lux', min: 15000, max: 25000 },
  { id: 'soil', name: '토양수분', unit: '%', key: 'soil_moisture_pct', min: 50, max: 70 },
] as const

function getSensorStatus(value: number, min: number, max: number): SensorData['status'] {
  if (value < min || value > max) return Math.abs(value - (value < min ? min : max)) > (max - min) * 0.2 ? 'danger' : 'warning'
  return 'normal'
}

function parseSensorTimestamp(value: string) {
  return new Date(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`)
}

function formatSensorTime(value?: string, currentTimeMs = 0) {
  if (!value) return '수신 시각 없음'
  const date = parseSensorTimestamp(value)
  if (Number.isNaN(date.getTime())) return value
  const minutes = Math.max(0, Math.round((currentTimeMs - date.getTime()) / 60000))
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' }).format(date)
}

function toSensorData(latest: SensorLatestRead, currentTimeMs: number): SensorData[] {
  return sensorDefinition.flatMap((definition) => {
    const value = latest[definition.key]
    if (value === null || value === undefined) return []
    return [{
      id: definition.id,
      name: definition.name,
      value,
      unit: definition.unit,
      normalRange: `${definition.min.toLocaleString()}–${definition.max.toLocaleString()}${definition.unit}`,
      status: getSensorStatus(value, definition.min, definition.max),
      updatedAt: formatSensorTime(latest.measured_at, currentTimeMs),
    }]
  })
}

function navigateToAlert(type: string) {
  if (type === 'sensor') return ROUTES.sensors
  if (type === 'stock') return ROUTES.flowers
  return ROUTES.reservations
}

export function DashboardPage() {
  const navigate = useNavigate()
  const operator = useAuthStore((state) => state.operator)
  const alerts = useNotificationStore((state) => state.alerts)
  const setAlerts = useNotificationStore((state) => state.setAlerts)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const resolveAlert = useNotificationStore((state) => state.resolveAlert)
  const [dashboardFlowerInventory, setDashboardFlowerInventory] = useState<FlowerInventory[]>(flowerInventory)
  const [reservationItems, setReservationItems] = useState<Reservation[]>(reservations)
  const [sensorItems, setSensorItems] = useState<SensorData[]>(sensors)
  const [sensorUpdatedAt, setSensorUpdatedAt] = useState<string | null>(null)
  const [sensorSource, setSensorSource] = useState<'live' | 'fallback'>('fallback')
  const [currentTimeMs, setCurrentTimeMs] = useState(0)
  const [resolvingAlert, setResolvingAlert] = useState<AdminAlert | null>(null)
  const [resolutionNote, setResolutionNote] = useState('')

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTimeMs(Date.now())
    updateCurrentTime()
    const intervalId = window.setInterval(updateCurrentTime, 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    let ignore = false
    async function loadDashboardData() {
      try {
        const summary = await getDashboardSummary()
        if (!ignore && summary.recent_alerts.length > 0) setAlerts(summary.recent_alerts)
      } catch { /* Preserve the operator's local alert queue when unavailable. */ }

      try {
        const flowers = await listFlowers(operator?.shop_id || undefined)
        if (!ignore && flowers.length > 0) setDashboardFlowerInventory(flowers.map((flower) => ({ name: flower.name, stock_quantity: flower.stock_quantity })))
      } catch { /* Keep demonstration data when the inventory API is unavailable. */ }

      try {
        const nextReservations = await listAdminReservations({ shopId: operator?.shop_id || undefined })
        if (!ignore) setReservationItems(nextReservations)
      } catch { /* Keep demonstration data when the reservation API is unavailable. */ }

      try {
        const devices = await listSensorDevices()
        const device = [...devices].sort((a, b) => (b.last_seen_at ?? '').localeCompare(a.last_seen_at ?? ''))[0]
        if (!device) throw new Error('No sensor device')
        const latest = await getLatestSensorReading(device.farm_uid, device.device_uid)
        const nextSensors = toSensorData(latest, Date.now())
        if (!ignore && nextSensors.length > 0) {
          setSensorItems(nextSensors)
          setSensorUpdatedAt(latest.measured_at)
          setSensorSource('live')
        }
      } catch {
        if (!ignore) setSensorSource('fallback')
      }
    }
    loadDashboardData()
    return () => { ignore = true }
  }, [operator?.shop_id, setAlerts])

  const actionAlerts = alerts.filter((alert) => !alert.is_resolved)
  const normalSensorCount = sensorItems.filter((sensor) => sensor.status === 'normal').length
  const pendingReservations = reservationItems.filter((item) => item.status === 'reserved').length
  const lowStockItems = dashboardFlowerInventory.filter((item) => item.stock_quantity > 0 && item.stock_quantity <= 5).length
  const sensorIssue = sensorItems.find((sensor) => sensor.status !== 'normal')
  const isSensorStale = sensorUpdatedAt ? currentTimeMs - parseSensorTimestamp(sensorUpdatedAt).getTime() > 10 * 60 * 1000 : false
  const sensorTrustText = sensorSource === 'live' && !isSensorStale ? `실시간 수신 · ${formatSensorTime(sensorUpdatedAt ?? undefined, currentTimeMs)}` : sensorSource === 'live' ? '수신 지연 · 데이터 확인 필요' : '연결 확인 필요 · 예시값 표시 중'
  const sortedInventory = useMemo(() => [...dashboardFlowerInventory].sort((a, b) => a.stock_quantity - b.stock_quantity), [dashboardFlowerInventory])

  const openResolve = (alert: AdminAlert) => {
    setResolvingAlert(alert)
    setResolutionNote(alert.resolution_note ?? '')
  }

  const submitResolution = () => {
    if (!resolvingAlert) return
    resolveAlert(resolvingAlert.id, resolutionNote)
    setResolvingAlert(null)
    setResolutionNote('')
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-col justify-between gap-3 border-b border-[#d9e0d7] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold tracking-[0.12em] text-rose-700">FARM OPERATIONS / TODAY</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-.05em] text-[#1d2921] md:text-[32px]">{operator?.shop_name ?? '스마트팜'} 운영 현황</h1>
          <p className="mt-2 text-sm text-slate-500">{operator?.address ?? '담당 운영지'} · 센서 기준 {formatSensorTime(sensorUpdatedAt ?? undefined, currentTimeMs)}</p>
        </div>
        <div className={`flex items-center gap-2 text-xs font-bold ${sensorSource === 'live' && !isSensorStale ? 'text-emerald-800' : 'text-amber-800'}`}>
          {sensorSource === 'live' && !isSensorStale ? <CheckCircle2 size={15} /> : <CloudOff size={15} />} {sensorTrustText}
        </div>
      </header>

      <section className="mt-5 grid gap-px overflow-hidden border border-[#d9e0d7] bg-[#d9e0d7] md:grid-cols-[1.15fr_1fr]">
        <div className="bg-[#fffefa] p-6 md:p-7">
          <div className="flex items-baseline justify-between"><div><h2 className="text-lg font-semibold tracking-[-.03em] text-[#1d2921]">재배 환경</h2><p className="mt-1 text-sm text-slate-500">현재값과 설정 정상 범위 비교</p></div><span className="text-xs font-medium text-slate-400">실시간 센서 기준</span></div>
          <dl className="mt-7 grid grid-cols-2 divide-x divide-y divide-[#e3e8e1] border-y border-[#e3e8e1] sm:grid-cols-4 sm:divide-y-0">
            {sensorItems.map((sensor) => (
              <div key={sensor.id} className="min-w-0 px-4 py-4 first:pl-0 sm:first:pl-0">
                <dt className="text-xs font-semibold text-slate-600">{sensor.name}</dt>
                <dd className={`mt-1.5 whitespace-nowrap text-[30px] font-semibold leading-none tracking-[-.06em] tabular-nums md:text-[34px] ${sensor.status === 'danger' ? 'text-rose-700' : sensor.status === 'warning' ? 'text-amber-700' : 'text-[#24352a]'}`}>{sensor.value.toLocaleString()}<span className="ml-1 text-xs font-semibold tracking-normal text-slate-500">{sensor.unit}</span></dd>
                <div className="relative mt-4 h-1.5 bg-[#e4e9e2]"><span className={`absolute top-0 size-1.5 -translate-x-1/2 rounded-full ${sensor.status === 'normal' ? 'bg-emerald-600' : sensor.status === 'warning' ? 'bg-amber-500' : 'bg-rose-600'}`} style={{ left: `${rangePosition[sensor.id]}%` }} /></div>
                <p className="mt-2 text-[11px] text-slate-500">정상 범위 {sensor.normalRange}</p>
                <p className={`mt-1 text-[11px] font-bold ${sensor.status === 'normal' ? 'text-emerald-700' : sensor.status === 'warning' ? 'text-amber-700' : 'text-red-700'}`}>{stateLabel[sensor.status]}</p>
              </div>
            ))}
          </dl>
        </div>
        <div className={sensorIssue ? 'bg-[#fff5f8] p-6 md:p-7' : 'bg-[#f2f8f3] p-6 md:p-7'}>
          {sensorIssue ? <><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 text-rose-700" size={22} /><div><p className="text-xs font-bold tracking-[.08em] text-rose-800">우선 조치 필요</p><p className="mt-2 text-lg font-semibold tracking-[-.03em] text-[#283329]">{sensorIssue.name} 수치가 정상 범위를 벗어났습니다.</p><p className="mt-2 text-sm leading-5 text-slate-600">현재 <strong className="font-semibold text-rose-700">{sensorIssue.value.toLocaleString()}{sensorIssue.unit}</strong> / 정상 {sensorIssue.normalRange}</p><p className="mt-2 text-xs font-semibold text-rose-800">권장 조치: {sensorIssue.id === 'soil' ? '급수 상태와 관수 장치를 확인하세요.' : '센서 및 재배 환경을 점검하세요.'}</p></div></div><button type="button" onClick={() => navigate(ROUTES.sensors)} className="mt-6 inline-flex items-center gap-2 bg-rose-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-800">센서 상세 확인 <ArrowRight size={15} /></button></> : <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 text-emerald-700" size={22} /><div><p className="text-xs font-bold tracking-[.08em] text-emerald-800">재배 환경 안정</p><p className="mt-2 text-lg font-semibold tracking-[-.03em] text-[#283329]">모든 센서가 정상 범위에 있습니다.</p><p className="mt-2 text-sm leading-5 text-slate-600">다음 수신값도 자동으로 점검합니다.</p></div></div>}
        </div>
      </section>

      <section className="mt-7 grid items-start gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div>
          <div className="flex items-end justify-between border-b border-[#d9e0d7] pb-3"><div><h2 className="text-lg font-semibold tracking-[-.03em] text-[#1d2921]">확인이 필요한 운영 알림</h2><p className="mt-1 text-sm text-slate-500">확인 후 조치 내용을 남기고 완료 처리하세요.</p></div><span className="text-sm font-semibold text-slate-500">미조치 {actionAlerts.length}건</span></div>
          <div className="divide-y divide-[#dfe5dc]">
            {alerts.map((alert) => {
              const urgent = alert.severity === 'danger'
              const actionLabel = alert.type === 'sensor' ? '센서 확인' : alert.type === 'stock' ? '재고 관리' : '예약 확인'
              return <article key={alert.id} className={`grid grid-cols-[5px_1fr_auto] gap-4 py-5 ${alert.is_resolved ? 'opacity-55' : ''}`}><span className={urgent ? 'bg-red-600' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-rose-600'} /><div><span className="text-xs font-bold text-slate-500">{alert.is_resolved ? '조치 완료' : urgent ? '위험' : alert.severity === 'warning' ? '주의' : '안내'} · {alert.type === 'sensor' ? '재배 환경' : alert.type === 'stock' ? '재고 관리' : '체험 운영'}</span><strong className="mt-1.5 block text-base font-semibold text-[#243029]">{alert.title}</strong><span className="mt-1.5 block text-sm text-slate-500">{alert.is_resolved ? alert.resolution_note : alert.message}</span></div><div className="flex self-center flex-col items-end gap-2"><button type="button" onClick={() => { markAsRead(alert.id); navigate(navigateToAlert(alert.type)) }} className="text-xs font-bold text-rose-800 hover:text-rose-950">{actionLabel}<ArrowRight className="ml-1 inline" size={13} /></button>{!alert.is_resolved && <button type="button" onClick={() => openResolve(alert)} className="rounded-md border border-emerald-200 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-50">조치 완료</button>}</div></article>
            })}
          </div>
        </div>
        <aside className="border-l border-[#d9e0d7] pl-0 xl:pl-6"><h2 className="text-lg font-semibold tracking-[-.03em] text-[#1d2921]">오늘의 농장 운영</h2><p className="mt-1 text-sm text-slate-500">실제 예약·재고 데이터 기준</p><dl className="mt-5 divide-y divide-[#dfe5dc] border-y border-[#dfe5dc]"><div className="flex items-baseline justify-between py-4"><dt className="text-sm text-slate-500">정상 센서</dt><dd className="text-2xl font-semibold tracking-[-.05em] tabular-nums text-emerald-800">{normalSensorCount}<span className="ml-1 text-sm font-medium">/ {sensorItems.length}</span></dd></div><button type="button" onClick={() => navigate(ROUTES.reservations)} className="flex w-full items-baseline justify-between py-4 text-left hover:bg-[#fff7f9]"><span className="text-sm text-slate-500">체험 예약 대기</span><span className="text-2xl font-semibold tracking-[-.05em] tabular-nums text-[#223529]">{pendingReservations}<span className="ml-1 text-sm font-medium">건</span></span></button><button type="button" onClick={() => navigate(ROUTES.flowers)} className="flex w-full items-baseline justify-between py-4 text-left hover:bg-[#fff7f9]"><span className="text-sm text-slate-500">재고 주의 품목</span><span className="text-2xl font-semibold tracking-[-.05em] text-amber-700">{lowStockItems}<span className="ml-1 text-sm font-medium">품목</span></span></button></dl></aside>
      </section>

      <section className="mt-8"><article className="border-t border-[#b9c7b9] pt-4"><div className="flex items-start justify-between"><div><h2 className="section-title">꽃 재고 현황</h2><p className="section-description">판매 가능 수량 · 주 단위</p></div><button type="button" onClick={() => navigate(ROUTES.flowers)} className="text-xs font-bold text-rose-800 hover:text-rose-950">재고 관리 <ArrowRight className="ml-1 inline" size={13} /></button></div><div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={sortedInventory} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}><CartesianGrid vertical={false} stroke="#dfe5dc" strokeDasharray="3 3" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#59665d', fontSize: 11 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#748077', fontSize: 10 }} /><Tooltip contentStyle={{ borderRadius: 4, border: '1px solid #d5ddd4', boxShadow: 'none' }} formatter={(value) => [`${value}주`, '재고']} /><Bar dataKey="stock_quantity" radius={[2, 2, 0, 0]} maxBarSize={48}>{sortedInventory.map((item) => <Cell key={item.name} fill={item.stock_quantity > 0 && item.stock_quantity <= 5 ? '#d97706' : item.stock_quantity === 0 ? '#e11d48' : '#d15b86'} />)}</Bar></BarChart></ResponsiveContainer></div></article></section>

      {resolvingAlert && <Modal title="조치 완료 처리" description={resolvingAlert.title} onClose={() => setResolvingAlert(null)}><label className="block"><span className="form-label">조치 내용</span><textarea value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} className="form-input min-h-28 resize-none" placeholder="예: 급수 장치 점검 후 관수를 완료했습니다." /></label><p className="mt-3 text-xs leading-5 text-slate-500">완료 처리한 항목은 알림 목록에 이력으로 남습니다.</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setResolvingAlert(null)} className="secondary-button">취소</button><button type="button" onClick={submitResolution} className="primary-button">조치 완료</button></div></Modal>}
    </div>
  )
}
