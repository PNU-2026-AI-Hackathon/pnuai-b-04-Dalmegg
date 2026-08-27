import { Check, ClipboardCheck, Eye, Image as ImageIcon, MapPin, RefreshCw, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { approveCollection, listPendingCollections, rejectCollection } from '../api/collections'
import type { CollectionRead } from '../api/types'
import { getAssetUrl } from '../api/client'
import { Modal } from '../components/Modal'

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(date)
}

function getCollectionPlace(memo: string | null) {
  const match = memo?.match(/^\[수거 장소\]\s*([^\n]+)/)
  return match?.[1] ?? null
}

function getUserMemo(memo: string | null) {
  return memo?.replace(/^\[수거 장소\]\s*[^\n]+\n?/, '').trim() || null
}

function formatWeight(weight: number | string) {
  const value = Number(weight)
  return Number.isFinite(value) ? value.toFixed(2) : String(weight)
}

export function CollectionRequestsPage() {
  const [items, setItems] = useState<CollectionRead[]>([])
  const [selected, setSelected] = useState<CollectionRead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCollections = async () => {
    setIsLoading(true)
    setError(null)
    try {
      setItems(await listPendingCollections())
    } catch {
      setError('수거 요청을 불러오지 못했습니다. 서버 연결과 관리자 권한을 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCollections()
  }, [])

  const processCollection = async (action: 'approve' | 'reject') => {
    if (!selected) return
    setIsUpdating(true)
    setError(null)
    try {
      const updated = action === 'approve' ? await approveCollection(selected.id) : await rejectCollection(selected.id)
      setItems((current) => current.filter((item) => item.id !== updated.id))
      setSelected(null)
    } catch {
      setError(action === 'approve' ? '승인 처리에 실패했습니다. 다시 시도해주세요.' : '반려 처리에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col justify-between gap-4 border-b border-[#d9e0d7] pb-5 sm:flex-row sm:items-end">
        <div><p className="text-[11px] font-bold tracking-[.12em] text-rose-700">RESOURCE COLLECTION</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-.05em] text-[#1d2921] md:text-[32px]">수거 요청 관리</h1><p className="mt-2 text-sm text-slate-500">앱에서 접수된 달걀 껍데기 수거 요청을 검토하고 처리하세요.</p></div>
        <button type="button" onClick={() => void loadCollections()} disabled={isLoading} className="secondary-button"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> 새로고침</button>
      </div>

      <section className="mt-6 grid overflow-hidden border border-[#d9e0d7] bg-[#fffefa] sm:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-full bg-rose-50 text-rose-700"><ClipboardCheck size={21} /></span><div><p className="text-sm font-semibold text-slate-600">검토 대기 요청</p><p className="mt-1 text-3xl font-semibold tracking-[-.05em] text-[#253229] tabular-nums">{items.length}<span className="ml-1 text-sm font-medium text-slate-500">건</span></p></div></div>
        <div className="border-t border-[#d9e0d7] px-5 py-4 text-xs leading-5 text-slate-500 sm:border-l sm:border-t-0">승인 시 수거량과 리워드가 반영됩니다.<br />반려된 요청은 사용자 수거 이력에 반영되지 않습니다.</div>
      </section>

      {error && <div className="mt-5 flex items-center justify-between gap-3 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"><span>{error}</span><button type="button" onClick={() => void loadCollections()} className="shrink-0 underline">다시 시도</button></div>}

      <section className="dashboard-card mt-7 overflow-hidden">
        <div className="border-b border-[#e2e7e0] px-5 py-4"><h2 className="font-semibold text-[#27332c]">접수 목록</h2><p className="mt-1 text-xs text-slate-500">요청을 열어 수거 장소와 메모를 확인한 후 처리하세요.</p></div>
        {isLoading ? <div className="grid min-h-64 place-items-center"><span className="size-7 animate-spin rounded-full border-4 border-rose-100 border-t-rose-600" /></div> : items.length === 0 ? <div className="grid min-h-64 place-items-center px-5 text-center"><div><ClipboardCheck className="mx-auto text-emerald-600" size={32} /><p className="mt-3 font-semibold text-[#27332c]">검토할 수거 요청이 없습니다.</p><p className="mt-1 text-sm text-slate-500">새 요청이 접수되면 이 목록에 표시됩니다.</p></div></div> : <><div className="divide-y divide-[#e2e7e0] md:hidden">{items.map((item) => <button type="button" key={item.id} onClick={() => setSelected(item)} className="w-full px-5 py-4 text-left hover:bg-[#fff7f9]"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[#27332c]">수거 요청 #{item.id}</p><p className="mt-1 text-sm text-slate-500">{getCollectionPlace(item.memo) ?? `사용자 #${item.user_id}`}</p></div><strong className="text-lg text-[#27332c]">{formatWeight(item.weight_kg)}kg</strong></div><p className="mt-3 text-xs text-slate-400">{formatDateTime(item.created_at)}</p></button>)}</div><div className="hidden overflow-x-auto md:block"><table className="data-table min-w-[820px]"><thead><tr><th>요청 번호</th><th>수거 장소</th><th>수거량</th><th>사용자 메모</th><th>접수 시각</th><th className="text-right">처리</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td className="font-bold text-slate-800">#{item.id}</td><td>{getCollectionPlace(item.memo) ?? '-'}</td><td className="font-semibold text-[#27332c]">{formatWeight(item.weight_kg)}kg</td><td className="max-w-64 truncate">{getUserMemo(item.memo) ?? '-'}</td><td>{formatDateTime(item.created_at)}</td><td className="text-right"><button type="button" onClick={() => setSelected(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-rose-300 hover:text-rose-700"><Eye size={14} /> 검토</button></td></tr>)}</tbody></table></div></>}
      </section>

      {selected && <Modal title="수거 요청 검토" description={`요청번호 #${selected.id} · ${formatDateTime(selected.created_at)}`} onClose={() => setSelected(null)}><div className="rounded-xl bg-[#f6f8f3] p-5"><p className="text-xs font-bold text-slate-500">접수 수거량</p><p className="mt-1 text-3xl font-semibold tracking-[-.05em] text-[#27332c]">{formatWeight(selected.weight_kg)}<span className="ml-1 text-base tracking-normal">kg</span></p></div><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="detail-label">요청 사용자</dt><dd className="detail-value">사용자 #{selected.user_id}</dd></div><div><dt className="detail-label">예상 리워드</dt><dd className="detail-value">{selected.reward_points.toLocaleString()}P</dd></div><div className="sm:col-span-2"><dt className="detail-label">수거 장소</dt><dd className="detail-value flex items-center gap-1.5"><MapPin size={14} /> {getCollectionPlace(selected.memo) ?? '입력된 장소 없음'}</dd></div><div className="sm:col-span-2"><dt className="detail-label">사용자 메모</dt><dd className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{getUserMemo(selected.memo) ?? '입력된 메모가 없습니다.'}</dd></div></dl>{selected.image_url && <a href={getAssetUrl(selected.image_url)} target="_blank" rel="noreferrer" className="mt-5 flex items-center gap-3 rounded-lg border border-[#d9e0d7] p-3 hover:bg-[#f6f8f3]"><ImageIcon className="text-rose-700" size={19} /><span className="text-sm font-semibold text-slate-700">첨부 사진 확인</span></a>}<div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#e2e7e0] pt-5"><button type="button" disabled={isUpdating} onClick={() => void processCollection('reject')} className="secondary-button !text-rose-700"><X size={15} /> 반려</button><button type="button" disabled={isUpdating} onClick={() => void processCollection('approve')} className="primary-button"><Check size={15} /> {isUpdating ? '처리 중…' : '승인'}</button></div></Modal>}
    </div>
  )
}
