import { useEffect, useMemo, useRef } from 'react'
import { Image as KonvaImage } from 'react-konva'
import { buildCoverageMap } from '../../utils/coverage'

const GRID_STEP = 6

/**
 * Renders a semi-transparent heatmap overlay:
 * - Red: uncovered gaps (no heads cover this cell, but within some radius of any head)
 * - Orange: overlap (2+ heads cover this cell)
 */
export default function CoverageOverlay({ heads, pixelsPerFoot, canvasWidth, canvasHeight, visible }) {
  const canvasEl = useRef(document.createElement('canvas'))
  const imageRef = useRef(null)

  const coverageMap = useMemo(() => {
    if (!visible || heads.length === 0) return []
    return buildCoverageMap(heads, pixelsPerFoot, canvasWidth, canvasHeight)
  }, [heads, pixelsPerFoot, canvasWidth, canvasHeight, visible])

  useEffect(() => {
    const canvas = canvasEl.current
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    if (!visible) {
      if (imageRef.current) imageRef.current.getLayer()?.batchDraw()
      return
    }

    for (const { x, y, count } of coverageMap) {
      if (count === 1) {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.25)' // green — good
      } else if (count >= 2) {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.40)' // orange — overlap
      }
      ctx.fillRect(x, y, GRID_STEP, GRID_STEP)
    }

    if (imageRef.current) {
      imageRef.current.image(canvas)
      imageRef.current.getLayer()?.batchDraw()
    }
  }, [coverageMap, visible, canvasWidth, canvasHeight])

  if (!visible) return null

  return (
    <KonvaImage
      ref={imageRef}
      image={canvasEl.current}
      x={0}
      y={0}
      listening={false}
    />
  )
}
