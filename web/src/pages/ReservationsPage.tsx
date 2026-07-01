import { CalendarDays, Eye, Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Modal } from '../components/Modal'
import { reservations } from '../mock/dashboard'
import type { Reservation, ReservationStatus } from '../types/dashboard'

const statusStyle: Record<ReservationStatus, { label: string; className: string }> = {
  confirmed: { label: '예약완료', className: 'bg-emerald-50 text-emerald-700' },
  pending: { label: '대기중', className: 'bg-amber-50 text-amber-700' },
  cancelled: { label: '취소', className: 'bg-slate-100 text-slate-500' },
}

export function ReservationsPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ReservationStatus>('all')
  const [selected, setSelected] = useState<Reservation | null>(null)

  const filteredReservations = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return reservations.filter((reservation) => {
      const matchesQuery = reservation.customerName.toLowerCase().includes(keyword) || reservation.programName.toLowerCase().includes(keyword)
      return matchesQuery && (statusFilter === 'all' || reservation.status === statusFilter)
    })
  }, [query, statusFilter])

  return (
    <div className="mx-auto max-w-[1500px]">
      <div><p className="text-sm font-bold text-emerald-600">EXPERIENCE RESERVATION</p><h1 className="page-title">체험 예약 관리</h1><p className="page-description">플라워팜 체험 프로그램 예약을 확인하고 관리하세요.</p></div>

      <section className="dashboard-card mt-7 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row">
          <label className="relative block flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="form-input pl-10" placeholder="예약자명 또는 프로그램 검색" /></label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | ReservationStatus)} className="form-input sm:w-44">
            <option value="all">전체 상태</option><option value="confirmed">예약완료</option><option value="pending">대기중</option><option value="cancelled">취소</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[880px]">
            <thead><tr><th>예약자명</th><th>프로그램명</th><th>예약일</th><th>인원수</th><th>상태</th><th className="text-right">상세</th></tr></thead>
            <tbody>
              {filteredReservations.map((reservation) => {
                const status = statusStyle[reservation.status]
                return (
                  <tr key={reservation.id}>
                    <td className="font-bold text-slate-800">{reservation.customerName}</td><td>{reservation.programName}</td><td>{reservation.date} · {reservation.time}</td><td>{reservation.participants}명</td>
                    <td><span className={`status-badge ${status.className}`}>{status.label}</span></td>
                    <td className="text-right"><button onClick={() => setSelected(reservation)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-700"><Eye size={14} /> 상세보기</button></td>
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
          <div className="rounded-2xl bg-emerald-50 p-5">
            <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-white text-emerald-700"><CalendarDays size={21} /></span><div><p className="font-extrabold text-slate-900">{selected.programName}</p><p className="mt-0.5 text-xs text-emerald-700">{selected.date} · {selected.time}</p></div></div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="detail-label">예약자</dt><dd className="detail-value">{selected.customerName}</dd></div>
            <div><dt className="detail-label">연락처</dt><dd className="detail-value">{selected.phone}</dd></div>
            <div><dt className="detail-label">인원</dt><dd className="detail-value flex items-center gap-1"><Users size={14} /> {selected.participants}명</dd></div>
            <div><dt className="detail-label">상태</dt><dd className="mt-1"><span className={`status-badge ${statusStyle[selected.status].className}`}>{statusStyle[selected.status].label}</span></dd></div>
            <div className="col-span-2"><dt className="detail-label">요청사항</dt><dd className="detail-value mt-2 rounded-xl bg-slate-50 p-3">{selected.note}</dd></div>
          </dl>
          <div className="mt-6 flex justify-end"><button onClick={() => setSelected(null)} className="primary-button">확인</button></div>
        </Modal>
      )}
    </div>
  )
}
