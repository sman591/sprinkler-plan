import { describe, it, expect } from 'vitest'
import { computePixelsPerFoot } from './calibration'

describe('computePixelsPerFoot', () => {
  it('computes ppf for a horizontal line', () => {
    const ppf = computePixelsPerFoot({ x: 0, y: 0 }, { x: 100, y: 0 }, 10)
    expect(ppf).toBe(10)
  })

  it('computes ppf for a vertical line', () => {
    const ppf = computePixelsPerFoot({ x: 0, y: 0 }, { x: 0, y: 200 }, 20)
    expect(ppf).toBe(10)
  })

  it('computes ppf for a diagonal (3-4-5 triangle)', () => {
    // pixel dist = 50, real = 5 ft → 10 px/ft
    const ppf = computePixelsPerFoot({ x: 0, y: 0 }, { x: 30, y: 40 }, 5)
    expect(ppf).toBeCloseTo(10)
  })

  it('works with non-origin points', () => {
    const ppf = computePixelsPerFoot({ x: 100, y: 200 }, { x: 200, y: 200 }, 10)
    expect(ppf).toBe(10)
  })

  it('is symmetric — order of points does not matter', () => {
    const p1 = { x: 50, y: 80 }
    const p2 = { x: 150, y: 80 }
    const ppf1 = computePixelsPerFoot(p1, p2, 5)
    const ppf2 = computePixelsPerFoot(p2, p1, 5)
    expect(ppf1).toBeCloseTo(ppf2)
  })

  it('scales linearly with real distance', () => {
    const ppf5 = computePixelsPerFoot({ x: 0, y: 0 }, { x: 100, y: 0 }, 5)
    const ppf10 = computePixelsPerFoot({ x: 0, y: 0 }, { x: 100, y: 0 }, 10)
    expect(ppf5).toBeCloseTo(ppf10 * 2)
  })

  it('scales linearly with pixel distance', () => {
    const ppf100 = computePixelsPerFoot({ x: 0, y: 0 }, { x: 100, y: 0 }, 10)
    const ppf200 = computePixelsPerFoot({ x: 0, y: 0 }, { x: 200, y: 0 }, 10)
    expect(ppf200).toBeCloseTo(ppf100 * 2)
  })
})
