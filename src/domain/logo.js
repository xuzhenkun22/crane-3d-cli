const TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const MAX_SIZE = 4 * 1024 * 1024

export async function prepareLogo(file) {
  if (!TYPES.has(file.type)) throw new Error('请选择 PNG、JPG 或 WebP 图片。')
  if (file.size > MAX_SIZE) throw new Error('Logo 图片不能超过 4 MB。')

  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const ratio = Math.min(1, 768 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/png')
  } catch {
    throw new Error('无法读取这张图片，请重新选择。')
  } finally {
    URL.revokeObjectURL(url)
  }
}
