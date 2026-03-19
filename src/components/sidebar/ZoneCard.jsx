import { useState } from 'react'
import useStore from '../../store/useStore'

export default function ZoneCard({ zone, headCount }) {
  const updateZone = useStore(s => s.updateZone)
  const removeZone = useStore(s => s.removeZone)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(zone.name)
  const [gpm, setGpm] = useState(zone.gpm)

  function save() {
    updateZone(zone.id, { name, gpm: parseFloat(gpm) || zone.gpm })
    setEditing(false)
  }

  return (
    <div className="bg-slate-700 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ background: zone.color }}
        />
        {editing ? (
          <input
            className="flex-1 bg-slate-600 text-white text-sm rounded px-2 py-0.5 outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && save()}
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm font-medium text-white truncate">{zone.name}</span>
        )}
        <button
          onClick={() => editing ? save() : setEditing(true)}
          className="text-xs text-slate-400 hover:text-white"
        >
          {editing ? 'Save' : 'Edit'}
        </button>
        <button
          onClick={() => removeZone(zone.id)}
          className="text-xs text-slate-500 hover:text-red-400"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span>{headCount} head{headCount !== 1 ? 's' : ''}</span>
        {editing ? (
          <label className="flex items-center gap-1">
            GPM:
            <input
              type="number"
              className="w-14 bg-slate-600 text-white rounded px-1 py-0.5 outline-none"
              value={gpm}
              step="0.1"
              min="0"
              onChange={e => setGpm(e.target.value)}
            />
          </label>
        ) : (
          <span>{zone.gpm} GPM</span>
        )}
      </div>
    </div>
  )
}
