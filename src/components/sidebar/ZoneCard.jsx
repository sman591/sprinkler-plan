import { useState } from 'react'
import useStore from '../../store/useStore'

export default function ZoneCard({ zone, headCount }) {
  const updateZone = useStore(s => s.updateZone)
  const removeZone = useStore(s => s.removeZone)
  const moveZone = useStore(s => s.moveZone)
  const zones = useStore(s => s.zones)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(zone.name)
  const [gpm, setGpm] = useState(String(zone.gpm))

  const sorted = [...zones].sort((a, b) => a.number - b.number)
  const idx = sorted.findIndex(z => z.id === zone.id)
  const isFirst = idx === 0
  const isLast = idx === sorted.length - 1

  function save() {
    updateZone(zone.id, { name: name.trim() || zone.name, gpm: parseFloat(gpm) || zone.gpm })
    setEditing(false)
  }

  function cancel() {
    setName(zone.name)
    setGpm(String(zone.gpm))
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="bg-slate-700 rounded-lg p-3 space-y-2">
        {/* Name row */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: zone.color }} />
          <input
            className="flex-1 bg-slate-600 text-white text-sm rounded px-2 py-0.5 outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
            autoFocus
            placeholder="Zone name"
          />
        </div>
        {/* GPM + actions row */}
        <div className="flex items-center gap-2 pl-5">
          <label className="flex items-center gap-1 text-xs text-slate-400">
            GPM:
            <input
              type="number"
              className="w-14 bg-slate-600 text-white rounded px-1 py-0.5 outline-none text-xs"
              value={gpm}
              step="0.1"
              min="0"
              onChange={e => setGpm(e.target.value)}
            />
          </label>
          <button onClick={save} className="ml-auto text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-0.5 rounded">
            Save
          </button>
          <button onClick={cancel} className="text-xs text-slate-400 hover:text-white">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-700 rounded-lg p-3 space-y-1">
      {/* Name + controls row */}
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: zone.color }} />
        <span className="text-xs text-slate-400 font-mono w-4 text-center flex-shrink-0">{zone.number}</span>
        <span className="flex-1 text-sm font-medium text-white truncate">{zone.name}</span>
        <button
          onClick={() => moveZone(zone.id, 'up')}
          disabled={isFirst}
          className="text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-default text-xs px-0.5 leading-none"
          title="Move up"
        >▲</button>
        <button
          onClick={() => moveZone(zone.id, 'down')}
          disabled={isLast}
          className="text-slate-400 hover:text-white disabled:opacity-25 disabled:cursor-default text-xs px-0.5 leading-none"
          title="Move down"
        >▼</button>
        <button onClick={() => setEditing(true)} className="text-xs text-slate-400 hover:text-white">
          Edit
        </button>
        <button onClick={() => removeZone(zone.id)} className="text-xs text-slate-500 hover:text-red-400">
          ✕
        </button>
      </div>
      {/* Stats row */}
      <div className="flex items-center gap-2 text-xs text-slate-400 pl-5">
        <span>{headCount} head{headCount !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{zone.gpm} GPM</span>
      </div>
    </div>
  )
}
