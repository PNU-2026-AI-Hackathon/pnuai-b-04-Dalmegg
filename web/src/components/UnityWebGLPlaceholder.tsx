import { Box, ExternalLink, Gamepad2, Maximize2, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type UnityBuildStatus = 'checking' | 'available' | 'missing' | 'error'

interface UnityWebGLPlaceholderProps {
  height?: number
  buildPath?: string
  title?: string
}

const UNITY_HTML_SIGNATURES = [
  'createUnityInstance',
  'unity-canvas',
  'UnityLoader',
  '/Build/',
]

function isUnityWebGLHtml(html: string) {
  return UNITY_HTML_SIGNATURES.some((signature) => html.includes(signature))
}

export function UnityWebGLPlaceholder({
  height = 800,
  buildPath = '/unity-simulator/index.html',
  title = '꽃 재배 시뮬레이터',
}: UnityWebGLPlaceholderProps) {
  const [status, setStatus] = useState<UnityBuildStatus>('checking')
  const [reloadKey, setReloadKey] = useState(0)
  const normalizedBuildPath = useMemo(
    () => buildPath.startsWith('/') ? buildPath : `/${buildPath}`,
    [buildPath],
  )

  useEffect(() => {
    let ignore = false

    async function checkUnityBuild() {
      setStatus('checking')

      try {
        const response = await fetch(`${normalizedBuildPath}?t=${Date.now()}`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          if (!ignore) {
            setStatus('missing')
          }
          return
        }

        const html = await response.text()

        if (!ignore) {
          setStatus(isUnityWebGLHtml(html) ? 'available' : 'missing')
        }
      } catch {
        if (!ignore) {
          setStatus('error')
        }
      }
    }

    checkUnityBuild()

    return () => {
      ignore = true
    }
  }, [normalizedBuildPath, reloadKey])

  if (status === 'available') {
    return (
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <div>
            <p className="text-xs font-black tracking-[0.18em] text-emerald-300">UNITY WEBGL</p>
            <h2 className="mt-0.5 text-sm font-extrabold">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setReloadKey((currentKey) => currentKey + 1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 hover:border-emerald-300/40 hover:text-emerald-200"
            >
              <RefreshCw size={14} /> 새로고침
            </button>
            <a
              href={normalizedBuildPath}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 hover:border-emerald-300/40 hover:text-emerald-200"
            >
              <ExternalLink size={14} /> 새 창
            </a>
          </div>
        </div>
        <iframe
          key={reloadKey}
          title={title}
          src={normalizedBuildPath}
          className="block w-full bg-black"
          style={{ height }}
          allow="fullscreen; autoplay"
          allowFullScreen
        />
      </div>
    )
  }

  const statusMessage = status === 'checking'
    ? '시뮬레이터 연결 확인 중'
    : 'Unity WebGL 빌드 준비 중'

  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 text-white" style={{ height }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_45%)]" />
      <div className="relative max-w-md px-6 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400"><Gamepad2 size={38} /></div>
        <p className="mt-7 text-xs font-black tracking-[0.18em] text-emerald-400">UNITY WEBGL VIEWPORT</p>
        <h2 className="mt-3 text-2xl font-black">{statusMessage}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">Unity 빌드가 추가되면 이 영역에서 바로 실행됩니다.</p>
        <div className="mt-7 flex justify-center gap-3 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2"><Box size={14} /> Unity Build</span>
          <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2"><Maximize2 size={14} /> 100% × 800px</span>
        </div>
        {status !== 'checking' && (
          <button
            type="button"
            onClick={() => setReloadKey((currentKey) => currentKey + 1)}
            className="mx-auto mt-5 inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:border-emerald-300/40 hover:text-emerald-200"
          >
            <RefreshCw size={14} /> 다시 확인
          </button>
        )}
      </div>
    </div>
  )
}
