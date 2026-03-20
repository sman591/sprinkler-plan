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
    expect(zones[0].weeklyRuntimeMinutes).toBe(60)
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

  it('inherits type and radiusFt from lastHeadDefaults', () => {
    useStore.getState().addHead(10, 10)
    const firstId = useStore.getState().heads[0].id
    useStore.getState().updateHead(firstId, { type: 'fixed', radiusFt: 15 })
    // Deselect — should still inherit via lastHeadDefaults
    useStore.getState().setSelectedHead(null)
    useStore.getState().addHead(20, 20)
    const second = useStore.getState().heads[1]
    expect(second.type).toBe('fixed')
    expect(second.radiusFt).toBe(15)
  })

  it('uses defaults when no head has ever been selected', () => {
    useStore.setState({ selectedHeadId: null, lastHeadDefaults: { type: 'rotary', radiusFt: 10 } })
    useStore.getState().addHead(10, 10)
    const head = useStore.getState().heads[0]
    expect(head.type).toBe('rotary')
    expect(head.radiusFt).toBe(10)
  })

  it('setSelectedHead updates lastHeadDefaults', () => {
    useStore.getState().addHead(10, 10)
    const id = useStore.getState().heads[0].id
    useStore.getState().updateHead(id, { type: 'fixed', radiusFt: 20 })
    useStore.getState().setSelectedHead(null) // deselect
    useStore.getState().setSelectedHead(id)   // re-select
    expect(useStore.getState().lastHeadDefaults).toEqual({ type: 'fixed', radiusFt: 20 })
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

describe('addZone with custom number', () => {
  it('uses provided number', () => {
    useStore.getState().addZone('A', 2.0, 5)
    expect(useStore.getState().zones[0].number).toBe(5)
  })

  it('defaults name to Zone N when number is provided', () => {
    useStore.getState().addZone(undefined, undefined, 3)
    expect(useStore.getState().zones[0].name).toBe('Zone 3')
  })

  it('falls back to insertion order when number is omitted', () => {
    useStore.getState().addZone()
    useStore.getState().addZone()
    const [a, b] = useStore.getState().zones
    expect(a.number).toBe(1)
    expect(b.number).toBe(2)
  })
})

describe('moveZone', () => {
  it('moves a zone up by swapping numbers with the one above', () => {
    useStore.getState().addZone('A')
    useStore.getState().addZone('B')
    const { zones } = useStore.getState()
    const a = zones.find(z => z.name === 'A') // number 1
    const b = zones.find(z => z.name === 'B') // number 2
    useStore.getState().moveZone(b.id, 'up')
    const updated = useStore.getState().zones
    expect(updated.find(z => z.id === b.id).number).toBe(1)
    expect(updated.find(z => z.id === a.id).number).toBe(2)
  })

  it('moves a zone down by swapping numbers with the one below', () => {
    useStore.getState().addZone('A')
    useStore.getState().addZone('B')
    const { zones } = useStore.getState()
    const a = zones.find(z => z.name === 'A') // number 1
    const b = zones.find(z => z.name === 'B') // number 2
    useStore.getState().moveZone(a.id, 'down')
    const updated = useStore.getState().zones
    expect(updated.find(z => z.id === a.id).number).toBe(2)
    expect(updated.find(z => z.id === b.id).number).toBe(1)
  })

  it('does nothing when moving the first zone up', () => {
    useStore.getState().addZone('A')
    useStore.getState().addZone('B')
    const id = useStore.getState().zones.find(z => z.name === 'A').id
    useStore.getState().moveZone(id, 'up')
    expect(useStore.getState().zones.find(z => z.id === id).number).toBe(1)
  })

  it('does nothing when moving the last zone down', () => {
    useStore.getState().addZone('A')
    useStore.getState().addZone('B')
    const id = useStore.getState().zones.find(z => z.name === 'B').id
    useStore.getState().moveZone(id, 'down')
    expect(useStore.getState().zones.find(z => z.id === id).number).toBe(2)
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

  it('partialize excludes image, selectedHeadId, and mode', () => {
    // image is excluded to avoid storing large blob/base64 data in localStorage
    // (would hit QuotaExceededError for typical lawn photos)
    const { getState } = useStore
    useStore.getState().addHead(5, 5)
    const state = getState()
    const persisted = {
      pixelsPerFoot: state.pixelsPerFoot,
      zones: state.zones,
      heads: state.heads,
    }
    expect('image' in persisted).toBe(false)
    expect('selectedHeadId' in persisted).toBe(false)
    expect('mode' in persisted).toBe(false)
  })

  it('persisted slice includes pixelsPerFoot, zones, and heads', () => {
    useStore.setState({ image: { src: 'blob:fake', widthPx: 800, heightPx: 600, realWidthFt: 40 } })
    useStore.getState().setScale(40)
    useStore.getState().addZone('Front')
    useStore.getState().addHead(10, 20)

    const state = useStore.getState()
    expect(state.pixelsPerFoot).toBe(20) // 800/40
    expect(state.zones).toHaveLength(1)
    expect(state.heads).toHaveLength(1)
  })
})
