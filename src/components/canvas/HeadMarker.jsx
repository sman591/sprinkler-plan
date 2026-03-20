import { Circle, Group, Text } from 'react-konva'
import useStore from '../../store/useStore'

/**
 * The circle marker for a sprinkler head. Draggable to reposition.
 */
export default function HeadMarker({ head, zone, isSelected, scaleX, scaleY, onClick }) {
  const updateHead = useStore(s => s.updateHead)

  const color = zone?.color ?? '#6b7280'

  function handleDragEnd(e) {
    // Convert display pixels back to image-native pixels for storage
    updateHead(head.id, { x: e.target.x() / scaleX, y: e.target.y() / scaleY })
  }

  // Zone number label
  const label = zone?.number != null ? String(zone.number) : '?'

  return (
    <Group
      x={head.x}
      y={head.y}
      draggable
      onDragEnd={handleDragEnd}
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
