import {
  ArrowRight,
  CheckCircle2,
  Egg,
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
  { icon: Egg, title: '계란껍질 수거', description: '가정과 지역 매장에서 버려지는 계란껍질을 깨끗하게 수거합니다.', tone: 'bg-amber-50 text-amber-600' },
  { icon: Recycle, title: '친환경 비료 생산', description: '수거한 껍질을 가공해 칼슘이 풍부한 친환경 비료로 만듭니다.', tone: 'bg-emerald-50 text-emerald-600' },
  { icon: Sprout, title: '스마트 꽃 재배', description: '센서 데이터와 자동 제어로 건강하고 아름다운 꽃을 키웁니다.', tone: 'bg-teal-50 text-teal-600' },
  { icon: ShoppingBasket, title: '꽃 판매 및 체험', description: '지역에서 자란 꽃을 만나고 순환 농업을 직접 경험합니다.', tone: 'bg-rose-50 text-rose-500' },
]

const cycleSteps = [
  { icon: Egg, title: '계란껍질 수거' },
  { icon: Recycle, title: '비료 생산' },
  { icon: Sprout, title: '꽃 재배' },
  { icon: ShoppingBasket, title: '꽃 판매' },
  { icon: Gift, title: '사용자 리워드' },
]

const participation = [
  { value: '3,842kg', label: '총 계란껍질 수거량', icon: Recycle },
  { value: '1,286명', label: '함께한 참여자', icon: Users },
  { value: '12,460송이', label: '생산된 꽃', icon: Sprout },
]

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-900">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-emerald-950/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-600 md:flex">
            <a href="#service" className="hover:text-emerald-600">서비스</a>
            <a href="#cycle" className="hover:text-emerald-600">순환 구조</a>
            <a href="#impact" className="hover:text-emerald-600">참여 현황</a>
            <Link to={ROUTES.dashboard} className="rounded-full bg-emerald-700 px-5 py-2.5 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-800">운영자 페이지</Link>
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
              <Link to={ROUTES.dashboard} className="text-emerald-700">운영자 페이지</Link>
            </div>
          </nav>
        )}
      </header>

      <main>
        <section className="relative flex min-h-[760px] items-center bg-[#f3f8f3] px-5 pb-20 pt-32 lg:px-8">
          <div className="absolute -right-32 top-20 size-[500px] rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -left-40 bottom-0 size-[400px] rounded-full bg-amber-100/60 blur-3xl" />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-extrabold text-emerald-700 shadow-sm">
                <Leaf size={15} /> 순환형 스마트 플라워팜 플랫폼
              </span>
              <h1 className="mt-7 text-5xl font-black leading-[1.08] tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl">
                계란껍질이<br /><span className="text-emerald-650 text-emerald-700">꽃이 됩니다</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                버려지는 계란껍질을 친환경 비료로 바꾸고, 스마트팜에서 새로운 꽃을 피웁니다. 일상의 작은 참여가 지역의 아름다운 순환을 만듭니다.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="#service" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-800">
                  순환에 참여하기 <ArrowRight size={17} />
                </a>
                <a href="#cycle" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-4 text-sm font-extrabold text-slate-700 hover:border-emerald-300">
                  순환 과정 보기
                </a>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-600" /> 지역 기반 수거</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-600" /> 친환경 가공</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-600" /> 데이터 기반 재배</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-emerald-800 to-emerald-950 p-8 shadow-2xl shadow-emerald-900/20 sm:p-12">
                <div className="flex h-full flex-col justify-between rounded-[2.25rem] border border-white/10 bg-white/10 p-7 backdrop-blur">
                  <div className="flex items-center justify-between text-white">
                    <div><p className="text-xs font-bold text-emerald-200">오늘의 순환</p><p className="mt-1 text-3xl font-black">128.4kg</p></div>
                    <div className="grid size-14 place-items-center rounded-2xl bg-amber-300 text-amber-900"><Egg size={28} /></div>
                  </div>
                  <div className="relative mx-auto grid size-48 place-items-center rounded-full border border-dashed border-emerald-300/50">
                    <div className="grid size-32 place-items-center rounded-full bg-white text-emerald-700 shadow-2xl"><Sprout size={58} strokeWidth={1.7} /></div>
                    <span className="absolute -right-2 top-8 grid size-12 place-items-center rounded-2xl bg-amber-300 text-amber-900"><Egg size={23} /></span>
                    <span className="absolute -bottom-1 left-3 grid size-12 place-items-center rounded-2xl bg-emerald-300 text-emerald-900"><Recycle size={22} /></span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['수거', '가공', '재배'].map((item, index) => (
                      <div key={item} className="rounded-xl bg-white/10 p-3 text-center text-white"><p className="text-lg font-black">{[92, 78, 86][index]}%</p><p className="text-[10px] text-emerald-200">{item} 진행률</p></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="service" className="scroll-mt-20 px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center"><p className="eyebrow">OUR SERVICE</p><h2 className="landing-title">버려지는 것에서<br className="sm:hidden" /> 새로운 가치를 만듭니다</h2><p className="landing-description">수거부터 재배와 체험까지, 지역 안에서 완성되는 자원 순환 서비스입니다.</p></div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map(({ icon: Icon, title, description, tone }, index) => (
                <article key={title} className="group rounded-3xl border border-slate-200/80 bg-white p-7 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5">
                  <div className="flex items-center justify-between"><div className={`grid size-12 place-items-center rounded-2xl ${tone}`}><Icon size={23} /></div><span className="text-xs font-black text-slate-200">0{index + 1}</span></div>
                  <h3 className="mt-6 text-lg font-extrabold">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="cycle" className="scroll-mt-20 bg-emerald-950 px-5 py-24 text-white lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl"><p className="text-xs font-black tracking-[0.2em] text-emerald-300">CIRCULAR SYSTEM</p><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-4xl">작은 껍질 하나가 만드는 큰 순환</h2><p className="mt-4 leading-7 text-emerald-100/60">모든 단계가 연결되고, 참여의 가치는 다시 사용자에게 돌아갑니다.</p></div>
            <div className="mt-14 grid gap-3 md:grid-cols-5">
              {cycleSteps.map(({ icon: Icon, title }, index) => (
                <div key={title} className="relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 md:block md:text-center">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-emerald-950 md:mx-auto"><Icon size={23} /></div>
                  <div className="md:mt-4"><p className="text-[10px] font-bold text-emerald-300">STEP {index + 1}</p><h3 className="mt-1 text-sm font-extrabold">{title}</h3></div>
                  {index < cycleSteps.length - 1 && <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 text-emerald-400 md:block" size={20} />}
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
                <article key={label} className="rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon size={22} /></div>
                  <p className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{value}</p><p className="mt-2 text-sm font-bold text-slate-500">{label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 px-5 py-12 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div><Logo /><p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">계란껍질 재활용 기반 순환형 스마트 플라워팜 플랫폼</p></div>
          <div className="text-sm text-slate-500"><p>© 2026 닮은살걀. All rights reserved.</p><Link to={ROUTES.dashboard} className="mt-2 inline-block hover:text-emerald-400">운영자 로그인</Link></div>
        </div>
      </footer>
    </div>
  )
}
