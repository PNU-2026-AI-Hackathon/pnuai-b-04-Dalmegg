import { Box, Gamepad2, Maximize2 } from 'lucide-react'

interface UnityWebGLPlaceholderProps {
  height?: number
}

export function UnityWebGLPlaceholder({ height = 800 }: UnityWebGLPlaceholderProps) {
  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 text-white" style={{ height }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_45%)]" />
      <div className="relative max-w-md px-6 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400"><Gamepad2 size={38} /></div>
        <p className="mt-7 text-xs font-black tracking-[0.18em] text-emerald-400">UNITY WEBGL VIEWPORT</p>
        <h2 className="mt-3 text-2xl font-black">시뮬레이터 준비 영역</h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">향후 Unity Build 파일과 react-unity-webgl 컨텍스트가 이 영역에 연결됩니다.</p>
        <div className="mt-7 flex justify-center gap-3 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2"><Box size={14} /> Unity Build</span>
          <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2"><Maximize2 size={14} /> 100% × 800px</span>
        </div>
      </div>
    </div>
  )
}
