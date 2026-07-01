import { ArrowUpRight, Egg, Trophy, Users } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { collectionRanking, monthlyCollectionTrend } from '../mock/dashboard'

const kpis = [
  { label: '총 수거량', value: '3,842.6', unit: 'kg', icon: Egg, tone: 'bg-amber-50 text-amber-600' },
  { label: '총 참여자 수', value: '1,286', unit: '명', icon: Users, tone: 'bg-sky-50 text-sky-600' },
  { label: '이번 달 증가량', value: '+146.2', unit: 'kg', icon: ArrowUpRight, tone: 'bg-emerald-50 text-emerald-600' },
]

export function CollectionsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <div><p className="text-sm font-bold text-emerald-600">EGGSHELL COLLECTION</p><h1 className="page-title">계란껍질 수거 참여 현황</h1><p className="page-description">지역 참여자와 함께 만든 자원 순환 성과를 확인하세요.</p></div>

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
        <div><h2 className="section-title">수거량 추이</h2><p className="section-description">최근 6개월 계란껍질 수거량 (kg)</p></div>
        <div className="mt-5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyCollectionTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs><linearGradient id="monthlyCollectionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.28} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="#e9efec" strokeDasharray="4 4" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0' }} formatter={(value) => [`${Number(value).toLocaleString()}kg`, '수거량']} />
              <Area type="monotone" dataKey="amount" stroke="#059669" strokeWidth={3} fill="url(#monthlyCollectionFill)" activeDot={{ r: 5, stroke: '#fff', strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="dashboard-card mt-5 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5 md:p-6"><span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><Trophy size={19} /></span><div><h2 className="section-title">수거 참여 랭킹 TOP 10</h2><p className="section-description">누적 수거량 기준</p></div></div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[680px]">
            <thead><tr><th>순위</th><th>이름</th><th>누적수거량</th><th>포인트</th></tr></thead>
            <tbody>
              {collectionRanking.map((participant) => (
                <tr key={participant.rank}>
                  <td><span className={`inline-grid size-8 place-items-center rounded-full text-xs font-black ${participant.rank <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{participant.rank}</span></td>
                  <td className="font-bold text-slate-800">{participant.name}</td><td>{participant.amount.toLocaleString()}kg</td><td className="font-bold text-emerald-700">{participant.points.toLocaleString()}P</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
