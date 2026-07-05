import { AlertCircle, ArrowLeft, Building2, Lock, Mail } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { ROUTES } from '../constants/routes'
import { operatorAccounts } from '../mock/operators'
import { useAuthStore } from '../store/useAuthStore'

interface LoginLocationState {
  from?: {
    pathname?: string
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const operator = useAuthStore((state) => state.operator)
  const login = useAuthStore((state) => state.login)
  const loginError = useAuthStore((state) => state.loginError)
  const clearLoginError = useAuthStore((state) => state.clearLoginError)
  const [email, setEmail] = useState(operatorAccounts[0]?.email ?? '')
  const [password, setPassword] = useState(operatorAccounts[0]?.password ?? '')

  const locationState = location.state as LoginLocationState | null
  const redirectPath = locationState?.from?.pathname ?? ROUTES.dashboard

  useEffect(() => {
    clearLoginError()
  }, [clearLoginError])

  if (operator) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (login(email, password)) {
      navigate(redirectPath, { replace: true })
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f8f5] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <section className="order-2 lg:order-1">
            <Link to={ROUTES.home} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700">
              <ArrowLeft size={17} /> 홈으로 돌아가기
            </Link>
            <div className="mt-8">
              <Logo />
              <p className="mt-8 text-sm font-black tracking-[0.18em] text-emerald-700">OPERATOR ACCESS</p>
              <h1 className="mt-3 max-w-xl text-4xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
                도심 유휴공간 스마트팜 운영자 로그인
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600">
                운영자는 담당 스마트팜 기기의 센서 상태, 재고, 예약, 수거 현황을 본인 운영 공간 기준으로 확인할 수 있습니다.
              </p>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <Building2 className="text-emerald-700" size={22} />
                <p className="mt-3 font-extrabold text-slate-900">공실 기반 운영지</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">운영자별 배정된 재배 모듈과 공간 데이터를 분리합니다.</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <Lock className="text-emerald-700" size={22} />
                <p className="mt-3 font-extrabold text-slate-900">관리자 전용 접근</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">대시보드 메뉴는 로그인 후에만 접근할 수 있습니다.</p>
              </div>
            </div>
          </section>

          <section className="order-1 rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-2xl shadow-emerald-950/10 sm:p-8 lg:order-2">
            <div>
              <p className="text-sm font-extrabold text-emerald-700">운영자 로그인</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">내 운영 페이지 접속</h2>
              <p className="mt-2 text-sm text-slate-500">현재 단계에서는 시연용 계정으로 로그인합니다.</p>
            </div>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-xs font-extrabold text-slate-600">이메일</span>
                <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="operator@example.com"
                    autoComplete="email"
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-xs font-extrabold text-slate-600">비밀번호</span>
                <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white">
                  <Lock size={18} className="text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="비밀번호"
                    autoComplete="current-password"
                    required
                  />
                </span>
              </label>

              {loginError && (
                <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
                  <AlertCircle size={17} /> {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-700 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                운영자 페이지로 접속
              </button>
            </form>

            <div className="mt-7 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-extrabold text-slate-500">시연용 계정</p>
              <div className="mt-3 space-y-2">
                {operatorAccounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => {
                      setEmail(account.email)
                      setPassword(account.password)
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-bold text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                  >
                    <span className="block text-slate-900">{account.siteName}</span>
                    <span className="mt-0.5 block">{account.email} / {account.password}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
