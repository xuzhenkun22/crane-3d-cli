<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ArrowDownToLine, ArrowRight, Box, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Crosshair, Expand, Film, ImageDown, ImagePlus, Layers3, Minimize, Minus, Play, Plus, RotateCcw, RotateCw, Search, SlidersHorizontal, Type, X, Pause } from '@lucide/vue'
import CraneViewer from './components/CraneViewer.vue'
import ProductGlyph from './components/ProductGlyph.vue'
import { CATEGORIES, COLORS, DEFAULT_PRODUCT, HOIST_CAPACITY_LIMIT, PRODUCTS, actionsFor, defaultConfig, fieldsFor, matchesProduct, normalizeColor, previewName, resolvedModel, selectionRecord, validateParameter } from './domain/products.js'
import { prepareLogo } from './domain/logo.js'
import { createSelectionPng, MODEL_IMAGE_SIZE, selectionImageData } from './domain/selectionImage.js'
import { encodeAnimationGif, GIF_SIZE, gifFrames } from './domain/animationGif.js'
import { mechanismCycleSeconds } from './three/crane.js'

const productId = ref(DEFAULT_PRODUCT.id)
const configs = reactive(Object.fromEntries(PRODUCTS.map(p => [p.id, defaultConfig(p)])))
const product = computed(() => PRODUCTS.find(item => item.id === productId.value))
const config = computed(() => configs[productId.value])
const categoryId = ref(DEFAULT_PRODUCT.categoryId), seriesId = ref(DEFAULT_PRODUCT.seriesId), query = ref('')
const category = computed(() => CATEGORIES.find(c => c.id === categoryId.value))
const searching = computed(() => Boolean(query.value.trim()))
const visibleProducts = computed(() => PRODUCTS.filter(item => searching.value
  ? matchesProduct(item, query.value)
  : item.categoryId === categoryId.value && item.seriesId === seriesId.value))
const productList = ref(null)
watch(visibleProducts, () => {
  if (productList.value) productList.value.scrollTop = 0
}, { flush: 'post' })
function changeCategory() {
  const active = product.value
  seriesId.value = active.categoryId === categoryId.value ? active.seriesId : category.value.series[0].id
}
const palette = computed(() => {
  if (COLORS.some(color => color.value === product.value.color)) return COLORS
  return [{ name: '系列标准色', value: product.value.color }, ...COLORS]
})
const fields = computed(() => fieldsFor(product.value, config.value))
const currentModel = computed(() => resolvedModel(product.value, config.value))
const drafts = reactive({}), fieldErrors = reactive({})
const colorDraft = ref(config.value.color.toUpperCase()), colorError = ref('')
const actions = computed(() => actionsFor(product.value, config.value))
const action = ref('all')
const viewModes = [{ id: 'iso', label: '轴测' }, { id: 'front', label: '正视' }, { id: 'side', label: '侧视' }, { id: 'top', label: '俯视' }]
const mode = ref('iso')
const rotating = ref(false), playing = ref(false), annotated = ref(false), expanded = ref(false)
const viewer = ref(null), stage = ref(null), fullscreenButton = ref(null), fileInput = ref(null)
const focusRegion = ref(null)
const fallbackExpanded = ref(false), widePreview = ref(false)
const catalogOpen = ref(false), configOpen = ref(false)
const message = ref(''), error = ref(''), busy = ref(false), exportingImage = ref(false)
const gifProgress = ref(null)
const gifSource = computed(() => ({ id: productId.value, action: action.value, ...config.value, options: { ...config.value.options } }))
let request = 0, messageTimer, fullscreenPending = false, wideMedia

function syncDrafts() {
  for (const key of ['capacity', 'span', 'height']) {
    drafts[key] = String(config.value[key])
    fieldErrors[key] = ''
  }
  chooseColor(config.value.color)
}
syncDrafts()

function selectProduct(item) {
  categoryId.value = item.categoryId
  seriesId.value = item.seriesId
  if (item.id !== productId.value) {
    productId.value = item.id
    mode.value = 'iso'
    action.value = 'all'
    rotating.value = playing.value = false
    error.value = ''
    syncDrafts()
  }
}
function updateParameter(field, raw, commit = false) {
  drafts[field.key] = raw
  const { error, value } = validateParameter(raw, field)
  fieldErrors[field.key] = commit || (raw && !raw.endsWith('.')) ? (error ?? '') : ''
  if (error) return false
  config.value[field.key] = value
  if (commit) drafts[field.key] = String(value)
  return true
}
function updateColor(raw, commit = false) {
  colorDraft.value = raw
  const color = normalizeColor(raw)
  if (!color) {
    colorError.value = commit || colorError.value ? '请输入 6 位十六进制色码，如 #2684C8' : ''
    return false
  }
  config.value.color = color
  colorError.value = ''
  if (commit) colorDraft.value = color.toUpperCase()
  return true
}
function chooseColor(color) { updateColor(color, true) }
function changeOption() {
  playing.value = false
  action.value = 'all'
  if (!fields.value.some(f => f.key === 'span')) {
    drafts.span = String(config.value.span)
    fieldErrors.span = ''
  }
}
function notify(text) {
  message.value = text
  clearTimeout(messageTimer)
  messageTimer = setTimeout(() => { message.value = '' }, 2200)
}
function reset() {
  ++request
  busy.value = false
  configs[productId.value] = defaultConfig(product.value)
  playing.value = false
  action.value = 'all'
  viewer.value?.resetMotion()
  syncDrafts()
  error.value = ''
  notify('已恢复当前产品的默认配置')
}
function openUpload() {
  fileInput.value?.click()
}
async function onLogoChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  const id = productId.value
  const token = ++request
  busy.value = true
  error.value = ''
  try {
    const logo = await prepareLogo(file)
    if (token !== request) return
    configs[id].logo = logo
    configs[id].logoName = file.name
    if (id === productId.value) notify('Logo 已添加到三维模型')
  } catch (failure) {
    if (token === request && id === productId.value) error.value = failure.message
  } finally {
    if (token === request) busy.value = false
  }
}
function removeLogo() {
  ++request
  busy.value = false
  config.value.logo = config.value.logoName = ''
  error.value = ''
}
function setView(id) {
  rotating.value = false
  mode.value = id
  viewer.value?.onView(id)
}
function syncPreviewLayout() {
  widePreview.value = wideMedia.matches
  catalogOpen.value = configOpen.value = widePreview.value
}
function setPanel(panel, open) {
  const target = panel === 'catalog' ? catalogOpen : configOpen
  const other = panel === 'catalog' ? configOpen : catalogOpen
  if (!widePreview.value && open) other.value = false
  target.value = open
}
function togglePanel(panel) {
  setPanel(panel, !(panel === 'catalog' ? catalogOpen.value : configOpen.value))
}
function onFullscreenChange() {
  const wasExpanded = expanded.value
  expanded.value = Boolean(stage.value && document.fullscreenElement === stage.value) || fallbackExpanded.value
  if (wasExpanded !== expanded.value) nextTick(() => fullscreenButton.value?.focus({ preventScroll: true }))
}
async function toggleFullscreen() {
  const element = stage.value
  if (!element || fullscreenPending) return
  if (fallbackExpanded.value) {
    fallbackExpanded.value = false
    onFullscreenChange()
    return
  }
  fullscreenPending = true
  try {
    if (document.fullscreenElement === element) {
      await document.exitFullscreen()
    } else if (element.requestFullscreen) {
      try { await element.requestFullscreen() } catch { fallbackExpanded.value = true }
    } else {
      fallbackExpanded.value = true
    }
    onFullscreenChange()
  } catch {
    notify('暂时无法退出全屏，请按 Esc 返回')
  } finally {
    fullscreenPending = false
  }
}
function onKey(event) {
  if (event.key === 'Escape' && fallbackExpanded.value) {
    event.preventDefault()
    toggleFullscreen()
  }
}
function validateSelection() {
  const valid = fields.value.map(field => updateParameter(field, drafts[field.key], true)).every(Boolean)
  const hasColor = updateColor(colorDraft.value, true)
  if (valid && hasColor) return true
  setPanel('config', true)
  nextTick(() => document.getElementById(fields.value.find(f => fieldErrors[f.key])?.key ?? 'paint-hex')?.focus())
  notify('请先修正配置中标出的输入')
  return false
}
function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
function exportSelection() {
  if (!validateSelection()) return
  const data = JSON.stringify(selectionRecord(product.value, config.value), null, 2)
  download(new Blob([data], { type: 'application/json;charset=utf-8' }), `${product.value.code}系列-选型配置.json`)
  notify('选型配置已导出')
}
async function exportImage() {
  if (exportingImage.value || gifProgress.value !== null || busy.value || !validateSelection()) return
  const id = productId.value, data = selectionImageData(product.value, config.value)
  exportingImage.value = true
  try {
    await nextTick()
    const image = await viewer.value?.captureModel(MODEL_IMAGE_SIZE.width, MODEL_IMAGE_SIZE.height)
    if (!image) throw new Error('当前无法截取三维模型，请启用浏览器的 WebGL 2 硬件加速')
    if (productId.value !== id || JSON.stringify(selectionImageData(product.value, config.value)) !== JSON.stringify(data)) {
      throw new Error('选型配置已更改，请重新导出')
    }
    const blob = await createSelectionPng(image, data)
    download(blob, `${data.code}-选型配置.png`)
    notify('选型图片已导出')
  } catch (failure) {
    notify(failure.message || '未能导出图片，请重试')
  } finally {
    exportingImage.value = false
  }
}
async function exportGif() {
  if (gifProgress.value !== null || exportingImage.value || busy.value || !validateSelection()) return
  const selected = gifSource.value, code = product.value.code
  const label = actions.value.find(motion => motion.id === selected.action)?.label ?? '整机循环'
  const frames = gifFrames(mechanismCycleSeconds(selected.action, actions.value.map(motion => motion.id)))
  if (!frames.length) return notify('当前型号没有可导出的动作')
  const ensureUnchanged = () => {
    if (gifSource.value !== selected) throw new Error('选型配置或动作已更改，请重新导出 GIF')
  }
  gifProgress.value = 0
  notify('正在生成 GIF 动图')
  try {
    await nextTick()
    const capture = await viewer.value?.captureAnimation(GIF_SIZE.width, GIF_SIZE.height, selected.action)
    if (!capture) throw new Error('当前无法录制三维模型，请启用浏览器的 WebGL 2 硬件加速')
    const gif = await encodeAnimationGif(frames, time => {
      ensureUnchanged()
      return capture(time)
    }, (done, total) => { gifProgress.value = Math.floor(done / total * 100) })
    ensureUnchanged()
    download(gif, `${code}-${label}.gif`)
    notify('GIF 动图已导出')
  } catch (failure) {
    notify(failure.message || '未能导出 GIF，请重试')
  } finally {
    gifProgress.value = null
  }
}
onMounted(() => {
  wideMedia = window.matchMedia('(min-width: 1100px)')
  syncPreviewLayout()
  wideMedia.addEventListener('change', syncPreviewLayout)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  wideMedia?.removeEventListener('change', syncPreviewLayout)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  window.removeEventListener('keydown', onKey)
  clearTimeout(messageTimer)
  ++request
})
</script>

<template>
  <main class="shell" id="workspace">
    <header class="intro" :inert="fallbackExpanded">
      <h1 id="main-title">起重机 <span>3D</span> 在线选型</h1>
    </header>

    <div class="workbench">
      <section id="preview" ref="stage" class="stage panel" :class="{ 'stage-expanded': expanded, 'stage-wide': widePreview }" :role="fallbackExpanded ? 'dialog' : undefined" :aria-modal="fallbackExpanded ? true : undefined" aria-label="三维预览">
        <div class="stage-meta">
          <div class="stage-heading"><Box :size="17" /> <strong>三维预览</strong><span class="live-tag"><i></i> 实时</span></div>
          <div class="scene-title">
            <p><i></i><span>{{ product.code }}</span><span class="title-separator"></span>{{ product.category }}</p>
            <div class="model-name"><h2>{{ previewName(product, currentModel) }}</h2><span v-if="currentModel.winch" class="reference-tag">卷扬起重小车</span><span v-if="currentModel.reference" class="reference-tag">参考构型</span></div>
            <span class="scene-description">{{ product.description }}</span>
          </div>
        </div>
        <div class="preview-toolbar" role="group" aria-label="三维预览工具">
          <div class="view-tools" role="group" aria-label="视角与缩放">
            <button v-for="view in viewModes" :key="view.id" class="button tiny view-mode" type="button" :aria-pressed="mode === view.id" @click="setView(view.id)">{{ view.label }}</button>
            <button class="button tiny tool-icon" type="button" title="缩小" aria-label="缩小" @click="viewer?.zoom(1.15)"><Minus :size="15" /></button>
            <button class="button tiny tool-icon" type="button" title="放大" aria-label="放大" @click="viewer?.zoom(0.87)"><Plus :size="15" /></button>
            <button class="button tiny tool-icon" type="button" title="重置视角" aria-label="重置视角" @click="setView('iso')"><RotateCcw :size="14" /></button>
          </div>
          <button class="button tiny" type="button" :aria-pressed="rotating" @click="rotating = !rotating"><RotateCw :size="14" /> 自动旋转</button>
          <button class="button tiny" type="button" :aria-pressed="annotated" @click="annotated = !annotated"><Crosshair :size="14" /> 结构标注</button>
          <div class="motion-tools" role="group" aria-label="动作控制">
            <label class="select-wrap motion-select">
              <span class="visually-hidden">演示机构</span>
              <select v-model="action" @change="playing = false"><option value="all">整机循环</option><option v-for="motion in actions" :key="motion.id" :value="motion.id">{{ motion.label }}</option></select><ChevronDown :size="13" />
            </label>
            <button class="button tiny amber" type="button" :aria-pressed="playing" @click="playing = !playing">
              <Pause v-if="playing" :size="15" fill="currentColor" /><Play v-else :size="15" fill="currentColor" />{{ playing ? '暂停演示' : '动作演示' }}
            </button>
          </div>
          <button class="button tiny gif-button export-button" type="button" :disabled="gifProgress !== null || exportingImage || busy || !actions.length" :aria-busy="gifProgress !== null" title="将当前所选动作导出为循环 GIF 动图" @click="exportGif">
            <Film :size="15" />{{ gifProgress === null ? '导出 GIF' : `GIF ${gifProgress}%` }}
          </button>
          <button class="button tiny export-button" type="button" :disabled="exportingImage || gifProgress !== null || busy" @click="exportImage"><ImageDown :size="15" /> {{ exportingImage ? '正在导出…' : '导出图片' }}</button>
          <button class="button tiny export-button" type="button" @click="exportSelection"><ArrowDownToLine :size="15" /> 导出配置</button>
          <button ref="fullscreenButton" class="button tiny fullscreen-button" type="button" @click="toggleFullscreen"><Minimize v-if="expanded" :size="15" /><Expand v-else :size="15" />{{ expanded ? '退出全屏' : '全屏' }}</button>
        </div>
        <div class="scene" :class="{ 'with-catalog': catalogOpen, 'with-config': configOpen }">
          <CraneViewer ref="viewer" :product="product" :config="config" :rotating="rotating" :playing="playing" :action="action" :annotated="annotated" :focus-region="focusRegion" />
          <div ref="focusRegion" class="preview-safe-region" aria-hidden="true"></div>
          <div class="preview-overlays">
            <button class="pane-toggle catalog-toggle" type="button" aria-controls="products" :aria-expanded="catalogOpen" :aria-label="catalogOpen ? '收起产品系列' : '展开产品系列'" :title="catalogOpen ? '收起产品系列' : '展开产品系列'" @click="togglePanel('catalog')">
              <Layers3 v-if="!catalogOpen" class="pane-icon" :size="15" aria-hidden="true" />
              <component :is="catalogOpen ? ChevronLeft : ChevronRight" class="pane-arrow-side" :size="17" aria-hidden="true" />
              <component :is="catalogOpen ? ChevronDown : ChevronUp" class="pane-arrow-drawer" :size="17" aria-hidden="true" />
            </button>
      <section v-show="catalogOpen" class="catalog panel" id="products" aria-labelledby="catalog-title">
        <div class="catalog-header">
          <Layers3 :size="17" />
          <h2 id="catalog-title">产品系列</h2>
          <span class="catalog-total">{{ PRODUCTS.length }} 个型号</span>
        </div>
        <div class="catalog-filters">
          <label class="field catalog-search"><span>全目录搜索</span><span class="text-wrap"><Search :size="15" /><input v-model="query" type="search" placeholder="输入型号、产品名或别名" /></span></label>
          <label class="field"><span>01 · 产品类别</span><span class="select-wrap"><select v-model="categoryId" :disabled="searching" @change="changeCategory"><option v-for="item in CATEGORIES" :key="item.id" :value="item.id">{{ item.name }}</option></select><ChevronDown :size="14" /></span></label>
          <label class="field"><span>02 · 结构系列</span><span class="select-wrap"><select v-model="seriesId" :disabled="searching"><option v-for="item in category.series" :key="item.id" :value="item.id">{{ item.name }}</option></select><ChevronDown :size="14" /></span></label>
        </div>
        <div class="catalog-results">
          <p id="catalog-results-title" class="catalog-note" aria-live="polite">{{ searching ? '搜索结果' : '03 · 具体型号' }} <strong>{{ visibleProducts.length }}</strong></p>
          <div v-if="visibleProducts.length" ref="productList" class="product-list" role="group" aria-labelledby="catalog-results-title">
            <button v-for="item in visibleProducts" :key="item.id" type="button" class="product-card" :class="{ selected: item.id === productId }" :aria-pressed="item.id === productId" @click="selectProduct(item)">
              <span class="product-card-head"><span class="product-code">{{ item.code }}</span><Check v-if="item.id === productId" class="product-selected" :size="14" /><ArrowRight v-else class="product-arrow" :size="14" /></span>
              <ProductGlyph :kind="item.model.kind === 'bridge' ? (item.model.double ? 'double' : 'single') : item.model.kind" :color="item.color" />
              <span class="product-caption"><strong>{{ item.name }}</strong><small>{{ item.seriesName }}</small></span>
            </button>
          </div>
          <p v-else class="catalog-empty">未找到匹配的型号，请试试其他关键词。</p>
        </div>
        <div class="catalog-current">
          <span>当前型号</span><strong>{{ product.code }}</strong><span class="catalog-current-name" :title="product.name">{{ product.name }}</span>
        </div>
      </section>

            <button class="pane-toggle config-toggle" type="button" aria-controls="configuration" :aria-expanded="configOpen" :aria-label="configOpen ? '收起选型配置' : '展开选型配置'" :title="configOpen ? '收起选型配置' : '展开选型配置'" @click="togglePanel('config')">
              <SlidersHorizontal v-if="!configOpen" class="pane-icon" :size="15" aria-hidden="true" />
              <component :is="configOpen ? ChevronRight : ChevronLeft" class="pane-arrow-side" :size="17" aria-hidden="true" />
              <component :is="configOpen ? ChevronDown : ChevronUp" class="pane-arrow-drawer" :size="17" aria-hidden="true" />
            </button>
      <aside v-show="configOpen" id="configuration" class="config panel" aria-labelledby="config-title">
        <div class="config-header">
          <span class="config-icon"><SlidersHorizontal :size="18" /></span>
          <h2 id="config-title">选型配置</h2>
          <button class="button tiny reset-button" type="button" @click="reset"><RotateCcw :size="13" /> 重置</button>
        </div>
        <div class="config-body">
          <section class="config-section">
            <h3><b>01</b> 核心参数</h3>
            <div class="parameter-list">
              <div v-for="field in fields" :key="field.key" class="field">
                <label :for="field.key">{{ field.label }}<small class="field-range">{{ field.min }}–{{ field.max }} {{ field.unit }}</small></label>
                <div class="parameter-inputs">
                  <span class="number-wrap"><input :id="field.key" type="text" inputmode="decimal" autocomplete="off" maxlength="10" :aria-invalid="Boolean(fieldErrors[field.key])" :aria-describedby="fieldErrors[field.key] ? `${field.key}-error` : null" :value="drafts[field.key]" @input="updateParameter(field, $event.target.value)" @blur="updateParameter(field, $event.target.value, true)" @keydown.enter.prevent="updateParameter(field, $event.target.value, true)" /><em>{{ field.unit }}</em></span>
                  <span class="select-wrap preset-select"><select :aria-label="`${field.label}常用值`" value="" @change="updateParameter(field, $event.target.value, true); $event.target.value = ''"><option value="" disabled>常用值</option><option v-for="value in field.choices" :key="value" :value="value">{{ value }} {{ field.unit }}</option></select><ChevronDown :size="13" /></span>
                </div>
                <small v-if="fieldErrors[field.key]" :id="`${field.key}-error`" class="error">{{ fieldErrors[field.key] }}</small>
              </div>
            </div>
            <p v-if="currentModel.capacityUpgrade" class="mechanism-note">超过 {{ HOIST_CAPACITY_LIMIT }} t，预览已切换为双梁卷扬起重小车参考构型，目录型号不变。</p>
            <p v-else-if="product.categoryId === 'hoist'" class="mechanism-note">此目录的葫芦预览最高 {{ HOIST_CAPACITY_LIMIT }} t。更大吨位请选择桥式或门式起重机的卷扬小车构型。</p>
            <div v-if="product.options.length" class="option-grid">
              <label v-for="option in product.options" :key="option.key" class="field"><span>{{ option.label }}</span><span class="select-wrap"><select v-model="config.options[option.key]" @change="changeOption"><option v-for="value in option.values" :key="value.id" :value="value.id">{{ value.name }}</option></select><ChevronDown :size="14" /></span></label>
            </div>
          </section>
          <section class="config-section brand-section">
            <h3><b>02</b> 外观定制</h3>
            <div class="paint-row"><span>设备涂装</span><div class="swatches" role="group" aria-label="设备涂装"><button v-for="color in palette" :key="color.value" type="button" class="swatch" :style="{ '--swatch-color': color.value }" :aria-label="color.name" :title="color.name" :aria-pressed="config.color === color.value" @click="chooseColor(color.value)"><Check v-if="config.color === color.value" :size="13" :stroke-width="2.8" /></button></div></div>
            <div class="field hex-field"><label for="paint-hex">自定义色码 <small>HEX</small></label><span class="text-wrap"><input type="color" aria-label="选择自定义颜色" :value="config.color" @input="chooseColor($event.target.value)" /><input id="paint-hex" type="text" autocomplete="off" spellcheck="false" maxlength="7" placeholder="#RRGGBB" :value="colorDraft" :aria-invalid="Boolean(colorError)" :aria-describedby="colorError ? 'paint-error' : null" @input="updateColor($event.target.value)" @blur="updateColor($event.target.value, true)" @keydown.enter.prevent="updateColor($event.target.value, true)" /></span><small v-if="colorError" id="paint-error" class="error">{{ colorError }}</small></div>
            <label class="field brand-field" for="brand-text"><span>品牌文字<span class="counter">{{ config.text.length }}/24</span></span><span class="text-wrap"><Type :size="15" /><input id="brand-text" v-model="config.text" maxlength="24" placeholder="输入设备展示文字" /></span></label>
            <div class="field upload-field">
              <span>品牌 Logo <small class="optional">选填</small></span>
              <input ref="fileInput" class="visually-hidden" tabindex="-1" type="file" accept="image/png,image/jpeg,image/webp" aria-label="上传品牌 Logo" @change="onLogoChange" />
              <div v-if="config.logo" class="upload filled"><img :src="config.logo" alt="Logo 预览" /><button class="logo-name" type="button" title="更换 Logo" @click="openUpload">{{ config.logoName }}</button><button class="icon-button" type="button" aria-label="移除 Logo" @click="removeLogo"><X :size="16" /></button></div>
              <button v-else class="upload upload-button" type="button" :disabled="busy" @click="openUpload"><ImagePlus :size="17" /><span>{{ busy ? '正在读取图片…' : '上传 Logo' }}</span><small>PNG / JPG / WebP · 4 MB</small></button>
              <small v-if="error" class="error" role="alert">{{ error }}</small>
            </div>
          </section>
        </div>
      </aside>
          </div>
        </div>
        <div class="stage-footer"><span><span class="footer-light"></span> 可交互模型</span><span class="gesture">拖动旋转 · 滚轮缩放 · 右键平移</span><span class="footer-code">{{ product.code }} / 3D MODEL</span></div>
        <div class="toast" role="status" :class="{ visible: message }"><Check :size="15" />{{ message }}</div>
      </section>
    </div>

    <footer class="page-footer" :inert="fallbackExpanded">模型与参数仅供选型预览，不作为工程校核或正式规格。</footer>
  </main>
</template>
