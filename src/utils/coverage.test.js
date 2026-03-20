import { describe, it, expect } from 'vitest'
import { buildCoverageMap, computeCoverageAreaFt } from './coverage'

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
