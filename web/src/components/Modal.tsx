import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  size?: 'md' | 'lg'
}

export function Modal({ title, description, children, onClose, size = 'md' }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={onClose}>
      <div className={`w-full rounded-3xl bg-white shadow-2xl ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'}`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 id="modal-title" className="text-lg font-extrabold text-slate-900">{title}</h2>
            {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="모달 닫기"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
