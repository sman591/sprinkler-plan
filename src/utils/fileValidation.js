/**
 * Extract a single image file from a FileList (e.g. from a drop event or file input).
 * Returns null if no image file is found.
 *
 * @param {FileList|File[]|null|undefined} files
 * @returns {File|null}
 */
export function extractImageFile(files) {
  if (!files || files.length === 0) return null
  const file = files[0]
  if (!file.type.startsWith('image/')) return null
  return file
}
