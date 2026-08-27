import { CloudOff, Droplets, Lightbulb, Thermometer, Waves } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getLatestSensorReading, listSensorDevices, listSensorReadings } from '../api/sensors'
import type { SensorLatestRead, SensorReadingRead, SmartFarmDeviceRead } from '../api/types'
import { sensorHistory, sensors } from '../mock/dashboard'
import type { SensorData } from '../types/dashboard'

type SensorChartPoint = {
  time: string
  temperature: number | null
  humidity: number | null
  light: number | null
  soil: number | null
}

const sensorConfig = {
  temperature: { icon: Thermometer, color: '#bf6d31', key: 'temperature_c', min: 20, max: 26, action: '환기·냉난방 장치와 재배동 온도를 확인하세요.' },
  humidity: { icon: Droplets, color: '#357c92', key: 'humidity_pct', min: 60, max: 75, action: '가습·환기 장치와 습도 유지 상태를 점검하세요.' },
  light: { icon: Lightbulb, color: '#a76d20', key: 'light_lux', min: 15000, max: 25000, action: '보광등 작동 시간과 조도 센서 위치를 확인하세요.' },
  soil: { icon: Waves, color: '#2f744e', key: 'soil_moisture_pct', min: 50, max: 70, action: '급수 상태와 관수 장치를 우선 확인하세요.' },
} as const

const statusStyle = {
  normal: { label: '정상', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' },
  warning: { label: '주의', className: 'bg-amber-50 text-amber-700 ring-amber-100' },
  danger: { label: '위험', className: 'bg-rose-50 text-rose-700 ring-rose-100' },
}

function statusFor(value: number, min: number, max: number): SensorData['status'] {
  if (value < min || value > max) return Math.abs(value - (value < min ? min : max)) > (max - min) * 0.2 ? 'danger' : 'warning'
  return 'normal'
}

function formatTime(value?: string | null) {
  if (!value) return '수신 시각 없음'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000))
  return minutes < 1 ? '방금 전' : minutes < 60 ? `${minutes}분 전` : new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' }).format(date)
}

function mapLatest(latest: SensorLatestRead): SensorData[] {
  return (Object.entries(sensorConfig) as Array<[SensorData['id'], typeof sensorConfig[SensorData['id']]]>).flatMap(([id, config]) => {
    const value = latest[config.key]
    if (value === null || value === undefined) return []
    return [{ id, name: id === 'temperature' ? '온도' : id === 'humidity' ? '습도' : id === 'light' ? '조도' : '토양수분', value, unit: id === 'temperature' ? '°C' : id === 'light' ? 'lx' : '%', normalRange: `${config.min.toLocaleString()}–${config.max.toLocaleString()}${id === 'temperature' ? '°C' : id === 'light' ? 'lx' : '%'}`, status: statusFor(value, config.min, config.max), updatedAt: formatTime(latest.measured_at) }]
  })
}

function mapHistory(readings: SensorReadingRead[]) {
  return readings.slice().reverse().map((reading) => ({
    time: new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' }).format(new Date(reading.measured_at)),
    temperature: reading.temperature_c,
    humidity: reading.humidity_pct,
    light: reading.light_lux,
    soil: reading.soil_moisture_pct,
  }))
}

export function SensorMonitoringPage() {
  const [selectedSensor, setSelectedSensor] = useState<SensorData['id']>('temperature')
  const [sensorItems, setSensorItems] = useState<SensorData[]>(sensors)
  const [history, setHistory] = useState<SensorChartPoint[]>(sensorHistory)
  const [device, setDevice] = useState<SmartFarmDeviceRead | null>(null)
  const [receivedAt, setReceivedAt] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let ignore = false
    async function loadSensors() {
      try {
        const devices = await listSensorDevices()
        const selectedDevice = [...devices].sort((a, b) => (b.last_seen_at ?? '').localeCompare(a.last_seen_at ?? ''))[0]
        if (!selectedDevice) throw new Error('No sensor device')
        const [latest, readings] = await Promise.all([
          getLatestSensorReading(selectedDevice.farm_uid, selectedDevice.device_uid),
          listSensorReadings(selectedDevice.farm_uid, selectedDevice.device_uid),
        ])
        const nextSensors = mapLatest(latest)
        if (!ignore && nextSensors.length > 0) {
          setDevice(selectedDevice)
          setSensorItems(nextSensors)
          setHistory(mapHistory(readings))
          setReceivedAt(latest.measured_at)
          setIsLive(true)
        }
      } catch {
        if (!ignore) setIsLive(false)
      }
    }
    loadSensors()
    return () => { ignore = true }
  }, [])

  const selected = sensorItems.find((sensor) => sensor.id === selectedSensor) ?? sensorItems[0]
  const config = sensorConfig[selected.id]
  const numericHistory = useMemo(() => history.filter((point) => point[selected.id] !== null && point[selected.id] !== undefined), [history, selected.id])
  const values = numericHistory.map((point) => Number(point[selected.id])).filter(Number.isFinite)
  const minValue = values.length ? Math.min(...values) : selected.value
  const maxValue = values.length ? Math.max(...values) : selected.value

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="flex flex-col justify-between gap-3 border-b border-[#d9e0d7] pb-5 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold tracking-[.12em] text-rose-700">SMART FARM SENSOR</p><h1 className="mt-2 text-2xl font-semibold tracking-[-.045em] text-[#1d2921]">센서 모니터링</h1><p className="mt-1.5 text-[13px] text-slate-500">재배동 환경 센서의 현재값과 최근 24시간 변화를 확인하세요.</p></div><p className={`inline-flex items-center gap-2 text-xs font-bold ${isLive ? 'text-emerald-800' : 'text-amber-800'}`}>{isLive ? <span className="size-2 rounded-full bg-emerald-500" /> : <CloudOff size={15} />}{isLive ? `${device?.name ?? device?.device_uid ?? '센서'} · ${formatTime(receivedAt)}` : '하드웨어 연결 확인 필요 · 예시값 표시 중'}</p></header>

      <section className="mt-5 grid divide-x divide-y divide-[#d9e0d7] overflow-hidden border border-[#d9e0d7] bg-[#d9e0d7] sm:grid-cols-2 xl:grid-cols-4 xl:divide-y-0">{sensorItems.map((sensor) => { const Icon = sensorConfig[sensor.id].icon; const status = statusStyle[sensor.status]; return <button type="button" key={sensor.id} onClick={() => setSelectedSensor(sensor.id)} className={`bg-[#fffefa] p-4 text-left transition hover:bg-[#f4f7f1] ${selectedSensor === sensor.id ? 'bg-[#ebf1e9] shadow-[inset_0_-2px_0_#d94f82]' : ''}`}><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold text-slate-600"><Icon size={15} style={{ color: sensorConfig[sensor.id].color }} /> {sensor.name}</span><span className={`text-[10px] font-bold ${status.className.split(' ')[1]}`}>{status.label}</span></div><p className="mt-4 text-2xl font-semibold tracking-[-.045em] tabular-nums text-[#233128]">{sensor.value.toLocaleString()} <span className="text-xs font-medium text-slate-500">{sensor.unit}</span></p><div className="mt-3 flex items-center justify-between border-t border-[#e2e7e0] pt-2.5 text-[10px]"><span className="text-slate-500">기준 {sensor.normalRange}</span><span className="text-slate-400">{sensor.updatedAt}</span></div></button> })}</section>

      <section className="mt-7 grid gap-5 xl:grid-cols-[1fr_18rem]"><div className="border-t border-[#b9c7b9] pt-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 className="section-title">최근 24시간 {selected.name} 변화</h2><p className="section-description">정상 범위는 연한 색 영역으로 표시됩니다.</p></div><div className="flex flex-wrap gap-2">{sensorItems.map((sensor) => <button key={sensor.id} onClick={() => setSelectedSensor(sensor.id)} className={`border-b-2 px-2 py-1.5 text-xs font-semibold ${selectedSensor === sensor.id ? 'border-rose-700 text-rose-800' : 'border-transparent text-slate-500 hover:text-rose-700'}`}>{sensor.name}</button>)}</div></div><div className="mt-6 h-[360px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={numericHistory} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e9efec" strokeDasharray="4 4" /><XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} domain={['auto', 'auto']} /><ReferenceArea y1={config.min} y2={config.max} fill="#dff2e3" fillOpacity={0.55} /><Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0' }} formatter={(value) => [`${Number(value).toLocaleString()}${selected.unit}`, selected.name]} /><Line type="monotone" dataKey={selected.id} stroke={config.color} strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff' }} /></LineChart></ResponsiveContainer></div></div><aside className="dashboard-card self-start p-5"><p className="text-xs font-extrabold tracking-[.08em] text-rose-700">판단 근거</p><h2 className="mt-2 text-lg font-bold text-[#243029]">{selected.name} {statusStyle[selected.status].label}</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-slate-500">현재값</dt><dd className="font-extrabold">{selected.value.toLocaleString()}{selected.unit}</dd></div><div className="flex justify-between"><dt className="text-slate-500">정상 범위</dt><dd className="font-bold">{selected.normalRange}</dd></div><div className="flex justify-between"><dt className="text-slate-500">24시간 최저</dt><dd className="font-bold">{minValue.toLocaleString()}{selected.unit}</dd></div><div className="flex justify-between"><dt className="text-slate-500">24시간 최고</dt><dd className="font-bold">{maxValue.toLocaleString()}{selected.unit}</dd></div></dl><div className={`mt-5 rounded-lg p-3 text-xs leading-5 ${selected.status === 'normal' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}><strong className="block">권장 조치</strong><span className="mt-1 block">{selected.status === 'normal' ? '현재 범위가 안정적입니다. 다음 수신값을 지속적으로 확인하세요.' : config.action}</span></div></aside></section>
    </div>
  )
}
