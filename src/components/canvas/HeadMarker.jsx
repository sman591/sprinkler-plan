import { Circle, Group, Text } from 'react-konva'
import useStore from '../../store/useStore'

/**
 * The circle marker for a sprinkler head. Draggable to reposition.
 */
function setCursor(e, cursor) {
  e.target.getStage().container().style.cursor = cursor
}

export default function HeadMarker({ head, zone, isSelected, scaleX, scaleY, canvasWidth, canvasHeight, mode, onClick }) {
  const updateHead = useStore(s => s.updateHead)

  const color = zone?.color ?? '#6b7280'

  function handleDragEnd(e) {
    // Convert display pixels back to image-native pixels for storage
    updateHead(head.id, { x: e.target.x() / scaleX, y: e.target.y() / scaleY })
    setCursor(e, mode === 'place' ? 'crosshair' : 'pointer')
  }

  function dragBoundFunc(pos) {
    return {
      x: Math.max(0, Math.min(canvasWidth, pos.x)),
      y: Math.max(0, Math.min(canvasHeight, pos.y)),
    }
  }

  // Zone number label
  const label = zone?.number != null ? String(zone.number) : '?'

  return (
    <Group
      x={head.x}
      y={head.y}
      draggable
      dragBoundFunc={dragBoundFunc}
      onDragEnd={handleDragEnd}
      onDragStart={e => setCursor(e, 'grabbing')}
      onMouseEnter={e => setCursor(e, mode === 'place' ? 'crosshair' : 'pointer')}
      onMouseLeave={e => setCursor(e, mode === 'place' ? 'crosshair' : 'default')}
      onClick={onClick}
      onTap={onClick}
    >
      {/* Outer ring when selected */}
      {isSelected && (
        <Circle
          radius={14}
          fill="transparent"
          stroke="white"
          strokeWidth={2}
        />
      )}
      {/* Main marker */}
      <Circle
        radius={10}
        fill={color}
        stroke={isSelected ? 'white' : color}
        strokeWidth={isSelected ? 2 : 1}
      />
      {/* Zone number */}
      <Text
        text={label}
        fontSize={9}
        fill="white"
        fontStyle="bold"
        align="center"
        width={20}
        offsetX={10}
        offsetY={5}
        listening={false}
      />
    </Group>
  )
}
