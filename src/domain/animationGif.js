export const GIF_SIZE = Object.freeze({ width: 1280, height: 800 })

// GIF delays are stored in centiseconds. Round the cumulative time rather than
// each frame independently so the exported cycle retains the demo's timing.
export function gifFrames(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return []
  const duration = Math.max(2, Math.round(seconds * 100))
  const count = Math.max(1, Math.min(160, Math.round(duration * 0.08)))
  return Array.from({ length: count }, (_, i) => {
    const start = Math.round(i * duration / count)
    const end = Math.round((i + 1) * duration / count)
    return { time: start / 100, delay: (end - start) * 10 }
  })
}

export async function encodeAnimationGif(frames, capture, onProgress) {
  if (!frames.length) throw new Error('当前型号没有可导出的动作')
  const worker = new Worker(new URL('./gif.worker.js', import.meta.url), { type: 'module' })
  try {
    for (const [index, { time, delay }] of frames.entries()) {
      const rgba = capture(time)
      const last = index === frames.length - 1
      const bytes = await new Promise((resolve, reject) => {
        const failed = () => reject(new Error('GIF 编码失败，请重试'))
        worker.onerror = worker.onmessageerror = failed
        worker.onmessage = ({ data }) => data.ok ? resolve(data.bytes) : failed()
        // Send one frame at a time, transferring the pixel buffer rather than
        // accumulating a full animation of raw frames in browser memory.
        worker.postMessage({ rgba, delay, last, ...GIF_SIZE }, [rgba.buffer])
      })
      onProgress(index + 1, frames.length)
      if (last) return new Blob([bytes], { type: 'image/gif' })
    }
  } finally {
    worker.terminate()
  }
}
