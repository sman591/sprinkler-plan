import useStore from '../../store/useStore'

export default function HeadInspector() {
  const heads = useStore(s => s.heads)
  const zones = useStore(s => s.zones)
  const selectedHeadId = useStore(s => s.selectedHeadId)
  const updateHead = useStore(s => s.updateHead)
  const removeHead = useStore(s => s.removeHead)
  const pixelsPerFoot = useStore(s => s.pixelsPerFoot)

  const head = heads.find(h => h.id === selectedHeadId)

  if (!head) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm text-center p-4">
        <div className="text-3xl mb-2">💧</div>
        <p>Select a sprinkler head to configure it.</p>
        <p className="mt-1 text-xs">Or click "Place Head" to add one.</p>
      </div>
    )
  }

  const sweepDeg = (() => {
    const start = ((head.startAngle % 360) + 360) % 360
    const end = ((head.endAngle % 360) + 360) % 360
    let sweep = end - start
    if (sweep <= 0) sweep += 360
    return sweep
  })()

  function nudgeRadius(delta) {
    updateHead(head.id, { radiusFt: Math.max(1, Math.round((head.radiusFt + delta) * 10) / 10) })
  }

  function nudgeAngle(field, delta) {
    const val = ((head[field] + delta) % 360 + 360) % 360
    updateHead(head.id, { [field]: val })
  }

  return (
    <div className="flex flex-col gap-4 p-1">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Head Config</h2>
        <button
          onClick={() => removeHead(head.id)}
          className="text-xs text-slate-500 hover:text-red-400"
        >
          Delete
        </button>
      </div>

      {/* Zone assignment */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Zone</label>
        <select
          className="w-full bg-slate-700 text-white text-sm rounded px-2 py-1.5 outline-none"
          value={head.zoneId ?? ''}
          onChange={e => updateHead(head.id, { zoneId: e.target.value || null })}
        >
          <option value="">— Unassigned —</option>
          {zones.map(z => (
            <option key={z.id} value={z.id}>{z.name}</option>
          ))}
        </select>
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">Type</label>
        <div className="flex gap-2">
          {['rotary', 'fixed'].map(t => (
            <button
              key={t}
              onClick={() => updateHead(head.id, { type: t })}
              className={`flex-1 text-sm py-1 rounded capitalize ${
                head.type === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Radius */}
      <div>
        <label className="block text-xs text-slate-400 mb-1">
          Radius — {head.radiusFt.toFixed(1)} ft
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => nudgeRadius(-1)}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded text-lg"
          >−</button>
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (head.radiusFt / 40) * 100)}%` }}
            />
          </div>
          <button
            onClick={() => nudgeRadius(1)}
            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 text-white rounded text-lg"
          >+</button>
        </div>
        <p className="text-xs text-slate-500 mt-1">Drag the white handle on the canvas to adjust</p>
      </div>

      {/* Arc angles */}
      <div>
        <label className="block text-xs text-slate-400 mb-2">Arc — {Math.round(sweepDeg)}° sweep</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-12">Start</span>
            <button onClick={() => nudgeAngle('startAngle', -5)} className="w-6 h-6 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">−</button>
            <span className="flex-1 text-center text-sm text-white">{Math.round(head.startAngle)}°</span>
            <button onClick={() => nudgeAngle('startAngle', 5)} className="w-6 h-6 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">+</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-12">End</span>
            <button onClick={() => nudgeAngle('endAngle', -5)} className="w-6 h-6 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">−</button>
            <span className="flex-1 text-center text-sm text-white">{Math.round(head.endAngle)}°</span>
            <button onClick={() => nudgeAngle('endAngle', 5)} className="w-6 h-6 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">+</button>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-1">Drag the colored handles on the canvas to adjust</p>
      </div>

      {/* Position readout */}
      <div className="text-xs text-slate-500 border-t border-slate-700 pt-3">
        <p>Position: ({(head.x / (pixelsPerFoot || 1)).toFixed(1)} ft, {(head.y / (pixelsPerFoot || 1)).toFixed(1)} ft)</p>
      </div>
    </div>
  )
}
