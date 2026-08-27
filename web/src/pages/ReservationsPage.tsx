import { CalendarDays, Eye, Plus, Search, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { listAdminReservations, updateAdminReservationStatus } from '../api/reservations'
import { createWorkshopProgram, listWorkshopPrograms } from '../api/workshops'
import { Modal } from '../components/Modal'
import { reservations } from '../mock/dashboard'
import { useAuthStore } from '../store/useAuthStore'
import type { WorkshopProgramRead } from '../api/types'
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
  const [attentionOnly, setAttentionOnly] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [programModalOpen, setProgramModalOpen] = useState(false)
  const [programError, setProgramError] = useState<string | null>(null)
  const [isCreatingProgram, setIsCreatingProgram] = useState(false)
  const [programForm, setProgramForm] = useState({ title: '', description: '', materials: '', starts_at: '', duration_minutes: '60', capacity: '10', price_per_person: '20000' })
  const [programs, setPrograms] = useState<WorkshopProgramRead[]>([])
  const [programFilter, setProgramFilter] = useState<number | 'all'>('all')

  useEffect(() => {
    let ignore = false

    async function loadReservations() {
      try {
        const nextReservations = await listAdminReservations({ shopId: operator?.shop_id || undefined })

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

  useEffect(() => {
    if (!operator?.shop_id) return
    let ignore = false
    void listWorkshopPrograms(operator.shop_id).then((nextPrograms) => {
      if (!ignore) setPrograms(nextPrograms)
    }).catch(() => {
      if (!ignore) setPrograms([])
    })
    return () => { ignore = true }
  }, [operator?.shop_id])

  const filteredReservations = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return items.filter((reservation) => {
      const matchesQuery = [
        reservation.user_full_name,
        reservation.user_email,
        reservation.program_title,
      ].some((value) => value.toLowerCase().includes(keyword))
      const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter
      const needsAttention = reservation.status === 'cancelled' || reservation.status === 'no_show'
      const matchesProgram = programFilter === 'all' || reservation.program_id === programFilter
      return matchesQuery && matchesStatus && matchesProgram && (!attentionOnly || needsAttention)
    })
  }, [attentionOnly, items, programFilter, query, statusFilter])
  const reservationSummary = [
    { key: 'reserved', label: '예약 접수', value: items.filter((item) => item.status === 'reserved').length, tone: 'text-amber-700' },
    { key: 'confirmed', label: '운영 확정', value: items.filter((item) => item.status === 'confirmed').length, tone: 'text-rose-700' },
    { key: 'attention', label: '확인 필요', value: items.filter((item) => item.status === 'no_show' || item.status === 'cancelled').length, tone: 'text-red-700' },
  ]

  const selectSummary = (key: string) => {
    setAttentionOnly(key === 'attention')
    setStatusFilter(key === 'attention' ? 'all' : key as ReservationStatus)
  }

  const updateStatus = async (status: ReservationStatus) => {
    if (!selected) return
    setIsUpdatingStatus(true)
    setStatusError(null)
    try {
      const updated = await updateAdminReservationStatus(selected.id, status)
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item))
      setSelected(updated)
    } catch {
      setStatusError('상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const openProgramModal = () => {
    setProgramError(null)
    setProgramForm({ title: '', description: '', materials: '', starts_at: '', duration_minutes: '60', capacity: '10', price_per_person: '20000' })
    setProgramModalOpen(true)
  }

  const submitProgram = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!operator?.shop_id) {
      setProgramError('운영 공간 정보를 찾을 수 없습니다.')
      return
    }
    const startsAt = new Date(programForm.starts_at)
    if (Number.isNaN(startsAt.getTime())) {
      setProgramError('체험 일시를 입력해주세요.')
      return
    }
    setIsCreatingProgram(true)
    setProgramError(null)
    try {
      const input = {
        shop_id: operator.shop_id,
        title: programForm.title.trim(),
        description: programForm.description.trim() || null,
        materials: programForm.materials.trim() || null,
        starts_at: startsAt.toISOString(),
        duration_minutes: Number(programForm.duration_minutes),
        capacity: Number(programForm.capacity),
        price_per_person: Number(programForm.price_per_person),
      }
      const saved = await createWorkshopProgram(input)
      setPrograms((current) => [...current, saved].sort((a, b) => a.starts_at.localeCompare(b.starts_at)))
      setProgramModalOpen(false)
    } catch {
      setProgramError('체험 개설에 실패했습니다. 입력값과 서버 연결을 확인해주세요.')
    } finally {
      setIsCreatingProgram(false)
    }
  }

  const nextStatusActions: Partial<Record<ReservationStatus, { status: ReservationStatus; label: string }[]>> = {
    reserved: [{ status: 'confirmed', label: '예약 확정' }, { status: 'cancelled', label: '예약 취소' }],
    confirmed: [{ status: 'completed', label: '체험 완료' }, { status: 'no_show', label: '미방문 처리' }, { status: 'cancelled', label: '예약 취소' }],
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold tracking-[.12em] text-rose-700">EXPERIENCE RESERVATION</p><h1 className="mt-2 text-[28px] font-semibold tracking-[-.05em] text-[#1d2921] md:text-[32px]">체험 예약 관리</h1><p className="mt-2 text-sm text-slate-500">내 운영 공간에 접수된 프로그램 예약을 확인하고 관리하세요.</p></div><button type="button" onClick={openProgramModal} className="primary-button self-start sm:self-auto"><Plus size={15} /> 체험 개설</button></div>

      {programs.length > 0 && <section className="mt-6"><div className="flex items-baseline justify-between border-b border-[#d9e0d7] pb-3"><div><h2 className="text-lg font-semibold tracking-[-.03em] text-[#1d2921]">개설 체험</h2><p className="mt-1 text-sm text-slate-500">체험 정보와 현재 신청 인원을 확인하세요.</p></div><span className="text-sm font-semibold text-slate-500">{programs.length}개 운영 중</span></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{programs.map((program) => <article key={program.id} className="border border-[#d9e0d7] bg-[#fffefa] p-5"><div><h3 className="font-semibold text-[#27332c]">{program.title}</h3><p className="mt-1 text-xs text-slate-500">{formatDateTime(program.starts_at)} · {program.duration_minutes}분</p></div><div className="mt-4 grid grid-cols-3 border-y border-[#e2e7e0] py-3 text-center"><div><p className="text-[10px] font-bold text-slate-400">신청 인원</p><p className="mt-1 font-semibold text-rose-700">{program.booked_count}명</p></div><div className="border-x border-[#e2e7e0]"><p className="text-[10px] font-bold text-slate-400">잔여 좌석</p><p className="mt-1 font-semibold text-[#27332c]">{program.remaining_seats}명</p></div><div><p className="text-[10px] font-bold text-slate-400">참가비</p><p className="mt-1 font-semibold text-[#27332c]">{program.price_per_person.toLocaleString()}원</p></div></div><button type="button" onClick={() => { setProgramFilter(program.id); setAttentionOnly(false); setStatusFilter('all'); setQuery('') }} className="mt-4 text-xs font-bold text-rose-800 hover:text-rose-950">신청자 보기</button></article>)}</div></section>}

      <section className="mt-6 grid divide-x divide-[#d9e0d7] overflow-hidden border border-[#d9e0d7] bg-[#fffefa] sm:grid-cols-3">
        {reservationSummary.map(({ key, label, value, tone }) => (
          <button key={key} type="button" onClick={() => selectSummary(key)} className="flex items-center justify-between px-5 py-4 text-left hover:bg-[#fff7f9]">
            <span className="text-sm text-slate-600">{label}</span><span className={`text-2xl font-semibold tabular-nums ${tone}`}>{value}<small className="ml-1 text-xs font-medium">건</small></span>
          </button>
        ))}
      </section>

      <section className="dashboard-card mt-7 overflow-hidden">
        <div className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-[minmax(0,1fr)_11rem]">
          <label className="relative block min-w-0"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="form-input !pl-16" placeholder="예약자명, 이메일, 프로그램 검색" /></label>
          <div className="grid gap-3 sm:grid-cols-2"><select value={programFilter} onChange={(event) => setProgramFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))} className="form-input !w-full"><option value="all">전체 체험</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.title}</option>)}</select><select value={statusFilter} onChange={(event) => { setAttentionOnly(false); setStatusFilter(event.target.value as 'all' | ReservationStatus) }} className="form-input !w-full">
            <option value="all">전체 상태</option>
            <option value="reserved">예약접수</option>
            <option value="confirmed">확정</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소</option>
            <option value="no_show">미방문</option>
          </select></div>
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
          {statusError && <p className="mt-5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{statusError}</p>}
          {nextStatusActions[selected.status] && <div className="mt-6 border-t border-slate-100 pt-5"><p className="text-xs font-bold text-slate-500">운영 처리</p><div className="mt-2 flex flex-wrap gap-2">{nextStatusActions[selected.status]?.map((action) => <button key={action.status} type="button" disabled={isUpdatingStatus} onClick={() => updateStatus(action.status)} className={action.status === 'cancelled' || action.status === 'no_show' ? 'secondary-button !text-rose-700' : 'primary-button'}>{isUpdatingStatus ? '변경 중…' : action.label}</button>)}</div></div>}
          <div className="mt-6 flex justify-end"><button onClick={() => setSelected(null)} className="secondary-button">닫기</button></div>
        </Modal>
      )}
      {programModalOpen && <Modal title="체험 프로그램 개설" description="개설한 체험은 앱에서 예약할 수 있습니다." onClose={() => setProgramModalOpen(false)}><form onSubmit={submitProgram} className="space-y-4"><label className="block"><span className="form-label">체험명</span><input required value={programForm.title} onChange={(event) => setProgramForm((current) => ({ ...current, title: event.target.value }))} className="form-input" placeholder="예: 나만의 꽃다발 만들기" /></label><label className="block"><span className="form-label">체험 일시</span><input required type="datetime-local" value={programForm.starts_at} onChange={(event) => setProgramForm((current) => ({ ...current, starts_at: event.target.value }))} className="form-input" /></label><div className="grid gap-4 sm:grid-cols-3"><label className="block"><span className="form-label">소요 시간(분)</span><input required min="1" type="number" value={programForm.duration_minutes} onChange={(event) => setProgramForm((current) => ({ ...current, duration_minutes: event.target.value }))} className="form-input" /></label><label className="block"><span className="form-label">정원(명)</span><input required min="1" type="number" value={programForm.capacity} onChange={(event) => setProgramForm((current) => ({ ...current, capacity: event.target.value }))} className="form-input" /></label><label className="block"><span className="form-label">참가비(원)</span><input required min="1" type="number" value={programForm.price_per_person} onChange={(event) => setProgramForm((current) => ({ ...current, price_per_person: event.target.value }))} className="form-input" /></label></div><label className="block"><span className="form-label">체험 소개</span><textarea value={programForm.description} onChange={(event) => setProgramForm((current) => ({ ...current, description: event.target.value }))} className="form-input min-h-24 resize-none" placeholder="체험 내용을 소개해주세요." /></label><label className="block"><span className="form-label">준비물 안내</span><input value={programForm.materials} onChange={(event) => setProgramForm((current) => ({ ...current, materials: event.target.value }))} className="form-input" placeholder="예: 편한 복장, 앞치마" /></label>{programError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{programError}</p>}<div className="flex justify-end gap-2 border-t border-slate-100 pt-5"><button type="button" onClick={() => setProgramModalOpen(false)} className="secondary-button">취소</button><button disabled={isCreatingProgram} className="primary-button">{isCreatingProgram ? '개설 중…' : '체험 개설'}</button></div></form></Modal>}
    </div>
  )
}
