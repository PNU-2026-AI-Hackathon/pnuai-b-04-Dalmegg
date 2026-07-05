import {
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
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { ROUTES } from '../constants/routes'
import { useAuthStore } from '../store/useAuthStore'
import { useFarmStore } from '../store/useFarmStore'

const navigation = [
  { label: 'Dashboard', path: ROUTES.dashboard, icon: CircleGauge },
  { label: '센서 모니터링', path: ROUTES.sensors, icon: Gauge },
  { label: '꽃 재고관리', path: ROUTES.flowers, icon: Flower2 },
  { label: '예약관리', path: ROUTES.reservations, icon: CalendarDays },
  { label: '계란껍질 수거현황', path: ROUTES.eggShell, icon: Egg },
]

export function DashboardLayout() {
  const navigate = useNavigate()
  const { sidebarOpen, toggleSidebar, closeSidebar } = useFarmStore()
  const operator = useAuthStore((state) => state.operator)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
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
            <p className="text-xs font-bold text-emerald-300">이번 달 순환 기여도</p>
            <p className="mt-2 text-2xl font-extrabold">92%</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[92%] rounded-full bg-emerald-400" /></div>
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
            <p className="mt-0.5 text-xs font-bold text-emerald-700">{operator?.siteName ?? '스마트팜 운영지'}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-emerald-600" aria-label="알림">
              <Bell size={19} />
              <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-rose-500" />
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-100 text-xs font-extrabold text-emerald-700">관리</span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-bold text-slate-700">{operator?.name ?? '운영자'}</span>
                <span className="block text-[10px] text-slate-400">{operator?.organization ?? '스마트팜 운영팀'}</span>
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
