import { pointInSector } from './geometry'

export const GRID_STEP = 6 // px between sample points

/**
 * Build a coverage map over the canvas.
 * Returns an array of { x, y, count } objects where count > 0.
 */
export function buildCoverageMap(heads, pixelsPerFoot, canvasWidth, canvasHeight) {
  const results = []

  for (let x = 0; x < canvasWidth; x += GRID_STEP) {
    for (let y = 0; y < canvasHeight; y += GRID_STEP) {
      let count = 0
      for (const head of heads) {
        const radiusPx = head.radiusFt * pixelsPerFoot
        if (pointInSector(x, y, head.x, head.y, radiusPx, head.startAngle, head.endAngle)) {
          count++
        }
      }
      if (count > 0) {
        results.push({ x, y, count })
      }
    }
  }

  return results
}

/**
 * Build a precipitation map over the canvas.
 * For each covered cell, computes the total precipitation rate (in/hr) summed
 * across all heads covering that cell.
 *
 * Formula: PR (in/hr) = (96.25 × GPM) / coverage_area_ft²
 *
 * @returns Array of { x, y, precipRate } where precipRate is in inches/hour.
 */
export function buildPrecipMap(heads, zones, pixelsPerFoot, canvasWidth, canvasHeight) {
  const zoneById = Object.fromEntries(zones.map(z => [z.id, z]))
  const results = []

  for (let x = 0; x < canvasWidth; x += GRID_STEP) {
    for (let y = 0; y < canvasHeight; y += GRID_STEP) {
      let totalPrecipRate = 0
      for (const head of heads) {
        const zone = zoneById[head.zoneId]
        if (!zone) continue
        const radiusPx = head.radiusFt * pixelsPerFoot
        if (pointInSector(x, y, head.x, head.y, radiusPx, head.startAngle, head.endAngle)) {
          const arcDeg = ((head.endAngle - head.startAngle) % 360 + 360) % 360 || 360
          const coverageAreaFt = Math.PI * head.radiusFt ** 2 * (arcDeg / 360)
          if (coverageAreaFt > 0) {
            totalPrecipRate += (zone.gpm * 96.25) / coverageAreaFt
          }
        }
      }
      if (totalPrecipRate > 0) {
        results.push({ x, y, precipRate: totalPrecipRate })
      }
    }
  }

  return results
}

/**
 * Map a precipitation ratio (actual / goal) to an RGBA color array [r, g, b, a].
 * Blue = under-watered, green = on target, red = over-watered.
 */
export function precipRatioToColor(ratio) {
  // [ratioStop, r, g, b, alpha]
  const stops = [
    [0.0,  37, 99,  235, 0.70], // blue-600   — no/very little water
    [0.5,  96, 165, 250, 0.55], // blue-400   — under-watered
    [0.85, 74, 222, 128, 0.45], // green-400  — slightly under
    [1.0,  34, 197,  94, 0.40], // green-500  — on target
    [1.15, 250, 204, 21, 0.50], // yellow-400 — slightly over
    [2.0,  239,  68,  68, 0.60], // red-500    — over-watered
    [3.0,  185,  28,  28, 0.75], // red-700    — severely over
  ]

  if (ratio <= stops[0][0]) return stops[0].slice(1)
  for (let i = 0; i < stops.length - 1; i++) {
    const [r0, ...c0] = stops[i]
    const [r1, ...c1] = stops[i + 1]
    if (ratio <= r1) {
      const t = (ratio - r0) / (r1 - r0)
      return c0.map((v, j) => (j < 3 ? Math.round(v + t * (c1[j] - v)) : +(v + t * (c1[j] - v)).toFixed(3)))
    }
  }
  return stops[stops.length - 1].slice(1)
}

/**
 * Compute the coverage area in sq ft for a set of heads.
 * Uses the grid sample approach — counts unique covered cells.
 */
export function computeCoverageAreaFt(heads, pixelsPerFoot, canvasWidth, canvasHeight) {
  const sqFtPerCell = (GRID_STEP / pixelsPerFoot) ** 2
  let coveredCells = 0

  for (let x = 0; x < canvasWidth; x += GRID_STEP) {
    for (let y = 0; y < canvasHeight; y += GRID_STEP) {
      for (const head of heads) {
        const radiusPx = head.radiusFt * pixelsPerFoot
        if (pointInSector(x, y, head.x, head.y, radiusPx, head.startAngle, head.endAngle)) {
          coveredCells++
          break // only count once per cell
        }
      }
    }
  }

  return coveredCells * sqFtPerCell
}
