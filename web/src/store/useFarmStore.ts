import { create } from 'zustand'

interface FarmState {
  selectedZoneId: string
  sidebarOpen: boolean
  selectZone: (zoneId: string) => void
  toggleSidebar: () => void
  closeSidebar: () => void
}

export const useFarmStore = create<FarmState>((set) => ({
  selectedZoneId: 'A',
  sidebarOpen: false,
  selectZone: (zoneId) => set({ selectedZoneId: zoneId }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}))
