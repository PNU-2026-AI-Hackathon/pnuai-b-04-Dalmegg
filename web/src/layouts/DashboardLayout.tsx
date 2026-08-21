import {
  AlertTriangle,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleGauge,
  Flower2,
  Gauge,
  LogOut,
  Menu,
  PackageX,
  X,
} from 'lucide-react'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { ROUTES } from '../constants/routes'
import { useAuthStore } from '../store/useAuthStore'
import { useFarmStore } from '../store/useFarmStore'
import { getUnreadAlertCount, useNotificationStore } from '../store/useNotificationStore'
import type { AdminAlert } from '../types/dashboard'

const navigation = [
  { label: '대시보드', path: ROUTES.dashboard, icon: CircleGauge },
  { label: '센서 모니터링', path: ROUTES.sensors, icon: Gauge },
  { label: '꽃 재고 관리', path: ROUTES.flowers, icon: Flower2 },
  { label: '예약 관리', path: ROUTES.reservations, icon: CalendarDays },
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

export function DashboardLayout() {
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({ shop_name: '', region: '' })
  const [profileSaved, setProfileSaved] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const { sidebarOpen, toggleSidebar, closeSidebar } = useFarmStore()
  const operator = useAuthStore((state) => state.operator)
  const logout = useAuthStore((state) => state.logout)
  const updateOperatorProfile = useAuthStore((state) => state.updateOperatorProfile)
  const alerts = useNotificationStore((state) => state.alerts)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const unreadCount = getUnreadAlertCount(alerts)

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.login, { replace: true })
  }

  const toggleProfile = () => {
    if (!profileOpen) {
      setProfileForm({
        shop_name: operator?.shop_name ?? '',
        region: operator?.region ?? '',
      })
    }
    setProfileOpen((isOpen) => !isOpen)
  }

  const handleProfileSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateOperatorProfile(profileForm)
    setProfileOpen(false)
    setProfileSaved(true)
  }

  useEffect(() => {
    if (!profileOpen) return
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [profileOpen])

  useEffect(() => {
    if (!profileSaved) return
    const timer = window.setTimeout(() => setProfileSaved(false), 2600)
    return () => window.clearTimeout(timer)
  }, [profileSaved])

  return (
    <div className="min-h-screen bg-[#f6f6f1]">
      {sidebarOpen && <button aria-label="메뉴 닫기" className="fixed inset-0 z-30 bg-[#152119]/35 lg:hidden" onClick={closeSidebar} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#d9e0d7] bg-[#f1f3ed] px-4 py-5 transition-transform duration-150 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <Link to={ROUTES.home}><Logo /></Link>
          <button className="text-slate-400 lg:hidden" onClick={closeSidebar} aria-label="메뉴 닫기"><X size={20} /></button>
        </div>
        <p className="mt-10 px-3 text-[10px] font-bold tracking-[0.12em] text-slate-400">운영 관리</p>
        <nav className="mt-2 space-y-0.5">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-[13px] font-semibold transition ${
                  isActive ? 'border-rose-700 bg-rose-100/70 text-rose-950' : 'border-transparent text-slate-600 hover:bg-white/70 hover:text-rose-800'
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#d9e0d7] bg-[#fdfdf9]/95 px-4 backdrop-blur md:px-8">
          <button className="grid size-9 place-items-center rounded-md border border-[#d5ddd4] text-slate-600 lg:hidden" onClick={toggleSidebar} aria-label="메뉴 열기">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block">
            <p className="text-xs font-medium text-slate-500">운영 관제</p>
            <p className="mt-0.5 text-sm font-semibold text-[#1d3224]">{operator?.shop_name ?? '스마트팜 운영지'}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div ref={profileRef} className="relative">
              <button
                className="relative grid size-9 place-items-center text-slate-500 hover:text-rose-700"
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
                <div className="absolute right-0 top-11 z-40 w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-lg border border-[#d5ddd4] bg-[#fffefa] shadow-xl shadow-slate-900/10">
                  <div className="flex items-center justify-between border-b border-[#e5e9e3] p-4">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">알림</p>
                      <p className="mt-0.5 text-xs text-slate-400">미확인 {unreadCount}건</p>
                    </div>
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:text-slate-300 disabled:hover:bg-transparent"
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
                          className={`flex w-full items-start gap-3 border-b border-[#e5e9e3] p-4 text-left last:border-b-0 hover:bg-[#f5f8f3] ${
                            alert.is_read ? 'bg-[#fffefa]' : 'bg-rose-50/40'
                          }`}
                        >
                          <span className={`grid size-8 shrink-0 place-items-center rounded-md ${tone}`}><Icon size={16} /></span>
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
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-1 transition hover:bg-rose-50"
                onClick={toggleProfile}
                aria-expanded={profileOpen}
                aria-haspopup="dialog"
              >
                <span className="grid size-8 place-items-center rounded-full bg-[#dcebdc] text-[10px] font-bold text-rose-800">운영</span>
                <span className="hidden text-left sm:block">
                  <span className="block text-xs font-bold text-slate-700">{operator?.full_name ?? '운영자'}</span>
                  <span className="block text-[10px] text-slate-400">{operator?.region ?? '스마트팜 운영팀'}</span>
                </span>
                <ChevronDown className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} size={14} />
              </button>

              {profileOpen && (
                <form
                  onSubmit={handleProfileSave}
                  role="dialog"
                  aria-label="운영자 프로필 설정"
                  className="absolute right-0 top-12 z-40 w-[min(calc(100vw-2rem),20rem)] rounded-xl border border-[#d5ddd4] bg-[#fffefa] p-5 shadow-xl shadow-slate-900/10"
                >
                  <div className="flex items-start gap-3 border-b border-[#e5e9e3] pb-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-xs font-extrabold text-rose-800">운영</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-extrabold text-slate-900">{operator?.full_name ?? '운영자'}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-400">{operator?.email ?? '운영자 계정'}</span>
                    </span>
                  </div>
                  <div className="space-y-3 py-4">
                    <label className="block text-xs font-bold text-slate-600">
                      농장 · 꽃가게 이름
                      <input
                        value={profileForm.shop_name}
                        onChange={(event) => setProfileForm((current) => ({ ...current, shop_name: event.target.value }))}
                        className="form-input mt-1.5 !w-full !px-3 !py-2.5 text-sm"
                        placeholder="예: 산지니 플라워"
                      />
                    </label>
                    <label className="block text-xs font-bold text-slate-600">
                      운영 지역
                      <input
                        value={profileForm.region}
                        onChange={(event) => setProfileForm((current) => ({ ...current, region: event.target.value }))}
                        className="form-input mt-1.5 !w-full !px-3 !py-2.5 text-sm"
                        placeholder="예: 부산"
                      />
                    </label>
                    <p className="text-[11px] leading-4 text-slate-400">저장하면 이 브라우저의 운영자 정보와 상단 관제명이 바로 바뀝니다.</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setProfileOpen(false)} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100">취소</button>
                    <button type="submit" className="rounded-lg bg-rose-700 px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-rose-800">저장</button>
                  </div>
                </form>
              )}
            </div>
            <button
              className="hidden items-center gap-2 border-l border-[#d9e0d7] pl-3.5 text-xs font-bold text-slate-500 hover:text-rose-600 sm:inline-flex"
              onClick={handleLogout}
            >
              <LogOut size={16} /> 로그아웃
            </button>
          </div>
        </header>
        {profileSaved && <div role="status" className="fixed right-4 top-20 z-50 rounded-lg bg-[#24352a] px-4 py-3 text-xs font-bold text-white shadow-lg md:right-8">운영자 정보가 저장되었습니다.</div>}
        <main className="p-4 md:p-7"><Outlet /></main>
      </div>
    </div>
  )
}
