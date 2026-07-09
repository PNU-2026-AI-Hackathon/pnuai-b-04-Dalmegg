import { Flower2, ImageIcon, ImagePlus, LayoutGrid, List, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { createFlower, deleteFlower as deleteFlowerApi, listFlowers, updateFlower as updateFlowerApi } from '../api/flowers'
import { ApiError, getAssetUrl } from '../api/client'
import { Modal } from '../components/Modal'
import { flowerInventoryItems } from '../mock/dashboard'
import { useAuthStore } from '../store/useAuthStore'
import type { FlowerInventoryItem, InventoryStatus } from '../types/dashboard'

type InventoryViewMode = 'list' | 'grid'
type FlowerFormData = Omit<FlowerInventoryItem, 'id' | 'image_url'> & {
  image_url?: string
  image_file?: File
}
type StoredFlowerInventoryItem = Partial<FlowerInventoryItem> & {
  stock?: number
  imageUrl?: string
}

const INVENTORY_STORAGE_KEY = 'dalmegg.flowerInventory'
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const statusStyle: Record<InventoryStatus, { label: string; className: string }> = {
  sufficient: { label: '재고충분', className: 'bg-emerald-50 text-emerald-700' },
  low: { label: '재고부족', className: 'bg-amber-50 text-amber-700' },
  soldout: { label: '품절', className: 'bg-rose-50 text-rose-700' },
}

function getStatus(stockQuantity: number): InventoryStatus {
  if (stockQuantity === 0) return 'soldout'
  if (stockQuantity < 100) return 'low'
  return 'sufficient'
}

function normalizeInventoryItem(rawItem: StoredFlowerInventoryItem, index: number): FlowerInventoryItem {
  return {
    id: Number(rawItem.id) || Date.now() + index,
    shop_id: Number(rawItem.shop_id) || 1,
    name: rawItem.name ?? '',
    description: rawItem.description ?? '',
    color: rawItem.color ?? '',
    price: Number(rawItem.price) || 0,
    stock_quantity: Number(rawItem.stock_quantity ?? rawItem.stock ?? 0),
    image_url: rawItem.image_url ?? rawItem.imageUrl,
  }
}

function readStoredInventory(): FlowerInventoryItem[] {
  if (typeof window === 'undefined') {
    return flowerInventoryItems
  }

  try {
    const storedValue = window.localStorage.getItem(INVENTORY_STORAGE_KEY)
    if (!storedValue) {
      return flowerInventoryItems
    }

    const parsedValue = JSON.parse(storedValue)
    return Array.isArray(parsedValue)
      ? parsedValue.map((item, index) => normalizeInventoryItem(item as StoredFlowerInventoryItem, index))
      : flowerInventoryItems
  } catch {
    window.localStorage.removeItem(INVENTORY_STORAGE_KEY)
    return flowerInventoryItems
  }
}

function canUseLocalInventory(error: unknown) {
  return USE_MOCKS || !(error instanceof ApiError) || error.status >= 500
}

function createLocalFlower(data: FlowerFormData, shopId: number): FlowerInventoryItem {
  return {
    id: Date.now(),
    shop_id: shopId,
    name: data.name,
    description: data.description,
    color: data.color,
    price: Math.max(0, data.price),
    stock_quantity: Math.max(0, data.stock_quantity),
    image_url: data.image_url,
  }
}

function updateLocalFlower(current: FlowerInventoryItem, data: FlowerFormData): FlowerInventoryItem {
  return {
    ...current,
    shop_id: data.shop_id || current.shop_id,
    name: data.name,
    description: data.description,
    color: data.color,
    price: Math.max(0, data.price),
    stock_quantity: Math.max(0, data.stock_quantity),
    image_url: data.image_url ?? current.image_url,
  }
}

function FlowerImagePreview({ item, className = '' }: { item: Pick<FlowerInventoryItem, 'name' | 'image_url'>; className?: string }) {
  const imageUrl = getAssetUrl(item.image_url)

  if (imageUrl) {
    return <img src={imageUrl} alt={`${item.name} 이미지`} className={`h-full w-full object-cover ${className}`} />
  }

  return (
    <div className={`grid h-full w-full place-items-center bg-rose-50 text-rose-400 ${className}`}>
      <Flower2 size={24} />
    </div>
  )
}

interface FlowerFormProps {
  initial?: FlowerInventoryItem
  defaultShopId: number
  onSubmit: (item: FlowerFormData) => void | Promise<void>
  onClose: () => void
}

function FlowerForm({ initial, defaultShopId, onSubmit, onClose }: FlowerFormProps) {
  const shopId = initial?.shop_id ?? defaultShopId
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [color, setColor] = useState(initial?.color ?? '')
  const [stockQuantity, setStockQuantity] = useState(String(initial?.stock_quantity ?? ''))
  const [price, setPrice] = useState(String(initial?.price ?? ''))
  const [imageUrl, setImageUrl] = useState(getAssetUrl(initial?.image_url) ?? '')
  const [imageFile, setImageFile] = useState<File | undefined>()

  const inputId = `flower-image-${initial?.id ?? 'new'}`

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setImageFile(file)

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
      shop_id: Number(shopId),
      name: name.trim(),
      description: description.trim(),
      color: color.trim(),
      stock_quantity: Number(stockQuantity),
      price: Number(price),
      image_url: imageUrl || undefined,
      image_file: imageFile,
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
              <button type="button" onClick={() => { setImageUrl(''); setImageFile(undefined) }} className="secondary-button w-full text-rose-600">
                <X size={15} /> 이미지 삭제
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="form-label">꽃 이름</span>
            <input required value={name} onChange={(event) => setName(event.target.value)} className="form-input" placeholder="예: 장미" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="form-label">색상</span>
              <input value={color} onChange={(event) => setColor(event.target.value)} className="form-input" placeholder="예: 빨강" />
            </label>
            <label className="block">
              <span className="form-label">가격</span>
              <input required min="0" step="1" type="number" value={price} onChange={(event) => setPrice(event.target.value)} className="form-input" placeholder="0" />
            </label>
          </div>

          <label className="block">
            <span className="form-label">설명</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="form-input min-h-24 resize-none" placeholder="예: 빨간 장미" />
          </label>

          <label className="block">
            <span className="form-label">재고수량</span>
            <input min="0" type="number" value={stockQuantity} onChange={(event) => setStockQuantity(event.target.value)} className="form-input" placeholder="0" />
          </label>

          <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            저장한 꽃은 내 운영 공간의 판매 목록에 등록됩니다. 100주 이상은 재고충분, 1-99주는 재고부족, 0주는 품절입니다.
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
  const operator = useAuthStore((state) => state.operator)
  const [items, setItems] = useState<FlowerInventoryItem[]>(readStoredInventory)
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<InventoryViewMode>('list')
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [editingItem, setEditingItem] = useState<FlowerInventoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FlowerInventoryItem | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return items.filter((item) =>
      [item.name, item.description, item.color].some((value) => value.toLowerCase().includes(keyword)),
    )
  }, [items, query])

  useEffect(() => {
    let ignore = false

    async function loadFlowers() {
      try {
        const flowers = await listFlowers(operator?.shop_id || undefined)

        if (!ignore) {
          setItems(flowers)
        }
      } catch {
        // 데이터를 불러오지 못하면 기존 화면 데이터를 유지합니다.
      }
    }

    loadFlowers()

    return () => {
      ignore = true
    }
  }, [operator?.shop_id])

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

  const openDelete = (item: FlowerInventoryItem) => {
    setDeleteTarget(item)
    setDeleteError(null)
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingItem(null)
    setFormError(null)
  }

  const closeDeleteModal = () => {
    setDeleteTarget(null)
    setDeleteError(null)
  }

  const addFlower = async (data: FlowerFormData) => {
    const shopId = operator?.shop_id || data.shop_id || 1

    if (USE_MOCKS) {
      const localFlower = createLocalFlower(data, shopId)
      setItems((current) => [localFlower, ...current])
      closeModal()
      return
    }

    try {
      const createdFlower = await createFlower({
        ...data,
        shop_id: shopId,
      })
      setItems((current) => [createdFlower, ...current])
      closeModal()
    } catch (error) {
      if (canUseLocalInventory(error)) {
        const localFlower = createLocalFlower(data, shopId)
        setItems((current) => [localFlower, ...current])
        closeModal()
        return
      }

      setFormError('꽃 등록에 실패했습니다. 입력한 정보를 다시 확인해주세요.')
    }
  }

  const updateFlower = async (data: FlowerFormData) => {
    if (!editingItem) return

    if (USE_MOCKS) {
      const localFlower = updateLocalFlower(editingItem, data)
      setItems((current) => current.map((item) => item.id === editingItem.id ? localFlower : item))
      closeModal()
      return
    }

    try {
      const updatedFlower = await updateFlowerApi(editingItem.id, data, editingItem.stock_quantity)
      setItems((current) => current.map((item) => item.id === editingItem.id ? updatedFlower : item))
      closeModal()
    } catch (error) {
      if (canUseLocalInventory(error)) {
        const localFlower = updateLocalFlower(editingItem, data)
        setItems((current) => current.map((item) => item.id === editingItem.id ? localFlower : item))
        closeModal()
        return
      }

      setFormError('꽃 정보 수정에 실패했습니다. 입력한 정보를 다시 확인해주세요.')
    }
  }

  const deleteFlower = async () => {
    if (!deleteTarget) return

    if (USE_MOCKS) {
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id))
      closeDeleteModal()
      return
    }

    try {
      await deleteFlowerApi(deleteTarget.id)
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id))
      closeDeleteModal()
    } catch (error) {
      if (canUseLocalInventory(error)) {
        setItems((current) => current.filter((item) => item.id !== deleteTarget.id))
        closeDeleteModal()
        return
      }

      setDeleteError('꽃 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold text-emerald-600">FLOWER INVENTORY</p>
          <h1 className="page-title">꽃 재고 관리</h1>
          <p className="page-description">판매 가능한 꽃의 이미지, 색상, 설명, 수량, 가격을 관리하세요.</p>
        </div>
        <button onClick={() => setModalMode('add')} className="primary-button self-start">
          <Plus size={17} /> 꽃 추가
        </button>
      </div>

      <section className="dashboard-card mt-7 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="form-input pl-10" placeholder="꽃 이름, 설명, 색상 검색" />
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
            <table className="data-table min-w-[1080px]">
              <thead><tr><th>판매 이미지</th><th>꽃 이름</th><th>색상</th><th>설명</th><th>재고수량</th><th>가격</th><th>상태</th><th className="text-right">관리</th></tr></thead>
              <tbody>
                {filteredItems.map((item) => {
                  const status = statusStyle[getStatus(item.stock_quantity)]
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="size-14 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                          <FlowerImagePreview item={item} />
                        </div>
                      </td>
                      <td><span className="font-bold text-slate-800">{item.name}</span></td>
                      <td>{item.color || '-'}</td>
                      <td className="max-w-xs truncate">{item.description || '-'}</td>
                      <td className="font-semibold">{item.stock_quantity.toLocaleString()}주</td>
                      <td>{item.price.toLocaleString()}원</td>
                      <td><span className={`status-badge ${status.className}`}>{status.label}</span></td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-700">
                            <Pencil size={13} /> 수정
                          </button>
                          <button onClick={() => openDelete(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 px-3 py-2 text-xs font-bold text-rose-600 hover:border-rose-300 hover:bg-rose-50">
                            <Trash2 size={13} /> 삭제
                          </button>
                        </div>
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
                const status = statusStyle[getStatus(item.stock_quantity)]
                return (
                  <article key={item.id} className="dashboard-card overflow-hidden">
                    <div className="aspect-square bg-slate-50">
                      <FlowerImagePreview item={item} />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900">{item.name}</h2>
                          <p className="mt-1 text-xs font-bold text-slate-400">{item.color || '색상 미입력'} · 판매가 {item.price.toLocaleString()}원</p>
                        </div>
                        <span className={`status-badge shrink-0 ${status.className}`}>{status.label}</span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{item.description || '설명이 없습니다.'}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-600">재고 <span className="text-emerald-700">{item.stock_quantity.toLocaleString()}주</span></p>
                        <div className="flex shrink-0 items-center gap-2">
                          <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-700">
                            <Pencil size={13} /> 수정
                          </button>
                          <button onClick={() => openDelete(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 px-3 py-2 text-xs font-bold text-rose-600 hover:border-rose-300 hover:bg-rose-50">
                            <Trash2 size={13} /> 삭제
                          </button>
                        </div>
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
        <Modal title={modalMode === 'add' ? '새 꽃 등록' : '꽃 정보 수정'} description="판매할 꽃의 이미지, 설명, 가격, 재고를 입력하세요." onClose={closeModal} size="lg">
          {formError && <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{formError}</div>}
          <FlowerForm
            key={editingItem?.id ?? 'new'}
            initial={editingItem ?? undefined}
            defaultShopId={operator?.shop_id || 1}
            onSubmit={modalMode === 'add' ? addFlower : updateFlower}
            onClose={closeModal}
          />
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="꽃 삭제" description="판매 목록에서 선택한 꽃을 삭제합니다." onClose={closeDeleteModal}>
          {deleteError && <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">{deleteError}</div>}
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-extrabold text-slate-900">{deleteTarget.name}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">삭제하면 꽃 재고 목록에서 더 이상 보이지 않습니다.</p>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={closeDeleteModal} className="secondary-button">취소</button>
            <button type="button" onClick={deleteFlower} className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-rose-700">
              <Trash2 size={15} /> 삭제
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
