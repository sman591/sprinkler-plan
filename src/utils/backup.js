import { loadImage, saveImage, clearImage } from './imageStorage'
import useStore from '../store/useStore'

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  return res.blob()
}

export async function exportBackup() {
  const blob = await loadImage()
  const { pixelsPerFoot, scaleCalibrated, zones, heads, image } = useStore.getState()
  let imageField = null

  if (blob) {
    const dataUrl = await blobToDataUrl(blob)
    if (dataUrl.length > 80_000_000) {
      throw new Error('Image is too large to export (limit: ~60 MB). Please use a smaller photo.')
    }
    imageField = {
      dataUrl,
      widthPx: image?.widthPx ?? 0,
      heightPx: image?.heightPx ?? 0,
      realWidthFt: image?.realWidthFt ?? 0,
    }
  }

  const now = new Date().toISOString()
  const backup = {
    version: 1,
    exportedAt: now,
    scale: { pixelsPerFoot, scaleCalibrated },
    zones,
    heads,
    image: imageField,
  }

  const json = JSON.stringify(backup)
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const date = now.slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `sprinkler-plan-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importBackup(backup) {
  const { image: prevImage } = useStore.getState()
  let imageState = null

  if (backup.image) {
    const blob = await dataUrlToBlob(backup.image.dataUrl)
    await saveImage(blob)
    if (prevImage?.src) URL.revokeObjectURL(prevImage.src)
    const src = URL.createObjectURL(blob)
    imageState = {
      src,
      widthPx: backup.image.widthPx,
      heightPx: backup.image.heightPx,
      realWidthFt: backup.image.realWidthFt,
    }
  } else {
    await clearImage()
    if (prevImage?.src) URL.revokeObjectURL(prevImage.src)
  }

  useStore.setState({
    pixelsPerFoot: backup.scale.pixelsPerFoot,
    scaleCalibrated: backup.scale.scaleCalibrated,
    zones: backup.zones,
    heads: backup.heads,
    image: imageState,
    selectedHeadId: null,
    mode: 'select',
  })
}

export function validateBackup(raw) {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('Invalid backup file.')
  }
  if (raw.version !== 1) {
    if (typeof raw.version === 'number' && raw.version > 1) {
      throw new Error(`Unsupported backup version (${raw.version}). Please update the app.`)
    }
    throw new Error('Invalid backup file: missing version.')
  }
  if (!raw.scale || typeof raw.scale.pixelsPerFoot !== 'number' || typeof raw.scale.scaleCalibrated !== 'boolean') {
    throw new Error('Invalid backup file: malformed scale data.')
  }
  if (!Array.isArray(raw.zones) || !Array.isArray(raw.heads)) {
    throw new Error('Invalid backup file: zones and heads must be arrays.')
  }
  if (raw.image != null) {
    const img = raw.image
    if (typeof img.dataUrl !== 'string' || !img.dataUrl.startsWith('data:')) {
      throw new Error('Invalid backup file: malformed image data URL.')
    }
    if (typeof img.widthPx !== 'number' || typeof img.heightPx !== 'number' || typeof img.realWidthFt !== 'number') {
      throw new Error('Invalid backup file: malformed image dimensions.')
    }
  }
}
