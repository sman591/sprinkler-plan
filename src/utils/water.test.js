import { describe, it, expect } from 'vitest'
import { computeWaterUsage } from './water'

describe('computeWaterUsage', () => {
  it('no zones → empty stats and 0 total', () => {
    const { zoneStats, totalGallons } = computeWaterUsage([], [], 10)
    expect(zoneStats).toEqual([])
    expect(totalGallons).toBe(0)
  })

  it('zone with no heads → 0 gallons', () => {
    const zones = [{ id: 'z1', name: 'Zone 1', gpm: 3.0 }]
    const { zoneStats, totalGallons } = computeWaterUsage(zones, [], 10)
    expect(zoneStats[0].gallons).toBe(0)
    expect(zoneStats[0].headCount).toBe(0)
    expect(totalGallons).toBe(0)
  })

  it('zone with heads → gpm × runtime', () => {
    const zones = [{ id: 'z1', name: 'Zone 1', gpm: 2.5 }]
    const heads = [
      { id: 'h1', zoneId: 'z1' },
      { id: 'h2', zoneId: 'z1' },
    ]
    const { zoneStats, totalGallons } = computeWaterUsage(zones, heads, 10)
    expect(zoneStats[0].gallons).toBe(25) // 2.5 * 10
    expect(zoneStats[0].headCount).toBe(2)
    expect(totalGallons).toBe(25)
  })

  it('multiple zones → correct per-zone and total', () => {
    const zones = [
      { id: 'z1', name: 'Zone 1', gpm: 2.0 },
      { id: 'z2', name: 'Zone 2', gpm: 3.0 },
    ]
    const heads = [
      { id: 'h1', zoneId: 'z1' },
      { id: 'h2', zoneId: 'z2' },
    ]
    const { zoneStats, totalGallons } = computeWaterUsage(zones, heads, 10)
    expect(zoneStats[0].gallons).toBe(20) // z1: 2.0 * 10
    expect(zoneStats[1].gallons).toBe(30) // z2: 3.0 * 10
    expect(totalGallons).toBe(50)
  })

  it('custom runtime scales gallons correctly', () => {
    const zones = [{ id: 'z1', name: 'Zone 1', gpm: 4.0 }]
    const heads = [{ id: 'h1', zoneId: 'z1' }]
    const { zoneStats } = computeWaterUsage(zones, heads, 30)
    expect(zoneStats[0].gallons).toBe(120) // 4.0 * 30
  })

  it('default runtime is 10 minutes', () => {
    const zones = [{ id: 'z1', name: 'Zone 1', gpm: 5.0 }]
    const heads = [{ id: 'h1', zoneId: 'z1' }]
    const { zoneStats } = computeWaterUsage(zones, heads)
    expect(zoneStats[0].gallons).toBe(50) // 5.0 * 10
  })
})
