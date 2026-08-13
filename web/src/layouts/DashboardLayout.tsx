import {
  AlertTriangle,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleGauge,
  Egg,
  Flower2,
  Gamepad2,
  Gauge,
  LogOut,
  Menu,
  PackageX,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getCollectionTrends } from '../api/collections'
import { Logo } from '../components/Logo'
import { ROUTES } from '../constants/routes'
import { monthlyCollectionTrend } from '../mock/dashboard'
import { useAuthStore } from '../store/useAuthStore'
import { useFarmStore } from '../store/useFarmStore'
import { getUnreadAlertCount, useNotificationStore } from '../store/useNotificationStore'
import type { AdminAlert } from '../types/dashboard'

const navigation = [
  { label: '대시보드', path: ROUTES.dashboard, icon: CircleGauge },
  { label: '센서 모니터링', path: ROUTES.sensors, icon: Gauge },
  { label: '꽃 재고 관리', path: ROUTES.flowers, icon: Flower2 },
  { label: '예약 관리', path: ROUTES.reservations, icon: CalendarDays },
  { label: '계란껍질 수거 현황', path: ROUTES.eggShell, icon: Egg },
]

type AlertConfig = { icon: typeof AlertTriangle; tone: string }

const alertConfig: Record<'sensor' | 'reservation' | 'stock', AlertConfig> = {
  sensor: { icon: AlertTriangle, tone: 'bg-rose-50 text-rose-600' },
  reservation: { icon: CalendarDays, tone: 'bg-sky-50 text-sky-600' },
  stock: { icon: PackageX, tone: 'bg-amber-50 text-amber-600' },
}

const defaultAlertConfig: AlertConfig = { icon: AlertTriangle, tone: 'bg-slate-100 text-slate-600' }

function getAlertConfig(type: AdminAlert['type']) {
  return type in alertConfig ? alertConfig[type as keyof typeof alertConfig] : defaultAlertConfig
}

const latestMonthlyCollection = monthlyCollectionTrend[monthlyCollectionTrend.length - 1]

export function DashboardLayout() {
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [latestCollection, setLatestCollection] = useState(latestMonthlyCollection)
  const { sidebarOpen, toggleSidebar, closeSidebar } = useFarmStore()
  const operator = useAuthStore((state) => state.operator)
  const logout = useAuthStore((state) => state.logout)
  const alerts = useNotificationStore((state) => state.alerts)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const unreadCount = getUnreadAlertCount(alerts)

  useEffect(() => {
    let ignore = false

    async function loadLatestCollection() {
      try {
        const trends = await getCollectionTrends('monthly')
        const latestTrend = trends[trends.length - 1]

        if (!ignore && latestTrend) {
          setLatestCollection(latestTrend)
        }
      } catch {
        // 데이터를 불러오지 못하면 기존 화면 데이터를 유지합니다.
      }
    }

    loadLatestCollection()

    return () => {
      ignore = true
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f6f8f7]">
      {sidebarOpen && <button aria-label="메뉴 닫기" className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={closeSidebar} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 bg-white px-4 py-6 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <Link to={ROUTES.home}><Logo /></Link>
          <button className="text-slate-400 lg:hidden" onClick={closeSidebar} aria-label="메뉴 닫기"><X size={20} /></button>
        </div>
        <nav className="mt-10 space-y-1.5">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                  isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <Link to={ROUTES.simulator} onClick={closeSidebar} className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-500 hover:bg-emerald-50 hover:text-emerald-700">
            <Gamepad2 size={19} /> 꽃 재배 시뮬레이터
          </Link>
          <div className="mt-4 rounded-2xl bg-emerald-950 p-4 text-white">
            <p className="text-xs font-bold text-emerald-300">최근 월 수거량</p>
            <p className="mt-2 text-2xl font-extrabold">{latestCollection.weight_kg.toLocaleString()}kg</p>
            <p className="mt-1 text-[11px] font-semibold text-emerald-100/70">
              {latestCollection.period} · 수거 기록 {latestCollection.collection_count.toLocaleString()}회
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-[74px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-8">
          <button className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 lg:hidden" onClick={toggleSidebar} aria-label="메뉴 열기">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-slate-500">운영자 통합 관제 시스템</p>
            <p className="mt-0.5 text-xs font-bold text-emerald-700">{operator?.shop_name ?? '스마트팜 운영지'}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <button
                className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-600"
                aria-label="알림"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((isOpen) => !isOpen)}
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black leading-4 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-40 w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                  <div className="flex items-center justify-between border-b border-slate-100 p-4">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">알림</p>
                      <p className="mt-0.5 text-xs text-slate-400">미확인 {unreadCount}건</p>
                    </div>
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:text-slate-300 disabled:hover:bg-transparent"
                    >
                      전체 읽음
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {alerts.map((alert) => {
                      const { icon: Icon, tone } = getAlertConfig(alert.type)
                      return (
                        <button
                          key={alert.id}
                          type="button"
                          onClick={() => markAsRead(alert.id)}
                          className={`flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left last:border-b-0 hover:bg-slate-50 ${
                            alert.is_read ? 'bg-white' : 'bg-emerald-50/40'
                          }`}
                        >
                          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-extrabold text-slate-900">{alert.title}</span>
                              {!alert.is_read && <span className="size-2 shrink-0 rounded-full bg-rose-500" />}
                            </span>
                            <span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-500">{alert.message}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-100 text-xs font-extrabold text-emerald-700">운영</span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-bold text-slate-700">{operator?.full_name ?? '운영자'}</span>
                <span className="block text-[10px] text-slate-400">{operator?.region ?? '스마트팜 운영팀'}</span>
              </span>
              <ChevronDown className="text-slate-400" size={14} />
            </button>
            <button
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-500 hover:border-rose-200 hover:text-rose-600 sm:inline-flex"
              onClick={handleLogout}
            >
              <LogOut size={16} /> 로그아웃
            </button>
          </div>
        </header>
        <main className="p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
