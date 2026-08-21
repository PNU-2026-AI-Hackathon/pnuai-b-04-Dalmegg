import { ArrowRight, CheckCircle2, CircleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { getDashboardSummary } from '../api/dashboard'
import { listFlowers } from '../api/flowers'
import { ROUTES } from '../constants/routes'
import { flowerInventory, sensors } from '../mock/dashboard'
import { useAuthStore } from '../store/useAuthStore'
import { useNotificationStore } from '../store/useNotificationStore'
import type { FlowerInventory } from '../types/dashboard'

const stateLabel = { normal: '정상', warning: '확인 필요', danger: '즉시 확인' }
const rangePosition = { temperature: 52, humidity: 54, light: 32, soil: 42 }

export function DashboardPage() {
  const navigate = useNavigate()
  const operator = useAuthStore((state) => state.operator)
  const alerts = useNotificationStore((state) => state.alerts)
  const setAlerts = useNotificationStore((state) => state.setAlerts)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const [dashboardFlowerInventory, setDashboardFlowerInventory] = useState<FlowerInventory[]>(flowerInventory)

  useEffect(() => {
    let ignore = false
    async function loadDashboardData() {
      try {
        const summary = await getDashboardSummary()
        if (!ignore) { setAlerts(summary.recent_alerts) }
      } catch { /* API unavailable: preserve existing operational data. */ }
      try {
        const flowers = await listFlowers(operator?.shop_id || undefined)
        if (!ignore && flowers.length > 0) setDashboardFlowerInventory(flowers.map((flower) => ({ name: flower.name, stock_quantity: flower.stock_quantity })))
      } catch { /* API unavailable: preserve existing operational data. */ }
    }
    loadDashboardData()
    return () => { ignore = true }
  }, [operator?.shop_id, setAlerts])

  const actionAlerts = alerts.filter((alert) => !alert.is_read)
  const normalSensorCount = sensors.filter((sensor) => sensor.status === 'normal').length
  const pendingReservations = actionAlerts.filter((alert) => alert.type === 'reservation').length
  const lowStockItems = actionAlerts.filter((alert) => alert.type === 'stock').length

  const navigateToAlert = (type: string) => {
    if (type === 'sensor') return ROUTES.sensors
    if (type === 'stock') return ROUTES.flowers
    return ROUTES.reservations
  }
  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-col justify-between gap-3 border-b border-[#d9e0d7] pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold tracking-[0.12em] text-rose-700">FARM OPERATIONS / TODAY</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-.05em] text-[#1d2921] md:text-[32px]">{operator?.shop_name ?? '스마트팜'} 운영 현황</h1>
          <p className="mt-2 text-sm text-slate-500">{operator?.address ?? '담당 운영지'} · 마지막 센서 수신 방금 전</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-800"><CheckCircle2 size={15} /> 시스템 연결 정상</div>
      </header>

      <section className="mt-5 grid gap-px overflow-hidden border border-[#d9e0d7] bg-[#d9e0d7] md:grid-cols-[1.15fr_1fr]">
        <div className="bg-[#fffefa] p-6 md:p-7">
          <div className="flex items-baseline justify-between"><div><h2 className="text-lg font-semibold tracking-[-.03em] text-[#1d2921]">재배 환경</h2><p className="mt-1 text-sm text-slate-500">현재값과 설정 정상 범위 비교</p></div><span className="text-xs font-medium text-slate-400">B동 2구역 기준</span></div>
          <dl className="mt-7 grid grid-cols-2 divide-x divide-y divide-[#e3e8e1] border-y border-[#e3e8e1] sm:grid-cols-4 sm:divide-y-0">
            {sensors.map((sensor) => (
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
        <div className="bg-[#fff5f8] p-6 md:p-7">
          <div className="flex items-start gap-3"><CircleAlert className="mt-0.5 text-rose-700" size={22} /><div><p className="text-xs font-bold tracking-[.08em] text-rose-800">우선 조치 필요</p><p className="mt-2 text-lg font-semibold tracking-[-.03em] text-[#283329]">토양수분이 정상 범위보다 낮습니다.</p><p className="mt-2 text-sm leading-5 text-slate-600">B동 2구역 · 현재 <strong className="font-semibold text-rose-700">42%</strong> / 정상 50–70%</p></div></div>
          <button type="button" onClick={() => navigate(ROUTES.sensors)} className="mt-6 inline-flex items-center gap-2 bg-rose-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-800">센서 상세 확인 <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="mt-7 grid items-start gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div>
          <div className="flex items-end justify-between border-b border-[#d9e0d7] pb-3"><div><h2 className="text-lg font-semibold tracking-[-.03em] text-[#1d2921]">확인이 필요한 운영 알림</h2><p className="mt-1 text-sm text-slate-500">지금 처리하면 되는 항목을 먼저 표시합니다.</p></div><span className="text-sm font-semibold text-slate-500">미확인 {actionAlerts.length}건</span></div>
          <div className="divide-y divide-[#dfe5dc]">
            {alerts.map((alert) => {
              const urgent = alert.severity === 'danger'
              const destination = navigateToAlert(alert.type)
              const actionLabel = alert.type === 'sensor' ? '센서 확인' : alert.type === 'stock' ? '재고 관리' : '예약 확인'
              return <button key={alert.id} type="button" onClick={() => { markAsRead(alert.id); navigate(destination) }} className={`grid w-full grid-cols-[5px_1fr_auto] gap-4 py-5 text-left hover:bg-[#fff7f9] ${alert.is_read ? 'opacity-60' : ''}`}>
                <span className={urgent ? 'bg-red-600' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-rose-600'} />
                <span><span className="text-xs font-bold text-slate-500">{urgent ? '위험' : alert.severity === 'warning' ? '주의' : '안내'} · {alert.type === 'sensor' ? '재배 환경' : alert.type === 'stock' ? '재고 관리' : '체험 운영'}</span><strong className="mt-1.5 block text-base font-semibold text-[#243029]">{alert.title}</strong><span className="mt-1.5 block text-sm text-slate-500">{alert.message}</span></span>
                <span className="self-center text-right text-xs font-bold text-rose-800">{alert.is_read ? '확인됨' : actionLabel}<ArrowRight className="ml-1 inline" size={13} /></span>
              </button>
            })}
          </div>
        </div>
        <aside className="border-l border-[#d9e0d7] pl-0 xl:pl-6">
          <h2 className="text-lg font-semibold tracking-[-.03em] text-[#1d2921]">오늘의 농장 운영</h2><p className="mt-1 text-sm text-slate-500">재배와 판매 준비 현황</p>
          <dl className="mt-5 divide-y divide-[#dfe5dc] border-y border-[#dfe5dc]">
            <div className="flex items-baseline justify-between py-4"><dt className="text-sm text-slate-500">정상 센서</dt><dd className="text-2xl font-semibold tracking-[-.05em] tabular-nums text-emerald-800">{normalSensorCount}<span className="ml-1 text-sm font-medium">/ {sensors.length}</span></dd></div>
            <button type="button" onClick={() => navigate(ROUTES.reservations)} className="flex w-full items-baseline justify-between py-4 text-left hover:bg-[#fff7f9]"><span className="text-sm text-slate-500">체험 예약 대기</span><span className="text-2xl font-semibold tracking-[-.05em] tabular-nums text-[#223529]">{pendingReservations}<span className="ml-1 text-sm font-medium">건</span></span></button>
            <button type="button" onClick={() => navigate(ROUTES.flowers)} className="flex w-full items-baseline justify-between py-4 text-left hover:bg-[#fff7f9]"><span className="text-sm text-slate-500">재고 주의 품목</span><span className="text-2xl font-semibold tracking-[-.05em] text-amber-700">{lowStockItems}<span className="ml-1 text-sm font-medium">품목</span></span></button>
          </dl>
        </aside>
      </section>

      <section className="mt-8">
        <article className="border-t border-[#b9c7b9] pt-4"><div className="flex items-start justify-between"><div><h2 className="section-title">꽃 재고 현황</h2><p className="section-description">판매 가능 수량 · 주 단위</p></div><button type="button" onClick={() => navigate(ROUTES.flowers)} className="text-xs font-bold text-rose-800 hover:text-rose-950">재고 관리 <ArrowRight className="ml-1 inline" size={13} /></button></div><div className="mt-4 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={dashboardFlowerInventory} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}><CartesianGrid vertical={false} stroke="#dfe5dc" strokeDasharray="3 3" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#59665d', fontSize: 11 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#748077', fontSize: 10 }} /><Tooltip contentStyle={{ borderRadius: 4, border: '1px solid #d5ddd4', boxShadow: 'none' }} formatter={(value) => [`${value}주`, '재고']} /><Bar dataKey="stock_quantity" radius={[2, 2, 0, 0]} maxBarSize={48}>{dashboardFlowerInventory.map((item, index) => <Cell key={item.name} fill={index === 3 ? '#bb7d26' : '#d15b86'} />)}</Bar></BarChart></ResponsiveContainer></div></article>
      </section>
    </div>
  )
}
