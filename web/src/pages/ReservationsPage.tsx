import { CalendarDays, Eye, Search, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { listAdminReservations } from '../api/reservations'
import { Modal } from '../components/Modal'
import { reservations } from '../mock/dashboard'
import { useAuthStore } from '../store/useAuthStore'
import type { Reservation, ReservationStatus } from '../types/dashboard'

const statusStyle: Record<ReservationStatus, { label: string; className: string }> = {
  reserved: { label: '예약접수', className: 'bg-amber-50 text-amber-700' },
  confirmed: { label: '확정', className: 'bg-rose-50 text-rose-700' },
  completed: { label: '완료', className: 'bg-sky-50 text-sky-700' },
  cancelled: { label: '취소', className: 'bg-slate-100 text-slate-500' },
  no_show: { label: '미방문', className: 'bg-rose-50 text-rose-700' },
}

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function ReservationsPage() {
  const operator = useAuthStore((state) => state.operator)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ReservationStatus>('all')
  const [items, setItems] = useState<Reservation[]>(reservations)
  const [selected, setSelected] = useState<Reservation | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadReservations() {
      try {
        const nextReservations = await listAdminReservations({
          shopId: operator?.shop_id || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          query: query.trim() || undefined,
        })

        if (!ignore) {
          setItems(nextReservations)
        }
      } catch {
        // 데이터를 불러오지 못하면 기존 화면 데이터를 유지합니다.
      }
    }

    loadReservations()

    return () => {
      ignore = true
    }
  }, [operator?.shop_id, query, statusFilter])

  const filteredReservations = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return items.filter((reservation) => {
      const matchesQuery = [
        reservation.user_full_name,
        reservation.user_email,
        reservation.program_title,
      ].some((value) => value.toLowerCase().includes(keyword))
      return matchesQuery && (statusFilter === 'all' || reservation.status === statusFilter)
    })
  }, [items, query, statusFilter])
  const reservationSummary = [
    { key: 'reserved', label: '예약 접수', value: items.filter((item) => item.status === 'reserved').length, tone: 'text-amber-700' },
    { key: 'confirmed', label: '운영 확정', value: items.filter((item) => item.status === 'confirmed').length, tone: 'text-rose-700' },
    { key: 'attention', label: '확인 필요', value: items.filter((item) => item.status === 'no_show' || item.status === 'cancelled').length, tone: 'text-red-700' },
  ]

  return (
    <div className="mx-auto max-w-[1500px]">
      <div><p className="text-sm font-bold text-rose-600">EXPERIENCE RESERVATION</p><h1 className="page-title">체험 예약 관리</h1><p className="page-description">내 운영 공간에 접수된 프로그램 예약을 확인하고 관리하세요.</p></div>

      <section className="mt-6 grid divide-x divide-[#d9e0d7] overflow-hidden border border-[#d9e0d7] bg-[#fffefa] sm:grid-cols-3">
        {reservationSummary.map(({ key, label, value, tone }) => (
          <button key={key} type="button" onClick={() => setStatusFilter(key === 'attention' ? 'all' : key as ReservationStatus)} className="flex items-center justify-between px-5 py-4 text-left hover:bg-[#fff7f9]">
            <span className="text-sm text-slate-600">{label}</span><span className={`text-2xl font-semibold tabular-nums ${tone}`}>{value}<small className="ml-1 text-xs font-medium">건</small></span>
          </button>
        ))}
      </section>

      <section className="dashboard-card mt-7 overflow-hidden">
        <div className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-[minmax(0,1fr)_11rem]">
          <label className="relative block min-w-0"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="form-input !pl-16" placeholder="예약자명, 이메일, 프로그램 검색" /></label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | ReservationStatus)} className="form-input !w-full">
            <option value="all">전체 상태</option>
            <option value="reserved">예약접수</option>
            <option value="confirmed">확정</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소</option>
            <option value="no_show">미방문</option>
          </select>
        </div>
        <div className="divide-y divide-[#e2e7e0] md:hidden">
          {filteredReservations.map((reservation) => {
            const status = statusStyle[reservation.status]
            return <button key={reservation.id} type="button" onClick={() => setSelected(reservation)} className="w-full px-5 py-4 text-left hover:bg-[#fff7f9]"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[#27332c]">{reservation.program_title}</p><p className="mt-1 text-sm text-slate-500">{reservation.user_full_name} · {reservation.participant_count}명</p></div><span className={`status-badge shrink-0 ${status.className}`}>{status.label}</span></div><div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span>{formatDateTime(reservation.created_at)}</span><strong className="text-[#27332c]">{reservation.total_amount.toLocaleString()}원</strong></div></button>
          })}
          {filteredReservations.length === 0 && <p className="p-12 text-center text-sm text-slate-400">조건에 맞는 예약이 없습니다.</p>}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="data-table min-w-[980px]">
            <thead><tr><th>예약자명</th><th>이메일</th><th>프로그램명</th><th>예약 접수일</th><th>인원수</th><th>결제금액</th><th>상태</th><th className="text-right">상세</th></tr></thead>
            <tbody>
              {filteredReservations.map((reservation) => {
                const status = statusStyle[reservation.status]
                return (
                  <tr key={reservation.id}>
                    <td className="font-bold text-slate-800">{reservation.user_full_name}</td>
                    <td>{reservation.user_email}</td>
                    <td>{reservation.program_title}</td>
                    <td>{formatDateTime(reservation.created_at)}</td>
                    <td>{reservation.participant_count}명</td>
                    <td>{reservation.total_amount.toLocaleString()}원</td>
                    <td><span className={`status-badge ${status.className}`}>{status.label}</span></td>
                    <td className="text-right"><button onClick={() => setSelected(reservation)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-rose-300 hover:text-rose-700"><Eye size={14} /> 상세보기</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredReservations.length === 0 && <p className="p-12 text-center text-sm text-slate-400">조건에 맞는 예약이 없습니다.</p>}
        </div>
      </section>

      {selected && (
        <Modal title="예약 상세정보" description={`예약번호 #${selected.id}`} onClose={() => setSelected(null)}>
          <div className="rounded-2xl bg-rose-50 p-5">
            <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-white text-rose-700"><CalendarDays size={21} /></span><div><p className="font-extrabold text-slate-900">{selected.program_title}</p><p className="mt-0.5 text-xs text-rose-700">{formatDateTime(selected.created_at)}</p></div></div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="detail-label">예약자</dt><dd className="detail-value">{selected.user_full_name}</dd></div>
            <div><dt className="detail-label">이메일</dt><dd className="detail-value">{selected.user_email}</dd></div>
            <div><dt className="detail-label">인원</dt><dd className="detail-value flex items-center gap-1"><Users size={14} /> {selected.participant_count}명</dd></div>
            <div><dt className="detail-label">결제금액</dt><dd className="detail-value">{selected.total_amount.toLocaleString()}원</dd></div>
            <div><dt className="detail-label">체험 프로그램</dt><dd className="detail-value">{selected.program_title}</dd></div>
            <div><dt className="detail-label">접수 운영 공간</dt><dd className="detail-value">{operator?.shop_name ?? `운영 공간 #${selected.shop_id}`}</dd></div>
            <div className="col-span-2"><dt className="detail-label">상태</dt><dd className="mt-1"><span className={`status-badge ${statusStyle[selected.status].className}`}>{statusStyle[selected.status].label}</span></dd></div>
          </dl>
          <div className="mt-6 flex justify-end"><button onClick={() => setSelected(null)} className="primary-button">확인</button></div>
        </Modal>
      )}
    </div>
  )
}
