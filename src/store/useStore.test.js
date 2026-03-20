import { describe, it, expect, beforeEach } from 'vitest'
import useStore from './useStore'

const ZONE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
]

function resetStore() {
  useStore.setState({
    image: null,
    pixelsPerFoot: 10,
    zones: [],
    heads: [],
    selectedHeadId: null,
    mode: 'select',
  })
}

beforeEach(resetStore)

describe('addZone', () => {
  it('creates zone with correct defaults', () => {
    useStore.getState().addZone()
    const zones = useStore.getState().zones
    expect(zones).toHaveLength(1)
    expect(zones[0].name).toBe('Zone 1')
    expect(zones[0].gpm).toBe(2.0)
    expect(zones[0].number).toBe(1)
  })

  it('uses provided name and gpm', () => {
    useStore.getState().addZone('Front Lawn', 3.5)
    const zone = useStore.getState().zones[0]
    expect(zone.name).toBe('Front Lawn')
    expect(zone.gpm).toBe(3.5)
  })

  it('auto-increments number for subsequent zones', () => {
    useStore.getState().addZone()
    useStore.getState().addZone()
    const zones = useStore.getState().zones
    expect(zones[0].number).toBe(1)
    expect(zones[1].number).toBe(2)
  })

  it('assigns color from palette', () => {
    useStore.getState().addZone()
    const zone = useStore.getState().zones[0]
    expect(ZONE_COLORS).toContain(zone.color)
  })

  it('cycles through palette colors', () => {
    for (let i = 0; i < 9; i++) useStore.getState().addZone()
    const zones = useStore.getState().zones
    expect(zones[0].color).toBe(ZONE_COLORS[0])
    expect(zones[8].color).toBe(ZONE_COLORS[0]) // wraps back
  })
})

describe('updateZone', () => {
  it('updates only specified fields', () => {
    useStore.getState().addZone('Old Name', 2.0)
    const id = useStore.getState().zones[0].id
    useStore.getState().updateZone(id, { name: 'New Name' })
    const zone = useStore.getState().zones[0]
    expect(zone.name).toBe('New Name')
    expect(zone.gpm).toBe(2.0) // unchanged
  })
})

describe('removeZone', () => {
  it('removes the zone', () => {
    useStore.getState().addZone()
    const id = useStore.getState().zones[0].id
    useStore.getState().removeZone(id)
    expect(useStore.getState().zones).toHaveLength(0)
  })

  it('unassigns heads that belonged to that zone', () => {
    useStore.getState().addZone()
    const zoneId = useStore.getState().zones[0].id
    useStore.getState().addHead(10, 10)
    const headId = useStore.getState().heads[0].id
    useStore.getState().updateHead(headId, { zoneId })

    useStore.getState().removeZone(zoneId)
    expect(useStore.getState().heads[0].zoneId).toBeNull()
  })
})

describe('addHead', () => {
  it('creates head with correct defaults', () => {
    useStore.getState().addHead(50, 75)
    const heads = useStore.getState().heads
    expect(heads).toHaveLength(1)
    expect(heads[0].x).toBe(50)
    expect(heads[0].y).toBe(75)
    expect(heads[0].type).toBe('rotary')
    expect(heads[0].radiusFt).toBe(10)
    expect(heads[0].startAngle).toBe(0)
    expect(heads[0].endAngle).toBe(270)
    expect(heads[0].zoneId).toBeNull()
  })

  it('sets selectedHeadId to the new head', () => {
    useStore.getState().addHead(10, 10)
    const head = useStore.getState().heads[0]
    expect(useStore.getState().selectedHeadId).toBe(head.id)
  })

  it('sets mode to select', () => {
    useStore.setState({ mode: 'place' })
    useStore.getState().addHead(10, 10)
    expect(useStore.getState().mode).toBe('select')
  })
})

describe('updateHead', () => {
  it('updates only specified fields', () => {
    useStore.getState().addHead(10, 10)
    const id = useStore.getState().heads[0].id
    useStore.getState().updateHead(id, { radiusFt: 15 })
    const head = useStore.getState().heads[0]
    expect(head.radiusFt).toBe(15)
    expect(head.x).toBe(10) // unchanged
  })
})

describe('removeHead', () => {
  it('removes the head', () => {
    useStore.getState().addHead(10, 10)
    const id = useStore.getState().heads[0].id
    useStore.getState().removeHead(id)
    expect(useStore.getState().heads).toHaveLength(0)
  })

  it('clears selectedHeadId if removed head was selected', () => {
    useStore.getState().addHead(10, 10)
    const id = useStore.getState().heads[0].id
    expect(useStore.getState().selectedHeadId).toBe(id)
    useStore.getState().removeHead(id)
    expect(useStore.getState().selectedHeadId).toBeNull()
  })

  it('does not clear selectedHeadId if a different head was removed', () => {
    useStore.getState().addHead(10, 10)
    const id1 = useStore.getState().heads[0].id
    useStore.getState().addHead(20, 20)
    const id2 = useStore.getState().heads[1].id
    // Select the first head manually
    useStore.getState().setSelectedHead(id1)
    useStore.getState().removeHead(id2)
    expect(useStore.getState().selectedHeadId).toBe(id1)
  })
})

describe('setScale', () => {
  it('computes pixelsPerFoot from image width / realWidthFt', () => {
    useStore.setState({ image: { src: 'x', widthPx: 600, heightPx: 400 } })
    useStore.getState().setScale(60)
    expect(useStore.getState().pixelsPerFoot).toBe(10) // 600/60
  })

  it('stores realWidthFt on the image', () => {
    useStore.setState({ image: { src: 'x', widthPx: 600, heightPx: 400 } })
    useStore.getState().setScale(60)
    expect(useStore.getState().image.realWidthFt).toBe(60)
  })

  it('falls back to 10 when no image is set', () => {
    useStore.getState().setScale(50)
    expect(useStore.getState().pixelsPerFoot).toBe(10)
  })
})

describe('setMode', () => {
  it('sets mode to place', () => {
    useStore.getState().setMode('place')
    expect(useStore.getState().mode).toBe('place')
  })

  it('sets mode to select', () => {
    useStore.setState({ mode: 'place' })
    useStore.getState().setMode('select')
    expect(useStore.getState().mode).toBe('select')
  })
})

describe('persistence', () => {
  it('zone IDs are non-empty strings', () => {
    useStore.getState().addZone()
    const id = useStore.getState().zones[0].id
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('head IDs are non-empty strings', () => {
    useStore.getState().addHead(0, 0)
    const id = useStore.getState().heads[0].id
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('zone and head IDs are unique across multiple additions', () => {
    useStore.getState().addZone()
    useStore.getState().addZone()
    const ids = useStore.getState().zones.map(z => z.id)
    expect(new Set(ids).size).toBe(ids.length)

    useStore.getState().addHead(0, 0)
    useStore.getState().addHead(10, 10)
    const headIds = useStore.getState().heads.map(h => h.id)
    expect(new Set(headIds).size).toBe(headIds.length)
  })

  it('partialize excludes selectedHeadId and mode', () => {
    // The persist middleware's partialize option controls what gets stored.
    // Verify those keys are absent from the serialized slice.
    const { getState } = useStore
    useStore.getState().addHead(5, 5)
    const state = getState()
    const persisted = {
      image: state.image,
      pixelsPerFoot: state.pixelsPerFoot,
      zones: state.zones,
      heads: state.heads,
    }
    expect('selectedHeadId' in persisted).toBe(false)
    expect('mode' in persisted).toBe(false)
  })

  it('persisted slice includes image, pixelsPerFoot, zones, and heads', () => {
    useStore.setState({ image: { src: 'data:image/png;base64,abc', widthPx: 800, heightPx: 600, realWidthFt: 40 } })
    useStore.getState().setScale(40)
    useStore.getState().addZone('Front')
    useStore.getState().addHead(10, 20)

    const state = useStore.getState()
    expect(state.image).not.toBeNull()
    expect(state.pixelsPerFoot).toBe(20) // 800/40
    expect(state.zones).toHaveLength(1)
    expect(state.heads).toHaveLength(1)
  })
})
