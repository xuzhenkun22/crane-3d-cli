import { fieldsFor, resolvedModel, selectionRecord } from './products.js'

const PNG_SCALE = 2
const modelLayout = { width: 1216, height: 800 }
// Export the model at the same pixel density as the report, not as an upscale.
export const MODEL_IMAGE_SIZE = Object.freeze({ width: modelLayout.width * PNG_SCALE, height: modelLayout.height * PNG_SCALE })

export function selectionImageData(product, config) {
  const record = selectionRecord(product, config)
  return {
    code: record.型号,
    title: record.预览构型 ?? record.产品,
    category: `${record.一级分类} / ${record.二级系列}`,
    parameters: fieldsFor(product, config).map(({ key, label, unit }) => [label, `${config[key]} ${unit}`]),
    options: Object.entries(record.构型),
    color: record.涂装,
    brand: record.品牌文字,
    logoName: record.Logo文件名,
    reference: resolvedModel(product, config).reference,
  }
}

export function createSelectionPng(modelImage, data) {
  const cardWidth = 488, margin = 48, gap = 28, top = 168
  const { width, height } = modelLayout
  const cardX = margin + width + gap
  const reportWidth = cardX + cardWidth + margin, reportHeight = top + height + 86
  const canvas = document.createElement('canvas')
  canvas.width = reportWidth * PNG_SCALE
  canvas.height = reportHeight * PNG_SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('当前浏览器无法生成选型图片'))
  ctx.scale(PNG_SCALE, PNG_SCALE)
  const dark = '#1b252f', muted = '#536575', stroke = '#dbe2e8', orange = '#b85d14'
  const font = '"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  function text(value, x, y, size, color, { weight = 400, max, align = 'left' } = {}) {
    ctx.font = `${weight} ${size}px ${font}`
    ctx.fillStyle = color
    ctx.textAlign = align
    if (max) ctx.fillText(value, x, y, max)
    else ctx.fillText(value, x, y)
  }
  function box(x, y, w, h, radius, fill, outline) {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, radius)
    ctx.fillStyle = fill
    ctx.fill()
    if (outline) { ctx.strokeStyle = outline; ctx.stroke() }
  }

  ctx.fillStyle = '#f1f4f6'
  ctx.fillRect(0, 0, reportWidth, reportHeight)
  ctx.fillStyle = '#de8433'
  ctx.fillRect(margin, 42, 27, 4)
  text('起重设备 / 选型配置', margin + 42, 45, 20, orange, { weight: 650 })
  text(data.title, margin, 99, 46, dark, { weight: 750, max: width })
  text(data.category, margin, 144, 22, muted, { max: width })
  const cardRight = cardX + cardWidth
  text(`型号 / ${data.code}`, cardRight, 103, 32, dark, { weight: 700, max: cardWidth, align: 'right' })
  if (data.reference) text('参考构型', cardRight, 144, 20, orange, { align: 'right' })

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(margin, top, width, height, 16)
  ctx.clip()
  ctx.drawImage(modelImage, margin, top, width, height)
  ctx.restore()
  box(cardX, top, cardWidth, height, 16, '#ffffff', stroke)

  const left = cardX + 28, right = cardRight - 28, textWidth = right - left
  let y = top + 40
  function heading(label) {
    text(label, left, y, 24, orange, { weight: 700 })
    y += 39
  }
  function row(label, value) {
    text(label, left, y, 21, muted, { max: 160 })
    text(value, right, y, 23, dark, { weight: 650, max: textWidth - 178, align: 'right' })
    y += 39
  }
  function separator() {
    ctx.fillStyle = stroke
    ctx.fillRect(left, y - 10, textWidth, 1)
    y += 16
  }

  heading('核心参数')
  data.parameters.forEach(([label, value]) => row(label, value))
  if (data.options.length) {
    separator()
    heading('结构选配')
    data.options.forEach(([label, value]) => row(label, value ?? '—'))
  }
  separator()
  heading('涂装与品牌')
  box(right - 135, y - 13, 24, 24, 4, data.color, stroke)
  row('设备涂装', data.color.toUpperCase())
  row('品牌文字', data.brand || '—')
  if (data.logoName) row('品牌 Logo', data.logoName)

  text('选型预览 · 模型、参数与配色仅供参考，不作为工程校核或正式规格。', margin, top + height + 43, 21, muted)
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('未能生成 PNG 图片，请重试')), 'image/png')
  })
}
