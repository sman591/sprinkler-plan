import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage } from 'react-konva'
import useStore from '../../store/useStore'
import HeadMarker from './HeadMarker'
import CoverageArc from './CoverageArc'
import CoverageOverlay from './CoverageOverlay'

export default function IrrigationCanvas({ showOverlay, weeklyGoalInches }) {
  const containerRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [bgImage, setBgImage] = useState(null)

  const image = useStore(s => s.image)
  const heads = useStore(s => s.heads)
  const zones = useStore(s => s.zones)
  const selectedHeadId = useStore(s => s.selectedHeadId)
  const mode = useStore(s => s.mode)
  const pixelsPerFoot = useStore(s => s.pixelsPerFoot)
  const addHead = useStore(s => s.addHead)
  const setSelectedHead = useStore(s => s.setSelectedHead)
  const removeHead = useStore(s => s.removeHead)

  // Load background image
  useEffect(() => {
    if (!image?.src) return
    const img = new window.Image()
    img.onload = () => {
      setBgImage(img)
      // Fit canvas to container while maintaining aspect ratio
      if (containerRef.current) {
        const containerW = containerRef.current.offsetWidth
        const containerH = containerRef.current.offsetHeight
        const scaleX = containerW / img.naturalWidth
        const scaleY = containerH / img.naturalHeight
        const scale = Math.min(scaleX, scaleY, 1)
        setCanvasSize({
          width: img.naturalWidth * scale,
          height: img.naturalHeight * scale,
        })
      }
    }
    img.src = image.src
  }, [image?.src])

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(() => {
      if (!bgImage) return
      const containerW = containerRef.current.offsetWidth
      const containerH = containerRef.current.offsetHeight
      const scaleX = containerW / bgImage.naturalWidth
      const scaleY = containerH / bgImage.naturalHeight
      const scale = Math.min(scaleX, scaleY, 1)
      setCanvasSize({
        width: bgImage.naturalWidth * scale,
        height: bgImage.naturalHeight * scale,
      })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [bgImage])

  // Scale factor for converting click coords to image coords
  const scaleX = bgImage ? canvasSize.width / bgImage.naturalWidth : 1
  const scaleY = bgImage ? canvasSize.height / bgImage.naturalHeight : 1

  // Keyboard: Delete selected head
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedHeadId) {
        removeHead(selectedHeadId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedHeadId, removeHead])

  function handleStageClick(e) {
    if (e.target === e.target.getStage()) {
      // Clicked on empty canvas
      if (mode === 'place') {
        const pos = e.target.getStage().getPointerPosition()
        addHead(pos.x, pos.y)
      } else {
        setSelectedHead(null)
      }
    }
  }

  const zoneById = Object.fromEntries(zones.map(z => [z.id, z]))

  // Scale pixelsPerFoot for the displayed canvas
  const displayPixelsPerFoot = pixelsPerFoot * scaleX

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-900"
    >
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
        style={{ cursor: mode === 'place' ? 'crosshair' : 'default' }}
      >
        {/* Background image layer */}
        <Layer listening={false}>
          {bgImage && (
            <KonvaImage
              image={bgImage}
              x={0}
              y={0}
              width={canvasSize.width}
              height={canvasSize.height}
            />
          )}
        </Layer>

        {/* Coverage arcs layer */}
        <Layer>
          {heads.map(head => (
            <CoverageArc
              key={head.id}
              head={head}
              zone={head.zoneId ? zoneById[head.zoneId] : null}
              isSelected={head.id === selectedHeadId}
              pixelsPerFoot={displayPixelsPerFoot}
            />
          ))}
        </Layer>

        {/* Coverage overlay layer */}
        <Layer listening={false}>
          <CoverageOverlay
            heads={heads}
            zones={zones}
            pixelsPerFoot={displayPixelsPerFoot}
            canvasWidth={canvasSize.width}
            canvasHeight={canvasSize.height}
            visible={showOverlay}
            weeklyGoalInches={weeklyGoalInches}
          />
        </Layer>

        {/* Head markers layer */}
        <Layer>
          {heads.map(head => (
            <HeadMarker
              key={head.id}
              head={head}
              zone={head.zoneId ? zoneById[head.zoneId] : null}
              isSelected={head.id === selectedHeadId}
              onClick={(e) => {
                e.cancelBubble = true
                setSelectedHead(head.id)
              }}
            />
          ))}
        </Layer>
      </Stage>

      {/* Mode indicator */}
      {mode === 'place' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm px-3 py-1 rounded-full pointer-events-none">
          Click to place sprinkler head — Esc to cancel
        </div>
      )}
    </div>
  )
}
