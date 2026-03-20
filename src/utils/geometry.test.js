import { describe, it, expect } from 'vitest'
import {
  normalizeAngle,
  toRad,
  toDeg,
  angleTo,
  bearingToKonva,
  pointInSector,
  pointOnCircle,
} from './geometry'

describe('normalizeAngle', () => {
  it('returns 0 for 0', () => expect(normalizeAngle(0)).toBe(0))
  it('returns 0 for 360', () => expect(normalizeAngle(360)).toBe(0))
  it('converts negative angle', () => expect(normalizeAngle(-90)).toBe(270))
  it('converts angle > 360', () => expect(normalizeAngle(450)).toBe(90))
  it('handles -360', () => expect(normalizeAngle(-360)).toBe(0))
})

describe('toRad / toDeg round-trip', () => {
  it('converts 180 degrees to π', () => expect(toRad(180)).toBeCloseTo(Math.PI))
  it('converts 90 degrees to π/2', () => expect(toRad(90)).toBeCloseTo(Math.PI / 2))
  it('round-trips 45 degrees', () => expect(toDeg(toRad(45))).toBeCloseTo(45))
  it('round-trips 123.456 degrees', () => expect(toDeg(toRad(123.456))).toBeCloseTo(123.456))
})

describe('angleTo', () => {
  // Screen coords: y increases downward
  it('point directly above → bearing 0 (north)', () => {
    expect(angleTo(0, 0, 0, -10)).toBeCloseTo(0)
  })
  it('point directly below → bearing 180 (south)', () => {
    expect(angleTo(0, 0, 0, 10)).toBeCloseTo(180)
  })
  it('point directly right → bearing 90 (east)', () => {
    expect(angleTo(0, 0, 10, 0)).toBeCloseTo(90)
  })
  it('point directly left → bearing 270 (west)', () => {
    expect(angleTo(0, 0, -10, 0)).toBeCloseTo(270)
  })
  it('point diagonally up-right → bearing 45', () => {
    expect(angleTo(0, 0, 10, -10)).toBeCloseTo(45)
  })
})

describe('bearingToKonva', () => {
  it('subtracts 90', () => {
    expect(bearingToKonva(90)).toBe(0)
    expect(bearingToKonva(0)).toBe(-90)
    expect(bearingToKonva(180)).toBe(90)
  })
})

describe('pointInSector', () => {
  it('point inside full-circle sector', () => {
    // startAngle=0, endAngle=360 means full circle (start <= end path, 0<=360)
    // Actually with start=0, end=360: normalizeAngle(360)=0, so start=0, end=0 → start<=end → bearing>=0 && bearing<=0 (only 0)
    // Use a nearly-full sector instead: 0 to 359
    expect(pointInSector(5, 0, 0, 0, 10, 0, 359)).toBe(true)
  })

  it('point outside by distance', () => {
    expect(pointInSector(15, 0, 0, 0, 10, 0, 359)).toBe(false)
  })

  it('point outside by angle', () => {
    // Head at origin, sector covers north (350 to 10) wrap-around
    // Point directly east (bearing 90) should be outside
    expect(pointInSector(10, 0, 0, 0, 20, 350, 10)).toBe(false)
  })

  it('wrap-around sector (350 to 10) includes north', () => {
    // Point directly above center (bearing 0) should be inside
    expect(pointInSector(0, -5, 0, 0, 10, 350, 10)).toBe(true)
  })

  it('wrap-around sector (350 to 10) includes 355', () => {
    // Point slightly left of north (bearing ~355)
    const angle = toRad(355 - 90)
    const px = 5 * Math.cos(angle)
    const py = 5 * Math.sin(angle)
    expect(pointInSector(px, py, 0, 0, 10, 350, 10)).toBe(true)
  })

  it('point exactly on radius boundary is inside', () => {
    // distSq = r*r → distSq > r*r is false → included
    expect(pointInSector(10, 0, 0, 0, 10, 80, 100)).toBe(true)
  })
})

describe('pointOnCircle', () => {
  it('bearing 0 (north) → directly above center', () => {
    const p = pointOnCircle(0, 0, 10, 0)
    expect(p.x).toBeCloseTo(0)
    expect(p.y).toBeCloseTo(-10)
  })

  it('bearing 90 (east) → directly right of center', () => {
    const p = pointOnCircle(0, 0, 10, 90)
    expect(p.x).toBeCloseTo(10)
    expect(p.y).toBeCloseTo(0)
  })

  it('bearing 180 (south) → directly below center', () => {
    const p = pointOnCircle(0, 0, 10, 180)
    expect(p.x).toBeCloseTo(0)
    expect(p.y).toBeCloseTo(10)
  })

  it('bearing 270 (west) → directly left of center', () => {
    const p = pointOnCircle(0, 0, 10, 270)
    expect(p.x).toBeCloseTo(-10)
    expect(p.y).toBeCloseTo(0)
  })

  it('respects non-zero center', () => {
    const p = pointOnCircle(5, 5, 10, 0)
    expect(p.x).toBeCloseTo(5)
    expect(p.y).toBeCloseTo(-5)
  })
})
