import { ArrowUpRight, Building2, Egg, Trophy, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getCollectionRankings, getCollectionSummary, getCollectionTrends } from '../api/collections'
import { collectionRanking, monthlyCollectionTrend } from '../mock/dashboard'
import { useAuthStore } from '../store/useAuthStore'
import type { CollectionData, CollectionRanking } from '../types/dashboard'

export function CollectionsPage() {
  const operator = useAuthStore((state) => state.operator)
  const shopName = operator?.shop_name ?? '내 스마트팜'
  const [summary, setSummary] = useState({
    total_weight_kg: 3842.6,
    participant_count: 1286,
    collection_count: 842,
  })
  const [trends, setTrends] = useState<CollectionData[]>(monthlyCollectionTrend)
  const [rankings, setRankings] = useState<CollectionRanking[]>(collectionRanking)

  useEffect(() => {
    let ignore = false

    async function loadCollections() {
      try {
        const [nextSummary, nextTrends, nextRankings] = await Promise.all([
          getCollectionSummary(),
          getCollectionTrends('monthly'),
          getCollectionRankings(),
        ])

        if (ignore) {
          return
        }

        setSummary(nextSummary)
        setTrends(nextTrends)
        setRankings(nextRankings.map((ranking) => ({
          ...ranking,
          full_name: ranking.full_name ?? '이름 없음',
        })))
      } catch {
        // 데이터를 불러오지 못하면 기존 화면 데이터를 유지합니다.
      }
    }

    loadCollections()

    return () => {
      ignore = true
    }
  }, [])

  const kpis = [
    { label: '내 운영지 총 수거량', value: summary.total_weight_kg.toLocaleString(), unit: 'kg', icon: Egg, tone: 'bg-amber-50 text-amber-600' },
    { label: '연결 참여자 수', value: summary.participant_count.toLocaleString(), unit: '명', icon: Users, tone: 'bg-sky-50 text-sky-600' },
    { label: '수거 기록 수', value: summary.collection_count.toLocaleString(), unit: '회', icon: ArrowUpRight, tone: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold text-emerald-600">EGGSHELL COLLECTION</p>
          <h1 className="page-title">{shopName} 계란껍질 수거 현황</h1>
          <p className="page-description">담당 스마트팜에 등록된 수거 기록과 참여자 성과를 확인하세요.</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          <Building2 size={16} />
          <span>{operator?.address ?? '운영지 기준'}</span>
        </div>
      </div>

      <section className="mt-7 grid gap-4 md:grid-cols-3">
        {kpis.map(({ label, value, unit, icon: Icon, tone }) => (
          <article key={label} className="dashboard-card p-5">
            <div className={`grid size-11 place-items-center rounded-2xl ${tone}`}><Icon size={21} /></div>
            <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{value} <span className="text-sm text-slate-400">{unit}</span></p>
          </article>
        ))}
      </section>

      <section className="dashboard-card mt-5 p-5 md:p-6">
        <div><h2 className="section-title">내 운영지 수거량 추이</h2><p className="section-description">최근 6개월 계란껍질 수거량 (kg)</p></div>
        <div className="mt-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs><linearGradient id="monthlyCollectionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.28} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="#e9efec" strokeDasharray="4 4" />
              <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0' }} formatter={(value) => [`${Number(value).toLocaleString()}kg`, '수거량']} />
              <Area type="monotone" dataKey="weight_kg" stroke="#059669" strokeWidth={3} fill="url(#monthlyCollectionFill)" activeDot={{ r: 5, stroke: '#fff', strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="dashboard-card mt-5 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5 md:p-6"><span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><Trophy size={19} /></span><div><h2 className="section-title">내 운영지 참여자 현황</h2><p className="section-description">해당 스마트팜에 연결된 참여자의 누적 수거량 기준</p></div></div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[860px]">
            <thead><tr><th>순위</th><th>이름</th><th>이메일</th><th>누적수거량</th><th>포인트</th><th>기여횟수</th></tr></thead>
            <tbody>
              {rankings.map((participant) => (
                <tr key={participant.rank}>
                  <td><span className={`inline-grid size-8 place-items-center rounded-full text-xs font-black ${participant.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{participant.rank}</span></td>
                  <td className="font-bold text-slate-800">{participant.full_name}</td>
                  <td>{participant.email}</td>
                  <td>{participant.total_weight_kg.toLocaleString()}kg</td>
                  <td className="font-bold text-emerald-700">{participant.reward_points.toLocaleString()}P</td>
                  <td>{participant.contribution_count.toLocaleString()}회</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
