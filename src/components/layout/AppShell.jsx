import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import IrrigationCanvas from '../canvas/IrrigationCanvas'
import ZoneList from '../sidebar/ZoneList'
import HeadInspector from '../inspector/HeadInspector'
import WaterUsageSummary from '../WaterUsageSummary'
import { clearImage } from '../../utils/imageStorage'
import { exportBackup, validateBackup, importBackup } from '../../utils/backup'

const LEGEND = [
  { label: 'Under',    color: 'rgb(37,99,235)' },
  { label: 'Low',      color: 'rgb(96,165,250)' },
  { label: 'Goal',     color: 'rgb(34,197,94)' },
  { label: 'Over',     color: 'rgb(250,204,21)' },
  { label: 'Way over', color: 'rgb(239,68,68)' },
]

export default function AppShell({ onRecalibrate }) {
  const mode = useStore(s => s.mode)
  const setMode = useStore(s => s.setMode)
  const selectedHeadId = useStore(s => s.selectedHeadId)
  const zones = useStore(s => s.zones)
  const addZone = useStore(s => s.addZone)
  const updateHead = useStore(s => s.updateHead)
  const reset = useStore(s => s.reset)
  const navigate = useNavigate()

  const [showOverlay, setShowOverlay] = useState(true)
  const [weeklyGoalInches, setWeeklyGoalInches] = useState(1.0)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [confirmingImport, setConfirmingImport] = useState(false)
  const [backupError, setBackupError] = useState(null)
  const importInputRef = useRef(null)
  const pendingBackupRef = useRef(null)

  async function handleReset() {
    await clearImage()
    reset()
    navigate('/')
  }

  async function handleExport() {
    try {
      setBackupError(null)
      await exportBackup()
    } catch (err) {
      setBackupError(err.message)
    }
  }

  function handleImportFileChange(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result)
        validateBackup(raw)
        pendingBackupRef.current = raw
        setBackupError(null)
        setConfirmingImport(true)
      } catch (err) {
        setBackupError(err.message)
      }
    }
    reader.onerror = () => setBackupError('Failed to read file.')
    reader.readAsText(file)
  }

  async function handleConfirmImport() {
    try {
      await importBackup(pendingBackupRef.current)
      pendingBackupRef.current = null
      setConfirmingImport(false)
    } catch (err) {
      setBackupError(err.message)
      setConfirmingImport(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape' && mode === 'place') {
      setMode('select')
      return
    }
    // Number keys 1–9: assign the selected head to that zone number
    if (selectedHeadId && /^[1-9]$/.test(e.key)) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const num = parseInt(e.key)
      const zone = zones.find(z => z.number === num)
      if (zone) {
        updateHead(selectedHeadId, { zoneId: zone.id })
      } else {
        const newId = addZone(undefined, undefined, num)
        updateHead(selectedHeadId, { zoneId: newId })
      }
    }
  }

  return (
    <div
      className="flex flex-col h-screen bg-slate-900 text-white"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      {/* Toolbar */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-slate-700 flex-shrink-0 flex-wrap">
        <h1 className="text-base font-semibold text-white mr-4">Sprinkler Plan</h1>
        <button
          onClick={() => setMode(mode === 'place' ? 'select' : 'place')}
          className={`text-sm px-3 py-1.5 rounded font-medium ${
            mode === 'place'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          }`}
        >
          {mode === 'place' ? '✕ Cancel' : '+ Place Head'}
        </button>
        {onRecalibrate && (
          <button
            onClick={onRecalibrate}
            className="text-sm px-3 py-1.5 rounded font-medium bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            Set Scale
          </button>
        )}

        <div className="ml-auto" />
        {backupError && <span className="text-red-400 text-xs">{backupError}</span>}
        <button
          onClick={handleExport}
          className="text-sm px-3 py-1.5 rounded font-medium bg-slate-700 text-slate-300 hover:bg-slate-600"
        >
          Save backup
        </button>
        <button
          onClick={() => { setBackupError(null); importInputRef.current.click() }}
          className="text-sm px-3 py-1.5 rounded font-medium bg-slate-700 text-slate-300 hover:bg-slate-600"
        >
          Load backup
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFileChange}
        />
        <button
          onClick={() => setConfirmingReset(true)}
          className="text-sm px-3 py-1.5 rounded font-medium bg-slate-700 text-slate-400 hover:bg-red-900/60 hover:text-red-300"
        >
          Erase & start over
        </button>

        <div className="flex items-center gap-4 text-sm flex-wrap justify-end">
          {showOverlay && (
            <>
              <label className="flex items-center gap-1 text-slate-300">
                Goal:
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  className="w-14 bg-slate-700 text-white rounded px-2 py-0.5 outline-none text-center"
                  value={weeklyGoalInches.toFixed(1)}
                  onChange={e => setWeeklyGoalInches(parseFloat(parseFloat(e.target.value).toFixed(1)) || 1)}
                />
                <span className="text-slate-400">in/wk</span>
              </label>
              <div className="flex items-center gap-2">
                {LEGEND.map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOverlay}
              onChange={e => setShowOverlay(e.target.checked)}
              className="accent-blue-500"
            />
            <span className="text-slate-300">Coverage overlay</span>
          </label>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 flex-shrink-0 border-r border-slate-700 overflow-y-auto p-3 bg-slate-800">
          <ZoneList />
        </aside>
        <main className="flex-1 overflow-hidden">
          <IrrigationCanvas
            showOverlay={showOverlay}
            weeklyGoalInches={weeklyGoalInches}
          />
        </main>
        <aside className="w-56 flex-shrink-0 border-l border-slate-700 overflow-y-auto p-3 bg-slate-800">
          <HeadInspector />
        </aside>
      </div>

      <WaterUsageSummary />

      {confirmingReset && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-sm w-full mx-4 space-y-4">
            <h2 className="text-white font-semibold text-lg">Erase everything?</h2>
            <p className="text-slate-400 text-sm">
              This will permanently delete your yard photo, all sprinkler heads, and all zones.
              There's no undo.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmingReset(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-sm font-medium"
              >
                Yes, erase everything
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmingImport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-sm w-full mx-4 space-y-4">
            <h2 className="text-white font-semibold text-lg">Replace current plan?</h2>
            <p className="text-slate-400 text-sm">
              Loading this backup will replace your yard photo, heads, and zones. There is no undo.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { pendingBackupRef.current = null; setConfirmingImport(false) }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium"
              >
                Yes, load backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
