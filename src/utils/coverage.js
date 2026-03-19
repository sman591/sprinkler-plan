import { pointInSector } from './geometry'

const GRID_STEP = 6 // px between sample points

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
