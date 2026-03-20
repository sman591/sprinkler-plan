/**
 * Compute pixels-per-foot from two calibration points on an image.
 *
 * @param {{x: number, y: number}} p1 - First point in image-native pixels
 * @param {{x: number, y: number}} p2 - Second point in image-native pixels
 * @param {number} realDistanceFt - Known real-world distance between the points (feet)
 * @returns {number} pixelsPerFoot
 */
export function computePixelsPerFoot(p1, p2, realDistanceFt) {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  const pixelDist = Math.sqrt(dx * dx + dy * dy)
  return pixelDist / realDistanceFt
}
