import { describe, it, expect, beforeEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { saveImage, loadImage, clearImage } from './imageStorage'

// Re-create a fresh IDB instance for each test to ensure isolation
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
})

describe('loadImage', () => {
  it('returns null when nothing has been stored', async () => {
    expect(await loadImage()).toBeNull()
  })
})

describe('saveImage / loadImage', () => {
  it('stores and retrieves a blob', async () => {
    const blob = new Blob(['pixel data'], { type: 'image/png' })
    await saveImage(blob)
    const result = await loadImage()
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('image/png')
    expect(await result.text()).toBe('pixel data')
  })

  it('overwrites the previous image', async () => {
    await saveImage(new Blob(['first'], { type: 'image/png' }))
    await saveImage(new Blob(['second'], { type: 'image/jpeg' }))
    const result = await loadImage()
    expect(result.type).toBe('image/jpeg')
    expect(await result.text()).toBe('second')
  })

  it('preserves the full content of a larger blob', async () => {
    const data = 'x'.repeat(100_000)
    await saveImage(new Blob([data], { type: 'image/webp' }))
    const result = await loadImage()
    expect(await result.text()).toHaveLength(100_000)
  })
})

describe('clearImage', () => {
  it('removes the stored image so loadImage returns null', async () => {
    await saveImage(new Blob(['data'], { type: 'image/png' }))
    await clearImage()
    expect(await loadImage()).toBeNull()
  })

  it('does not throw when nothing is stored', async () => {
    await expect(clearImage()).resolves.toBeUndefined()
  })
})
