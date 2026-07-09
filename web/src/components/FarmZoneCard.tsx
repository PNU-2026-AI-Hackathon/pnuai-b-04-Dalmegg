import { Droplets, Thermometer } from 'lucide-react'
import type { FarmZone } from '../types/dashboard'

interface FarmZoneCardProps {
  zone: FarmZone
  selected: boolean
  onSelect: (id: string) => void
}

export function FarmZoneCard({ zone, selected, onSelect }: FarmZoneCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(zone.id)}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? 'border-emerald-300 bg-emerald-50/70 ring-2 ring-emerald-100'
          : 'border-slate-100 bg-slate-50/70 hover:border-emerald-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-extrabold text-slate-800">{zone.name}</span>
          <span className="ml-2 text-xs font-medium text-slate-400">{zone.crop}</span>
        </div>
        <span className={`size-2.5 rounded-full ${zone.status === 'optimal' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <span className="flex items-center gap-1 text-slate-500"><Thermometer size={13} /> {zone.temperature}°</span>
        <span className="flex items-center gap-1 text-slate-500"><Droplets size={13} /> {zone.humidity}%</span>
        <span className="text-right font-bold text-emerald-600">{zone.soilMoisture}%</span>
      </div>
    </button>
  )
}
