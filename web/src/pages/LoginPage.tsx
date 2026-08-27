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

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const operator = useAuthStore((state) => state.operator)
  const login = useAuthStore((state) => state.login)
  const loginError = useAuthStore((state) => state.loginError)
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating)
  const clearLoginError = useAuthStore((state) => state.clearLoginError)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const locationState = location.state as LoginLocationState | null
  const redirectPath = locationState?.from?.pathname ?? ROUTES.dashboard

  useEffect(() => {
    clearLoginError()
  }, [clearLoginError])

  if (operator) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (await login(email, password)) {
      navigate(redirectPath, { replace: true })
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f6f1] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <section className="order-2 border-t border-[#cfd8cc] pt-6 lg:order-1 lg:border-t-0 lg:border-r lg:pr-12 lg:pt-0">
            <Link to={ROUTES.home} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-700">
              <ArrowLeft size={17} /> 홈으로 돌아가기
            </Link>
            <div className="mt-8">
              <Logo />
              <p className="mt-8 text-[11px] font-bold tracking-[0.16em] text-rose-700">OPERATOR ACCESS</p>
              <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-[1.2] tracking-[-0.05em] md:text-4xl">
                도심에서 시작하는 플라워팜<br />운영의 시작
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600">
                센서, 꽃 재고, 체험 예약을 한 곳에서 관리하는 BLOOM:IN 운영 공간입니다.
              </p>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div className="border border-[#d9e0d7] bg-[#fffefa] p-4">
                <Building2 className="text-rose-700" size={22} />
                <p className="mt-3 font-extrabold text-slate-900">운영 공간별 관리</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">담당 스마트팜의 재고와 수거 데이터를 한곳에서 관리합니다.</p>
              </div>
              <div className="border border-[#d9e0d7] bg-[#fffefa] p-4">
                <Lock className="text-rose-700" size={22} />
                <p className="mt-3 font-extrabold text-slate-900">운영자 전용 접근</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">대시보드 메뉴는 로그인 후에만 접근할 수 있습니다.</p>
              </div>
            </div>
          </section>

          <section className="order-1 border border-[#d9e0d7] bg-[#fffefa] p-5 sm:p-8 lg:order-2">
            <div>
              <p className="text-sm font-extrabold text-rose-700">운영자 로그인</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">내 운영 페이지 접속</h2>
              <p className="mt-2 text-sm text-slate-500">등록된 운영자 계정으로 로그인합니다.</p>
            </div>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-xs font-extrabold text-slate-600">이메일</span>
                <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-rose-400 focus-within:bg-white">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="아이디 또는 이메일"
                    autoComplete="username"
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-xs font-extrabold text-slate-600">비밀번호</span>
                <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-rose-400 focus-within:bg-white">
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
                disabled={isAuthenticating}
                className="w-full bg-rose-800 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-rose-900"
              >
                {isAuthenticating ? '로그인 중...' : '운영자 페이지로 접속'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs font-bold text-slate-500">
              아직 운영자 계정이 없나요?{' '}
              <Link to={ROUTES.signup} className="text-rose-700 hover:text-rose-800">
                회원가입하기
              </Link>
            </p>
            <div className="mt-7 border-l-2 border-rose-700 bg-[#f1f4ed] p-4 text-xs leading-5 text-slate-600">
              처음 이용하는 운영자는 회원가입에서 계정과 담당 운영 공간을 먼저 등록해주세요.
            </div>
            {USE_MOCKS && (
              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
                <p className="text-xs font-extrabold text-rose-800">테스트 계정</p>
                <div className="mt-3 space-y-2">
                  {operatorAccounts.map((account) => (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => {
                        setEmail(account.email)
                        setPassword(account.password)
                      }}
                      className="w-full rounded-xl border border-rose-100 bg-white px-3 py-2 text-left text-xs font-bold text-slate-600 hover:border-rose-300 hover:text-rose-700"
                    >
                      <span className="block text-slate-900">{account.shop_name}</span>
                      <span className="mt-0.5 block">{account.email} / {account.password}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
