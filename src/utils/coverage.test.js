import { describe, it, expect } from 'vitest'
import { buildCoverageMap, buildPrecipMap, precipRatioToColor, computeCoverageAreaFt } from './coverage'

// pixelsPerFoot=6 → each grid cell (GRID_STEP=6) is 1 sq ft
const PPF = 6

function fullCircleHead(x, y, radiusFt) {
  return { x, y, radiusFt, startAngle: 0, endAngle: 359 }
}

describe('buildCoverageMap', () => {
  it('no heads → empty array', () => {
    const result = buildCoverageMap([], PPF, 120, 120)
    expect(result).toEqual([])
  })

  it('single full-circle head → covered cells have count=1', () => {
    // Head at center of 120x120 canvas, radius 5ft → radiusPx 30
    const head = fullCircleHead(60, 60, 5)
    const result = buildCoverageMap([head], PPF, 120, 120)
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(c => c.count === 1)).toBe(true)
  })

  it('two overlapping heads → cells in overlap have count=2', () => {
    const h1 = fullCircleHead(60, 60, 8)
    const h2 = fullCircleHead(66, 60, 8) // shifted by one grid step (6px)
    const result = buildCoverageMap([h1, h2], PPF, 200, 200)
    const overlapping = result.filter(c => c.count === 2)
    expect(overlapping.length).toBeGreaterThan(0)
  })

  it('head far outside canvas bounds → no cells returned', () => {
    const head = fullCircleHead(-200, -200, 5)
    const result = buildCoverageMap([head], PPF, 120, 120)
    expect(result).toEqual([])
  })
})

const mockZone = { id: 'z1', gpm: 2.0 }
// 270° arc, radius 10ft, centre at (100,100) — well inside a 200×200 canvas
const mockHead = { id: 'h1', zoneId: 'z1', x: 100, y: 100, radiusFt: 10, startAngle: 0, endAngle: 270 }

describe('buildPrecipMap', () => {
  it('returns empty for no heads', () => {
    expect(buildPrecipMap([], [mockZone], PPF, 200, 200)).toHaveLength(0)
  })

  it('returns cells with positive precipRate inside the arc', () => {
    const map = buildPrecipMap([mockHead], [mockZone], PPF, 200, 200)
    expect(map.length).toBeGreaterThan(0)
    expect(map.every(c => c.precipRate > 0)).toBe(true)
  })

  it('skips heads with no zone assigned', () => {
    const headNoZone = { ...mockHead, zoneId: null }
    expect(buildPrecipMap([headNoZone], [mockZone], PPF, 200, 200)).toHaveLength(0)
  })

  it('skips heads whose zone is not in the zones list', () => {
    const headUnknownZone = { ...mockHead, zoneId: 'unknown' }
    expect(buildPrecipMap([headUnknownZone], [mockZone], PPF, 200, 200)).toHaveLength(0)
  })

  it('two identical overlapping heads double the precipitation rate', () => {
    const head2 = { ...mockHead, id: 'h2' }
    const single = buildPrecipMap([mockHead], [mockZone], PPF, 200, 200)
    const double = buildPrecipMap([mockHead, head2], [mockZone], PPF, 200, 200)
    // Pick a cell present in both
    const cell = single[0]
    const dCell = double.find(c => c.x === cell.x && c.y === cell.y)
    expect(dCell.precipRate).toBeCloseTo(cell.precipRate * 2, 5)
  })

  it('precipRate matches the analytical formula', () => {
    // arcDeg=270, r=10ft → area = π × 100 × 0.75
    // PR = (2.0 × 96.25) / (π × 100 × 0.75)
    const expected = (2.0 * 96.25) / (Math.PI * 100 * 0.75)
    const map = buildPrecipMap([mockHead], [mockZone], PPF, 200, 200)
    expect(map[0].precipRate).toBeCloseTo(expected, 4)
  })
})

describe('precipRatioToColor', () => {
  it('returns 4-element array', () => {
    expect(precipRatioToColor(1.0)).toHaveLength(4)
  })

  it('ratio=0 returns blue (under-watered)', () => {
    const [r, , b] = precipRatioToColor(0)
    expect(b).toBeGreaterThan(r) // more blue than red
  })

  it('ratio=1 returns green (on target)', () => {
    const [r, g, b] = precipRatioToColor(1.0)
    expect(g).toBeGreaterThan(r)
    expect(g).toBeGreaterThan(b)
  })

  it('ratio=3 returns red (severely over-watered)', () => {
    const [r, , b] = precipRatioToColor(3.0)
    expect(r).toBeGreaterThan(b)
  })

  it('interpolates smoothly between stops', () => {
    const [, g05] = precipRatioToColor(0.5)
    const [, g10] = precipRatioToColor(1.0)
    // Green component should increase as we approach target
    expect(g10).toBeGreaterThanOrEqual(g05)
  })
})

describe('computeCoverageAreaFt', () => {
  it('no heads → 0', () => {
    expect(computeCoverageAreaFt([], PPF, 120, 120)).toBe(0)
  })

  it('single full-circle head → area ≈ π × r²', () => {
    const r = 10 // ft
    const head = fullCircleHead(120, 120, r)
    // Canvas large enough to contain the circle (radiusPx = 60, center at 120,120)
    const area = computeCoverageAreaFt([head], PPF, 240, 240)
    const expected = Math.PI * r * r // ≈ 314.16
    // Grid quantization: allow ±15%
    expect(area).toBeGreaterThan(expected * 0.85)
    expect(area).toBeLessThan(expected * 1.15)
  })

  it('two identical overlapping heads → same area as one (no double-counting)', () => {
    const head1 = fullCircleHead(60, 60, 5)
    const head2 = fullCircleHead(60, 60, 5) // exact same position
    const area1 = computeCoverageAreaFt([head1], PPF, 120, 120)
    const area2 = computeCoverageAreaFt([head1, head2], PPF, 120, 120)
    expect(area2).toBe(area1)
  })
})
