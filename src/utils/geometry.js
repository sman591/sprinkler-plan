/**
 * Normalize an angle in degrees to [0, 360).
 */
export function normalizeAngle(deg) {
  return ((deg % 360) + 360) % 360
}

/**
 * Convert degrees to radians.
 */
export function toRad(deg) {
  return (deg * Math.PI) / 180
}

/**
 * Convert radians to degrees.
 */
export function toDeg(rad) {
  return (rad * 180) / Math.PI
}

/**
 * Get atan2 angle in degrees (0 = right, CCW positive — standard math)
 * then convert to our convention: 0 = up (north), CW positive.
 */
export function angleTo(cx, cy, px, py) {
  const dx = px - cx
  const dy = py - cy
  // atan2 gives angle from positive x-axis, CCW
  const mathDeg = toDeg(Math.atan2(dy, dx))
  // Convert to: 0=up, CW
  return normalizeAngle(mathDeg + 90)
}

/**
 * Return the canvas angle (0=right, CW) from Konva's coordinate system
 * for a given bearing (0=up, CW).
 * Konva arcs: 0 = right, CW positive (same as SVG).
 * Our bearing: 0 = up, CW positive.
 * Conversion: konvaAngle = bearing - 90
 */
export function bearingToKonva(bearing) {
  return bearing - 90
}

/**
 * Check if a point (px,py) is inside the sector defined by:
 * center (cx,cy), radius r (pixels), startAngle and endAngle (our bearing convention, CW from north).
 */
export function pointInSector(px, py, cx, cy, r, startAngle, endAngle) {
  const dx = px - cx
  const dy = py - cy
  const distSq = dx * dx + dy * dy
  if (distSq > r * r) return false

  const pointBearing = normalizeAngle(toDeg(Math.atan2(dy, dx)) + 90)
  const start = normalizeAngle(startAngle)
  const end = normalizeAngle(endAngle)

  if (start <= end) {
    return pointBearing >= start && pointBearing <= end
  } else {
    // Wraps around 0/360
    return pointBearing >= start || pointBearing <= end
  }
}

/**
 * Given center, radius, and bearing (0=up CW), return the point on the circle edge.
 */
export function pointOnCircle(cx, cy, r, bearingDeg) {
  const rad = toRad(bearingDeg - 90) // convert to math angle
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}
