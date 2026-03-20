import { useState } from 'react'
import useStore from './store/useStore'
import AppShell from './components/layout/AppShell'
import { extractImageFile } from './utils/fileValidation'

export default function App() {
  const image = useStore(s => s.image)
  const setImage = useStore(s => s.setImage)
  const setScale = useStore(s => s.setScale)

  const [step, setStep] = useState('upload') // 'upload' | 'scale' | 'app'
  const [previewSrc, setPreviewSrc] = useState(null)
  const [imgDims, setImgDims] = useState(null)
  const [widthFt, setWidthFt] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  function processFile(file) {
    const src = URL.createObjectURL(file)
    setPreviewSrc(src)
    const img = new window.Image()
    img.onload = () => setImgDims({ width: img.naturalWidth, height: img.naturalHeight })
    img.src = src
    setStep('scale')
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

  function handleSetScale() {
    const ft = parseFloat(widthFt)
    if (!ft || ft <= 0) return
    setImage({ src: previewSrc, widthPx: imgDims.width, heightPx: imgDims.height, realWidthFt: ft })
    setScale(ft)
    setStep('app')
  }

  if (step === 'app') {
    return <AppShell />
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Irrigation Planner</h1>
          <p className="text-slate-400 text-sm">Visualize sprinkler coverage and estimate water usage</p>
        </div>

        {step === 'upload' && (
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
        )}

        {step === 'scale' && previewSrc && (
          <div className="bg-slate-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-white font-semibold">Set Scale</h2>
            <img
              src={previewSrc}
              alt="Lawn preview"
              className="w-full rounded-lg object-contain max-h-48"
            />
            <div className="space-y-2">
              <label className="text-sm text-slate-300">
                How wide is the area in this photo? (feet)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 60"
                  value={widthFt}
                  onChange={e => setWidthFt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSetScale()}
                  autoFocus
                />
                <span className="flex items-center text-slate-400 text-sm">ft wide</span>
              </div>
              {imgDims && (
                <p className="text-xs text-slate-500">
                  Image: {imgDims.width} × {imgDims.height}px
                  {widthFt && parseFloat(widthFt) > 0 && (
                    <> · Scale: {(imgDims.width / parseFloat(widthFt)).toFixed(1)} px/ft</>
                  )}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('upload')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm"
              >
                Back
              </button>
              <button
                onClick={handleSetScale}
                disabled={!widthFt || parseFloat(widthFt) <= 0}
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
