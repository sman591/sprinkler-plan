import { useState } from 'react'
import useStore from '../../store/useStore'
import IrrigationCanvas from '../canvas/IrrigationCanvas'
import ZoneList from '../sidebar/ZoneList'
import HeadInspector from '../inspector/HeadInspector'
import WaterUsageSummary from '../WaterUsageSummary'

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

  const [showOverlay, setShowOverlay] = useState(true)
  const [weeklyGoalInches, setWeeklyGoalInches] = useState(1.0)

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
        <h1 className="text-base font-semibold text-white mr-4">Irrigation Planner</h1>
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
        <button
          onClick={() => setMode('select')}
          className={`text-sm px-3 py-1.5 rounded font-medium ${
            mode === 'select'
              ? 'bg-slate-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Select
        </button>

        {onRecalibrate && (
          <button
            onClick={onRecalibrate}
            className="text-sm px-3 py-1.5 rounded font-medium bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            Set Scale
          </button>
        )}

        <div className="ml-auto flex items-center gap-4 text-sm flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOverlay}
              onChange={e => setShowOverlay(e.target.checked)}
              className="accent-blue-500"
            />
            <span className="text-slate-300">Coverage overlay</span>
          </label>

          {showOverlay && (
            <>
              <label className="flex items-center gap-1 text-slate-300">
                Goal:
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  className="w-14 bg-slate-700 text-white rounded px-2 py-0.5 outline-none text-center"
                  value={weeklyGoalInches}
                  onChange={e => setWeeklyGoalInches(parseFloat(e.target.value) || 1)}
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
    </div>
  )
}
