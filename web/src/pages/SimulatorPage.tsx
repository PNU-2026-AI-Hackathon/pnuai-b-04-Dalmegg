import { ArrowLeft, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'
import { UnityWebGLPlaceholder } from '../components/UnityWebGLPlaceholder'
import { ROUTES } from '../constants/routes'

export function SimulatorPage() {
  return (
    <div className="min-h-screen bg-[#f6f8f7]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 md:px-8">
          <Link to={ROUTES.home} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700"><ArrowLeft size={17} /> 홈으로</Link>
          <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-700"><Sprout size={18} /> 닮은살걀 Simulator</div>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
        <div className="mb-7">
          <p className="text-sm font-bold text-emerald-600">UNITY WEBGL SIMULATOR</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">꽃 재배 시뮬레이터</h1>
          <p className="mt-3 text-sm text-slate-500">가상 스마트팜에서 환경을 조절하고 꽃의 생육 변화를 체험할 수 있습니다.</p>
        </div>
        <UnityWebGLPlaceholder height={800} />
      </main>
    </div>
  )
}
