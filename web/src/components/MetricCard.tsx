import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { MetricCardData } from '../types/dashboard'

const toneStyle = {
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
}

export function MetricCard({ metric }: { metric: MetricCardData }) {
  const Icon = metric.icon
  const isUp = metric.trend === 'up'

  return (
    <article className="dashboard-card p-5">
      <div className="flex items-start justify-between">
        <div className={`grid size-11 place-items-center rounded-2xl ${toneStyle[metric.tone]}`}>
          <Icon size={21} />
        </div>
        <span className={`flex items-center gap-0.5 text-xs font-bold ${isUp ? 'text-emerald-600' : 'text-sky-600'}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {metric.change}
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{metric.label}</p>
      <div className="mt-1 flex items-baseline gap-1.5">
        <strong className="text-2xl font-extrabold tracking-tight text-slate-900">{metric.value}</strong>
        {metric.unit && <span className="text-sm font-semibold text-slate-400">{metric.unit}</span>}
      </div>
    </article>
  )
}
