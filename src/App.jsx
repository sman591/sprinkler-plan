import { useState, useRef, useEffect } from 'react'
import useStore from './store/useStore'
import AppShell from './components/layout/AppShell'
import { extractImageFile } from './utils/fileValidation'
import { computePixelsPerFoot } from './utils/calibration'
import { saveImage, loadImage } from './utils/imageStorage'

export default function App() {
  const image = useStore(s => s.image)
  const setImage = useStore(s => s.setImage)
  const setScale = useStore(s => s.setScale)

  const [step, setStep] = useState('upload') // 'upload' | 'scale' | 'app'
  const [previewSrc, setPreviewSrc] = useState(null)
  const [imgDims, setImgDims] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  // Two-point scale calibration
  const [points, setPoints] = useState([])   // [{x, y}, ...] in image-native px
  const [distanceFt, setDistanceFt] = useState('')
  const imgRef = useRef(null)

  // On mount: restore a previously saved image from IndexedDB so the user
  // doesn't have to re-upload after a page reload.
  useEffect(() => {
    loadImage().then(blob => {
      if (!blob) return
      const src = URL.createObjectURL(blob)
      const img = new window.Image()
      img.onload = () => {
        const widthPx = img.naturalWidth
        const heightPx = img.naturalHeight
        const { pixelsPerFoot, scaleCalibrated, zones, heads } = useStore.getState()
        const realWidthFt = widthPx / pixelsPerFoot
        setImage({ src, widthPx, heightPx, realWidthFt })
        // Go to app if scale is set or planning data exists; otherwise re-calibrate
        if (scaleCalibrated || zones.length > 0 || heads.length > 0) {
          setStep('app')
        } else {
          setPreviewSrc(src)
          setImgDims({ width: widthPx, height: heightPx })
          setStep('scale')
        }
      }
      img.src = src
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function processFile(file) {
    saveImage(file) // persist to IndexedDB for next session
    const src = URL.createObjectURL(file)
    setPreviewSrc(src)
    const img = new window.Image()
    img.onload = () => setImgDims({ width: img.naturalWidth, height: img.naturalHeight })
    img.src = src
    setStep('scale')
  }

  async function loadExamplePhoto() {
    const res = await fetch('/example-yard.jpg')
    const blob = await res.blob()
    saveImage(blob)
    const src = URL.createObjectURL(blob)
    // Pre-calibrated from known measurement: roof ridge = 54 ft
    // Points measured in native pixels (1500×1124 image)
    const p1 = { x: 500, y: 308 }
    const p2 = { x: 1095, y: 308 }
    const widthPx = 1500
    const heightPx = 1124
    const ppf = computePixelsPerFoot(p1, p2, 54)
    const realWidthFt = widthPx / ppf
    setImage({ src, widthPx, heightPx, realWidthFt })
    setScale(realWidthFt)
    setStep('app')
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = extractImageFile(e.dataTransfer.files)
    if (file) processFile(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false)
  }

  function handleImageClick(e) {
    if (points.length >= 2) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * imgDims.width
    const y = ((e.clientY - rect.top) / rect.height) * imgDims.height
    setPoints(prev => [...prev, { x, y }])
  }

  function handleSetScale() {
    const ft = parseFloat(distanceFt)
    if (!ft || ft <= 0 || points.length < 2) return
    const ppf = computePixelsPerFoot(points[0], points[1], ft)
    const realWidthFt = imgDims.width / ppf
    setImage({ src: previewSrc, widthPx: imgDims.width, heightPx: imgDims.height, realWidthFt })
    setScale(realWidthFt)
    setStep('app')
  }

  function resetScale() {
    setPoints([])
    setDistanceFt('')
  }

  function handleRecalibrate() {
    const { image: img } = useStore.getState()
    if (!img) return
    setPreviewSrc(img.src)
    setImgDims({ width: img.widthPx, height: img.heightPx })
    setPoints([])
    setDistanceFt('')
    setStep('scale')
  }

  if (step === 'app') {
    return <AppShell onRecalibrate={handleRecalibrate} />
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Sprinkler Plan</h1>
          <p className="text-slate-400 text-sm">Visualize sprinkler coverage and estimate water usage</p>
        </div>

        {step === 'upload' && (
          <>
            <div
              className={`bg-slate-800 rounded-2xl p-8 border-2 border-dashed transition-colors ${
                isDragging
                  ? 'border-blue-400 bg-slate-700'
                  : 'border-slate-600 hover:border-blue-500'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <label className="flex flex-col items-center gap-4 cursor-pointer">
                <div className="text-5xl">🌿</div>
                <div className="text-center">
                  <p className="text-white font-medium">
                    {isDragging ? 'Drop your photo here' : 'Upload a photo of your lawn'}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Drag & drop or click to choose — aerial photos work best
                  </p>
                </div>
                <div className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Choose Photo
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-slate-500 text-xs text-center mt-3">
              🔒 Your photo never leaves your device — everything stays local in your browser.
            </p>
            <div className="text-center">
              <button
                onClick={loadExamplePhoto}
                className="text-slate-400 hover:text-white text-sm underline underline-offset-2 transition-colors"
              >
                Try with an example yard photo
              </button>
            </div>
          </>
        )}

        {step === 'scale' && previewSrc && (
          <div className="bg-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-white font-semibold">Set Scale</h2>
              <p className="text-slate-400 text-sm mt-1">
                Click two points on the image with a known real-world distance between them.
              </p>
              <p className="text-slate-500 text-xs mt-2">
                Good references: a standard sidewalk slab (5 ft), a garage door width (8–9 ft),
                a car length (~15 ft), or the ridge-to-eave depth of a roof.
              </p>
            </div>

            {/* Image with calibration point overlay */}
            <div
              className="relative rounded-lg overflow-hidden"
              style={{ cursor: points.length < 2 ? 'crosshair' : 'default' }}
            >
              <img
                ref={imgRef}
                src={previewSrc}
                alt="Lawn preview"
                className="w-full block"
                onClick={handleImageClick}
                draggable={false}
              />
              {imgDims && points.length > 0 && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 ${imgDims.width} ${imgDims.height}`}
                  preserveAspectRatio="none"
                >
                  {points.length === 2 && (
                    <line
                      x1={points[0].x} y1={points[0].y}
                      x2={points[1].x} y2={points[1].y}
                      stroke="#3b82f6"
                      strokeWidth={imgDims.width * 0.003}
                      strokeDasharray={`${imgDims.width * 0.012} ${imgDims.width * 0.006}`}
                    />
                  )}
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={imgDims.width * 0.014}
                      fill={i === 0 ? '#3b82f6' : '#10b981'}
                      stroke="white"
                      strokeWidth={imgDims.width * 0.004}
                    />
                  ))}
                </svg>
              )}
            </div>

            <p className="text-sm text-slate-400">
              {points.length === 0 && 'Click the first point on the image.'}
              {points.length === 1 && 'Now click the second point.'}
              {points.length === 2 && 'Both points set. Enter the real-world distance below.'}
            </p>

            {points.length === 2 && (
              <div className="space-y-2">
                <label className="text-sm text-slate-300">
                  Real-world distance between the two points
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 12"
                    value={distanceFt}
                    onChange={e => setDistanceFt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSetScale()}
                    autoFocus
                  />
                  <span className="flex items-center text-slate-400 text-sm">ft</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const { zones, heads } = useStore.getState()
                  if (zones.length > 0 || heads.length > 0) {
                    setStep('app')
                  } else {
                    setStep('upload')
                  }
                  resetScale()
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg text-sm"
              >
                Back
              </button>
              {points.length > 0 && (
                <button
                  onClick={resetScale}
                  className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg text-sm"
                >
                  Reset
                </button>
              )}
              <button
                onClick={handleSetScale}
                disabled={points.length < 2 || !distanceFt || parseFloat(distanceFt) <= 0}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium"
              >
                Start Planning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
