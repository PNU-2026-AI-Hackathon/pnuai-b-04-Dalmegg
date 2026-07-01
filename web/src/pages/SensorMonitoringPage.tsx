import { Droplets, Lightbulb, Thermometer, Waves } from 'lucide-react'
import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { sensorHistory, sensors } from '../mock/dashboard'
import type { SensorData } from '../types/dashboard'

const sensorConfig = {
  temperature: { icon: Thermometer, color: '#f97316', tone: 'bg-orange-50 text-orange-600' },
  humidity: { icon: Droplets, color: '#0ea5e9', tone: 'bg-sky-50 text-sky-600' },
  light: { icon: Lightbulb, color: '#f59e0b', tone: 'bg-amber-50 text-amber-600' },
  soil: { icon: Waves, color: '#10b981', tone: 'bg-emerald-50 text-emerald-600' },
}

const statusStyle = {
  normal: { label: '정상', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  warning: { label: '주의', className: 'bg-amber-50 text-amber-700 ring-amber-100' },
  danger: { label: '위험', className: 'bg-rose-50 text-rose-700 ring-rose-100' },
}

export function SensorMonitoringPage() {
  const [selectedSensor, setSelectedSensor] = useState<SensorData['id']>('temperature')
  const selected = sensors.find((sensor) => sensor.id === selectedSensor) ?? sensors[0]
  const config = sensorConfig[selected.id]

  return (
    <div className="mx-auto max-w-[1500px]">
      <div>
        <p className="text-sm font-bold text-emerald-600">SMART FARM SENSOR</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-slate-900 md:text-3xl">센서 모니터링</h1>
        <p className="mt-2 text-sm text-slate-500">재배동 환경 센서의 현재값과 최근 24시간 변화를 확인하세요.</p>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sensors.map((sensor) => {
          const Icon = sensorConfig[sensor.id].icon
          const status = statusStyle[sensor.status]
          return (
            <button
              type="button"
              key={sensor.id}
              onClick={() => setSelectedSensor(sensor.id)}
              className={`dashboard-card p-5 text-left transition hover:-translate-y-0.5 ${selectedSensor === sensor.id ? 'border-emerald-300 ring-2 ring-emerald-100' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className={`grid size-11 place-items-center rounded-2xl ${sensorConfig[sensor.id].tone}`}><Icon size={21} /></div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ${status.className}`}>{status.label}</span>
              </div>
              <p className="mt-5 text-sm font-bold text-slate-600">{sensor.name}</p>
              <p className="mt-1 text-3xl font-black tracking-tight text-slate-900">{sensor.value.toLocaleString()} <span className="text-sm text-slate-400">{sensor.unit}</span></p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
                <span className="text-slate-400">정상 {sensor.normalRange}</span><span className="text-slate-400">{sensor.updatedAt}</span>
              </div>
            </button>
          )
        })}
      </section>

      <section className="dashboard-card mt-5 p-5 md:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div><h2 className="section-title">최근 24시간 {selected.name} 변화</h2><p className="section-description">2시간 간격 센서 측정값</p></div>
          <div className="flex flex-wrap gap-2">
            {sensors.map((sensor) => (
              <button key={sensor.id} onClick={() => setSelectedSensor(sensor.id)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${selectedSensor === sensor.id ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-500'}`}>{sensor.name}</button>
            ))}
          </div>
        </div>
        <div className="mt-6 h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sensorHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e9efec" strokeDasharray="4 4" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0' }} formatter={(value) => [`${Number(value).toLocaleString()}${selected.unit}`, selected.name]} />
              <Line type="monotone" dataKey={selected.id} stroke={config.color} strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
