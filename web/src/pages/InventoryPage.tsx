import { Flower2, Pencil, Plus, Search } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Modal } from '../components/Modal'
import { flowerInventoryItems } from '../mock/dashboard'
import type { FlowerInventoryItem, InventoryStatus } from '../types/dashboard'

const statusStyle: Record<InventoryStatus, { label: string; className: string }> = {
  sufficient: { label: '재고충분', className: 'bg-emerald-50 text-emerald-700' },
  low: { label: '재고부족', className: 'bg-amber-50 text-amber-700' },
  soldout: { label: '품절', className: 'bg-rose-50 text-rose-700' },
}

function getStatus(stock: number): InventoryStatus {
  if (stock === 0) return 'soldout'
  if (stock < 100) return 'low'
  return 'sufficient'
}

interface FlowerFormProps {
  initial?: FlowerInventoryItem
  onSubmit: (item: Omit<FlowerInventoryItem, 'id' | 'status'>) => void
  onClose: () => void
}

function FlowerForm({ initial, onSubmit, onClose }: FlowerFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [stock, setStock] = useState(String(initial?.stock ?? ''))
  const [price, setPrice] = useState(String(initial?.price ?? ''))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({ name: name.trim(), stock: Number(stock), price: Number(price) })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <label className="block"><span className="form-label">꽃 이름</span><input required value={name} onChange={(event) => setName(event.target.value)} className="form-input" placeholder="예: 화이트 튤립" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="form-label">재고수량</span><input required min="0" type="number" value={stock} onChange={(event) => setStock(event.target.value)} className="form-input" placeholder="0" /></label>
          <label className="block"><span className="form-label">가격</span><input required min="0" step="100" type="number" value={price} onChange={(event) => setPrice(event.target.value)} className="form-input" placeholder="0" /></label>
        </div>
        <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">재고 상태는 수량에 따라 자동 결정됩니다. 100주 이상은 재고충분, 1–99주는 재고부족, 0주는 품절입니다.</p>
      </div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onClose} className="secondary-button">취소</button><button type="submit" className="primary-button">{initial ? '수정 저장' : '꽃 등록'}</button></div>
    </form>
  )
}

export function InventoryPage() {
  const [items, setItems] = useState(flowerInventoryItems)
  const [query, setQuery] = useState('')
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editingItem, setEditingItem] = useState<FlowerInventoryItem | null>(null)

  const filteredItems = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase())),
    [items, query],
  )

  const openEdit = (item: FlowerInventoryItem) => {
    setEditingItem(item)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingItem(null)
  }

  const addFlower = (data: Omit<FlowerInventoryItem, 'id' | 'status'>) => {
    setItems((current) => [{ ...data, id: Date.now(), status: getStatus(data.stock) }, ...current])
    closeModal()
  }

  const updateFlower = (data: Omit<FlowerInventoryItem, 'id' | 'status'>) => {
    if (!editingItem) return
    setItems((current) => current.map((item) => item.id === editingItem.id ? { ...item, ...data, status: getStatus(data.stock) } : item))
    closeModal()
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-bold text-emerald-600">FLOWER INVENTORY</p><h1 className="page-title">꽃 재고 관리</h1><p className="page-description">판매 가능한 꽃의 수량과 가격을 관리하세요.</p></div>
        <button onClick={() => setModalMode('add')} className="primary-button self-start"><Plus size={17} /> 꽃 추가</button>
      </div>

      <section className="dashboard-card mt-7 overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <label className="relative block max-w-md"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="form-input pl-10" placeholder="꽃 이름으로 검색" /></label>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[760px]">
            <thead><tr><th>꽃 이름</th><th>재고수량</th><th>가격</th><th>상태</th><th className="text-right">관리</th></tr></thead>
            <tbody>
              {filteredItems.map((item) => {
                const status = statusStyle[item.status]
                return (
                  <tr key={item.id}>
                    <td><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-rose-50 text-rose-500"><Flower2 size={17} /></span><span className="font-bold text-slate-800">{item.name}</span></div></td>
                    <td className="font-semibold">{item.stock.toLocaleString()}주</td>
                    <td>{item.price.toLocaleString()}원</td>
                    <td><span className={`status-badge ${status.className}`}>{status.label}</span></td>
                    <td className="text-right"><button onClick={() => openEdit(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-700"><Pencil size={13} /> 수정</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredItems.length === 0 && <p className="p-12 text-center text-sm text-slate-400">검색 결과가 없습니다.</p>}
        </div>
      </section>

      {modalMode && (
        <Modal title={modalMode === 'add' ? '새 꽃 등록' : '꽃 정보 수정'} description="재고와 판매 가격을 입력하세요." onClose={closeModal}>
          <FlowerForm key={editingItem?.id ?? 'new'} initial={editingItem ?? undefined} onSubmit={modalMode === 'add' ? addFlower : updateFlower} onClose={closeModal} />
        </Modal>
      )}
    </div>
  )
}
