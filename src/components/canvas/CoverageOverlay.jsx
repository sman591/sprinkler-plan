import { useEffect, useMemo, useRef } from 'react'
import { Image as KonvaImage } from 'react-konva'
import { buildPrecipMap, precipRatioToColor, GRID_STEP } from '../../utils/coverage'

export default function CoverageOverlay({
  heads, zones, pixelsPerFoot, canvasWidth, canvasHeight, visible,
  weeklyRuntimeMinutes, weeklyGoalInches,
}) {
  const canvasEl = useRef(document.createElement('canvas'))
  const imageRef = useRef(null)

  const precipMap = useMemo(() => {
    if (!visible || heads.length === 0) return []
    return buildPrecipMap(heads, zones, pixelsPerFoot, canvasWidth, canvasHeight)
  }, [heads, zones, pixelsPerFoot, canvasWidth, canvasHeight, visible])

  useEffect(() => {
    const canvas = canvasEl.current
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    if (visible && precipMap.length > 0) {
      for (const { x, y, precipRate } of precipMap) {
        const weeklyInches = precipRate * (weeklyRuntimeMinutes / 60)
        const ratio = weeklyGoalInches > 0 ? weeklyInches / weeklyGoalInches : 0
        const [r, g, b, a] = precipRatioToColor(ratio)
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`
        ctx.fillRect(x, y, GRID_STEP, GRID_STEP)
      }
    }

    if (imageRef.current) {
      imageRef.current.image(canvas)
      imageRef.current.getLayer()?.batchDraw()
    }
  }, [precipMap, visible, canvasWidth, canvasHeight, weeklyRuntimeMinutes, weeklyGoalInches])

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
