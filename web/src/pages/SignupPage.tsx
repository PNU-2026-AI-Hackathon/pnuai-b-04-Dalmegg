import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Sprout,
  UserRound,
} from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { ROUTES } from '../constants/routes'
import { useAuthStore } from '../store/useAuthStore'

const initialForm = {
  full_name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  shop_name: '',
  region: '',
  address: '',
  phone: '',
  description: '',
}

export function SignupPage() {
  const navigate = useNavigate()
  const operator = useAuthStore((state) => state.operator)
  const signup = useAuthStore((state) => state.signup)
  const signupError = useAuthStore((state) => state.signupError)
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating)
  const clearSignupError = useAuthStore((state) => state.clearSignupError)
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    clearSignupError()
  }, [clearSignupError])

  if (operator) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (form.password.length < 8) {
      setFormError('비밀번호는 8자 이상으로 입력해주세요.')
      return
    }

    if (form.password !== form.passwordConfirm) {
      setFormError('비밀번호 확인이 일치하지 않습니다.')
      return
    }

    const didSignup = await signup({
      email: form.email,
      password: form.password,
      full_name: form.full_name,
      shop_name: form.shop_name,
      region: form.region,
      address: form.address,
      phone: form.phone,
      description: form.description,
    })

    if (didSignup) {
      navigate(ROUTES.dashboard, { replace: true })
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
              <p className="mt-8 text-sm font-black tracking-[0.18em] text-emerald-700">OPERATOR SIGNUP</p>
              <h1 className="mt-3 max-w-xl text-4xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
                운영자 계정과 운영 공간 등록
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600">
                운영자 정보와 담당 스마트팜 공간을 등록하면, 가입 직후 내 운영 페이지로 이동합니다.
              </p>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <Sprout className="text-emerald-700" size={22} />
                <p className="mt-3 font-extrabold text-slate-900">운영자 계정</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">이메일, 비밀번호, 이름을 입력해 운영 계정을 만듭니다.</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <Building2 className="text-emerald-700" size={22} />
                <p className="mt-3 font-extrabold text-slate-900">담당 운영 공간</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">운영 공간명, 지역, 주소, 연락처를 함께 등록합니다.</p>
              </div>
            </div>
          </section>

          <section className="order-1 rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-2xl shadow-emerald-950/10 sm:p-8 lg:order-2">
            <div>
              <p className="text-sm font-extrabold text-emerald-700">운영자 회원가입</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">내 운영 공간 등록</h2>
              <p className="mt-2 text-sm text-slate-500">운영자 정보와 담당 스마트팜 정보를 입력해주세요.</p>
            </div>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-xs font-extrabold text-slate-600">운영자 이름</span>
                <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white">
                  <UserRound size={18} className="text-slate-400" />
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(event) => updateField('full_name', event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="홍길동"
                    autoComplete="name"
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-xs font-extrabold text-slate-600">이메일</span>
                <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="operator@example.com"
                    autoComplete="email"
                    required
                  />
                </span>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-extrabold text-slate-600">비밀번호</span>
                  <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white">
                    <Lock size={18} className="text-slate-400" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => updateField('password', event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="8자 이상"
                      autoComplete="new-password"
                      required
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="text-xs font-extrabold text-slate-600">비밀번호 확인</span>
                  <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white">
                    <Lock size={18} className="text-slate-400" />
                    <input
                      type="password"
                      value={form.passwordConfirm}
                      onChange={(event) => updateField('passwordConfirm', event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="한 번 더 입력"
                      autoComplete="new-password"
                      required
                    />
                  </span>
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-extrabold text-slate-600">운영 공간명</span>
                <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white">
                  <Building2 size={18} className="text-slate-400" />
                  <input
                    type="text"
                    value={form.shop_name}
                    onChange={(event) => updateField('shop_name', event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="달멕 스마트팜 1호점"
                    autoComplete="organization"
                    required
                  />
                </span>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-extrabold text-slate-600">지역</span>
                  <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white">
                    <Sprout size={18} className="text-slate-400" />
                    <input
                      type="text"
                      value={form.region}
                      onChange={(event) => updateField('region', event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="부산"
                      required
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="text-xs font-extrabold text-slate-600">전화번호</span>
                  <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white">
                    <Phone size={18} className="text-slate-400" />
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(event) => updateField('phone', event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="010-0000-0000"
                      required
                    />
                  </span>
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-extrabold text-slate-600">주소</span>
                <span className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white">
                  <MapPin size={18} className="text-slate-400" />
                  <input
                    type="text"
                    value={form.address}
                    onChange={(event) => updateField('address', event.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="부산광역시 금정구 ..."
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-xs font-extrabold text-slate-600">운영 공간 설명</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField('description', event.target.value)}
                  className="form-input mt-2 min-h-24 resize-none"
                  placeholder="도심 유휴공간을 활용한 스마트팜"
                />
              </label>

              {(formError || signupError) && (
                <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
                  <AlertCircle size={17} /> {formError ?? signupError}
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full rounded-2xl bg-emerald-700 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                {isAuthenticating ? '계정 생성 중...' : '운영자 계정 만들기'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs font-bold text-slate-500">
              이미 계정이 있나요?{' '}
              <Link to={ROUTES.login} className="text-emerald-700 hover:text-emerald-800">
                로그인하기
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
