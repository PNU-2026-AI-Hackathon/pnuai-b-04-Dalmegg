import { Flower2, ImageIcon, ImagePlus, LayoutGrid, List, Pencil, Plus, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Modal } from '../components/Modal'
import { flowerInventoryItems } from '../mock/dashboard'
import type { FlowerInventoryItem, InventoryStatus } from '../types/dashboard'

type InventoryViewMode = 'list' | 'grid'
type FlowerFormData = Omit<FlowerInventoryItem, 'id' | 'status'>
const INVENTORY_STORAGE_KEY = 'dalmegg.flowerInventory'

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

function readStoredInventory(): FlowerInventoryItem[] {
  try {
    const storedValue = window.localStorage.getItem(INVENTORY_STORAGE_KEY)
    return storedValue ? (JSON.parse(storedValue) as FlowerInventoryItem[]) : flowerInventoryItems
  } catch {
    window.localStorage.removeItem(INVENTORY_STORAGE_KEY)
    return flowerInventoryItems
  }
}

function FlowerImagePreview({ item, className = '' }: { item: Pick<FlowerInventoryItem, 'name' | 'imageUrl'>; className?: string }) {
  if (item.imageUrl) {
    return <img src={item.imageUrl} alt={`${item.name} 이미지`} className={`h-full w-full object-cover ${className}`} />
  }

  return (
    <div className={`grid h-full w-full place-items-center bg-rose-50 text-rose-400 ${className}`}>
      <Flower2 size={24} />
    </div>
  )
}

interface FlowerFormProps {
  initial?: FlowerInventoryItem
  onSubmit: (item: FlowerFormData) => void
  onClose: () => void
}

function FlowerForm({ initial, onSubmit, onClose }: FlowerFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [stock, setStock] = useState(String(initial?.stock ?? ''))
  const [price, setPrice] = useState(String(initial?.price ?? ''))
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')

  const inputId = `flower-image-${initial?.id ?? 'new'}`

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result)
      }
    }

    reader.readAsDataURL(file)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit({
      name: name.trim(),
      stock: Number(stock),
      price: Number(price),
      imageUrl: imageUrl || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-[180px_1fr]">
        <div>
          <span className="form-label">판매 이미지</span>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <div className="aspect-square">
              {imageUrl ? (
                <img src={imageUrl} alt="꽃 미리보기" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-slate-400">
                  <div className="text-center">
                    <ImageIcon className="mx-auto" size={30} />
                    <p className="mt-2 text-xs font-bold">이미지 없음</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            <label htmlFor={inputId} className="secondary-button w-full">
              <ImagePlus size={15} /> 이미지 첨부
            </label>
            <input id={inputId} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            {imageUrl && (
              <button type="button" onClick={() => setImageUrl('')} className="secondary-button w-full text-rose-600">
                <X size={15} /> 이미지 삭제
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="form-label">꽃 이름</span>
            <input required value={name} onChange={(event) => setName(event.target.value)} className="form-input" placeholder="예: 화이트 튤립" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="form-label">재고수량</span>
              <input required min="0" type="number" value={stock} onChange={(event) => setStock(event.target.value)} className="form-input" placeholder="0" />
            </label>
            <label className="block">
              <span className="form-label">가격</span>
              <input required min="0" step="100" type="number" value={price} onChange={(event) => setPrice(event.target.value)} className="form-input" placeholder="0" />
            </label>
          </div>
          <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            재고 상태는 수량에 따라 자동 결정됩니다. 100주 이상은 재고충분, 1-99주는 재고부족, 0주는 품절입니다.
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="secondary-button">취소</button>
        <button type="submit" className="primary-button">{initial ? '수정 저장' : '꽃 등록'}</button>
      </div>
    </form>
  )
}

export function InventoryPage() {
  const [items, setItems] = useState<FlowerInventoryItem[]>(readStoredInventory)
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<InventoryViewMode>('list')
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editingItem, setEditingItem] = useState<FlowerInventoryItem | null>(null)

  const filteredItems = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase())),
    [items, query],
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // 이미지 용량이 큰 경우 브라우저 저장소 한도를 넘을 수 있어 화면 상태만 유지합니다.
    }
  }, [items])

  const openEdit = (item: FlowerInventoryItem) => {
    setEditingItem(item)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingItem(null)
  }

  const addFlower = (data: FlowerFormData) => {
    setItems((current) => [{ ...data, id: Date.now(), status: getStatus(data.stock) }, ...current])
    closeModal()
  }

  const updateFlower = (data: FlowerFormData) => {
    if (!editingItem) return
    setItems((current) => current.map((item) => item.id === editingItem.id ? { ...item, ...data, status: getStatus(data.stock) } : item))
    closeModal()
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold text-emerald-600">FLOWER INVENTORY</p>
          <h1 className="page-title">꽃 재고 관리</h1>
          <p className="page-description">판매 가능한 꽃의 이미지, 수량, 가격을 관리하세요.</p>
        </div>
        <button onClick={() => setModalMode('add')} className="primary-button self-start">
          <Plus size={17} /> 꽃 추가
        </button>
      </div>

      <section className="dashboard-card mt-7 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="form-input pl-10" placeholder="꽃 이름으로 검색" />
          </label>
          <div className="inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-extrabold transition ${
                viewMode === 'list' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List size={15} /> 리스트
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-extrabold transition ${
                viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid size={15} /> 피드형
            </button>
          </div>
        </div>
      </section>

      {viewMode === 'list' ? (
        <section className="dashboard-card mt-5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table min-w-[860px]">
              <thead><tr><th>판매 이미지</th><th>꽃 이름</th><th>재고수량</th><th>가격</th><th>상태</th><th className="text-right">관리</th></tr></thead>
              <tbody>
                {filteredItems.map((item) => {
                  const status = statusStyle[item.status]
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="size-14 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                          <FlowerImagePreview item={item} />
                        </div>
                      </td>
                      <td><span className="font-bold text-slate-800">{item.name}</span></td>
                      <td className="font-semibold">{item.stock.toLocaleString()}주</td>
                      <td>{item.price.toLocaleString()}원</td>
                      <td><span className={`status-badge ${status.className}`}>{status.label}</span></td>
                      <td className="text-right">
                        <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-700">
                          <Pencil size={13} /> 수정
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredItems.length === 0 && <p className="p-12 text-center text-sm text-slate-400">검색 결과가 없습니다.</p>}
          </div>
        </section>
      ) : (
        <section className="mt-5">
          {filteredItems.length === 0 ? (
            <div className="dashboard-card p-12 text-center text-sm text-slate-400">검색 결과가 없습니다.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {filteredItems.map((item) => {
                const status = statusStyle[item.status]
                return (
                  <article key={item.id} className="dashboard-card overflow-hidden">
                    <div className="aspect-square bg-slate-50">
                      <FlowerImagePreview item={item} />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900">{item.name}</h2>
                          <p className="mt-1 text-xs font-bold text-slate-400">판매가 {item.price.toLocaleString()}원</p>
                        </div>
                        <span className={`status-badge shrink-0 ${status.className}`}>{status.label}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-600">재고 <span className="text-emerald-700">{item.stock.toLocaleString()}주</span></p>
                        <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-700">
                          <Pencil size={13} /> 수정
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {modalMode && (
        <Modal title={modalMode === 'add' ? '새 꽃 등록' : '꽃 정보 수정'} description="판매 이미지, 재고와 판매 가격을 입력하세요." onClose={closeModal} size="lg">
          <FlowerForm key={editingItem?.id ?? 'new'} initial={editingItem ?? undefined} onSubmit={modalMode === 'add' ? addFlower : updateFlower} onClose={closeModal} />
        </Modal>
      )}
    </div>
  )
}
