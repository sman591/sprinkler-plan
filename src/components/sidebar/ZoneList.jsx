import { useState } from 'react'
import useStore from '../../store/useStore'
import ZoneCard from './ZoneCard'

export default function ZoneList() {
  const zones = useStore(s => s.zones)
  const heads = useStore(s => s.heads)
  const addZone = useStore(s => s.addZone)

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [gpm, setGpm] = useState('2.0')

  function handleAdd() {
    if (!adding) { setAdding(true); return }
    addZone(name.trim() || undefined, parseFloat(gpm) || 2.0)
    setName('')
    setGpm('2.0')
    setAdding(false)
  }

  const headCountByZone = {}
  for (const h of heads) {
    if (h.zoneId) headCountByZone[h.zoneId] = (headCountByZone[h.zoneId] ?? 0) + 1
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Zones</h2>
        <button
          onClick={handleAdd}
          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded"
        >
          + Add
        </button>
      </div>

      {adding && (
        <div className="bg-slate-700 rounded-lg p-3 space-y-2">
          <input
            className="w-full bg-slate-600 text-white text-sm rounded px-2 py-1 outline-none"
            placeholder="Zone name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <label>GPM:</label>
            <input
              type="number"
              className="w-16 bg-slate-600 text-white rounded px-2 py-1 outline-none"
              value={gpm}
              step="0.1"
              min="0"
              onChange={e => setGpm(e.target.value)}
            />
            <button
              onClick={() => setAdding(false)}
              className="ml-auto text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {zones.length === 0 && !adding && (
        <p className="text-xs text-slate-500 text-center py-4">No zones yet. Add a zone to get started.</p>
      )}

      {[...zones].sort((a, b) => a.number - b.number).map(zone => (
        <ZoneCard
          key={zone.id}
          zone={zone}
          headCount={headCountByZone[zone.id] ?? 0}
        />
      ))}
    </div>
  )
}
