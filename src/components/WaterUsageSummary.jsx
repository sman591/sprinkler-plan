import { useState } from 'react'
import useStore from '../store/useStore'
import { computeWaterUsage } from '../utils/water'

export default function WaterUsageSummary() {
  const zones = useStore(s => s.zones)
  const heads = useStore(s => s.heads)
  const [runtime, setRuntime] = useState(10)
  const [collapsed, setCollapsed] = useState(false)

  const { zoneStats, totalGallons } = computeWaterUsage(zones, heads, runtime)

  return (
    <footer className="border-t border-slate-700 bg-slate-800 flex-shrink-0">
      <button
        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-400 hover:text-white"
        onClick={() => setCollapsed(c => !c)}
      >
        <span className={`transition-transform ${collapsed ? '' : 'rotate-180'}`}>▲</span>
        <span className="font-semibold text-slate-300">Water Usage</span>
        <span className="ml-auto">Total: {totalGallons.toFixed(1)} gal / {runtime} min</span>
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 space-y-2">
          {/* Runtime control */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <label>Runtime (min):</label>
            <input
              type="number"
              className="w-16 bg-slate-700 text-white rounded px-2 py-0.5 outline-none"
              value={runtime}
              min={1}
              max={120}
              onChange={e => setRuntime(Math.max(1, parseInt(e.target.value) || 10))}
            />
          </div>

          {zones.length === 0 && (
            <p className="text-xs text-slate-500">Add zones to see water usage estimates.</p>
          )}

          {/* Per-zone stats */}
          <div className="flex flex-wrap gap-3">
            {zoneStats.map(({ zone, headCount, gallons }) => (
              <div
                key={zone.id}
                className="flex items-center gap-2 bg-slate-700 rounded px-3 py-1.5 text-xs"
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: zone.color }} />
                <span className="text-slate-200 font-medium">{zone.name}</span>
                <span className="text-slate-400">{headCount} heads</span>
                <span className="text-slate-300">{gallons.toFixed(1)} gal</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </footer>
  )
}
