/**
 * Compute per-zone water usage estimates.
 * @param {Array} zones - array of zone objects { id, name, gpm, color }
 * @param {Array} heads - array of head objects { zoneId, ... }
 * @param {number} pixelsPerFoot
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {number} runtimeMinutes - minutes each zone runs
 * @returns {Array} per-zone stats + total
 */
export function computeWaterUsage(zones, heads, runtimeMinutes = 10) {
  const zoneStats = zones.map(zone => {
    const zoneHeads = heads.filter(h => h.zoneId === zone.id)
    const gallons = zone.gpm * runtimeMinutes
    return {
      zone,
      headCount: zoneHeads.length,
      gallons: zoneHeads.length > 0 ? gallons : 0,
    }
  })

  const totalGallons = zoneStats.reduce((sum, s) => sum + s.gallons, 0)

  return { zoneStats, totalGallons }
}
