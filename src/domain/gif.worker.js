import { GIFEncoder, applyPalette, quantize } from 'gifenc'

const encoder = GIFEncoder()
const unchanged = 255
let palette, previous
self.onmessage = ({ data: { rgba, width, height, delay, last } }) => {
  try {
    // Share one palette to avoid color flicker. Keep the last index available
    // for unchanged pixels, which GIF can leave on screen from the prior frame.
    palette ??= quantize(rgba, unchanged)
    const pixels = applyPalette(rgba, palette)
    if (!previous) {
      const table = [...palette]
      while (table.length <= unchanged) table.push([0, 0, 0])
      encoder.writeFrame(pixels, width, height, { palette: table, delay, repeat: 0 })
    } else {
      const delta = new Uint8Array(pixels.length)
      for (let i = 0; i < pixels.length; i++) delta[i] = pixels[i] === previous[i] ? unchanged : pixels[i]
      encoder.writeFrame(delta, width, height, { delay, transparent: true, transparentIndex: unchanged, dispose: 1 })
    }
    previous = pixels
    if (last) {
      encoder.finish()
      const bytes = encoder.bytes()
      self.postMessage({ ok: true, bytes }, [bytes.buffer])
    } else self.postMessage({ ok: true })
  } catch {
    self.postMessage({ ok: false })
  }
}
