import * as T from 'three'
import { actionsFor, modelDimensions, resolvedModel } from '../domain/products.js'
import { buildMechanisms } from './mechanisms.js'

const tau = 2 * Math.PI

export function buildCrane(product, config) {
  const profile = resolvedModel(product, config), dimensions = modelDimensions(product, config)
  const root = new T.Group()
  const main = new T.Color(config.color)
  const mat = (color, metalness = 0.25, roughness = 0.46) => new T.MeshStandardMaterial({ color, metalness, roughness })
  const paint = mat(main), edge = mat(main.clone().multiplyScalar(1.23)), shade = mat(main.clone().multiplyScalar(0.67))
  const dark = mat('#27313a', 0.44), steel = mat('#667582', 0.47, 0.36), bolt = mat('#a7adb0', 0.54)
  const teal = mat('#33756b', 0.27), tealDark = mat('#21514d', 0.32), rubber = mat('#171c20', 0.18)
  const safety = mat('#e8bc5f'), copper = mat('#8e7458', 0.36), wire = mat('#313a3d', 0.3)
  const glass = mat('#527b89', 0.46, 0.22)
  const mats = { paint, edge, shade, dark, steel, bolt, teal, tealDark, rubber, safety, copper, wire, glass }
  const anchors = [], brands = [], rated = []
  const unitBox = new T.BoxGeometry(), unitCylinder = new T.CylinderGeometry(1, 1, 1, 16), placard = new T.PlaneGeometry(1, 1)
  const v = (x, y, z) => new T.Vector3(x, y, z)

  function mesh(geo, material, x, y, z, parent = root) {
    const obj = new T.Mesh(geo, material)
    obj.position.set(x, y, z)
    obj.castShadow = obj.receiveShadow = true
    parent.add(obj)
    return obj
  }
  function group(name, parent = root, x = 0, y = 0, z = 0) {
    const object = new T.Group()
    object.name = name
    object.position.set(x, y, z)
    parent.add(object)
    return object
  }
  function box(w, h, l, x, y, z, material, parent) {
    const obj = mesh(unitBox, material, x, y, z, parent)
    obj.scale.set(w, h, l)
    return obj
  }
  function cylinder(r, len, x, y, z, material, axis = 'y', parent) {
    const obj = mesh(unitCylinder, material, x, y, z, parent)
    obj.scale.set(r, len, r)
    if (axis === 'x') obj.rotation.z = Math.PI / 2
    if (axis === 'z') obj.rotation.x = Math.PI / 2
    return obj
  }
  function fitBar(obj, a, end) {
    const dir = end.clone().sub(a)
    obj.position.copy(a).lerp(end, 0.5)
    obj.scale.y = Math.max(0.001, dir.length())
    obj.quaternion.setFromUnitVectors(v(0, 1, 0), dir.normalize())
    return obj
  }
  function bar(a, end, w, l, material, parent) {
    return fitBar(box(w, 1, l, 0, 0, 0, material, parent), a, end)
  }
  function tube(points, r, material, parent) {
    const curve = new T.CatmullRomCurve3(points)
    return mesh(new T.TubeGeometry(curve, 18, r, 6, false), material, 0, 0, 0, parent)
  }
  function surface(x, y, z, w, h, list, parent) {
    const m = new T.MeshBasicMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
    const decal = mesh(placard, m, x, y, z, parent)
    decal.castShadow = decal.receiveShadow = decal.visible = false
    decal.scale.set(w, h, 1)
    list.push(decal)
  }
  function label(text, x, y, z, parent) {
    const marker = group('', parent, x, y, z)
    anchors.push({ text, marker, position: v(0, 0, 0) })
  }
  function stripe(x, y, z, scale, parent) {
    box(0.64 * scale, 0.25 * scale, 0.022, x, y, z, rubber, parent)
    for (let j = -2; j <= 2; j++) {
      box(0.052 * scale, 0.235 * scale, 0.024, x + j * 0.112 * scale, y, z + 0.013, safety, parent).rotation.z = -0.45
    }
  }
  function plaque(x, y, z, width, height, parent) {
    const bw = width * 0.72, rw = width * 0.20
    box(width, height, 0.034, x, y, z, shade, parent)
    surface(x + width * 0.11, y, z + 0.025, bw, height * 0.86, brands, parent)
    box(rw * 1.06, height * 0.62, 0.02, x - width * 0.376, y, z + 0.019, dark, parent)
    surface(x - width * 0.376, y, z + 0.035, rw, height * 0.52, rated, parent)
  }
  function girder(length, x, y, z, depth, h, decorated, parent, truss = false) {
    if (truss) {
      const count = Math.max(4, Math.min(18, Math.round(length / (h * 1.8))))
      for (const side of [-1, 1]) {
        const zz = z + side * depth * 0.39
        for (const sign of [-1, 1]) box(length, h * 0.15, depth * 0.23, x, y + sign * h * 0.42, zz, edge, parent)
        for (let i = 0; i <= count; i++) {
          const xx = x - length / 2 + i * length / count
          box(h * 0.09, h, depth * 0.22, xx, y, zz, paint, parent)
          if (i < count) bar(v(xx, y - h * 0.43, zz), v(xx + length / count, y + h * 0.43, zz), h * 0.095, depth * 0.18, shade, parent)
          if (side === 1) box(h * 0.11, h * 0.12, depth, xx, y - h * 0.43, z, paint, parent)
        }
      }
    } else {
      box(length, h, depth, x, y, z, paint, parent)
      for (const sign of [-1, 1]) {
        box(length + 0.045, h * 0.105, depth * 1.12, x, y + sign * h * 0.47, z, edge, parent)
        box(Math.min(length * 0.04, h * 0.09), h * 1.02, depth * 1.08, x + sign * length * 0.49, y, z, shade, parent)
      }
      for (const n of [-4, -2, -1, 0, 3, 4]) box(h * 0.044, h * 0.68, 0.025, x + n * length / 10, y, z + depth / 2 + 0.014, shade, parent)
    }
    if (decorated) {
      const face = z + depth * 0.56
      plaque(x, y, face + 0.022, length * 0.65, h * 0.78, parent)
      for (const side of [-1, 1]) stripe(x + side * length * 0.443, y - h * 0.19, face + 0.025, Math.min(2.5, length * 0.14, h * 1.8), parent)
    }
  }
  // cy is the running face. Suspended end trucks run on the lower flange.
  function rail(x, cy, length, { overhead = false, suspended = false, parent = root, scale = 1 } = {}) {
    if (!overhead) {
      const count = Math.min(56, Math.max(7, Math.ceil(length * 1.35)))
      for (let i = 0; i < count; i++) box(1.27 * scale, 0.115 * scale, 0.29 * scale, x, cy - 0.30 * scale, (i / (count - 1) - 0.5) * (length - 0.18), dark, parent)
    }
    const sign = suspended ? -1 : 1
    box(0.45 * scale, 0.14 * scale, length, x, cy - sign * 0.23 * scale, 0, steel, parent)
    box(0.19 * scale, 0.17 * scale, length, x, cy - sign * 0.12 * scale, 0, dark, parent)
    box(0.31 * scale, 0.075 * scale, length, x, cy - sign * 0.038 * scale, 0, bolt, parent)
    for (const side of [-1, 1]) box(0.52 * scale, 0.36 * scale, 0.24 * scale, x, cy + 0.14 * scale, side * (length / 2 - 0.26 * scale), dark, parent)
  }
  function baseTruck(x, cy, length, parent, { tyre = false, size = 1, suspended = false, wheels = [] } = {}) {
    const r = (tyre ? 0.46 : 0.24) * size, dir = suspended ? -1 : 1
    box(0.79 * size, 0.40 * size, length, x, cy + r * 1.7 * dir, 0, paint, parent)
    box(0.89 * size, 0.09 * size, length * 0.97, x, cy + r * 2.4 * dir, 0, edge, parent)
    for (const side of [-1, 1]) {
      const zz = side * length * 0.39
      for (const lane of (suspended || tyre ? [-1, 1] : [0])) {
        const wheel = group('travel-wheel', parent, x + lane * 0.29 * size, cy + r, zz)
        cylinder(r, (tyre ? 0.35 : suspended ? 0.19 : 0.32) * size, 0, 0, 0, rubber, 'x', wheel)
        cylinder(r * 0.68, (tyre ? 0.39 : suspended ? 0.22 : 0.43) * size, 0, 0, 0, steel, 'x', wheel)
        for (let i = 0; i < 6; i++) {
          const a = i * tau / 6
          cylinder(r * 0.115, 0.045 * size, 0.21 * size, r * 0.41 * Math.sin(a), r * 0.41 * Math.cos(a), bolt, 'x', wheel)
        }
        wheels.push({ wheel, radius: r })
        if (suspended) box(0.115 * size, r * 2.7, 0.36 * size, x + lane * 0.43 * size, cy, zz, steel, parent)
      }
    }
  }
  function ladder(x, y0, y1, z0, z1, parent) {
    const a = v(x, y0, z0), end = v(x, y1, z1)
    const count = Math.min(36, Math.max(1, Math.round(a.distanceTo(end) / 0.37)))
    for (const side of [-1, 1]) {
      const offset = v(side * 0.205, 0, 0)
      bar(a.clone().add(offset), end.clone().add(offset), 0.065, 0.065, steel, parent)
    }
    for (let i = 0; i <= count; i++) {
      const p = a.clone().lerp(end, i / count)
      cylinder(0.028, 0.44, p.x, p.y, p.z, bolt, 'x', parent)
    }
  }
  function festoon(length, y, z, parent) {
    const count = Math.max(3, Math.min(10, Math.round(length * 0.46)))
    const dx = length / count, sag = Math.min(dx * 0.3, 0.30)
    for (let i = 0; i < count; i++) {
      const x = -length * 0.5 + dx * i
      tube([v(x, y, z), v(x + dx * 0.25, y - sag, z + 0.08), v(x + dx * 0.63, y - sag * 1.13, z + 0.11), v(x + dx, y, z)], 0.022, wire, parent)
      box(0.09, 0.13, 0.08, x, y + 0.02, z, steel, parent)
    }
  }

  const rig = buildMechanisms({ root, v, group, box, cylinder, bar, fitBar, tube, rail, girder, plaque, baseTruck, ladder, festoon, label, ...mats }, profile, dimensions, config)
  const available = actionsFor(product, config).map(action => action.id)
  function pose(time = 0, action = 'all') {
    rig.pose(mechanismProgress(time, action, available))
    root.updateMatrixWorld(true)
    anchors.forEach(({ marker, position }) => marker.getWorldPosition(position))
  }
  pose()
  const bounds = new T.Box3().setFromObject(root)
  const framingPoints = [], parts = []
  function corners(part, points) {
    if (!part.geometry.boundingBox) part.geometry.computeBoundingBox()
    const { min, max } = part.geometry.boundingBox
    for (const x of [min.x, max.x]) for (const y of [min.y, max.y]) for (const z of [min.z, max.z]) {
      points.push(v(x, y, z).applyMatrix4(part.matrixWorld))
    }
  }
  root.traverse(part => {
    if (!part.isMesh || !part.visible) return
    corners(part, framingPoints)
    parts.push({ part, rest: part.matrixWorld.clone() })
  })
  let cachedAction, cachedPoints
  function motionFraming(action, elapsed) {
    if (action === cachedAction) return cachedPoints
    const ids = action === 'all' ? available.filter(id => id !== 'boom') : available.filter(id => id === action)
    const points = framingPoints.slice()
    for (const id of ids) for (const value of ['rotate', 'joint', 'luff', 'boom'].includes(id) ? [0.45, 1] : [1]) {
      rig.pose({ [id]: value })
      root.updateMatrixWorld(true)
      for (const { part, rest } of parts) if (!rest.equals(part.matrixWorld)) corners(part, points)
    }
    pose(elapsed, action)
    cachedAction = action
    cachedPoints = points
    return points
  }
  function poseFraming() {
    const points = []
    root.traverseVisible(part => { if (part.isMesh) corners(part, points) })
    return points
  }
  return {
    root, bounds, framingPoints, motionFraming, poseFraming, brands, rated, anchors, pose, floorY: rig.floorY,
    setColor(value) {
      main.set(value)
      paint.color.copy(main)
      edge.color.copy(main).multiplyScalar(1.23)
      shade.color.copy(main).multiplyScalar(0.67)
    },
    dispose() {
      const materials = new Set(Object.values(mats)), geometries = new Set([unitBox, unitCylinder, placard]), textures = new Set()
      root.traverse(obj => {
        if (!obj.isMesh) return
        materials.add(obj.material)
        geometries.add(obj.geometry)
        if (obj.material.map) textures.add(obj.material.map)
      })
      textures.forEach(t => t.dispose())
      materials.forEach(m => m.dispose())
      geometries.forEach(g => g.dispose())
    },
  }
}

export function mechanismProgress(time, action, available) {
  const clock = Math.max(0, time)
  if (action !== 'all') {
    const p = (1 - Math.cos(tau * clock / (action === 'boom' ? 8 : 5.3))) / 2
    return available.includes(action) ? { [action]: p } : {}
  }
  // Cycle one motion at a time; the quay parking boom never runs during cargo handling.
  const sequence = available.filter(id => id !== 'boom')
  if (!sequence.length) return {}
  const duration = 3.4
  const active = sequence[Math.floor(clock / duration) % sequence.length]
  const phase = (clock % duration) / duration
  return { [active]: (1 - Math.cos(tau * phase)) / 2 }
}

function textureFromCanvas(canvas) {
  const texture = new T.CanvasTexture(canvas)
  texture.colorSpace = T.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

export function ratingTexture(config) {
  const c = document.createElement('canvas')
  c.width = 480
  c.height = 120
  const ctx = c.getContext('2d')
  ctx.font = 'bold 88px "Segoe UI", sans-serif'
  ctx.fillStyle = '#f6efe3'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${config.capacity} t`, c.width / 2, c.height / 2 + 3)
  return textureFromCanvas(c)
}

export function brandingTexture(text, image, aspect) {
  if (!text.trim() && !image) return null
  const c = document.createElement('canvas')
  c.width = Math.min(3072, Math.max(160, Math.round(154 * aspect)))
  c.height = 154
  const ctx = c.getContext('2d')
  const hasText = Boolean(text.trim())
  let imageW = 0, imageH = 0
  if (image) {
    const scale = Math.min(124 / image.naturalHeight, (hasText ? c.width * 0.24 : c.width * 0.92) / image.naturalWidth)
    imageW = image.naturalWidth * scale
    imageH = image.naturalHeight * scale
  }
  const gap = image && hasText ? 23 : 0
  let size = 130, textWidth = 0
  const font = () => { ctx.font = `800 ${size}px "Segoe UI", "Microsoft YaHei", sans-serif` }
  if (hasText) {
    font()
    const limit = c.width * 0.94 - imageW - gap
    if (ctx.measureText(text).width > limit) { size = Math.max(12, Math.floor(size * limit / ctx.measureText(text).width)); font() }
    textWidth = Math.min(limit, ctx.measureText(text).width)
  }
  const start = (c.width - imageW - gap - textWidth) / 2
  if (image) ctx.drawImage(image, start, (c.height - imageH) / 2, imageW, imageH)
  if (hasText) {
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff4de'
    ctx.fillText(text, start + imageW + gap, c.height / 2 + 4, textWidth)
  }
  return textureFromCanvas(c)
}
