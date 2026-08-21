import {
  ArrowRight,
  CheckCircle2,
  Gift,
  Leaf,
  Menu,
  Recycle,
  ShoppingBasket,
  Sprout,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { ROUTES } from '../constants/routes'

const services = [
  { icon: Recycle, title: '지역 자원 순환', description: '지역에서 모인 자원을 지속 가능한 재배 환경으로 연결합니다.', tone: 'bg-rose-50 text-rose-600' },
  { icon: Leaf, title: '재배 환경 관리', description: '센서 데이터와 자동 제어로 건강한 생육 환경을 유지합니다.', tone: 'bg-rose-50 text-rose-600' },
  { icon: Sprout, title: '스마트 꽃 재배', description: '운영 데이터를 바탕으로 아름다운 지역 화훼를 키웁니다.', tone: 'bg-rose-50 text-rose-600' },
  { icon: ShoppingBasket, title: '꽃 판매 및 체험', description: '지역에서 자란 꽃과 체험을 통해 가치를 공유합니다.', tone: 'bg-rose-50 text-rose-600' },
]

const cycleSteps = [
  { icon: Recycle, title: '지역 자원 연결' },
  { icon: Leaf, title: '생육 환경 관리' },
  { icon: Sprout, title: '꽃 재배' },
  { icon: ShoppingBasket, title: '판매·체험 운영' },
  { icon: Gift, title: '지역 가치 환원' },
]

const participation = [
  { value: '3개', label: '운영 재배 구역', icon: Leaf },
  { value: '1,286명', label: '함께한 참여자', icon: Users },
  { value: '12,460송이', label: '생산된 꽃', icon: Sprout },
]

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen overflow-hidden bg-[#fafaf6] text-slate-900">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#d9e0d7] bg-[#fafaf6]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-600 md:flex">
            <a href="#service" className="hover:text-rose-600">서비스</a>
            <a href="#cycle" className="hover:text-rose-600">순환 구조</a>
            <a href="#impact" className="hover:text-rose-600">참여 현황</a>
            <Link to={ROUTES.login} className="border border-rose-800 bg-rose-800 px-4 py-2 text-xs text-white hover:bg-rose-900">운영자 로그인</Link>
          </nav>
          <button className="text-slate-700 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴 열기">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-600">
              <a href="#service" onClick={() => setMenuOpen(false)}>서비스</a>
              <a href="#cycle" onClick={() => setMenuOpen(false)}>순환 구조</a>
              <a href="#impact" onClick={() => setMenuOpen(false)}>참여 현황</a>
              <Link to={ROUTES.login} className="text-rose-700">운영자 로그인</Link>
            </div>
          </nav>
        )}
      </header>

      <main>
        <section className="relative border-b border-[#d9e0d7] px-5 pb-14 pt-28 lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl items-end gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 border-l-2 border-rose-700 pl-3 text-[11px] font-bold tracking-[.1em] text-rose-800">
                <Leaf size={15} /> 순환형 스마트 플라워팜 플랫폼
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.12] tracking-[-.065em] text-[#1c2b20] sm:text-5xl lg:text-6xl">
                더 나은 재배 환경에서<br /><span className="text-rose-800">꽃을 키우는 운영</span>으로
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-7 text-slate-600">
                BLOOM:IN은 스마트 화훼 재배와 현장 운영, 지역 순환 활동을 연결하는 부산의 데이터 기반 플라워팜 운영 시스템입니다.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <a href="#cycle" className="inline-flex items-center gap-2 bg-rose-800 px-5 py-3 text-xs font-bold text-white hover:bg-rose-900">
                  순환 운영 방식 보기 <ArrowRight size={16} />
                </a>
                <Link to={ROUTES.login} className="text-xs font-bold text-rose-800 underline underline-offset-4">운영자 시스템 접속</Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-rose-600" /> 유휴공간 재생</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-rose-600" /> 실시간 환경 관리</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-rose-600" /> 재배·판매·체험 연계</span>
              </div>
            </div>

            <div className="w-full border-y border-[#cfd8cc] bg-[#f1f4ed] px-5 py-6 sm:px-7">
              <div className="flex items-center justify-between border-b border-[#cfd8cc] pb-4"><div><p className="text-[10px] font-bold tracking-[.1em] text-rose-800">CIRCULAR FARM STATUS</p><p className="mt-1 text-sm font-semibold text-[#24342a]">오늘의 자원 순환 흐름</p></div><p className="text-xs text-slate-500">2026. 08. 21</p></div>
              <div className="mt-5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
                <div><Leaf className="mx-auto text-rose-700" size={23}/><p className="mt-2 text-xs font-semibold">환경 관리</p><p className="mt-1 text-[11px] text-slate-500">실시간 점검</p></div><ArrowRight className="text-[#90a18e]" size={16}/><div><Recycle className="mx-auto text-rose-700" size={23}/><p className="mt-2 text-xs font-semibold">순환 운영</p><p className="mt-1 text-[11px] text-slate-500">지역 연계</p></div><ArrowRight className="text-[#90a18e]" size={16}/><div><Sprout className="mx-auto text-rose-700" size={23}/><p className="mt-2 text-xs font-semibold">꽃 재배</p><p className="mt-1 text-[11px] text-slate-500">생육 관리</p></div>
              </div>
              <div className="mt-6 border-t border-[#cfd8cc] pt-4 text-xs leading-5 text-slate-600">현장 센서, 꽃 재고, 체험 예약을 하나의 운영 흐름으로 관리합니다.</div>
            </div>
          </div>
        </section>

        <section id="service" className="scroll-mt-20 px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center"><p className="eyebrow">OUR SERVICE</p><h2 className="landing-title">버려지는 것에서<br className="sm:hidden" /> 새로운 가치를 만듭니다</h2><p className="landing-description">수거부터 재배와 체험까지, 지역 안에서 완성되는 자원 순환 서비스입니다.</p></div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map(({ icon: Icon, title, description, tone }, index) => (
                <article key={title} className="group rounded-3xl border border-slate-200/80 bg-white p-7 transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-950/5">
                  <div className="flex items-center justify-between"><div className={`grid size-12 place-items-center rounded-2xl ${tone}`}><Icon size={23} /></div><span className="text-xs font-black text-slate-200">0{index + 1}</span></div>
                  <h3 className="mt-6 text-lg font-extrabold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="cycle" className="scroll-mt-20 bg-rose-950 px-5 py-24 text-white lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl"><p className="text-xs font-black tracking-[0.2em] text-rose-300">CIRCULAR SYSTEM</p><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">재배와 지역을 연결하는 운영의 흐름</h2><p className="mt-4 leading-7 text-rose-100/60">환경 데이터와 현장 운영, 지역 참여가 하나의 지속 가능한 흐름으로 이어집니다.</p><p className="mt-3 text-xs leading-5 text-rose-200/70">계란껍질 수거·자원화 활동은 이 흐름을 보완하는 지역 순환 사례 중 하나입니다.</p></div>
            <div className="mt-14 grid gap-3 md:grid-cols-5">
              {cycleSteps.map(({ icon: Icon, title }, index) => (
                <div key={title} className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:block md:text-center">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-rose-400 text-rose-950 md:mx-auto"><Icon size={23} /></div>
                  <div className="md:mt-4"><p className="text-[10px] font-bold text-rose-300">STEP {index + 1}</p><h3 className="mt-1 text-sm font-extrabold">{title}</h3></div>
                  {index < cycleSteps.length - 1 && <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 text-rose-400 md:block" size={20} />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="impact" className="scroll-mt-20 bg-[#f5f8f5] px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center"><p className="eyebrow">OUR IMPACT</p><h2 className="landing-title">함께 만든 변화</h2><p className="landing-description">참여가 쌓일수록 우리 지역은 더 푸르고 건강해집니다.</p></div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {participation.map(({ value, label, icon: Icon }) => (
                <article key={label} className="rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-700"><Icon size={22} /></div>
                  <p className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{value}</p><p className="mt-2 text-sm font-bold text-slate-500">{label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 px-5 py-12 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div><Logo /><p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">데이터 기반 스마트 화훼 재배와 지역 순환을 연결하는 운영 플랫폼</p></div>
          <div className="text-sm text-slate-500"><p>© 2026 BLOOM:IN. All rights reserved.</p><Link to={ROUTES.login} className="mt-2 inline-block hover:text-rose-400">운영자 로그인</Link></div>
        </div>
      </footer>
    </div>
  )
}
