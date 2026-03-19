import { create } from 'zustand'

const ZONE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
]

let headIdCounter = 0
let zoneIdCounter = 0

function genHeadId() { return `head-${++headIdCounter}` }
function genZoneId() { return `zone-${++zoneIdCounter}` }

const useStore = create((set, get) => ({
  // Image state
  image: null, // { src, widthPx, heightPx, realWidthFt }
  pixelsPerFoot: 10,

  // Zones
  zones: [],

  // Sprinkler heads
  heads: [],

  // UI state
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

  addZone: (name, gpm) => {
    const id = genZoneId()
    const zones = get().zones
    const color = ZONE_COLORS[zones.length % ZONE_COLORS.length]
    set((state) => ({
      zones: [...state.zones, {
        id,
        number: zones.length + 1,
        name: name || `Zone ${zones.length + 1}`,
        gpm: gpm || 2.0,
        color,
      }],
    }))
    return id
  },

  updateZone: (id, updates) => set((state) => ({
    zones: state.zones.map(z => z.id === id ? { ...z, ...updates } : z),
  })),

  removeZone: (id) => set((state) => ({
    zones: state.zones.filter(z => z.id !== id),
    heads: state.heads.map(h => h.zoneId === id ? { ...h, zoneId: null } : h),
  })),

  addHead: (x, y) => {
    const id = genHeadId()
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
}))

export default useStore
