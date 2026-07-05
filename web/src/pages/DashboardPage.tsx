import {
  AlertTriangle,
  CalendarCheck2,
  Building2,
  Droplets,
  Lightbulb,
  PackageX,
  Thermometer,
  Waves,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { adminAlerts, collectionStats, flowerInventory, sensors } from '../mock/dashboard'
import { useAuthStore } from '../store/useAuthStore'

const kpiIcons = {
  temperature: Thermometer,
  humidity: Droplets,
  light: Lightbulb,
  soil: Waves,
}

const kpiTones = {
  temperature: 'bg-orange-50 text-orange-600',
  humidity: 'bg-sky-50 text-sky-600',
  light: 'bg-amber-50 text-amber-600',
  soil: 'bg-emerald-50 text-emerald-600',
}

const alertConfig = {
  sensor: { icon: AlertTriangle, tone: 'bg-rose-50 text-rose-600' },
  reservation: { icon: CalendarCheck2, tone: 'bg-sky-50 text-sky-600' },
  inventory: { icon: PackageX, tone: 'bg-amber-50 text-amber-600' },
}

export function DashboardPage() {
  const operator = useAuthStore((state) => state.operator)

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold text-emerald-600">{operator?.role ?? '운영 관리자'} 전용 페이지</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-slate-900 md:text-3xl">{operator?.siteName ?? '스마트팜'} 운영 대시보드</h1>
          <p className="mt-2 text-sm text-slate-500">{operator?.siteLocation ?? '담당 운영지'}의 기기 상태와 순환 운영 현황을 확인하세요.</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          <Building2 size={16} />
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" /> 운영지 연결됨
        </div>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sensors.map((sensor) => {
          const Icon = kpiIcons[sensor.id]
          return (
            <article key={sensor.id} className="dashboard-card p-5">
              <div className="flex items-start justify-between">
                <div className={`grid size-11 place-items-center rounded-2xl ${kpiTones[sensor.id]}`}><Icon size={21} /></div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                  sensor.status === 'normal' ? 'bg-emerald-50 text-emerald-700' : sensor.status === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                }`}>{sensor.status === 'normal' ? '정상' : sensor.status === 'warning' ? '주의' : '위험'}</span>
              </div>
              <p className="mt-5 text-sm font-semibold text-slate-500">현재 {sensor.name}</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{sensor.value.toLocaleString()} <span className="text-sm text-slate-400">{sensor.unit}</span></p>
              <p className="mt-3 text-[11px] text-slate-400">정상 범위 {sensor.normalRange}</p>
            </article>
          )
        })}
      </section>

      <section className="dashboard-card mt-5 p-5 md:p-6">
        <div><h2 className="section-title">최근 알림</h2><p className="section-description">운영 확인이 필요한 새로운 소식</p></div>
        <div className="mt-5 divide-y divide-slate-100">
          {adminAlerts.map((alert) => {
            const { icon: Icon, tone } = alertConfig[alert.type]
            return (
              <div key={alert.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon size={18} /></div>
                <div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">{alert.title}</p><p className="truncate text-xs text-slate-400">{alert.description}</p></div>
                <time className="shrink-0 text-[11px] text-slate-400">{alert.time}</time>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <article className="dashboard-card p-5 md:p-6">
          <div><h2 className="section-title">계란껍질 수거량</h2><p className="section-description">최근 7일 수거량 통계 (kg)</p></div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={collectionStats} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs><linearGradient id="collectionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.25} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid vertical={false} stroke="#e9efec" strokeDasharray="4 4" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0' }} formatter={(value) => [`${value}kg`, '수거량']} />
                <Area type="monotone" dataKey="amount" stroke="#059669" strokeWidth={3} fill="url(#collectionFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-card p-5 md:p-6">
          <div><h2 className="section-title">꽃 재고 현황</h2><p className="section-description">품종별 현재 보유 수량 (주)</p></div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowerInventory} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e9efec" strokeDasharray="4 4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0' }} formatter={(value) => [`${value}주`, '재고']} />
                <Bar dataKey="stock" radius={[8, 8, 2, 2]} maxBarSize={52}>
                  {flowerInventory.map((item, index) => <Cell key={item.name} fill={index === 3 ? '#f59e0b' : '#10b981'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  )
}
