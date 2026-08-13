import { Sprout } from 'lucide-react'

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
        <Sprout size={21} strokeWidth={2.4} />
      </div>
      <div>
        <p className="text-[17px] font-extrabold tracking-[-0.04em] text-slate-900">닮은살걀</p>
        <p className="text-[10px] font-semibold tracking-[0.08em] text-emerald-600">CIRCULAR FLOWER FARM</p>
      </div>
    </div>
  )
}
