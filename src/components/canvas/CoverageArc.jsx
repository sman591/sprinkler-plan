import { Arc, Circle, Group, Line } from 'react-konva'
import { bearingToKonva, pointOnCircle } from '../../utils/geometry'
import useStore from '../../store/useStore'

/**
 * Renders the filled arc sector for a single sprinkler head.
 * Also renders drag handles for radius and arc angles when selected.
 */
export default function CoverageArc({ head, zone, isSelected, pixelsPerFoot }) {
  const updateHead = useStore(s => s.updateHead)

  const color = zone?.color ?? '#6b7280'
  const radiusPx = head.radiusFt * pixelsPerFoot

  // Konva Arc: rotation sets the start, angle sets the sweep
  const sweepDeg = (() => {
    const start = ((head.startAngle % 360) + 360) % 360
    const end = ((head.endAngle % 360) + 360) % 360
    let sweep = end - start
    if (sweep <= 0) sweep += 360
    return sweep
  })()

  const konvaRotation = bearingToKonva(head.startAngle)

  // Handle positions
  const midBearing = head.startAngle + sweepDeg / 2
  const radiusHandlePos = pointOnCircle(head.x, head.y, radiusPx + 8, midBearing)
  const startHandlePos = pointOnCircle(head.x, head.y, radiusPx * 0.7, head.startAngle)
  const endHandlePos = pointOnCircle(head.x, head.y, radiusPx * 0.7, head.endAngle)

  function handleRadiusDrag(e) {
    const node = e.target
    const dx = node.x() - head.x
    const dy = node.y() - head.y
    const newRadiusPx = Math.sqrt(dx * dx + dy * dy) - 8
    const newRadiusFt = Math.max(1, newRadiusPx / pixelsPerFoot)
    updateHead(head.id, { radiusFt: Math.round(newRadiusFt * 10) / 10 })
    // Reset handle position — let Konva re-render from state
    node.x(head.x + (newRadiusPx + 8) * Math.sin(((head.startAngle + sweepDeg / 2 - 90) * Math.PI) / 180))
    node.y(head.y + (newRadiusPx + 8) * Math.cos(((head.startAngle + sweepDeg / 2 - 90 + 180) * Math.PI) / 180))
  }

  function handleStartAngleDrag(e) {
    const node = e.target
    const dx = node.x() - head.x
    const dy = node.y() - head.y
    const bearing = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360
    updateHead(head.id, { startAngle: Math.round(bearing) })
  }

  function handleEndAngleDrag(e) {
    const node = e.target
    const dx = node.x() - head.x
    const dy = node.y() - head.y
    const bearing = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360
    updateHead(head.id, { endAngle: Math.round(bearing) })
  }

  return (
    <Group>
      {/* Filled arc sector */}
      <Arc
        x={head.x}
        y={head.y}
        innerRadius={0}
        outerRadius={radiusPx}
        angle={sweepDeg}
        rotation={konvaRotation}
        fill={color + '55'}
        stroke={color}
        strokeWidth={isSelected ? 2 : 1}
        listening={false}
      />

      {/* Drag handles — only when selected */}
      {isSelected && (
        <>
          {/* Radius handle */}
          <Circle
            x={radiusHandlePos.x}
            y={radiusHandlePos.y}
            radius={6}
            fill="white"
            stroke={color}
            strokeWidth={2}
            draggable
            onDragMove={handleRadiusDrag}
          />

          {/* Start angle handle */}
          <Line
            points={[head.x, head.y, startHandlePos.x, startHandlePos.y]}
            stroke={color}
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />
          <Circle
            x={startHandlePos.x}
            y={startHandlePos.y}
            radius={5}
            fill={color}
            stroke="white"
            strokeWidth={1.5}
            draggable
            onDragMove={handleStartAngleDrag}
          />

          {/* End angle handle */}
          <Line
            points={[head.x, head.y, endHandlePos.x, endHandlePos.y]}
            stroke={color}
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />
          <Circle
            x={endHandlePos.x}
            y={endHandlePos.y}
            radius={5}
            fill={color}
            stroke="white"
            strokeWidth={1.5}
            draggable
            onDragMove={handleEndAngleDrag}
          />
        </>
      )}
    </Group>
  )
}
