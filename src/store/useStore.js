import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ZONE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
]

const useStore = create(
  persist(
    (set, get) => ({
      // Image state
      image: null, // { src, widthPx, heightPx, realWidthFt }
      pixelsPerFoot: 10,

      // Zones
      zones: [],

      // Sprinkler heads
      heads: [],

      // UI state (not persisted)
      selectedHeadId: null,
      mode: 'select', // 'select' | 'place'

      // Actions
      setImage: (imageData) => set({ image: imageData }),

      setScale: (realWidthFt) => set((state) => ({
        pixelsPerFoot: state.image ? state.image.widthPx / realWidthFt : 10,
        image: state.image ? { ...state.image, realWidthFt } : null,
      })),

      setMode: (mode) => set({ mode }),

      setSelectedHead: (id) => set({ selectedHeadId: id }),

      addZone: (name, gpm, number) => {
        const id = crypto.randomUUID()
        const zones = get().zones
        const color = ZONE_COLORS[zones.length % ZONE_COLORS.length]
        const zoneNumber = number ?? (zones.length + 1)
        set((state) => ({
          zones: [...state.zones, {
            id,
            number: zoneNumber,
            name: name ?? `Zone ${zoneNumber}`,
            gpm: gpm || 2.0,
            color,
          }],
        }))
        return id
      },

      moveZone: (id, direction) => set((state) => {
        const sorted = [...state.zones].sort((a, b) => a.number - b.number)
        const idx = sorted.findIndex(z => z.id === id)
        if (direction === 'up' && idx === 0) return {}
        if (direction === 'down' && idx === sorted.length - 1) return {}
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1
        const thisNum = sorted[idx].number
        const swapNum = sorted[swapIdx].number
        return {
          zones: state.zones.map(z => {
            if (z.id === sorted[idx].id) return { ...z, number: swapNum }
            if (z.id === sorted[swapIdx].id) return { ...z, number: thisNum }
            return z
          }),
        }
      }),

      updateZone: (id, updates) => set((state) => ({
        zones: state.zones.map(z => z.id === id ? { ...z, ...updates } : z),
      })),

      removeZone: (id) => set((state) => ({
        zones: state.zones.filter(z => z.id !== id),
        heads: state.heads.map(h => h.zoneId === id ? { ...h, zoneId: null } : h),
      })),

      addHead: (x, y) => {
        const id = crypto.randomUUID()
        set((state) => ({
          heads: [...state.heads, {
            id,
            zoneId: null,
            x,
            y,
            type: 'rotary',
            radiusFt: 10,
            startAngle: 0,
            endAngle: 270,
          }],
          selectedHeadId: id,
          mode: 'select',
        }))
        return id
      },

      updateHead: (id, updates) => set((state) => ({
        heads: state.heads.map(h => h.id === id ? { ...h, ...updates } : h),
      })),

      removeHead: (id) => set((state) => ({
        heads: state.heads.filter(h => h.id !== id),
        selectedHeadId: state.selectedHeadId === id ? null : state.selectedHeadId,
      })),
    }),
    {
      name: 'irrigation-store',
      // Persist planning data only — exclude image (src is a blob URL that
      // becomes invalid on reload, and base64 would exceed localStorage quota)
      partialize: (state) => ({
        pixelsPerFoot: state.pixelsPerFoot,
        zones: state.zones,
        heads: state.heads,
      }),
    }
  )
)

export default useStore
