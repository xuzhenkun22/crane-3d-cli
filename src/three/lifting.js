// Trolleys and sheaves belong to the moving structure. Suspended loads are
// posed in world axes, so their ropes stay plumb while a jib or boom turns.
export function buildLifting(api, parent, profile, dimensions, settings) {
  const { root, group, v, box, cylinder, tube, bar, plaque, label, teal, tealDark, steel, bolt, paint, edge, dark, wire, copper, safety, rubber, shade } = api
  const { id = 'primary', start, end = start, z = 0, y, top = false, gap = 0, fixed = false, remote = false, branded = false,
    tool = profile.tool, trolleyAction = 'trolley', liftAction = 'lift', floorY = 0, height, unit = dimensions.trolley,
    aux = false, parkedX = null, toolWidth = 0, labelText } = settings
  const u = Math.max(0.16, unit)
  const carriage = remote ? parent : group(`trolley-${id}`, parent, start, y, z)
  const wheels = []
  const machineryY = top ? u * 0.38 : -u * (profile.compact ? 0.36 : 0.55)
  const offsets = aux ? [-u * 0.47, u * 0.65] : [0]
  if (!remote) {
    if (top) {
      const gauge = Math.max(gap, 0.32 * u)
      box(1.65 * u, 0.18 * u, gauge * 2 + 0.41 * u, 0, u * 0.19, 0, teal, carriage)
      for (const lane of [-1, 1]) for (const x of [-0.61, 0.61]) {
        const wheel = group('trolley-wheel', carriage, x * u, 0.12 * u, lane * gauge)
        cylinder(0.12 * u, 0.18 * u, 0, 0, 0, steel, 'z', wheel)
        box(0.19 * u, 0.035 * u, 0.035 * u, 0, 0, lane * 0.095 * u, bolt, wheel)
        wheels.push(wheel)
      }
    } else if (fixed) {
      box(0.98 * u, 0.15 * u, 0.60 * u, 0, 0, 0, steel, carriage)
      for (const x of [-1, 1]) cylinder(0.055 * u, 0.22 * u, x * u * 0.36, 0, 0.26 * u, bolt, 'y', carriage)
    } else {
      box(1.18 * u, 0.12 * u, 0.48 * u, 0, -0.14 * u, 0, dark, carriage)
      for (const x of [-0.44, 0.44]) for (const lane of [-1, 1]) {
        const wheel = group('trolley-wheel', carriage, x * u, 0.125 * u, lane * 0.29 * u)
        box(0.18 * u, 0.26 * u, 0.049 * u, x * u, 0, lane * 0.382 * u, dark, carriage)
        cylinder(0.13 * u, 0.15 * u, 0, 0, 0, steel, 'z', wheel)
        cylinder(0.055 * u, 0.16 * u, 0, 0, 0, bolt, 'z', wheel)
        box(0.16 * u, 0.032 * u, 0.025 * u, 0, 0, lane * 0.093 * u, bolt, wheel)
        wheels.push(wheel)
      }
    }
    if (profile.winch) {
      cylinder(0.34 * u, 0.90 * u, -0.10 * u, machineryY + 0.06 * u, 0, steel, 'x', carriage)
      for (let i = -5; i <= 5; i++) cylinder(0.351 * u, 0.022 * u, (-0.10 + i * 0.073) * u, machineryY + 0.06 * u, 0, wire, 'x', carriage)
      for (const x of [-0.57, 0.37]) cylinder(0.41 * u, 0.12 * u, x * u, machineryY + 0.06 * u, 0, dark, 'x', carriage)
      box(0.46 * u, 0.66 * u, 0.63 * u, 0.61 * u, machineryY + 0.12 * u, 0, teal, carriage)
      cylinder(0.22 * u, 0.56 * u, 0.1 * u, machineryY + 0.19 * u, -0.49 * u, tealDark, 'x', carriage)
    } else if (profile.chain) {
      box(0.70 * u, 0.48 * u, 0.43 * u, -0.02 * u, machineryY, 0, teal, carriage)
      cylinder(0.25 * u, 0.37 * u, 0.36 * u, machineryY, 0, tealDark, 'x', carriage)
      box(0.30 * u, 0.40 * u, 0.33 * u, -0.37 * u, machineryY - 0.31 * u, -0.04 * u, rubber, carriage)
    } else {
      if (profile.compact) {
        if (profile.cover === 'SH') {
          cylinder(0.28 * u, 1.05 * u, -0.07 * u, machineryY, 0, teal, 'x', carriage)
          box(0.16 * u, 0.59 * u, 0.68 * u, -0.65 * u, machineryY, 0, tealDark, carriage)
        } else {
          box(1.22 * u, 0.56 * u, 0.66 * u, -0.05 * u, machineryY, 0, teal, carriage)
          box(0.11 * u, 0.56 * u, 0.69 * u, -0.65 * u, machineryY, 0, tealDark, carriage)
          if (profile.cover === 'DVR') box(0.76 * u, 0.18 * u, 0.58 * u, -0.03 * u, machineryY + 0.31 * u, 0, dark, carriage)
        }
      } else {
        const r = (profile.heavy ? 0.42 : 0.36) * u
        cylinder(r, 1.14 * u, -0.05 * u, machineryY, 0, teal, 'x', carriage)
        for (const x of [-0.58, 0.52]) cylinder(r * 1.07, 0.15 * u, x * u, machineryY, 0, tealDark, 'x', carriage)
      }
      cylinder((profile.planetary ? 0.35 : 0.26) * u, 0.46 * u, 0.71 * u, machineryY, 0, teal, 'x', carriage)
      for (let i = 0; i < 5; i++) cylinder(0.275 * u, 0.027 * u, (0.55 + i * 0.084) * u, machineryY, 0, tealDark, 'x', carriage)
      if (profile.motorCount === 2) cylinder(0.19 * u, 0.43 * u, 0.26 * u, machineryY, -0.39 * u, tealDark, 'x', carriage)
    }
    if (aux) cylinder(0.24 * u, 0.49 * u, 0.48 * u, machineryY + 0.23 * u, 0.58 * u, steel, 'x', carriage)
    if (branded) plaque(-0.10 * u, machineryY, 0.402 * u, 1.20 * u, 0.34 * u, carriage)
    label(labelText ?? (profile.winch ? '卷扬小车' : profile.chain ? '环链葫芦' : fixed ? '固定式电动葫芦' : '电动葫芦'), 0, machineryY, 0.58 * u, carriage)
  }

  const loadUnits = offsets.map((offset, index) => {
    const kind = index ? 'hook' : tool
    const scale = u * (index ? 0.65 : 1)
    const source = group(`reeving-${index ? 'aux' : id}`, carriage, offset, remote ? 0 : top ? 0.16 * u : machineryY - 0.27 * u, index ? 0.61 * u : 0)
    const hanger = group(`load-${index ? 'aux' : id}`, root)
    const tackle = group(`attachment-${kind}`, hanger)
    const slingHalf = Math.max(0.49 * scale, toolWidth / 2)
    const ropeOffsets = profile.chain ? [0] : kind === 'sling' ? [-slingHalf, slingHalf] : kind === 'spreader' ? [-0.48 * scale, 0.48 * scale] : [-0.16 * scale, 0.16 * scale]
    const cables = ropeOffsets.map(x => cylinder((profile.chain ? 0.043 : 0.026) * scale, 1, x, 0, 0, wire, 'y', hanger))
    const jaws = []
    const head = kind === 'spreader' ? 0.54 : 0.44
    if (kind === 'sling') for (const x of ropeOffsets) box(0.34 * scale, 0.30 * scale, 0.27 * scale, x, 0, 0, tealDark, tackle)
    else {
      box(head * 1.38 * scale, 0.29 * scale, 0.35 * scale, 0, 0, 0, tealDark, tackle)
      for (const x of [-0.14, 0.14]) cylinder(0.145 * scale, 0.37 * scale, x * scale, 0.035 * scale, 0, teal, 'z', tackle)
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
        tube([p(0, -0.12), p(-0.13, -0.41), p(-0.11, -0.57), p(0.04, -0.64), p(0.18, -0.55), p(0.19, -0.44)], 0.058 * scale, steel, tackle)
        if (kind !== 'foundry') bar(p(0.00, -0.32), p(0.19, -0.45), 0.033 * scale, 0.029 * scale, copper, tackle)
      }
    }
    const toolName = { hook: '吊钩', foundry: '铸造吊钩', grab: '抓斗', magnet: '电磁吊具', spreader: '集装箱吊具', sling: '吊带' }
    label(index ? '副吊钩' : toolName[kind], 0, 0.04, 0.3 * scale, tackle)
    const pos = v(0, 0, 0)
    const chain = profile.chain ? Array.from({ length: 26 }, (_, i) => group('', hanger, 0, i, 0)) : []
    for (let i = 0; i < chain.length; i++) cylinder(0.079 * scale, 0.027 * scale, 0, 0, 0, steel, i % 2 ? 'x' : 'z', chain[i])
    return { source, hanger, tackle, cables, jaws, chain, pos, scale }
  })

  return function pose(motion) {
    if (!remote) {
      const phase = motion[trolleyAction] ?? 0
      carriage.position.x = parkedX != null && motion.boom != null ? start + (parkedX - start) * Math.min(1, motion.boom * 5) : start + (end - start) * phase
      for (const wheel of wheels) wheel.rotation.z = (start - carriage.position.x) / (0.13 * u)
    }
    loadUnits.forEach((load, index) => {
      const { source, hanger, tackle, cables, jaws, chain, pos, scale } = load
      source.getWorldPosition(pos)
      const room = Math.max(0.24 * scale, pos.y - floorY - 0.98 * scale)
      const long = Math.max(0.39 * scale, Math.min(height * (index ? 0.40 : 0.58) + scale * 0.52, room))
      const short = Math.min(long * 0.79, Math.max(0.24 * scale, long - height * 0.43))
      const lift = motion[index ? 'lift2' : liftAction] ?? 0
      const cableLength = long - (long - short) * lift
      hanger.position.copy(pos)
      tackle.position.y = -cableLength - 0.12 * scale
      for (const cable of cables) {
        cable.position.y = -cableLength / 2
        cable.scale.y = cableLength
      }
      for (let i = 0; i < chain.length; i++) {
        chain[i].position.y = -(i + 0.6) * 0.14 * scale
        chain[i].visible = -chain[i].position.y < cableLength
      }
      for (const { jaw, sign } of jaws) jaw.rotation.z = sign * (0.08 + (motion.grab ?? 0) * 0.78)
    })
  }
}
