import sourceAliases from './catalogAliases.json' with { type: 'json' }

const groups = [
  ['bridge', '桥式起重机', [
    ['single', '单梁桥式起重机', 'LD HD HDE LE LDE LDZ LDC LDT LDP LX LXE LXC NLX DLX HDJ'],
    ['hoist-double', '电动葫芦双梁桥式', 'LH LHZ NLH LHE NLHE LHXD NLHX'],
    ['double', '通用双梁桥式', 'QD QDXX QZ QE QDE QN QC QCL'],
    ['transfer', '过轨桥式', 'XG'],
    ['ex-single', '防爆单梁桥式', 'LB LBE LXB HDB NLXB'],
    ['ex-double', '防爆双梁桥式', 'LHB NLHB QB QBE'],
    ['foundry', '冶金桥式', 'YH:bridge YZ QDY LHY LHEY LDY'],
    ['insulated', '绝缘桥式', 'QY'],
  ]],
  ['gantry', '门式起重机', [
    ['single', '单梁门式', 'MH NMH MDG'],
    ['double', '双梁门式', 'MG ME MHII MHIIE'],
    ['grab', '抓斗门式', 'MZ MDZ MHZ MHIIZ'],
    ['semi', '半门式', 'BMG BMH BMHN BMHIIE BMHE'],
    ['ex', '防爆门式', 'MGB MHB MHIIB'],
    ['handling', '专用搬运设备', 'MGK 叶片转运车'],
  ]],
  ['hoist', '电动葫芦', [
    ['rope', '钢丝绳电动葫芦', 'CD MD HC YH:hoist NR SH DVR'],
    ['trolley', '葫芦小车', 'NRT WHT'],
    ['ex', '防爆钢丝绳电动葫芦', 'HB'],
    ['chain', '环链电动葫芦', 'NL NHC'],
    ['planetary', '行星电动葫芦', 'NH'],
  ]],
  ['light', '轻型起重机', [
    ['jib', '悬臂起重机', 'BZ BB BX ZB'],
    ['kbk', 'KBK 柔性起重系统', 'KBK-1 KBK-S KBK-D'],
  ]],
  ['port', '港口起重机', [
    ['portal', '门座起重机', 'MQ-S MQ-L'],
    ['quay', '岸边集装箱起重机', 'STS-S STS-D'],
    ['rmg', '轨道式集装箱门式', 'GJM'],
    ['rtg', '轮胎式集装箱门式', 'RTG'],
    ['shipyard', '造船门式', 'SHIPYARD'],
    ['handling', '港口配套搬运设备', '跨运车'],
  ]],
]

const supplemental = {
  'KBK-1': ['KBK 单轨', 'KBK 单轨起重系统', '悬挂单轨吊'],
  'KBK-S': ['KBK 单梁', 'KBK 单梁悬挂起重机', '柔性单梁'],
  'KBK-D': ['KBK 双梁', 'KBK 双梁悬挂起重机', '柔性双梁'],
  'MQ-S': ['MQ', '单臂架门座起重机', 'MQ 单臂架'],
  'MQ-L': ['MQ', '四连杆门座起重机', 'MQ 四连杆'],
  'STS-S': ['STS', '单小车岸桥', '岸桥、岸边集装箱起重机'],
  'STS-D': ['STS', '双小车岸桥', '岸桥、岸边集装箱起重机'],
  SHIPYARD: ['上下双小车', '上下双小车造船门机', '造船门机、Goliath'],
}

const titles = {
  LD: '电动单梁桥式起重机', HD: '欧式单梁桥式起重机', HDE: '欧式双葫芦单梁起重机', LE: '同步双葫芦单梁起重机', LDE: '双葫芦单梁起重机', LDZ: '抓斗单梁起重机',
  LDC: '低净空单梁起重机', LDP: '偏挂单梁起重机', LDT: '重工作制单梁起重机', LX: '电动单梁悬挂起重机', LXE: '双葫芦悬挂起重机', LXC: '低净空悬挂单梁起重机', NLX: '欧式悬挂单梁起重机', DLX: '多支点悬挂起重机', HDJ: '洁净单梁起重机',
  LB: '防爆单梁起重机', LBE: '防爆双葫芦单梁起重机', LXB: '防爆悬挂单梁起重机', HDB: '欧式防爆单梁起重机', NLXB: '欧式防爆悬挂起重机',
  LH: '电动葫芦双梁起重机', LHZ: '葫芦抓斗双梁起重机', NLH: '欧式葫芦双梁起重机', LHE: '双小车葫芦双梁起重机', NLHE: '欧式双小车葫芦双梁起重机', XG: '过轨桥式起重机', LHXD: '多支点悬挂双梁起重机', NLHX: '偏轨悬挂双梁起重机',
  QD: '吊钩双梁桥式起重机', QDXX: '欧式卷扬双梁起重机', QZ: '抓斗双梁桥式起重机', QE: '双小车桥式起重机', QDE: '双起升双梁起重机', QN: '多用途桥式起重机', QC: '电磁双梁桥式起重机', QCL: '电磁吊具桥式起重机',
  LHB: '防爆葫芦双梁起重机', NLHB: '欧式防爆葫芦双梁起重机', QB: '防爆双梁桥式起重机', QBE: '防爆双小车桥式起重机', 'YH:bridge': '淬火桥式起重机', YZ: '铸造桥式起重机', QDY: '冶金吊钩桥式起重机', LHY: '冶金葫芦双梁起重机', LHEY: '冶金双小车起重机', LDY: '冶金单梁起重机', QY: '绝缘桥式起重机',
  MH: '电动葫芦门式起重机', NMH: '欧式单梁门式起重机', MDG: '单主梁吊钩门式起重机', MG: '吊钩双梁门式起重机', ME: '双小车门式起重机', MHII: '葫芦双梁门式起重机', MHIIE: '双葫芦门式起重机', MZ: '抓斗门式起重机', MDZ: '单主梁卷扬抓斗门机', MHZ: '单梁葫芦抓斗门机', MHIIZ: '双梁葫芦抓斗门机',
  BMG: '双梁半门式起重机', BMH: '单梁半门式起重机', BMHN: '欧式葫芦半门式起重机', BMHIIE: '双葫芦半门式起重机', BMHE: '双小车半门式起重机', MGB: '防爆双梁门式起重机', MHB: '防爆葫芦门式起重机', MHIIB: '欧式防爆双梁门机', MGK: '轮胎式船艇搬运机', '叶片转运车': '风电叶片转运车',
  CD: '单速钢丝绳电动葫芦', MD: '双速钢丝绳电动葫芦', HC: '重型钢丝绳电动葫芦', 'YH:hoist': '冶金钢丝绳电动葫芦', NR: '新中式钢丝绳电动葫芦', SH: 'STAHL SH 钢丝绳葫芦', DVR: 'Demag DVR 钢丝绳葫芦', NRT: 'NRT 葫芦小车', WHT: 'WHT 葫芦小车', HB: '防爆钢丝绳电动葫芦', NL: '环链电动葫芦', NHC: '紧凑型环链电动葫芦', NH: '行星电动葫芦',
  BZ: '定柱式悬臂起重机', BB: '墙壁式起重机', BX: '壁挂式悬臂起重机', ZB: '折臂式悬臂起重机', GJM: '轨道式集装箱门机', RTG: '轮胎式集装箱门机', '跨运车': '集装箱跨运车',
}

const inList = (code, list) => list.split(' ').includes(code)

const STYLES = {
  bridge: ['#eab757', '桥架沿高架轨道运行，起升机构沿主梁横移。'],
  gantry: ['#ed8935', '门架沿轨道运行，起升机构沿主梁横移。'],
  hoist: ['#4a8775', '示意起升机构、吊钩与安装方式。'],
  jib: ['#e4b14a', '悬臂设备用于覆盖固定工位附近的吊运区域。'],
  kbk: ['#cbaa53', '轻型模块化悬挂轨道，用于工位内物料搬运。'],
  portal: ['#cf8245', '轨道门座与回转臂架配合，通过变幅和起升覆盖作业区域。'],
  quay: ['#da9958', '集装箱吊具沿岸桥小车运行；臂架俯仰另行演示。'],
  yard: ['#609790', '门架、大车、小车和集装箱吊具配合进行堆场装卸。'],
  shipyard: ['#db8060', '上下小车沿各自的轨道运行，可独立演示。'],
  carrier: ['#a98f58', '有轮式行走机构；截面和吊运部件按设备类型示意。'],
}
const option = (key, label, values, initial = values[0][0]) => ({ key, label, values: values.map(([id, name]) => ({ id, name })), initial })
const mounting = option('mount', '安装方式', [['running', '运行式'], ['fixed', '固定式']])
const beam = option('beam', '主梁形式', [['box', '箱梁'], ['truss', '桁架']])
const overhang = option('overhang', '悬臂配置', [['none', '无悬臂'], ['one', '单悬臂'], ['both', '双悬臂']])

function spec(c, category, series) {
  const m = { kind: category, tool: 'hook' }
  const options = []
  if (category === 'bridge') {
    m.double = !['single', 'ex-single'].includes(series) && !inList(c, 'LDY YH:bridge')
    m.suspended = inList(c, 'LX LXE LXC NLX DLX LXB NLXB LHXD NLHX')
    m.multiSupport = inList(c, 'DLX LHXD')
    m.dual = inList(c, 'HDE LE LDE LXE LBE LHE NLHE QE QBE LHEY')
    m.sync = c === 'LE'
    m.winch = inList(c, 'XG QD QDXX QZ QE QDE QN QC QCL QB QBE YZ QDY QY')
    m.auxHook = inList(c, 'QDE QDXX QDY YZ')
    m.compact = inList(c, 'HD HDE LDC LXC NLX NLH NLHE HDB NLXB NLHX NLHB HDJ')
    m.offset = inList(c, 'LDP NLHX')
    m.tool = inList(c, 'LDZ LHZ QZ') ? 'grab' : inList(c, 'QC QCL') ? 'magnet' : c === 'YZ' ? 'foundry' : 'hook'
    m.reference = inList(c, 'XG YH:bridge QN QCL HDJ') || ['ex-single', 'ex-double', 'foundry', 'insulated'].includes(series)
    if (c === 'QN') options.push(option('tool', '吊具配置', [['hook', '吊钩'], ['grab', '抓斗']]))
  } else if (category === 'gantry') {
    m.double = inList(c, 'MG ME MHII MHIIE MZ MHIIZ BMG MGB MHIIB')
    m.winch = inList(c, 'MG ME MZ MDG MDZ BMG MGB')
    m.semi = series === 'semi'
    m.dual = inList(c, 'ME MHIIE BMHIIE BMHE')
    m.compact = inList(c, 'NMH MHII MHIIE BMHN BMHIIE BMHE MHIIB')
    m.oneLeg = inList(c, 'MDG MDZ')
    if (series === 'grab') m.tool = 'grab'
    if (series === 'handling') Object.assign(m, { kind: 'carrier', tool: c === 'MGK' ? 'sling' : 'blade', reference: c !== 'MGK' })
    if (inList(c, 'MH MG')) options.push(beam, overhang)
    if (c === 'NMH') options.push({ ...overhang, initial: 'one' })
    if (c === 'MZ') options.push({ ...beam, initial: 'truss' })
    if (c === 'MG') options.push(option('legs', '支腿构型', [['standard', '标准支腿'], ['u', 'U 型支腿']]))
    if (series === 'ex') m.reference = true
  } else if (category === 'hoist') {
    m.chain = series === 'chain'
    m.compact = inList(c, 'NR SH DVR NRT WHT NL NHC')
    m.double = series === 'trolley'
    m.planetary = series === 'planetary'
    m.cover = inList(c, 'SH DVR') ? c : null
    m.heavy = c === 'HC'
    m.motorCount = c === 'MD' ? 2 : 1
    m.reference = c === 'HB' || c === 'YH:hoist'
    if (inList(c, 'CD MD SH DVR NL NHC')) options.push(mounting)
  } else if (category === 'light') {
    m.kind = series
    if (series === 'jib') {
      m.wall = inList(c, 'BB BX')
      m.wallTravel = c === 'BB'
      m.articulated = c === 'ZB'
      m.reference = c === 'BB'
    } else {
      m.monorail = c === 'KBK-1'
      m.double = c === 'KBK-D'
      m.suspended = true
      m.chain = true
    }
  } else {
    m.kind = series === 'handling' ? 'carrier' : inList(series, 'rmg rtg') ? 'yard' : series
    m.linkage = c === 'MQ-L'
    m.dual = c === 'STS-D' || c === 'SHIPYARD'
    m.double = ['yard', 'shipyard'].includes(m.kind)
    m.tyres = c === 'RTG'
    if (m.kind === 'yard' || m.kind === 'quay' || c === '跨运车') m.tool = 'spreader'
    if (m.kind === 'shipyard') m.tool = 'hook'
    if (c === 'GJM') options.push(overhang)
  }
  return { model: m, options }
}

const profiles = {
  bridge: [[0.5, 1, 2, 3, 5, 10, 16], [6, 10.5, 16, 18, 22.5, 28], [3, 6, 9, 12, 15, 18]],
  'bridge-double': [[3, 5, 10, 16, 20, 32, 50, 80, 125, 350], [8, 10.5, 16.5, 20, 22.5, 28.5, 36], [3, 6, 9, 12, 16, 20, 30]],
  gantry: [[1, 3, 5, 10, 16, 20, 32], [6, 10, 14, 18, 22, 26, 32], [3, 6, 8, 9, 12, 15, 20]],
  'gantry-double': [[3, 5, 10, 16, 20, 32, 50, 100, 200], [8, 12, 18, 24, 30, 36, 42], [4, 6, 9, 12, 18, 25, 35]],
  hoist: [[0.2, 0.5, 1, 2, 3, 5, 10, 16, 25, 40], [2, 3, 4.5, 6, 9, 12, 18], [2, 3, 6, 9, 12, 18, 24, 36]],
  light: [[0.1, 0.2, 0.3, 0.5, 1, 2, 3.2, 5], [1, 2, 3, 4, 6, 8, 10], [1, 2, 3, 4, 6, 8]],
  portal: [[5, 10, 16, 25, 40, 63, 100], [8, 15, 25, 32, 40, 50, 60], [8, 12, 20, 25, 35, 45, 60]],
  quay: [[30, 40, 50, 65, 80, 100, 120], [25, 35, 45, 55, 65, 75, 85], [14, 20, 30, 36, 42, 50, 60]],
  yard: [[10, 20, 30, 40, 45, 50, 60, 80], [12, 18, 23.5, 28, 35, 45, 60, 75], [6, 10, 14, 18, 21, 24, 32]],
  shipyard: [[60, 100, 200, 300, 450, 600, 900, 1200, 2000], [30, 50, 70, 90, 120, 160, 210], [15, 25, 35, 45, 60, 75, 100]],
  carrier: [[3, 10, 20, 35, 50, 65, 100, 200], [4, 6, 8, 10, 12, 16, 24], [2, 4, 6, 8, 10, 15, 22]],
  blade: [[3, 5, 10, 20, 35, 50], [4, 6, 8, 10, 12, 16], [0.8, 1, 1.5, 2, 2.5, 3.5]],
}
const defaults = {
  bridge: [5, 16, 6], 'bridge-double': [16, 20, 9], gantry: [10, 18, 8], 'gantry-double': [20, 24, 12], hoist: [3, 6, 6], light: [0.5, 4, 3],
  portal: [25, 32, 25], quay: [65, 55, 36], yard: [40, 23.5, 18], shipyard: [450, 90, 45], carrier: [35, 8, 6], blade: [20, 8, 2],
}

export const CATEGORIES = groups.map(([id, name, series]) => ({
  id, name, series: series.map(([seriesId, seriesName]) => ({ id: seriesId, name: seriesName })),
}))

export const PRODUCTS = groups.flatMap(([categoryId, category, series]) => series.flatMap(([seriesId, seriesName, codes]) => codes.split(' ').map(key => {
  const entry = supplemental[key]
  const code = entry?.[0] ?? key.split(':')[0]
  const { model, options } = spec(key, categoryId, seriesId)
  const kind = model.kind
  const profile = model.tool === 'blade' ? 'blade' : categoryId === 'light' ? 'light' : model.double && inList(kind, 'gantry bridge') ? `${kind}-double` : kind
  const [capacity, span, height] = profiles[profile]
  const [c, s, h] = defaults[profile]
  const [color, description] = STYLES[kind]
  const name = entry?.[1] ?? titles[key]
  const aliases = entry ? entry.slice(2) : sourceAliases[key]
  return {
    id: `${categoryId}-${key.split(':')[0].toLowerCase()}`, sourceKey: key,
    code, name, categoryId, category, seriesId, seriesName, description, aliases, supplemental: Boolean(entry),
    model, options, color, presets: { capacity, span, height },
    defaults: { capacity: c, span: s, height: h },
  }
})))

export const DEFAULT_PRODUCT = PRODUCTS.find(p => p.code === 'MH')

export const COLORS = [
  { name: '工程橙', value: '#ed8935' }, { name: '安全黄', value: '#eab757' },
  { name: '工业蓝', value: '#5085af' }, { name: '松石绿', value: '#4a8775' }, { name: '岩石灰', value: '#8c969e' },
  { name: '工业红', value: '#d55143' },
]

export function matchesProduct(product, query) {
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/\s+/g, '')
  return !query.trim() || [product.code, product.sourceKey, product.name, product.category, product.seriesName, ...product.aliases].some(term => normalize(term).includes(normalize(query)))
}

export function defaultConfig(product) {
  return { ...product.defaults, options: Object.fromEntries(product.options.map(o => [o.key, o.initial])), color: product.color, text: '中国制造 Made In China', logo: '', logoName: '' }
}

export function resolvedModel(product, config) {
  return { ...product.model, tool: config.options.tool ?? product.model.tool, fixed: config.options.mount === 'fixed', truss: config.options.beam === 'truss', overhang: config.options.overhang ?? 'none', uLeg: config.options.legs === 'u' }
}

const SPAN_CHOICES = Object.freeze([7.5, 10.5, 13.5, 16.5, 19.5, 22.5, 25.5])

export function fieldsFor(product, config) {
  const m = resolvedModel(product, config)
  const blade = m.tool === 'blade'
  const dimensions = m.kind === 'quay' ? '外伸距' : m.kind === 'portal' ? '最大工作幅度' : m.kind === 'jib' ? '悬臂长度' : (m.kind === 'hoist' || m.monorail) ? '轨道长度' : blade ? '承托跨度' : '跨度'
  return [
    ['capacity', blade ? '额定载荷' : '额定起重量', 't'],
    ...(!m.fixed ? [['span', dimensions, 'm']] : []),
    ['height', blade ? '承托高度' : '起升高度', 'm'],
  ].map(([key, label, unit]) => {
    const preset = product.presets[key]
    const choices = label === '跨度' ? SPAN_CHOICES : preset
    return { key, label, unit, choices, min: Math.min(preset[0], choices[0]), max: Math.max(preset.at(-1), choices.at(-1)) }
  })
}

export function validateParameter(raw, field) {
  const value = String(raw ?? '').trim()
  if (!value) return { error: `请输入${field.label}` }
  if (!/^\d+(?:\.\d)?$/.test(value)) return { error: '请输入数字，最多 1 位小数' }
  const number = Number(value)
  if (number < field.min || number > field.max) return { error: `请输入 ${field.min}–${field.max} ${field.unit}` }
  return { value: number }
}

export function normalizeColor(value) {
  const input = String(value ?? '').trim()
  return /^#?[\da-f]{6}$/i.test(input) ? `#${input.replace(/^#/, '').toLowerCase()}` : null
}

export function modelDimensions(product, config) {
  const m = resolvedModel(product, config)
  const ratio = Math.sqrt(config.capacity / product.defaults.capacity)
  const scale = 0.66 + ratio * 0.34
  return {
    span: config.span,
    height: config.height + (m.kind === 'jib' ? 1.25 : m.kind === 'hoist' ? 0.8 : 1.7),
    girder: (m.kind === 'hoist' || m.kind === 'jib' || m.kind === 'kbk' ? 0.4 : 0.87) * scale,
    leg: (m.kind === 'jib' ? 0.37 : 0.5) * scale,
    trolley: 0.74 + ratio * 0.26,
  }
}

export const ACTION_LABELS = {
  travel: '大车运行', trolley: '小车横移', lift: '吊具升降', rotate: '臂架回转', luff: '臂架变幅', boom: '臂架俯仰', joint: '折臂摆动',
  trolley2: '副小车横移', lift2: '副吊钩升降', grab: '抓斗开合',
}

export function actionsFor(product, config) {
  const m = resolvedModel(product, config)
  const list = []
  if (['bridge', 'gantry', 'portal', 'quay', 'yard', 'shipyard', 'carrier'].includes(m.kind) || m.wallTravel || (m.kind === 'kbk' && !m.monorail)) list.push('travel')
  if (['bridge', 'gantry', 'quay', 'yard', 'shipyard', 'kbk'].includes(m.kind) || (m.kind === 'jib' && !m.articulated) || (m.kind === 'hoist' && !m.fixed)) list.push('trolley')
  if (m.kind === 'portal' || (m.kind === 'jib' && !m.wallTravel)) list.push('rotate')
  if (m.kind === 'portal') list.push('luff')
  if (m.articulated) list.push('joint')
  if (m.kind !== 'carrier' || m.tool !== 'blade') list.push('lift')
  if (m.dual && !m.sync) list.push('trolley2', 'lift2')
  else if (m.auxHook) list.push('lift2')
  if (m.tool === 'grab') list.push('grab')
  if (m.kind === 'quay') list.push('boom')
  const labels = m.kind === 'shipyard' ? { trolley: '上小车横移', lift: '上吊钩升降', trolley2: '下小车横移', lift2: '下吊钩升降' }
    : m.kind === 'quay' && m.dual ? { trolley: '海侧小车横移', lift: '海侧吊具升降', trolley2: '陆侧小车横移', lift2: '陆侧吊具升降' } : {}
  return list.map(id => ({ id, label: labels[id] ?? ACTION_LABELS[id] }))
}

export function selectionRecord(product, config) {
  return {
    产品: product.name, 一级分类: product.category, 二级系列: product.seriesName, 型号: product.code, 目录编码: product.id, 系列: product.code,
    ...Object.fromEntries(fieldsFor(product, config).map(({ key, label, unit }) => [`${label}_${unit}`, config[key]])),
    构型: Object.fromEntries(product.options.map(o => [o.label, o.values.find(v => v.id === config.options[o.key])?.name])),
    涂装: config.color, 品牌文字: config.text, Logo文件名: config.logoName, Logo图像: config.logo || null,
    用途说明: '参数范围及模型仅用于选型示意，不作为工程校核、认证或正式规格。',
  }
}
