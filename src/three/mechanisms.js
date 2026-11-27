import { buildLifting } from './lifting.js'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export function buildMechanisms(api, profile, d, config) {
  const { root, group, box, cylinder, bar, fitBar, v, girder, rail, baseTruck, plaque, label, ladder, festoon,
    paint, shade, edge, steel, bolt, dark, glass, wire, safety } = api
  const { span: width, height: nominalY, girder: g, leg: b, trolley: size } = d
  const railway = group('fixed-infrastructure', root)
  const frame = group('travel-frame', root)
  const wheels = [], lifts = []
  let floorY = 0, travel = 0, poseArms = () => {}

  function makeLift(parent, settings) {
    const pose = buildLifting(api, parent, profile, d, { floorY, height: config.height, ...settings })
    lifts.push(pose)
  }
  function suspension(length, x, cy, z, parent, unit, overhead = false) {
    const u = unit
    box(length, 0.10 * u, 0.61 * u, x, cy - 0.056 * u, z, steel, parent)
    box(length, 0.22 * u, 0.18 * u, x, cy + 0.105 * u, z, dark, parent)
    box(length, 0.095 * u, 0.46 * u, x, cy + 0.24 * u, z, steel, parent)
    for (const sign of [-1, 1]) box(0.11 * u, 0.31 * u, 0.66 * u, x + sign * (length / 2 - 0.09 * u), cy + 0.015 * u, z, shade, parent)
    if (overhead) label('悬挂轨道', x + length * 0.24, cy + u * 0.32, z + u * 0.34, parent)
  }
  function topTrack(length, x, cy, z, parent, u) {
    box(length, 0.10 * u, 0.25 * u, x, cy - 0.048 * u, z, steel, parent)
    for (const sign of [-1, 1]) box(0.17 * u, 0.26 * u, 0.35 * u, x + sign * (length / 2 - 0.13 * u), cy + 0.10 * u, z, dark, parent)
  }
  function cab(x, cy, z, parent, u) {
    box(1.18 * u, 1.35 * u, 1.03 * u, x, cy, z, paint, parent)
    box(1.01 * u, 0.77 * u, 0.025, x, cy + 0.14 * u, z + 0.53 * u, glass, parent)
    box(0.025, 0.77 * u, 0.85 * u, x + 0.605 * u, cy + 0.14 * u, z, glass, parent)
    box(1.29 * u, 0.13 * u, 1.12 * u, x, cy + 0.72 * u, z, edge, parent)
    box(0.05 * u, 0.79 * u, 0.04 * u, x + 0.09 * u, cy + 0.14 * u, z + 0.56 * u, dark, parent)
  }
  function doubleLift(parent, { left, right, y, z = 0, top = false, gap = 0, unit = size }) {
    const distance = right - left
    const primary = profile.dual
      ? { start: left + distance * 0.38, end: left, y, z, top, gap, unit, aux: profile.auxHook }
      : { start: left + distance * 0.46, end: right, y, z, top, gap, unit, aux: profile.auxHook }
    makeLift(parent, primary)
    if (profile.dual) makeLift(parent, { id: 'second', start: left + distance * 0.69, end: right, y, z, top, gap, unit,
      trolleyAction: profile.sync ? 'trolley' : 'trolley2', liftAction: profile.sync ? 'lift' : 'lift2', labelText: profile.sync && !profile.winch ? '同步葫芦' : '副小车' })
  }

  function overhead() {
    const kbk = profile.kind === 'kbk'
    const y = nominalY, u = kbk ? Math.min(0.43, width * 0.18) * size : Math.min(size, width * 0.27)
    floorY = kbk ? 0 : Math.max(0, y - Math.max(3.5, config.height * 0.81 + 1))
    const xLimit = width / 2 - u * 0.78
    if (profile.monorail) {
      suspension(width, 0, y, 0, railway, u, true)
      for (const sign of [-1, 1]) {
        bar(v(sign * width * 0.35, y + 0.24 * u, 0), v(sign * width * 0.35, y + 0.99 * u, 0), u * 0.21, u * 0.19, steel, railway)
        box(u * 0.70, 0.12 * u, u * 0.65, sign * width * 0.35, y + 0.99 * u, 0, dark, railway)
      }
      plaque(0, y + 0.19 * u, 0.31 * u, width * 0.55, 0.29 * u, railway)
      makeLift(railway, { start: -xLimit * 0.36, end: xLimit, y, unit: u })
      return
    }
    const top = profile.double && (!profile.suspended || profile.winch)
    const gap = profile.double ? Math.min(kbk ? width * 0.15 : width * 0.19, (kbk ? 0.95 : 1.30) * u) : 0
    const depth = (kbk ? 0.52 : 0.79) * u, h = kbk ? Math.min(0.36, g * 0.63) : g
    const bridgeLength = width + u * 0.62
    const deckZ = Math.min(width * 0.45, kbk ? Math.max(3, gap * 3.0) : 4.7 * u)
    const trackLength = deckZ + 2 * Math.max(width * 0.16, u * 1.45)
    travel = (trackLength - deckZ) * 0.43
    const face = profile.suspended ? y + h * 0.52 + 0.77 * u : y - h * 0.55 - 0.58 * u
    const beamZs = profile.double ? [-gap, gap] : [0]
    for (const zz of beamZs) {
      girder(bridgeLength, 0, y, zz, depth, h, zz === gap, frame)
      if (top) topTrack(bridgeLength - 0.08, 0, y + h * 0.55 + 0.095 * u, zz, frame, u)
    }
    for (const side of (profile.multiSupport ? [-1, 0, 1] : [-1, 1])) {
      const x = side * width / 2
      rail(x, face, trackLength, { overhead: true, suspended: profile.suspended, parent: railway, scale: u })
      baseTruck(x, face, deckZ, frame, { suspended: profile.suspended, size: u, wheels })
      const truckMount = y + (profile.suspended ? 1 : -1) * h * 0.48
      box(0.64 * u, Math.abs(face - truckMount) * 0.75, (profile.double ? gap * 2 + 0.32 * u : 0.69 * u), x, truckMount + (face - truckMount) * 0.31, 0, shade, frame)
      if (profile.suspended) for (const z of [-0.44, 0.44]) {
        const zz = z * trackLength
        const barTop = face + u * (kbk ? 1.15 : 1.35)
        box(u * 0.34, barTop - face, u * 0.34, x, (barTop + face) / 2, zz, steel, railway)
        box(u * 0.70, u * 0.12, u * 0.74, x, barTop, zz, dark, railway)
      }
    }
    label(profile.suspended ? '高架悬挂轨道' : '固定高架轨道', width / 2, face + u * 0.13, -trackLength * 0.32, railway)
    label('端梁运行机构', width / 2, y, deckZ * 0.34, frame)
    label(profile.double ? '双主梁桥架' : '单主梁桥架', -width * 0.25, y + h * 0.37, gap + depth * 0.58, frame)
    const runningZ = !top && profile.double ? (profile.offset ? gap : -gap * 0.18) : 0
    const runningY = top ? y + h * 0.55 + 0.095 * u : y - h * 0.55 - 0.28 * u
    if (!top) {
      suspension(width + u * 0.12, 0, runningY, runningZ, frame, u)
      if (profile.double && !profile.offset) for (const x of [-width * 0.41, 0, width * 0.41]) box(u * 0.27, u * 0.19, 2.04 * gap, x, runningY + 0.22 * u, 0, shade, frame)
      if (!kbk) festoon(width * 0.82, y - h * 0.28, runningZ + depth * 0.52, frame)
    }
    doubleLift(frame, { left: -xLimit, right: xLimit, y: runningY + (!top && profile.compact ? u * 0.02 : 0), z: runningZ, top, gap, unit: u })
  }

  function makeGantry() {
    const yard = profile.kind === 'yard', shipyard = profile.kind === 'shipyard', port = yard || shipyard
    const y = nominalY, u = clamp((port ? Math.max(size, Math.min(4.8, width * 0.055, y * 0.24)) : size), 0.70, width * 0.23)
    const h = Math.max(g, port ? u * (shipyard ? 1.23 : 0.95) : 0.73), depth = Math.max(h * 0.90, u * 0.71)
    const gap = profile.double ? Math.max(0.8 * u, depth * 0.76) : 0
    const halfBase = clamp(y * (port ? 0.22 : 0.28), 1.65 * u, (port ? 3.3 : 4.05) * u)
    const top = profile.double || profile.winch
    const leftExtra = profile.overhang === 'both' ? width * 0.16 : 0
    const rightExtra = ['one', 'both'].includes(profile.overhang) ? width * 0.19 : 0
    const length = width + leftExtra + rightExtra + 1.02 * u, center = (rightExtra - leftExtra) / 2
    const truck = halfBase * 2 + 0.51 * u, trackLength = truck + 2 * Math.max(width * 0.22, 1.8 * u)
    travel = (trackLength - truck) * 0.44
    const railY = 0.31 * u
    const groundContact = profile.tyres ? 0 : railY
    const feet = (profile.double ? 0.71 : 0.59) * u
    const tip = h * 0.52 + (profile.double ? 0.10 * u : 0)
    const legTop = y - tip
    const bridgeTop = y + h * 0.55 + u * 0.085
    const lane = profile.double ? gap : stdLane(u, depth)
    for (const zz of (profile.double ? [-gap, gap] : [0])) girder(length, center, y, zz, depth, h, !profile.double || zz > 0, frame, profile.truss || shipyard)
    if (top) for (const zz of [-lane, lane]) {
      if (!profile.double) box(length * 0.97, 0.13 * u, 0.26 * u, center, bridgeTop - 0.13 * u, zz, edge, frame)
      topTrack(length - 0.14 * u, center, bridgeTop, zz, frame, u)
    }
    for (const side of [-1, 1]) {
      const x = side * width / 2, raised = profile.semi && side === -1
      const contact = raised ? y - h * 0.59 - 0.65 * u : groundContact
      if (!profile.tyres) rail(x, contact, trackLength, { overhead: raised, parent: railway, scale: u })
      else {
        box(u * 1.93, 0.042, trackLength, x, -0.022, 0, dark, railway)
        for (const sign of [-1, 1]) box(0.045 * u, 0.014, trackLength, x + sign * u * 0.81, 0.008, 0, safety, railway)
      }
      baseTruck(x, contact, truck, frame, { size: u, wheels, tyre: profile.tyres })
      if (raised) {
        box(u * 0.83, Math.max(u * 0.12, legTop - contact - u * 0.39), gap * 2 + u * 0.84, x, (legTop + contact + u * 0.39) / 2, 0, shade, frame)
        continue
      }
      const lowerY = contact + (profile.tyres ? 0.89 : 0.55) * u
      const legZ = profile.uLeg || port ? halfBase * 0.78 : profile.oneLeg && side < 0 ? 0 : Math.max(gap, halfBase * 0.19)
      const thick = Math.max(b, u * (port ? 0.59 : 0.45))
      const ends = profile.oneLeg && side < 0 ? [0] : [-1, 1]
      for (const sign of ends) {
        const start = v(x, lowerY, sign * halfBase * 0.89)
        const end = v(x + (port ? -side * width * 0.018 : 0), legTop, sign * legZ)
        bar(start, end, thick * (shipyard && side > 0 ? 1.65 : 1.14), thick * 1.60, paint, frame)
        const flange = v(side * (thick * 0.63), 0, 0)
        bar(start.clone().add(flange), end.clone().add(flange), thick * 0.18, thick * 1.55, edge, frame)
        box(feet * 1.18, 0.13 * u, feet * 1.58, start.x, start.y, start.z, shade, frame)
      }
      const bridgeH = lowerY + (legTop - lowerY) * (profile.uLeg ? 0.14 : 0.3)
      const spanZ = halfBase * 0.89 + (legZ - halfBase * 0.89) * (profile.uLeg ? 0.14 : 0.30)
      if (ends.length > 1) box(thick * 0.87, thick * 0.66, spanZ * 2, x, bridgeH, 0, paint, frame)
      box(thick * 1.42, 0.19 * u, Math.max(legZ * 2, gap * 2) + u * 0.55, x, legTop, 0, shade, frame)
      if (side > 0) {
        ladder(x + u * 0.33, lowerY, legTop, halfBase * 0.90 + u * 0.28, legZ + u * 0.34, frame)
        if (port || profile.winch) cab(x - u * 0.79, legTop - u * 0.93, legZ + u * 0.22, frame, u * 0.78)
        label('门架支腿', x, y * 0.53, legZ * 0.65 + halfBase * 0.39, frame)
      }
    }
    const low = -width / 2 - leftExtra + 0.82 * u, high = width / 2 + rightExtra - 0.82 * u
    if (!top) {
      suspension(length * 0.97, center, y - h * 0.51 - 0.25 * u, 0, frame, u)
      festoon(width * 0.85, y - h * 0.40, depth * 0.61, frame)
    }
    label(profile.truss || shipyard ? '桁架主梁' : '箱型主梁', -width * 0.24, y + 0.38 * h, gap + depth * 0.58, frame)
    label(profile.tyres ? '轮胎运行机构' : '固定运行轨道', width / 2, railY + 0.15 * u, -trackLength * 0.42, railway)
    if (shipyard) {
      const yy = y - h * 0.55 - 0.28 * u, underZ = -gap * 1.03
      suspension(width * 0.97, 0, yy, underZ, frame, u * 0.80)
      makeLift(frame, { start: low * 0.52, end: high, y: bridgeTop, top: true, gap, unit: u * 0.90, labelText: '上小车' })
      makeLift(frame, { id: 'second', start: high * 0.53, end: low, y: yy, z: underZ, unit: u * 0.72,
        trolleyAction: 'trolley2', liftAction: 'lift2', labelText: '下小车' })
    } else doubleLift(frame, { left: low, right: high, y: top ? bridgeTop : y - h * 0.51 - 0.25 * u, top, gap: lane, unit: u })
  }

  function jib() {
    const u = clamp(size * 0.63, 0.22, width * 0.33), y = Math.max(nominalY, 1.35 + u * 2.25)
    const body = profile.wallTravel ? frame : railway
    const px = -width * 0.43, h = g * (profile.articulated ? 0.86 : 0.94)
    const arm = group('slew-arm', body, px, y)
    if (profile.wall) {
      const zz = profile.wallTravel ? width * 0.87 + u * 2.9 : Math.max(width * 0.56, u * 2.15)
      const wallX = px - u * 0.70
      box(u * 0.48, y + u * 0.67, zz, wallX, (y + u * 0.67) * 0.5, 0, dark, railway)
      for (const yy of [y - u * 0.99, y + 0.09 * u]) {
        box(u * 0.34, u * 0.27, zz * 0.92, wallX + 0.29 * u, yy, 0, steel, railway)
        box(u * 1.12, u * 0.30, u * 1.22, px - u * 0.2, yy, 0, shade, body)
        if (profile.wallTravel) for (const z of [-1, 1]) cylinder(u * 0.23, u * 0.23, wallX + 0.38 * u, yy + 0.15 * u, z * u * 0.51, bolt, 'x', body)
      }
      cylinder(u * 0.23, u * 1.25, px, y - u * 0.41, 0, steel, body)
      if (profile.wallTravel) travel = (zz * 0.46 - 0.76 * u) * 0.89
      label(profile.wallTravel ? '墙面固定轨道' : '墙壁安装支座', wallX + 0.29 * u, y - 0.99 * u, zz * 0.32, railway)
    } else {
      cylinder(b * 1.83, 0.14, px, 0.077, 0, dark, railway)
      cylinder(b * 1.59, 0.11, px, 0.18, 0, edge, railway)
      cylinder(b, y - 0.08, px, y * 0.5 + 0.10, 0, paint, railway)
      for (let i = 0; i < 8; i++) cylinder(0.056, 0.07, px + Math.cos(i * Math.PI / 4) * b * 1.34, 0.249, Math.sin(i * Math.PI / 4) * b * 1.34, bolt, 'y', railway)
      for (const yy of [y - u * 1.23, y + u * 0.15]) cylinder(b * 1.28, u * 0.23, px, yy, 0, shade, railway)
      label('固定立柱', px, y * 0.44, b, railway)
    }
    const l1 = profile.articulated ? width * 0.54 : width
    girder(l1, l1 / 2, 0, 0, 0.54 * u, h, true, arm)
    bar(v(0.05 * u, -u * 1.15, 0), v(l1 * 0.38, -h * 0.47, 0), 0.19 * u, 0.24 * u, shade, arm)
    label('悬臂主梁', l1 * 0.30, 0.31 * h, 0.33 * u, arm)
    if (profile.articulated) {
      const l2 = width - l1
      const elbow = group('articulated-joint', arm, l1, 0)
      cylinder(0.31 * u, 0.43 * u, 0, 0, 0, steel, 'y', elbow)
      girder(l2, l2 / 2, -0.11 * u, 0, 0.49 * u, h * 0.80, false, elbow)
      makeLift(elbow, { start: l2 * 0.88, y: -h * 0.49 - 0.17 * u, fixed: true, unit: u })
      poseArms = motion => { arm.rotation.y = -(motion.rotate ?? 0) * 1.25; elbow.rotation.y = -0.22 - (motion.joint ?? 0) * 1.39 }
    } else {
      const trackY = -h * 0.51 - 0.23 * u
      suspension(l1, l1 / 2, trackY, 0, arm, u)
      makeLift(arm, { start: l1 * 0.48, end: l1 - u * 0.72, y: trackY, unit: u })
      poseArms = motion => { if (!profile.wallTravel) arm.rotation.y = -(motion.rotate ?? 0) * (profile.wall ? 0.92 : 1.21) }
    }
  }

  function standaloneHoist() {
    const u = Math.min(size, profile.fixed ? 1.35 : width * 0.34)
    const railY = nominalY
    floorY = Math.max(0, railY - Math.max(2.5 * u, config.height * 0.82 + u * 0.6))
    if (profile.fixed) {
      // Mounting bracket is part of the hoist; do not render a fictional span/rail.
      box(0.99 * u, 0.10 * u, 0.68 * u, 0, railY + 0.1 * u, 0, edge, railway)
      for (const x of [-0.34, 0.34]) cylinder(0.065 * u, u * 0.23, x * u, railY + 0.11 * u, 0.23 * u, steel, 'y', railway)
      label('固定安装座', 0, railY + 0.18 * u, 0.29 * u, railway)
    } else if (profile.double) {
      for (const z of [-0.58, 0.58]) {
        girder(width, 0, railY - g * 0.69, z * u, 0.40 * u, g, false, railway)
        topTrack(width, 0, railY, z * u, railway, u)
      }
      label('双轨运行轨道', -width * 0.23, railY + 0.13 * u, 0.94 * u, railway)
    } else suspension(width, 0, railY, 0, railway, u, true)
    makeLift(railway, { start: 0, end: profile.fixed ? 0 : width * 0.5 - u * 0.64, y: railY, fixed: profile.fixed,
      top: profile.double, gap: 0.58 * u, unit: u, branded: true })
  }

  function portBase(gauge, platformY, u, legTopZ, wheelbase) {
    const trackLength = 2 * wheelbase + 6.8 * u
    travel = Math.min((trackLength - 2 * wheelbase) * 0.43, wheelbase * 1.35)
    const railY = 0.31 * u
    for (const sign of [-1, 1]) {
      const x = sign * gauge / 2
      rail(x, railY, trackLength, { scale: u, parent: railway })
      baseTruck(x, railY, wheelbase * 2, frame, { size: u, wheels })
      for (const side of [-1, 1]) {
        const start = v(x, railY + 0.50 * u, side * wheelbase * 0.78)
        const end = v(x * 0.68, platformY, side * legTopZ)
        bar(start, end, u * 0.69, u * 0.74, paint, frame)
        bar(start.clone().add(v(0.33 * u, 0, 0)), end.clone().add(v(0.33 * u, 0, 0)), u * 0.13, u * 0.80, edge, frame)
      }
      box(u * 0.59, u * 0.63, wheelbase * 1.49, x * 0.9, platformY * 0.43, 0, shade, frame)
    }
    label('固定地面轨道', gauge / 2, railY + 0.14 * u, -trackLength * 0.39, railway)
  }

  function portal() {
    const u = clamp(width * 0.065, 0.58, 3.55) * (0.75 + size * 0.25)
    const platformY = clamp(width * 0.20, 2.6 * u, 4.45 * u)
    const gauge = u * 5.0, wheelbase = u * 2.2
    portBase(gauge, platformY, u, u * 1.43, wheelbase)
    box(gauge * 0.93, u * 0.62, u * 3.47, 0, platformY, 0, paint, frame)
    cylinder(u * 1.18, 0.27 * u, 0, platformY + 0.42 * u, 0, steel, 'y', frame)
    const upper = group('slewing-upper', frame, 0, platformY + 0.6 * u)
    cylinder(u * 1.05, 0.34 * u, 0, -0.04 * u, 0, shade, 'y', upper)
    girder(u * 4.1, -0.37 * u, 0.54 * u, 0, u * 1.98, u * 0.96, true, upper)
    box(u * 0.69, u * 0.63, u * 2.11, -2.37 * u, 0.66 * u, 0, dark, upper)
    cab(0.46 * u, 1.13 * u, 1.13 * u, upper, u * 0.67)
    label('回转支承', 0, 0.08 * u, 1.20 * u, upper)
    const arm = group('luffing-arm', upper, 0.67 * u, u * 1.31)
    const tower = group('luffing-tower', upper, 0.67 * u, u * 1.31)
    const L = width * (profile.linkage ? 0.79 : 1.12)
    girder(L, L / 2, 0, 0, u * 0.68, u * 0.84, false, arm, true)
    for (const z of [-1, 1]) cylinder(u * 0.22, u * 0.12, 0.12 * u, 0, z * u * 0.45, bolt, 'z', arm)
    label(profile.linkage ? '四连杆主臂架' : '单臂架', L * 0.43, 0.49 * u, 0.38 * u, arm)
    let source, poseLink
    const baseAngle = profile.linkage ? 0.54 : clamp(Math.atan2(nominalY - platformY - 1.8 * u, L), 0.39, 0.61)
    if (profile.linkage) {
      const cx = -L * 0.22, cy = L * 0.43
      for (const z of [-0.36 * u, 0.36 * u]) {
        bar(v(-2.25 * u, -0.35 * u, z), v(cx, cy, z), u * 0.26, u * 0.25, shade, tower)
        bar(v(-0.29 * u, -0.14 * u, z), v(cx, cy, z), u * 0.22, u * 0.21, paint, tower)
      }
      const jibMount = group('linked-jib', tower)
      // Link lengths keep the circle intersection valid for the full luffing stroke.
      const jibLink = L * 0.40, rodLength = L * 0.79
      girder(jibLink + L * 0.27, (L * 0.27 - jibLink) / 2, 0, 0, u * 0.55, u * 0.58, false, jibMount, true)
      source = group('boom-head', jibMount, L * 0.27, -0.15 * u)
      const rocker = box(u * 0.18, 1, u * 0.18, 0, 0, 0, steel, tower)
      rocker.name = 'luffing-rod'
      label('活动拉杆', cx, cy, u * 0.47, tower)
      poseLink = angle => {
        const bx = L * Math.cos(angle), by = L * Math.sin(angle)
        const dx = cx - bx, dy = cy - by, middle = Math.hypot(dx, dy)
        const f = (jibLink ** 2 - rodLength ** 2 + middle ** 2) / (2 * middle)
        const h = Math.sqrt(Math.max(0, jibLink ** 2 - f ** 2))
        const ex = bx + (f * dx + h * dy) / middle, ey = by + (f * dy - h * dx) / middle
        jibMount.position.set(bx, by, 0)
        jibMount.rotation.z = Math.atan2(by - ey, bx - ex)
        fitBar(rocker, v(cx, cy, 0), v(ex, ey, 0))
      }
    } else {
      const crown = v(-u * 1.42, u * 2.58, 0)
      for (const z of [-0.45 * u, 0.45 * u]) {
        bar(v(-2.05 * u, -0.26 * u, z), v(crown.x, crown.y, z * 0.31), u * 0.27, u * 0.27, shade, tower)
        bar(v(-0.76 * u, -0.24 * u, z), v(crown.x, crown.y, z * 0.31), u * 0.19, u * 0.22, paint, tower)
      }
      const rope = box(0.050 * u, 1, 0.055 * u, 0, 0, 0, wire, tower)
      source = group('boom-head', arm, L * 0.99, -0.17 * u)
      poseLink = angle => fitBar(rope, crown, v(Math.cos(angle) * L * 0.72, Math.sin(angle) * L * 0.72, 0))
    }
    cylinder(u * 0.18, u * 0.53, 0, 0, 0, bolt, 'z', source)
    makeLift(source, { remote: true, unit: u * 0.57, start: 0, y: 0 })
    poseArms = motion => {
      upper.rotation.y = -(motion.rotate ?? 0) * 1.12
      const angle = baseAngle + (motion.luff ?? 0) * (profile.linkage ? 0.28 : 0.42)
      arm.rotation.z = angle
      poseLink(angle)
    }
  }

  function quay() {
    const u = clamp(width * 0.072, 1.65, 5.5) * (0.75 + size * 0.25), y = Math.max(nominalY, 5.15 * u)
    const gauge = u * 5.45, wheelbase = u * 2.42, platform = y * 0.55
    const girderH = u * 0.77, zz = u * 0.54, pivot = gauge * 0.53
    portBase(gauge, platform, u, u * 1.18, wheelbase)
    const back = -gauge * 0.81, front = pivot + width
    const length = pivot - back, floor = y - girderH * 0.55 - u * 0.23
    const boom = group('parking-boom', frame, pivot, y)
    const support = group('quay-suspension', frame)
    for (const z of [-zz, zz]) {
      girder(length, back + length / 2, y, z, u * 0.53, girderH, z > 0, frame)
      girder(width, width / 2, 0, z, u * 0.50, girderH, false, boom, true)
    }
    suspension(length, back + length / 2, floor, 0, frame, u * 0.80)
    suspension(width, width / 2, floor - y, 0, boom, u * 0.80)
    for (const x of [-gauge * 0.44, gauge * 0.39]) for (const side of [-1, 1]) {
      const z = side * u * 1.2, inner = side * u * 0.64
      bar(v(x, platform * 0.99, z), v(x + u * 0.22, y + u * 0.12, inner), u * 0.41, u * 0.55, paint, frame)
      box(u * 0.43, u * 0.37, u * 2.52, x, platform, 0, shade, frame)
    }
    const crownX = -gauge * 0.23, crownY = y + width * 0.26
    const stays = []
    for (const side of [-1, 1]) {
      const z = side * zz, crown = v(crownX, crownY, z)
      bar(v(back + u * 0.36, y, z), crown, u * 0.26, u * 0.24, shade, support)
      bar(v(pivot - u * 0.55, y, z), crown, u * 0.28, u * 0.28, paint, support)
      const stay = box(u * 0.10, 1, u * 0.13, 0, 0, 0, steel, support)
      stays.push({ stay, crown, z })
      cylinder(u * 0.24, u * 0.38, 0, -u * 0.07, z, bolt, 'z', boom)
    }
    cab(back + length * 0.29, y + u * 0.38, u * 0.93, frame, u * 0.69)
    label('岸桥俯仰臂架', width * 0.36, girderH * 0.40, zz + u * 0.30, boom)
    label('门架大车机构', gauge * 0.50, u * 1.11, wheelbase * 0.61, frame)
    const parked = pivot - u * 0.97
    const firstStart = profile.dual ? parked : pivot - length * 0.51
    makeLift(frame, { start: firstStart, end: front - u * 0.80, y: floor, unit: u * 0.80,
      parkedX: parked, labelText: profile.dual ? '海侧小车' : '岸桥起重小车' })
    if (profile.dual) {
      const landY = floor - 0.91 * u, landLength = length * 0.83, landStart = back + u * 0.68
      suspension(landLength, back + landLength * 0.5, landY, 0, frame, u * 0.65)
      for (const x of [back + u * 0.13, back + landLength * 0.88]) box(0.18 * u, u * 0.76, 0.38 * u, x, landY + 0.54 * u, 0, shade, frame)
      box(2.0 * u, 0.18 * u, 1.8 * u, back + length * 0.59, landY - 2.10 * u, 0, steel, frame)
      makeLift(frame, { id: 'second', start: landStart, end: back + landLength - u * 0.55, y: landY, unit: u * 0.65,
        trolleyAction: 'trolley2', liftAction: 'lift2', labelText: '陆侧小车' })
    }
    poseArms = motion => {
      const p = motion.boom ?? 0
      const angle = Math.max(0, (p - 0.22) / 0.78) * 1.23
      boom.rotation.z = angle
      for (const { stay, crown, z } of stays) fitBar(stay, crown, v(pivot + Math.cos(angle) * width * 0.51, y + Math.sin(angle) * width * 0.51, z))
    }
  }

  function carrier() {
    const blade = profile.tool === 'blade', vessel = profile.tool === 'sling'
    const u = clamp(width * 0.13, 0.60, 2.0) * (0.75 + size * 0.25)
    const y = blade ? Math.max(0.78 * u, config.height - 0.40 * u) : Math.max(2.3 * u, nominalY)
    const wheelLength = blade ? u * 5.2 : Math.max(width * 0.77, u * 4.4)
    travel = width * 0.32
    for (const side of [-1, 1]) {
      const x = side * width * 0.50
      baseTruck(x, 0, wheelLength, frame, { tyre: true, wheels, size: u })
      if (!blade) {
        for (const z of [-1, 1]) bar(v(x, u * 0.67, z * wheelLength * 0.40), v(x * 0.93, y, z * wheelLength * 0.46), u * 0.61, u * 0.58, paint, frame)
        box(0.86 * u, u * 0.59, wheelLength, x, y, 0, paint, frame)
      } else box(0.77 * u, u * 0.60, wheelLength, x, y, 0, shade, frame)
    }
    for (const z of [-1, 1]) girder(width + u * 0.43, 0, y, z * wheelLength * 0.41, u * 0.65, u * 0.59, z > 0, frame)
    label('轮式运行机构', width * 0.52, 0.75 * u, wheelLength * 0.40, frame)
    if (blade) {
      for (const sign of [-1, 1]) {
        box(width * 0.76, 0.26 * u, 0.78 * u, 0, y + u * 0.38, sign * wheelLength * 0.34, steel, frame)
        for (const x of [-width * 0.34, width * 0.34]) bar(v(x * 0.82, y + u * 0.39, sign * wheelLength * 0.34), v(x, y + u * 1.11, sign * wheelLength * 0.34), u * 0.22, u * 0.52, shade, frame)
      }
      label('叶片承托架', 0, y + u * 0.94, wheelLength * 0.39, frame)
    } else {
      cab(width * 0.39, vessel ? y * 0.31 : y - 0.69 * u, wheelLength * 0.37, frame, u * 0.63)
      const positions = vessel ? [-wheelLength * 0.36, wheelLength * 0.36] : [0]
      positions.forEach((z, i) => {
        const anchor = group('carrier-hoist', frame, 0, y - u * 0.18, z)
        if (vessel) for (const x of [-0.45, 0.45]) {
          cylinder(u * 0.24, u * 0.42, x * width, 0.02 * u, 0, steel, 'x', anchor)
          box(u * 0.60, u * 0.33, u * 0.65, x * width, u * 0.22, 0, shade, anchor)
        }
        makeLift(anchor, { id: i ? 'second' : 'primary', remote: true, start: 0, y: 0, unit: u * 1.12, toolWidth: vessel ? width * 0.90 : 0 })
      })
    }
  }

  if (['bridge', 'kbk'].includes(profile.kind)) overhead()
  else if (['gantry', 'yard', 'shipyard'].includes(profile.kind)) makeGantry()
  else if (profile.kind === 'jib') jib()
  else if (profile.kind === 'hoist') standaloneHoist()
  else if (profile.kind === 'portal') portal()
  else if (profile.kind === 'quay') quay()
  else if (profile.kind === 'carrier') carrier()

  return {
    floorY,
    pose(motion) {
      const moveZ = (motion.travel ?? 0) * travel
      frame.position.z = moveZ
      for (const { wheel, radius } of wheels) wheel.rotation.x = moveZ / radius
      poseArms(motion)
      lifts.forEach(pose => pose(motion))
    },
  }
}

const stdLane = (u, depth) => Math.max(0.32 * u, depth * 0.42)
