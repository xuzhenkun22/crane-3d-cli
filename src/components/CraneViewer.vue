<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as T from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { buildCrane, brandingTexture, ratingTexture } from '../three/crane.js'

const props = defineProps({
  product: { type: Object, required: true }, config: { type: Object, required: true },
  rotating: Boolean, playing: Boolean, annotated: Boolean, action: { type: String, default: 'all' },
  focusRegion: { type: Object, default: null },
})
const host = ref(null)
const unavailable = ref(false)
const labels = ref([])
const hasLabels = computed(() => props.annotated && !unavailable.value)
let scene, camera, renderer, controls, resizeObserver, frame, model, sun, floor, grid, fitView = 'iso'
let width = 1, height = 1, last = 0, elapsed = 0, brandRevision = 0, dirtyShadow = true
let worldSize = 20, dirtyRender = true, loadedLogo = '', logoImage = null, fitMotion = false
let brandingReady, framingArea
const direction = {
  iso: new T.Vector3(0.64, 0.43, 1).normalize(),
  front: new T.Vector3(0, 0, 1),
  side: new T.Vector3(1, 0, 0),
  top: new T.Vector3(0, 1, 0.001).normalize(),
}

function frameModel(view = 'iso', preserveAngle = false) {
  if (!model || width <= 1 || height <= 1) return
  fitView = view
  const center = model.bounds.getCenter(new T.Vector3())
  const normal = preserveAngle ? camera.position.clone().sub(controls.target).normalize() : direction[view] ?? direction.iso
  const right = new T.Vector3().crossVectors(new T.Vector3(0, 1, 0), normal).normalize()
  const up = new T.Vector3().crossVectors(normal, right).normalize()
  const vf = Math.tan(T.MathUtils.degToRad(camera.fov / 2))
  const hf = vf * camera.aspect
  // Fit the actual part corners into the uncovered portion of the canvas,
  // while still rendering the floor and grid behind the floating panels.
  const { left, right: edge, top, bottom } = framingArea
  const xHalf = 0.88 * (edge - left) / width, yHalf = 0.82 * (bottom - top) / height
  const points = fitMotion ? model.motionFraming(props.action, elapsed) : model.framingPoints
  const coordinates = points.map(point => {
    const delta = point.clone().sub(center)
    return [delta.dot(right), delta.dot(up), delta.dot(normal)]
  })
  function offsetRange(distance) {
    let minX = -Infinity, maxX = Infinity, minY = -Infinity, maxY = Infinity
    for (const [x, y, z] of coordinates) {
      const depth = distance - z
      minX = Math.max(minX, x - hf * depth * xHalf)
      maxX = Math.min(maxX, x + hf * depth * xHalf)
      minY = Math.max(minY, y - vf * depth * yHalf)
      maxY = Math.min(maxY, y + vf * depth * yHalf)
    }
    return { minX, maxX, minY, maxY }
  }
  let near = coordinates.reduce((max, point) => Math.max(max, point[2] + 0.2), worldSize * 0.35)
  let far = worldSize * Math.max(8 / Math.max(0.05, yHalf), 4 / (camera.aspect * Math.max(0.05, xHalf)))
  for (let i = 0; i < 16; i++) {
    const mid = (near + far) / 2
    const { minX, maxX, minY, maxY } = offsetRange(mid)
    if (minX <= maxX && minY <= maxY) far = mid
    else near = mid
  }
  const distance = far * 1.02
  const { minX, maxX, minY, maxY } = offsetRange(distance)
  controls.target.copy(center).addScaledVector(right, (minX + maxX) / 2).addScaledVector(up, (minY + maxY) / 2)
  camera.position.copy(controls.target).addScaledVector(normal, distance)
  controls.minDistance = worldSize * 0.32
  controls.maxDistance = Math.max(worldSize * 4.4, distance * 1.9)
  controls.update()
  dirtyRender = true
}

function resize() {
  if (!renderer || !host.value) return
  const w = host.value.clientWidth, h = host.value.clientHeight
  if (w <= 1 || h <= 1) return
  const hostRect = host.value.getBoundingClientRect(), focus = props.focusRegion?.getBoundingClientRect()
  const area = focus?.width > 1 && focus.height > 1
    ? { left: focus.left - hostRect.left, top: focus.top - hostRect.top, right: focus.right - hostRect.left, bottom: focus.bottom - hostRect.top }
    : { left: 0, top: 0, right: w, bottom: h }
  const sizeChanged = w !== width || h !== height
  if (!sizeChanged && framingArea && Object.keys(area).every(key => area[key] === framingArea[key])) return
  const preserveAngle = width > 1 && height > 1
  framingArea = area
  if (sizeChanged) {
    width = w
    height = h
    renderer.setSize(width, height, false)
  }
  // Shift the projection, not the orbit target, when only one side is open.
  const shiftX = (width - area.left - area.right) / 2
  const shiftY = (height - area.top - area.bottom) / 2
  if (shiftX || shiftY) camera.setViewOffset(width, height, shiftX, shiftY, width, height)
  else {
    camera.aspect = width / height
    camera.clearViewOffset()
  }
  frameModel(fitView, preserveAngle)
}

function setTexture(surfaces, next) {
  const previous = new Set(surfaces.map(surface => surface.material.map))
  for (const surface of surfaces) {
    surface.material.map = next
    surface.material.needsUpdate = true
    surface.visible = Boolean(next)
  }
  previous.forEach(texture => { if (texture && texture !== next) texture.dispose() })
  dirtyRender = true
}

async function updateBranding() {
  if (!model) return
  const revision = ++brandRevision
  const target = model
  const { text, logo } = props.config
  if (logo !== loadedLogo) {
    let image = null
    if (logo) {
      image = new Image()
      image.src = logo
      try { await image.decode() } catch { image = null }
    }
    if (revision !== brandRevision || target !== model) return
    loadedLogo = logo
    logoImage = image
  }
  const first = target.brands[0]
  if (first) setTexture(target.brands, brandingTexture(text, logoImage, first.scale.x / first.scale.y))
}

function rebuild(shouldFit) {
  if (!renderer) return
  if (model) {
    scene.remove(model.root)
    model.dispose()
  }
  model = buildCrane(props.product, props.config)
  if (!props.playing && elapsed === 0) fitMotion = false
  scene.add(model.root)
  model.pose(elapsed, props.action)
  const size = model.bounds.getSize(new T.Vector3())
  worldSize = Math.max(size.x, size.y, size.z, 3)
  const mid = model.bounds.getCenter(new T.Vector3())
  const elevated = ['bridge', 'hoist'].includes(props.product.model.kind)
  const floorY = elevated ? Math.min(model.floorY, model.bounds.min.y - worldSize * 0.065) : model.floorY
  grid.position.set(mid.x, floorY + 0.012, mid.z)
  floor.position.set(mid.x, floorY, mid.z)
  grid.scale.setScalar(Math.max(0.25, worldSize / 48))
  floor.scale.setScalar(Math.max(0.25, worldSize / 53))
  floor.material.opacity = elevated ? 0.17 : 0.31
  scene.fog.density = 0.011 * Math.min(1, 28 / worldSize)
  camera.far = Math.max(650, worldSize * 12)
  camera.updateProjectionMatrix()
  sun.target.position.copy(mid)
  sun.position.copy(mid).addScaledVector(new T.Vector3(-0.59, 1.15, 0.65), worldSize)
  const range = worldSize * 0.91
  Object.assign(sun.shadow.camera, { left: -range, right: range, top: range, bottom: -range, near: 0.5, far: worldSize * 4 })
  sun.shadow.camera.updateProjectionMatrix()
  dirtyShadow = true
  setTexture(model.rated, ratingTexture(props.config))
  brandingReady = updateBranding()
  if (shouldFit) frameModel(fitView)
}

function onView(view) { frameModel(view) }
function zoom(factor) {
  if (!controls) return
  const offset = camera.position.clone().sub(controls.target)
  offset.setLength(T.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance))
  camera.position.copy(controls.target).add(offset)
  controls.update()
}
function resetMotion() {
  elapsed = 0
  model?.pose(0, props.action)
  if (fitMotion) {
    fitMotion = false
    frameModel(fitView)
  }
  dirtyRender = dirtyShadow = true
}
async function prepareCapture(w, h, action = null) {
  if (!renderer || !model || renderer.getContext().isContextLost()) return null
  const expected = model, branding = brandingReady
  await branding
  if (model !== expected || brandingReady !== branding) throw new Error('选型配置已更改，请重新导出')

  const shot = document.createElement('canvas')
  shot.width = w
  shot.height = h
  const ctx = shot.getContext('2d', action === null ? undefined : { willReadFrequently: true })
  if (!ctx) return null
  const background = ctx.createLinearGradient(0, 0, w, h)
  background.addColorStop(0, '#282e35')
  background.addColorStop(1, '#15191e')
  ctx.fillStyle = background

  // Fit the complete static pose for PNG, or the entire motion envelope for GIF.
  // The capture camera keeps one fixed direction and never uses the panel offset.
  const captureCamera = camera.clone()
  captureCamera.clearViewOffset()
  captureCamera.aspect = w / h
  const points = action === null ? expected.poseFraming() : expected.motionFraming(action, elapsed)
  const center = new T.Box3().setFromPoints(points).getCenter(new T.Vector3())
  const inverse = camera.quaternion.clone().invert(), local = new T.Vector3()
  const vf = Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * 0.85
  const hf = vf * captureCamera.aspect
  const distance = points.reduce((fit, point) => {
    local.copy(point).sub(center).applyQuaternion(inverse)
    return Math.max(fit, local.z + Math.max(Math.abs(local.x) / hf, Math.abs(local.y) / vf))
  }, worldSize * 0.35)
  captureCamera.position.copy(center).add(new T.Vector3(0, 0, distance).applyQuaternion(camera.quaternion))
  captureCamera.updateProjectionMatrix()

  function render(time) {
    if (model !== expected || brandingReady !== branding) throw new Error('选型配置已更改，请重新导出')
    if (renderer.getContext().isContextLost()) throw new Error('三维预览已断开，请刷新后重试')
    const pixelRatio = renderer.getPixelRatio(), animated = action !== null
    try {
      if (animated) expected.pose(time, action)
      renderer.setDrawingBufferSize(w, h, 1)
      if (animated || dirtyShadow) renderer.shadowMap.needsUpdate = true
      renderer.render(scene, captureCamera)
      ctx.fillRect(0, 0, w, h)
      // Copy before restoring the WebGL drawing buffer.
      ctx.drawImage(renderer.domElement, 0, 0)
    } finally {
      if (animated) {
        expected.pose(elapsed, props.action)
        renderer.shadowMap.needsUpdate = true
      }
      renderer.setDrawingBufferSize(width, height, pixelRatio)
      renderer.render(scene, camera)
    }
  }
  return { shot, render, ctx }
}
async function captureModel(w, h) {
  const capture = await prepareCapture(w, h)
  if (!capture) return null
  capture.render()
  return capture.shot
}
async function captureAnimation(w, h, action) {
  const capture = await prepareCapture(w, h, action)
  if (!capture) return null
  return time => {
    capture.render(time)
    return capture.ctx.getImageData(0, 0, w, h).data
  }
}
defineExpose({ onView, zoom, resetMotion, captureModel, captureAnimation })

const projected = new T.Vector3()
function draw(now) {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
  last = now
  controls.autoRotate = props.rotating
  if (controls.update(dt)) dirtyRender = true
  if (model && props.playing) {
    elapsed += dt
    model.pose(elapsed, props.action)
    dirtyShadow = dirtyRender = true
  }
  if (dirtyRender && props.annotated && model) {
    camera.updateMatrixWorld()
    labels.value = model.anchors.map(({ text, position }) => {
      projected.copy(position).project(camera)
      const x = (projected.x + 1) * width / 2, y = (1 - projected.y) * height / 2
      const { left, right, top, bottom } = framingArea
      return { text, x, y, visible: x > left + 8 && x < right - 30 && y > top + 15 && y < bottom && Math.abs(projected.z) <= 1 }
    })
  }
  if (dirtyShadow) {
    renderer.shadowMap.needsUpdate = true
    dirtyShadow = false
  }
  if (dirtyRender) {
    renderer.render(scene, camera)
    dirtyRender = false
  }
  frame = requestAnimationFrame(draw)
}

onMounted(() => {
  try {
    renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  } catch {
    unavailable.value = true
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = T.SRGBColorSpace
  renderer.toneMapping = T.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.16
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = T.PCFShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.domElement.setAttribute('aria-label', '可交互的起重机三维模型')
  host.value.appendChild(renderer.domElement)
  scene = new T.Scene()
  scene.fog = new T.FogExp2(0x161b21, 0.011)
  camera = new T.PerspectiveCamera(33, 1, 0.1, 650)
  camera.position.set(20, 13, 23)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.085
  controls.addEventListener('change', () => { dirtyRender = true })
  controls.autoRotateSpeed = 0.9
  controls.minPolarAngle = 0.001
  controls.maxPolarAngle = Math.PI * 0.507
  scene.add(new T.HemisphereLight(0xe1eafd, 0x928272, 2.0))
  sun = new T.DirectionalLight(0xffe3c6, 2.5)
  sun.castShadow = true
  sun.shadow.mapSize.set(1536, 1536)
  sun.shadow.normalBias = 0.045
  sun.shadow.bias = -0.00024
  sun.shadow.radius = 3
  scene.add(sun, sun.target)
  const fill = new T.DirectionalLight(0xb2d2ff, 1.25)
  fill.position.set(4, 11, -13)
  scene.add(fill)
  floor = new T.Mesh(new T.PlaneGeometry(165, 165), new T.ShadowMaterial({ opacity: 0.31, depthWrite: false }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)
  grid = new T.GridHelper(119, 85, 0x4a4c4a, 0x535a60)
  grid.material.transparent = true
  grid.material.opacity = 0.17
  grid.material.depthWrite = false
  scene.add(grid)
  rebuild(false)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host.value)
  if (props.focusRegion) resizeObserver.observe(props.focusRegion)
  resize()
  frame = requestAnimationFrame(draw)
})

watch(() => [props.product.id, props.config.capacity, props.config.span, props.config.height, JSON.stringify(props.config.options), props.config.color], (current, previous) => {
  if (current[0] !== previous[0]) fitView = 'iso'
  if (current[0] !== previous[0] || current[4] !== previous[4]) elapsed = 0
  if (current.slice(0, 5).some((v, i) => v !== previous[i])) rebuild(true)
  else if (model) {
    model.setColor(props.config.color)
    dirtyRender = true
  }
})
watch(() => props.focusRegion, (region, previous) => {
  if (previous) resizeObserver?.unobserve(previous)
  if (region) resizeObserver?.observe(region)
  resize()
}, { flush: 'post' })
watch(() => props.action, resetMotion)
watch(() => props.playing, playing => {
  if (playing && !fitMotion) {
    fitMotion = true
    frameModel(fitView)
  }
})
watch(() => [props.config.text, props.config.logo], () => { brandingReady = updateBranding() })
watch(() => props.annotated, () => { dirtyRender = true })
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  controls?.dispose()
  model?.dispose()
  for (const obj of [floor, grid]) { obj?.geometry.dispose(); obj?.material.dispose() }
  sun?.dispose()
  renderer?.dispose()
  model = null
  brandRevision++
})
</script>

<template>
  <div ref="host" class="viewer-canvas">
    <div v-if="unavailable" class="webgl-notice" role="status">
      <strong>当前环境无法加载三维预览</strong>
      <span>请开启支持 WebGL 2 的硬件加速。选型和 JSON 导出仍可使用。</span>
    </div>
    <div v-if="hasLabels" class="model-labels" aria-hidden="true">
      <span v-for="(label, index) in labels" v-show="label.visible" :key="`${label.text}-${index}`" :style="{ left: `${label.x}px`, top: `${label.y}px` }">{{ label.text }}</span>
    </div>
  </div>
</template>
