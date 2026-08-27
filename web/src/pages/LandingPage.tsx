import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Gauge,
  Leaf,
  Menu,
  ShoppingBasket,
  Sprout,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { ROUTES } from '../constants/routes'

const services = [
  { icon: Building2, title: '유휴공간 활용', description: '비어 있던 도심 공간에 작은 플라워팜을 만들고, 공간에 새로운 쓰임을 더합니다.', tone: 'bg-rose-50 text-rose-600' },
  { icon: Gauge, title: '재배 환경 관리', description: '센서 데이터를 바탕으로 꽃이 건강하게 자랄 수 있는 환경을 꾸준히 돌봅니다.', tone: 'bg-rose-50 text-rose-600' },
  { icon: Sprout, title: '스마트 꽃 재배', description: '재배 데이터를 바탕으로 계절과 공간에 어울리는 꽃을 정성껏 키웁니다.', tone: 'bg-rose-50 text-rose-600' },
  { icon: ShoppingBasket, title: '판매·체험 연결', description: '자란 꽃을 판매와 체험으로 이어, 지역에서 가까운 꽃의 경험을 만듭니다.', tone: 'bg-rose-50 text-rose-600' },
]

const bloomInApproach = [
  {
    number: '01',
    icon: Building2,
    title: '공간에 새로운 쓰임을',
    description: '도심의 유휴공간을 지역을 위한 작고 가까운 플라워팜으로 바꿉니다.',
  },
  {
    number: '02',
    icon: Gauge,
    title: '재배는 더 안정적으로',
    description: '환경 데이터를 살피며 꽃이 건강하게 자랄 수 있는 하루를 함께 만듭니다.',
  },
  {
    number: '03',
    icon: CalendarDays,
    title: '꽃은 더 가까이',
    description: '자란 꽃은 판매와 체험을 통해 지역의 일상 속에서 다시 만날 수 있습니다.',
  },
]

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen overflow-hidden bg-[#fafaf6] text-slate-900">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#d9e0d7] bg-[#fafaf6]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-600 md:flex">
            <a href="#service" className="hover:text-rose-600">서비스 소개</a>
            <a href="#impact" className="hover:text-rose-600">BLOOM:IN 소개</a>
            <Link to={ROUTES.login} className="border border-rose-800 bg-rose-800 px-4 py-2 text-xs text-white hover:bg-rose-900">운영자 로그인</Link>
          </nav>
          <button className="text-slate-700 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="메뉴 열기">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-slate-100 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-600">
              <a href="#service" onClick={() => setMenuOpen(false)}>서비스 소개</a>
              <a href="#impact" onClick={() => setMenuOpen(false)}>BLOOM:IN 소개</a>
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
                <Leaf size={15} /> URBAN FLOWER FARM PROJECT
              </span>
              <h1 className="mt-6 text-3xl font-semibold leading-[1.22] tracking-[-.045em] text-[#1c2b20] sm:text-4xl lg:text-5xl">
                도심의 유휴공간을<br /><span className="text-rose-800">꽃이 자라는 곳으로</span>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] leading-7 text-slate-600">
                BLOOM:IN은 비어 있던 도심 공간을 작은 플라워팜으로 바꾸고, 데이터 기반 재배와 지역의 꽃 경험을 연결합니다.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <a href="#service" className="inline-flex items-center gap-2 bg-rose-800 px-5 py-3 text-xs font-bold text-white hover:bg-rose-900">
                  프로젝트 이야기 보기 <ArrowRight size={16} />
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
              <div className="flex items-center justify-between border-b border-[#cfd8cc] pb-4"><div><p className="text-[10px] font-bold tracking-[.1em] text-rose-800">URBAN FLOWER FARM</p><p className="mt-1 text-sm font-semibold text-[#24342a]">도심 플라워팜 운영 흐름</p></div><p className="text-[11px] font-medium text-slate-500">공간 · 환경 · 꽃</p></div>
              <div className="mt-5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
                <div><Building2 className="mx-auto text-rose-700" size={23}/><p className="mt-2 text-xs font-semibold">공간 활용</p><p className="mt-1 text-[11px] text-slate-500">유휴공간 재생</p></div><ArrowRight className="text-[#90a18e]" size={16}/><div><Gauge className="mx-auto text-rose-700" size={23}/><p className="mt-2 text-xs font-semibold">환경 관리</p><p className="mt-1 text-[11px] text-slate-500">실시간 점검</p></div><ArrowRight className="text-[#90a18e]" size={16}/><div><Sprout className="mx-auto text-rose-700" size={23}/><p className="mt-2 text-xs font-semibold">꽃 재배</p><p className="mt-1 text-[11px] text-slate-500">생육 관리</p></div>
              </div>
              <div className="mt-6 border-t border-[#cfd8cc] pt-4 text-xs leading-5 text-slate-600">현장 센서, 꽃 재고, 체험 예약을 하나의 운영 흐름으로 관리합니다.</div>
            </div>
          </div>
        </section>

        <section id="service" className="scroll-mt-20 px-5 py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center"><p className="eyebrow">FROM SPACE TO FLOWERS</p><h2 className="landing-title">공간이 꽃으로 이어지는 과정</h2><p className="landing-description">공간 활용부터 판매와 체험까지, 하나의 플라워팜이 완성되는 네 단계입니다.</p></div>
            <div className="mt-10 grid grid-cols-2 gap-3 lg:mt-14 lg:grid-cols-4 lg:gap-5">
              {services.map(({ icon: Icon, title, description, tone }, index) => (
                <article key={title} className="group rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-950/5 lg:rounded-3xl lg:p-7">
                  <div className="flex items-center justify-between"><div className={`grid size-10 place-items-center rounded-xl ${tone} lg:size-12 lg:rounded-2xl`}><Icon size={20} className="lg:hidden" /><Icon size={23} className="hidden lg:block" /></div><span className="text-[10px] font-black text-slate-200 lg:text-xs">0{index + 1}</span></div>
                  <h3 className="mt-4 text-[15px] font-extrabold tracking-[-.035em] lg:mt-6 lg:text-lg">{title}</h3><p className="mt-2 text-[13px] leading-5 text-slate-500 lg:mt-3 lg:text-sm lg:leading-6">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>


        <section id="impact" className="scroll-mt-20 border-y border-[#dce5db] bg-[#f5f8f5] px-5 py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl"><p className="eyebrow">WHY BLOOM:IN</p><h2 className="landing-title">꽃이 머무는 도시는<br />조금 더 가까워집니다</h2><p className="landing-description">공간은 다시 쓰이고, 재배는 더 안정적이며, 꽃은 지역의 일상에 자연스럽게 닿습니다.</p></div>
            <div className="mt-10 grid gap-3 md:mt-12 md:grid-cols-3 md:gap-5">
              {bloomInApproach.map(({ number, icon: Icon, title, description }) => (
                <article key={number} className="group border-t-2 border-[#d7e2d6] bg-white p-5 transition hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-950/5 md:p-7">
                  <div className="flex items-start justify-between"><div className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-700 md:size-12 md:rounded-2xl"><Icon size={20} className="md:hidden" /><Icon size={22} className="hidden md:block" /></div><span className="text-[10px] font-black tracking-[.16em] text-rose-300 md:text-xs">{number}</span></div>
                  <h3 className="mt-5 text-lg font-extrabold tracking-[-.035em] text-[#1e2b22] md:mt-8 md:text-xl">{title}</h3>
                  <p className="mt-2 text-[13px] leading-5 text-slate-500 md:mt-3 md:text-sm md:leading-6">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-rose-100 bg-[#fff3f6] px-5 py-12 text-[#1e2b22] lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div><Logo /><p className="mt-5 max-w-sm text-sm leading-6 text-slate-600">데이터 기반 스마트 화훼 재배와 지역 순환을 연결하는 운영 플랫폼</p></div>
          <div className="text-sm text-slate-500"><p>© 2026 BLOOM:IN. All rights reserved.</p><Link to={ROUTES.login} className="mt-2 inline-block hover:text-rose-700">운영자 로그인</Link></div>
        </div>
      </footer>
    </div>
  )
}
