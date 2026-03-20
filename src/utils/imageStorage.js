const DB_NAME = 'irrigation-db'
const STORE = 'images'
const KEY = 'background'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE)
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

/** Persist an image Blob to IndexedDB. Overwrites any previous image.
 *  Stores as { buffer: ArrayBuffer, type: string } to avoid Firefox's
 *  structured-clone bug where programmatically-created Blobs can't be
 *  serialized for IDB storage ("Error preparing Blob/File data…"). */
export async function saveImage(blob) {
  const buffer = await blob.arrayBuffer()
  const entry = { buffer, type: blob.type }
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(entry, KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = (e) => reject(e.target.error)
  })
}

/** Load the stored image as a Blob, or null if nothing is stored.
 *  Handles both the legacy Blob format and the current { buffer, type } format. */
export async function loadImage() {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(KEY)
    req.onsuccess = (e) => {
      const result = e.target.result ?? null
      if (!result) { resolve(null); return }
      // Legacy entries were stored as a raw Blob
      if (result instanceof Blob) { resolve(result); return }
      resolve(new Blob([result.buffer], { type: result.type }))
    }
    req.onerror = (e) => reject(e.target.error)
  })
}

/** Remove the stored image. */
export async function clearImage() {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = (e) => reject(e.target.error)
  })
}
