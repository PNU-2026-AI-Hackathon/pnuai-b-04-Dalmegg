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
  temperature: { icon: Thermometer, color: '#bf6d31' },
  humidity: { icon: Droplets, color: '#357c92' },
  light: { icon: Lightbulb, color: '#a76d20' },
  soil: { icon: Waves, color: '#2f744e' },
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
      <header className="border-b border-[#d9e0d7] pb-5"><p className="text-[11px] font-bold tracking-[.12em] text-rose-700">SMART FARM SENSOR</p><h1 className="mt-2 text-2xl font-semibold tracking-[-.045em] text-[#1d2921]">센서 모니터링</h1><p className="mt-1.5 text-[13px] text-slate-500">재배동 환경 센서의 현재값과 최근 24시간 변화를 확인하세요.</p></header>

      <section className="mt-5 grid divide-x divide-y divide-[#d9e0d7] overflow-hidden border border-[#d9e0d7] bg-[#d9e0d7] sm:grid-cols-2 xl:grid-cols-4 xl:divide-y-0">
        {sensors.map((sensor) => {
          const Icon = sensorConfig[sensor.id].icon
          const status = statusStyle[sensor.status]
          return (
            <button
              type="button"
              key={sensor.id}
              onClick={() => setSelectedSensor(sensor.id)}
              className={`bg-[#fffefa] p-4 text-left transition hover:bg-[#f4f7f1] ${selectedSensor === sensor.id ? 'bg-[#ebf1e9] shadow-[inset_0_-2px_0_#24734f]' : ''}`}
            >
              <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Icon size={15} style={{ color: sensorConfig[sensor.id].color }} /> {sensor.name}</span><span className={`text-[10px] font-bold ${status.className.split(' ')[1]}`}>{status.label}</span></div>
              <p className="mt-4 text-2xl font-semibold tracking-[-.045em] tabular-nums text-[#233128]">{sensor.value.toLocaleString()} <span className="text-xs font-medium text-slate-500">{sensor.unit}</span></p>
              <div className="mt-3 flex items-center justify-between border-t border-[#e2e7e0] pt-2.5 text-[10px]">
                <span className="text-slate-500">기준 {sensor.normalRange}</span><span className="text-slate-400">{sensor.updatedAt}</span>
              </div>
            </button>
          )
        })}
      </section>

      <section className="mt-7 border-t border-[#b9c7b9] pt-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div><h2 className="section-title">최근 24시간 {selected.name} 변화</h2><p className="section-description">2시간 간격 센서 측정값</p></div>
          <div className="flex flex-wrap gap-2">
            {sensors.map((sensor) => (
            <button key={sensor.id} onClick={() => setSelectedSensor(sensor.id)} className={`border-b-2 px-2 py-1.5 text-xs font-semibold ${selectedSensor === sensor.id ? 'border-rose-700 text-rose-800' : 'border-transparent text-slate-500 hover:text-rose-700'}`}>{sensor.name}</button>
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
