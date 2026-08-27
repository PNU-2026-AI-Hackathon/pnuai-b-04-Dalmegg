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
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={onClose}>
      <div className={`w-full border border-[#d5ddd4] bg-[#fffefa] shadow-xl shadow-slate-950/15 ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'}`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-[#e1e6df] px-6 py-5">
          <div>
            <h2 id="modal-title" className="text-lg font-extrabold text-slate-900">{title}</h2>
            {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="grid size-8 place-items-center text-slate-500 hover:bg-slate-100" aria-label="모달 닫기"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
