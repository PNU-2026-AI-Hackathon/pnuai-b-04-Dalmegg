import { ArrowLeft, Home, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-[#f3f8f3] px-5 py-16">
      <div className="relative w-full max-w-xl text-center">
        <div className="absolute left-1/2 top-1/2 -z-0 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="relative">
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-emerald-700 text-white shadow-xl shadow-emerald-200">
            <Sprout size={36} />
          </div>
          <p className="mt-8 text-sm font-black tracking-[0.2em] text-emerald-700">404 NOT FOUND</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">길을 잃은 꽃송이예요</h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-500">
            요청한 페이지가 존재하지 않거나 이동되었습니다. 주소를 다시 확인하거나 홈으로 돌아가 주세요.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={ROUTES.home} className="primary-button px-5 py-3">
              <Home size={16} /> 홈으로 가기
            </Link>
            <Link to={ROUTES.dashboard} className="secondary-button px-5 py-3">
              <ArrowLeft size={16} /> 대시보드 열기
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
