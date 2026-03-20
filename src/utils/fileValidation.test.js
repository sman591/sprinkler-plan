import { describe, it, expect } from 'vitest'
import { extractImageFile } from './fileValidation'

function makeFile(name, type) {
  return { name, type }
}

describe('extractImageFile', () => {
  it('returns null for null input', () => {
    expect(extractImageFile(null)).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(extractImageFile(undefined)).toBeNull()
  })

  it('returns null for empty list', () => {
    expect(extractImageFile([])).toBeNull()
  })

  it('returns null for non-image file', () => {
    expect(extractImageFile([makeFile('report.pdf', 'application/pdf')])).toBeNull()
  })

  it('returns null for text file', () => {
    expect(extractImageFile([makeFile('notes.txt', 'text/plain')])).toBeNull()
  })

  it('returns file for image/jpeg', () => {
    const f = makeFile('photo.jpg', 'image/jpeg')
    expect(extractImageFile([f])).toBe(f)
  })

  it('returns file for image/png', () => {
    const f = makeFile('lawn.png', 'image/png')
    expect(extractImageFile([f])).toBe(f)
  })

  it('returns file for image/webp', () => {
    const f = makeFile('aerial.webp', 'image/webp')
    expect(extractImageFile([f])).toBe(f)
  })

  it('returns only the first file when multiple are provided', () => {
    const f1 = makeFile('a.png', 'image/png')
    const f2 = makeFile('b.jpg', 'image/jpeg')
    expect(extractImageFile([f1, f2])).toBe(f1)
  })

  it('returns null if first file is not an image even when others are', () => {
    const nonImage = makeFile('doc.pdf', 'application/pdf')
    const image = makeFile('photo.jpg', 'image/jpeg')
    expect(extractImageFile([nonImage, image])).toBeNull()
  })
})
