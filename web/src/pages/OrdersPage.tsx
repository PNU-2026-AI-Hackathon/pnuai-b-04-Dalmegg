import { Check, Eye, PackageCheck, RefreshCw, ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { listAdminOrders } from '../api/orders'
import type { AdminOrderRead } from '../api/types'
import { Modal } from '../components/Modal'
import { useAuthStore } from '../store/useAuthStore'

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(date)
}

function getFlowerSummary(order: AdminOrderRead) {
  return order.items.map((item) => `${item.flower_name ?? `꽃 상품 #${item.flower_id}`} ${item.quantity}송이`).join(', ')
}

function completedOrdersStorageKey(shopId: number) {
  return `dalmegg.completedOrders.${shopId}`
}

const ORDERS_PER_PAGE = 20

export function OrdersPage() {
  const operator = useAuthStore((state) => state.operator)
  const [orders, setOrders] = useState<AdminOrderRead[]>([])
  const [selected, setSelected] = useState<AdminOrderRead | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completedOrderIds, setCompletedOrderIds] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [orderTab, setOrderTab] = useState<'pending' | 'completed'>('pending')

  const loadOrders = async () => {
    if (!operator?.shop_id) return
    setIsLoading(true)
    setError(null)
    try {
      setOrders(await listAdminOrders(operator.shop_id))
    } catch {
      setError('주문 정보를 불러오지 못했습니다. 서버 연결을 확인한 뒤 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [operator?.shop_id])

  useEffect(() => {
    if (!operator?.shop_id) return
    try {
      const stored = JSON.parse(window.localStorage.getItem(completedOrdersStorageKey(operator.shop_id)) ?? '[]')
      setCompletedOrderIds(Array.isArray(stored) ? stored.filter(Number.isInteger) : [])
    } catch {
      setCompletedOrderIds([])
    }
  }, [operator?.shop_id])

  const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const totalFlowers = orders.reduce((sum, order) => sum + order.items.reduce((quantity, item) => quantity + item.quantity, 0), 0)

  const isOrderCompleted = (order: AdminOrderRead) => order.status === 'pickup_completed' || completedOrderIds.includes(order.id)
  const tabOrders = useMemo(() => orders.filter((order) => orderTab === 'completed' ? isOrderCompleted(order) : !isOrderCompleted(order)), [orders, completedOrderIds, orderTab])
  const totalPages = Math.max(1, Math.ceil(tabOrders.length / ORDERS_PER_PAGE))
  const pagedOrders = tabOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE)

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [orderTab])

  const completeOrder = (order: AdminOrderRead) => {
    if (!operator?.shop_id || isOrderCompleted(order)) return
    setCompletedOrderIds((current) => {
      const next = [...current, order.id]
      window.localStorage.setItem(completedOrdersStorageKey(operator.shop_id), JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col justify-between gap-4 border-b border-[#d9e0d7] pb-5 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold tracking-[.12em] text-rose-700">FLOWER MARKET ORDER</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-.05em] text-[#1d2921] md:text-[32px]">주문 관리</h1><p className="mt-2 text-sm text-slate-500">내 마켓에 접수된 꽃 주문을 확인하세요.</p></div><button type="button" onClick={() => void loadOrders()} disabled={isLoading} className="secondary-button"><RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> 새로고침</button></div>

      <section className="mt-6 grid divide-x divide-[#d9e0d7] overflow-hidden border border-[#d9e0d7] bg-[#fffefa] sm:grid-cols-3"><div className="p-5"><p className="text-sm text-slate-500">접수 주문</p><p className="mt-2 text-3xl font-semibold tracking-[-.05em] tabular-nums text-[#253229]">{orders.length}<span className="ml-1 text-sm font-medium">건</span></p></div><div className="p-5"><p className="text-sm text-slate-500">주문 꽃 수량</p><p className="mt-2 text-3xl font-semibold tracking-[-.05em] tabular-nums text-[#253229]">{totalFlowers}<span className="ml-1 text-sm font-medium">송이</span></p></div><div className="p-5"><p className="text-sm text-slate-500">주문 금액</p><p className="mt-2 text-3xl font-semibold tracking-[-.05em] tabular-nums text-rose-700">{totalSales.toLocaleString()}<span className="ml-1 text-sm font-medium">원</span></p></div></section>

      {error && <div className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      <section className="dashboard-card mt-7 overflow-hidden"><div className="border-b border-[#e2e7e0] px-5 pt-4"><h2 className="font-semibold text-[#27332c]">주문 목록</h2><p className="mt-1 text-xs text-slate-500">주문을 열어 고객 정보와 주문 품목을 확인하고, 상품을 전달한 뒤 수령 완료 처리하세요.</p><div className="mt-4 flex gap-4"><button type="button" onClick={() => setOrderTab('pending')} className={`border-b-2 pb-3 text-sm font-bold ${orderTab === 'pending' ? 'border-rose-700 text-rose-800' : 'border-transparent text-slate-500 hover:text-rose-700'}`}>수령 대기 <span className="ml-1 tabular-nums">{orders.filter((order) => !isOrderCompleted(order)).length}</span></button><button type="button" onClick={() => setOrderTab('completed')} className={`border-b-2 pb-3 text-sm font-bold ${orderTab === 'completed' ? 'border-rose-700 text-rose-800' : 'border-transparent text-slate-500 hover:text-rose-700'}`}>수령 완료 <span className="ml-1 tabular-nums">{orders.filter(isOrderCompleted).length}</span></button></div></div>{isLoading ? <div className="grid min-h-64 place-items-center"><span className="size-7 animate-spin rounded-full border-4 border-rose-100 border-t-rose-600" /></div> : orders.length === 0 ? <div className="grid min-h-64 place-items-center px-5 text-center"><div><PackageCheck className="mx-auto text-emerald-600" size={32} /><p className="mt-3 font-semibold text-[#27332c]">접수된 주문이 없습니다.</p><p className="mt-1 text-sm text-slate-500">새 주문이 들어오면 이 목록에 표시됩니다.</p></div></div> : tabOrders.length === 0 ? <div className="grid min-h-64 place-items-center px-5 text-center"><div><PackageCheck className="mx-auto text-emerald-600" size={32} /><p className="mt-3 font-semibold text-[#27332c]">{orderTab === 'pending' ? '수령 대기 주문이 없습니다.' : '수령 완료 주문이 없습니다.'}</p></div></div> : <><div className="divide-y divide-[#e2e7e0] md:hidden">{pagedOrders.map((order) => <button key={order.id} type="button" onClick={() => setSelected(order)} className="w-full px-5 py-4 text-left hover:bg-[#fff7f9]"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[#27332c]">{getFlowerSummary(order)}</p><p className="mt-1 text-sm text-slate-500">{order.user_full_name ?? order.user_email}</p></div><strong className="text-[#27332c]">{order.total_amount.toLocaleString()}원</strong></div><p className="mt-3 text-xs text-slate-400">{formatDateTime(order.created_at)}</p></button>)}</div><div className="hidden overflow-x-auto md:block"><table className="data-table min-w-[980px]"><thead><tr><th>주문 번호</th><th>주문 고객</th><th>주문 품목</th><th>주문 금액</th><th>주문 시각</th><th>상태</th><th className="text-right">처리</th></tr></thead><tbody>{pagedOrders.map((order) => { const completed = isOrderCompleted(order); return <tr key={order.id}><td className="font-bold text-slate-800">#{order.id}</td><td><p className="font-semibold text-slate-700">{order.user_full_name ?? '고객'}</p><p className="mt-0.5 text-xs text-slate-400">{order.user_email}</p></td><td>{getFlowerSummary(order)}</td><td className="font-semibold text-[#27332c]">{order.total_amount.toLocaleString()}원</td><td>{formatDateTime(order.created_at)}</td><td><span className={`status-badge ${completed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{completed ? '수령 완료' : '수령 대기'}</span></td><td className="text-right"><div className="inline-flex gap-2"><button type="button" onClick={() => setSelected(order)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-rose-300 hover:text-rose-700"><Eye size={14} /> 상세보기</button>{!completed && <button type="button" onClick={() => completeOrder(order)} className="primary-button !px-3 !py-2"><Check size={14} /> 수령 완료</button>}</div></td></tr>})}</tbody></table></div>{totalPages > 1 && <nav className="flex items-center justify-center gap-1 border-t border-[#e2e7e0] px-4 py-4" aria-label="주문 목록 페이지"><button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)} className="rounded px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300">이전</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`grid size-8 place-items-center rounded text-xs font-bold ${currentPage === page ? 'bg-rose-700 text-white' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-800'}`}>{page}</button>)}<button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)} className="rounded px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300">다음</button></nav>}</>}</section>

      {selected && <Modal title="주문 상세" description={`주문번호 #${selected.id} · ${formatDateTime(selected.created_at)}`} onClose={() => setSelected(null)}><div className="rounded-xl bg-[#f6f8f3] p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-white text-rose-700"><ShoppingBag size={19} /></span><div><p className="font-semibold text-[#27332c]">{selected.user_full_name ?? '고객'}님의 주문</p><p className="mt-0.5 text-xs text-slate-500">{selected.user_email}</p></div></div></div><div className="mt-5 divide-y divide-[#e2e7e0] border-y border-[#e2e7e0]">{selected.items.map((item) => <div key={item.id} className="flex items-center justify-between py-3 text-sm"><span className="font-semibold text-slate-700">{item.flower_name ?? `꽃 상품 #${item.flower_id}`}<span className="ml-2 font-normal text-slate-500">{item.quantity}송이</span></span><strong>{item.line_amount.toLocaleString()}원</strong></div>)}</div><div className="mt-5 flex justify-between text-base"><span className="font-semibold text-slate-600">총 주문 금액</span><strong className="text-lg text-rose-700">{selected.total_amount.toLocaleString()}원</strong></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setSelected(null)} className="secondary-button">닫기</button>{!isOrderCompleted(selected) && <button type="button" onClick={() => completeOrder(selected)} className="primary-button"><Check size={15} /> 수령 완료</button>}</div></Modal>}
    </div>
  )
}
