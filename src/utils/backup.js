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

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

export async function exportBackup() {
  const blob = await loadImage()
  let imageField = null

  if (blob) {
    const dataUrl = await blobToDataUrl(blob)
    if (dataUrl.length > 80_000_000) {
      throw new Error('Image is too large to export (limit: ~60 MB). Please use a smaller photo.')
    }
    const { image } = useStore.getState()
    imageField = {
      dataUrl,
      widthPx: image?.widthPx ?? 0,
      heightPx: image?.heightPx ?? 0,
      realWidthFt: image?.realWidthFt ?? 0,
    }
  }

  const { pixelsPerFoot, scaleCalibrated, zones, heads } = useStore.getState()

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    scale: { pixelsPerFoot, scaleCalibrated },
    zones,
    heads,
    image: imageField,
  }

  const json = JSON.stringify(backup)
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const date = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `sprinkler-plan-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importBackup(backup) {
  let imageState = null

  if (backup.image) {
    const blob = dataUrlToBlob(backup.image.dataUrl)
    await saveImage(blob)
    const src = URL.createObjectURL(blob)
    imageState = {
      src,
      widthPx: backup.image.widthPx,
      heightPx: backup.image.heightPx,
      realWidthFt: backup.image.realWidthFt,
    }
  } else {
    await clearImage()
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
