import { buildCarriage, buildHoistHardware } from './liftingHardware.js'

// Trolleys and sheaves belong to the moving structure. Suspended loads are
// posed in world axes, so their ropes stay plumb while a jib or boom turns.
export function buildLifting(api, parent, profile, dimensions, settings) {
  const { root, group, v, box, cylinder, chainLink, tube, bar, label, tealDark, steel, bolt, paint, edge, dark, wire, safety, shade } = api
  const { id = 'primary', start, end = start, z = 0, y, top = false, gap = 0, fixed = false, remote = false, branded = false,
    tool = profile.tool, trolleyAction = 'trolley', liftAction = 'lift', floorY = 0, height, unit = dimensions.trolley,
    aux = false, parkedX = null, toolWidth = 0, labelText, buildRunningGear, showLabels = true } = settings
  const u = Math.max(0.16, unit)
  const carriage = remote ? parent : group(`trolley-${id}`, parent, start, y, z)
  const machineryY = top ? u * (profile.winch ? 0.73 : 0.59) : -u * (profile.winch ? 0.65 : profile.compact ? 0.40 : 0.53)
  const offsets = aux ? [-u * 0.24, u * 0.46] : [0]
  const wheels = remote ? [] : buildRunningGear?.(carriage) ?? buildCarriage(api, carriage, u, { top, gap, fixed, winch: profile.winch })
  const drums = remote ? [] : buildHoistHardware(api, carriage, profile, u, machineryY, { top, aux, branded })
  if (!remote && showLabels) {
    const title = profile.winch ? '卷扬起重小车' : profile.chain ? '环链葫芦' : fixed ? '固定式钢丝绳葫芦' : '钢丝绳电动葫芦'
    label(labelText ?? title, 0, machineryY, 0.53 * u, carriage)
  }

  const loadUnits = offsets.map((offset, index) => {
    const kind = index ? 'hook' : tool
    const scale = u * (index ? 0.65 : 1)
    const outletY = remote ? 0 : top ? 0.15 * u : machineryY - 0.32 * u
    const source = group(`reeving-${index ? 'aux' : id}`, carriage, offset, outletY, index ? 0.59 * u : 0)
    const hanger = group(`load-${index ? 'aux' : id}`, root)
    const tackle = group(`attachment-${kind}`, hanger)
    const slingHalf = Math.max(0.49 * scale, toolWidth / 2)
    const radius = (profile.winch ? 0.23 : 0.17) * scale
    const ropeOffsets = profile.chain ? [] : kind === 'sling' ? [-slingHalf, slingHalf] : kind === 'spreader' ? [-0.48 * scale, 0.48 * scale] : [-radius, radius]
    const cables = ropeOffsets.map(x => cylinder(0.021 * scale, 1, x, 0, 0, wire, 'y', hanger))
    if (!remote && !profile.chain) {
      const lead = Math.max(0.04 * u, machineryY - 0.24 * scale - outletY)
      const separation = ropeOffsets[0] < -0.3 * scale ? 0.52 : 0.85
      for (const x of ropeOffsets) tube([v(x * separation, lead, 0), v(x, lead * 0.3, 0), v(x, 0, 0)], 0.021 * scale, wire, source)
    }
    const jaws = []
    if (kind === 'sling') for (const x of ropeOffsets) box(0.34 * scale, 0.30 * scale, 0.27 * scale, x, 0, 0, tealDark, tackle)
    else if (kind === 'spreader') {
      box(1.08 * scale, 0.29 * scale, 0.35 * scale, 0, 0, 0, tealDark, tackle)
      for (const x of ropeOffsets) cylinder(0.11 * scale, 0.39 * scale, x, -0.015 * scale, 0, steel, 'z', tackle)
    } else if (profile.chain) {
      cylinder(0.14 * scale, 0.26 * scale, 0, -0.10 * scale, 0, steel, 'y', tackle)
      cylinder(0.18 * scale, 0.085 * scale, 0, -0.09 * scale, 0, safety, 'y', tackle)
    } else {
      const sheave = group('hook-sheave', tackle)
      cylinder(radius - 0.021 * scale, 0.132 * scale, 0, 0, 0, steel, 'z', sheave)
      for (const z of [-0.08, 0.08]) cylinder(radius + 0.019 * scale, 0.028 * scale, 0, 0, z * scale, dark, 'z', sheave)
      box(0.19 * scale, 0.24 * scale, 0.38 * scale, 0, -radius * 0.93, 0, dark, tackle)
      for (const z of [-0.158, 0.158]) {
        box(radius * 2.38, 0.27 * scale, 0.055 * scale, 0, -0.044 * scale, z * scale, safety, tackle)
        cylinder(0.083 * scale, 0.095 * scale, 0, 0.015 * scale, z * scale, bolt, 'z', tackle)
      }
      tube([v(-radius, 0, 0), v(-radius * 0.72, -radius * 0.71, 0), v(0, -radius, 0), v(radius * 0.72, -radius * 0.71, 0), v(radius, 0, 0)], 0.021 * scale, wire, tackle)
    }
    if (kind === 'spreader') {
      const l = Math.max(3.2 * u, 2.4)
      box(l, 0.22 * u, 0.72 * u, 0, -0.51 * u, 0, paint, tackle)
      for (const sign of [-1, 1]) {
        bar(v(sign * 0.25 * u, -0.05 * u, 0), v(sign * l * 0.38, -0.41 * u, 0), 0.13 * u, 0.12 * u, steel, tackle)
        box(0.32 * u, 0.35 * u, 1.16 * u, sign * l * 0.49, -0.46 * u, 0, edge, tackle)
        for (const z of [-0.48, 0.48]) cylinder(0.085 * u, 0.20 * u, sign * l * 0.49, -0.65 * u, z * u, safety, 'y', tackle)
      }
    } else if (kind === 'grab') {
      for (const sign of [-1, 1]) {
        const jaw = group('grab-jaw', tackle, sign * 0.14 * scale, -0.19 * scale)
        const point = (x, y) => v(sign * x * scale, y * scale, 0)
        bar(point(0, 0), point(0.40, -0.35), 0.14 * scale, 0.60 * scale, paint, jaw)
        bar(point(0.40, -0.35), point(0.31, -0.62), 0.17 * scale, 0.70 * scale, shade, jaw)
        bar(point(0.31, -0.58), point(0.03, -0.67), 0.17 * scale, 0.70 * scale, paint, jaw)
        for (const z of [-0.24, 0, 0.24]) box(0.15 * scale, 0.09 * scale, 0.11 * scale, sign * 0.02 * scale, -0.68 * scale, z * scale, steel, jaw)
        jaws.push({ jaw, sign })
      }
    } else if (kind === 'magnet') {
      cylinder(0.12 * scale, 0.28 * scale, 0, -0.27 * scale, 0, steel, 'y', tackle)
      cylinder(0.56 * scale, 0.20 * scale, 0, -0.50 * scale, 0, paint, 'y', tackle)
      cylinder(0.53 * scale, 0.07 * scale, 0, -0.63 * scale, 0, dark, 'y', tackle)
    } else if (kind === 'sling') {
      tube([v(-slingHalf, 0, 0), v(-slingHalf * 0.77, -0.72 * scale, 0), v(0, -0.98 * scale, 0), v(slingHalf * 0.77, -0.72 * scale, 0), v(slingHalf, 0, 0)], 0.063 * scale, safety, tackle)
    } else {
      for (const side of (kind === 'foundry' ? [-1, 1] : [0])) {
        const p = (x, yy) => v((x + side * 0.31) * scale, yy * scale, 0)
        cylinder(0.077 * scale, 0.22 * scale, side * 0.31 * scale, -0.237 * scale, 0, steel, 'y', tackle)
        tube([p(0, -0.24), p(-0.025, -0.36), p(-0.147, -0.48), p(-0.13, -0.628), p(0.013, -0.70), p(0.158, -0.634), p(0.183, -0.506)], 0.053 * scale, steel, tackle).name = 'forged-hook'
        if (kind !== 'foundry') bar(p(-0.013, -0.375), p(0.18, -0.508), 0.033 * scale, 0.048 * scale, safety, tackle).name = 'hook-latch'
      }
    }
    const toolName = { hook: '吊钩', foundry: '铸造吊钩', grab: '抓斗', magnet: '电磁吊具', spreader: '集装箱吊具', sling: '吊带' }
    if (showLabels) label(index ? '副吊钩' : toolName[kind], 0, 0.04, 0.3 * scale, tackle)
    const chain = profile.chain ? Array.from({ length: 48 }, (_, i) => {
      const link = chainLink(hanger, steel)
      link.name = 'chain-link'
      link.rotation.y = (i % 2) * Math.PI / 2
      return link
    }) : []
    return { source, hanger, tackle, cables, jaws, chain, pos: v(0, 0, 0), axis: v(0, 0, 0), scale }
  })

  return function pose(motion) {
    if (!remote) {
      const phase = motion[trolleyAction] ?? 0
      carriage.position.x = parkedX != null && motion.boom != null ? start + (parkedX - start) * Math.min(1, motion.boom * 5) : start + (end - start) * phase
      for (const { wheel, radius } of wheels) wheel.rotation.z = (start - carriage.position.x) / radius
    }
    loadUnits.forEach((load, index) => {
      const { source, hanger, tackle, cables, jaws, chain, pos, axis, scale } = load
      source.getWorldPosition(pos)
      const room = Math.max(0.24 * scale, pos.y - floorY - 0.98 * scale)
      const long = Math.max(0.39 * scale, Math.min(height * (index ? 0.40 : 0.58) + scale * 0.52, room))
      const short = Math.min(long * 0.79, Math.max(0.24 * scale, long - height * 0.43))
      const lift = motion[index ? 'lift2' : liftAction] ?? 0
      const cableLength = long - (long - short) * lift
      hanger.position.copy(pos)
      // Follow the horizontal orientation of the moving boom, without tilting the ropes.
      axis.set(1, 0, 0)
      source.localToWorld(axis).sub(pos)
      if (Math.hypot(axis.x, axis.z) > 1e-6) hanger.rotation.y = Math.atan2(-axis.z, axis.x)
      tackle.position.y = -cableLength
      if (drums[index]) drums[index].node.rotation.x = (long - cableLength) / (2 * drums[index].radius)
      for (const cable of cables) {
        cable.position.y = -cableLength / 2
        cable.scale.y = cableLength
      }
      if (chain.length) {
        const count = Math.min(chain.length, Math.max(2, Math.round(cableLength / (0.14 * scale))))
        const step = cableLength / count
        for (let i = 0; i < chain.length; i++) {
          chain[i].visible = i < count
          chain[i].position.y = i < count ? -(i + 0.5) * step : 0
          chain[i].scale.set(0.052 * scale, step * 0.68, 0.052 * scale)
        }
      }
      for (const { jaw, sign } of jaws) jaw.rotation.z = sign * (0.08 + (motion.grab ?? 0) * 0.78)
    })
  }
}
