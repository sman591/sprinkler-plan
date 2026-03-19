import { useState } from 'react'
import useStore from '../../store/useStore'
import IrrigationCanvas from '../canvas/IrrigationCanvas'
import ZoneList from '../sidebar/ZoneList'
import HeadInspector from '../inspector/HeadInspector'
import WaterUsageSummary from '../WaterUsageSummary'

export default function AppShell() {
  const mode = useStore(s => s.mode)
  const setMode = useStore(s => s.setMode)
  const [showOverlay, setShowOverlay] = useState(true)

  function handleEsc(e) {
    if (e.key === 'Escape' && mode === 'place') setMode('select')
  }

  return (
    <div
      className="flex flex-col h-screen bg-slate-900 text-white"
      onKeyDown={handleEsc}
      tabIndex={-1}
      style={{ outline: 'none' }}
    >
      {/* Toolbar */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-slate-700 flex-shrink-0">
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
        <div className="ml-auto flex items-center gap-2 text-sm">
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
        {/* Left sidebar */}
        <aside className="w-52 flex-shrink-0 border-r border-slate-700 overflow-y-auto p-3 bg-slate-800">
          <ZoneList />
        </aside>

        {/* Canvas area */}
        <main className="flex-1 overflow-hidden">
          <IrrigationCanvas showOverlay={showOverlay} />
        </main>

        {/* Right inspector */}
        <aside className="w-56 flex-shrink-0 border-l border-slate-700 overflow-y-auto p-3 bg-slate-800">
          <HeadInspector />
        </aside>
      </div>

      {/* Bottom water usage */}
      <WaterUsageSummary />
    </div>
  )
}
