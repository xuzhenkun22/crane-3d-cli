// Schematic KBK workshop installation based on img/444.png. The background
// stations share the runway but are parked during the foreground crane demo.
export function buildKbk(api, profile, d, { railway, frame, makeLift }) {
  const { group, box, cylinder, bar, tube, v, label, lightPlaque, paint, shade, edge, steel, bolt, dark, rubber, wire, safety } = api
  const { span, height } = d
  const u = Math.min(0.63, Math.max(0.34, d.trolley * 0.48))
  const mono = profile.monorail, double = profile.double
  const tread = height, runway = mono ? tread : tread + 1.05 * u
  const gauge = mono ? Math.max(1.8, Math.min(3.2, span * 0.46)) : span + 1.65 * u
  const crossTrack = span + 0.90 * u
  const lanes = mono ? [0] : [-span / 2, span / 2]
  const gap = double ? 0.90 * u : 0
  const pitch = Math.max(1.55, Math.min(span * 0.55, 4.5), 2 * gap + 1.5 * u)
  const travel = mono ? 0 : pitch * 0.86
  const endMargin = gap + 0.8 * u
  const runwayLength = mono ? span : 2 * pitch + travel + 2 * endMargin
  const runwayCenter = mono ? 0 : (travel - 2 * pitch) / 2
  const trackTop = 0.54 * u, hangHeight = 0.44 * u
  const steelwork = group('kbk-support-steelwork', railway, 0, 0, runwayCenter)
  // Steelwork local Z follows the long axis of the fixed runway(s).
  if (mono) steelwork.rotation.y = Math.PI / 2
  const length = runwayLength + 1.20 * u
  const portalCount = Math.max(2, Math.ceil(length / (mono ? 4.8 : 3.8)) + 1)
  const stations = Array.from({ length: portalCount }, (_, i) => (i / (portalCount - 1) - 0.5) * (length - 0.72 * u))
  const stringerH = 0.53 * u, portalH = 0.67 * u, postW = 0.56 * u
  const stringerBottom = runway + trackTop + hangHeight
  const portalBottom = stringerBottom + stringerH
  const postTop = portalBottom + portalH

  // H-section columns, portal crossbeams, longitudinal I-beams and knee braces.
  function section(parent, name, x, y, z, len, flange, depth, rotate = false) {
    const beam = group(name, parent, x, y, z)
    if (rotate) beam.rotation.y = Math.PI / 2
    for (const side of [-1, 1]) box(len, depth * 0.13, flange, 0, side * depth * 0.435, 0, steel, beam)
    box(len, depth * 0.74, flange * 0.24, 0, 0, 0, steel, beam)
  }
  for (const lane of lanes) {
    section(steelwork, 'kbk-longitudinal-beam', lane, stringerBottom + stringerH / 2, 0, length, 0.69 * u, stringerH, true)
  }
  for (const z of stations) {
    const portal = group('kbk-steel-portal', steelwork, 0, 0, z)
    section(portal, 'kbk-portal-crossbeam', 0, portalBottom + portalH / 2, 0, gauge + postW, 0.70 * u, portalH)
    for (const side of [-1, 1]) {
      const x = side * gauge / 2
      const column = group('kbk-support-column', portal, x, 0, 0)
      const base = group('kbk-column-base', column)
      box(1.02 * u, 0.12 * u, 1.14 * u, 0, 0.06 * u, 0, dark, base)
      for (const a of [-1, 1]) for (const b of [-1, 1]) cylinder(0.063 * u, 0.12 * u, a * 0.37 * u, 0.15 * u, b * 0.42 * u, bolt, 'y', base)
      const h = postTop - 0.12 * u
      box(postW * 0.25, h, postW * 0.73, 0, 0.12 * u + h / 2, 0, steel, column)
      for (const a of [-1, 1]) box(postW, h, postW * 0.14, 0, 0.12 * u + h / 2, a * postW * 0.43, steel, column)
      box(postW * 1.15, 0.09 * u, postW * 1.32, 0, postTop - 0.04 * u, 0, bolt, column)
      const knee = Math.min(1.52 * u, gauge * 0.23)
      bar(v(x, portalBottom - knee, 0), v(x - side * knee, portalBottom, 0), 0.20 * u, 0.27 * u, steel, portal).name = 'kbk-knee-brace'
    }
    for (const lane of lanes) {
      box(0.92 * u, 0.10 * u, 0.85 * u, lane, portalBottom, 0, dark, portal)
      for (const offset of [-0.32, 0.32]) cylinder(0.054 * u, 0.14 * u, lane + offset * u, portalBottom + 0.08 * u, 0.33 * u, bolt, 'y', portal)
    }
  }

  function track(parent, name, x, y, z, len, rotated = false, joints = false) {
    const rail = group(name, parent, x, y, z)
    if (rotated) rail.rotation.y = -Math.PI / 2
    // Lower running lips remain separate so the suspension pin passes through the slot.
    box(len, 0.081 * u, 0.53 * u, 0, trackTop - 0.0405 * u, 0, edge, rail)
    for (const side of [-1, 1]) {
      box(len, 0.50 * u, 0.061 * u, 0, 0.222 * u, side * 0.244 * u, paint, rail)
      box(len, 0.08 * u, 0.025 * u, 0, 0.423 * u, side * 0.270 * u, edge, rail)
      box(len, 0.066 * u, 0.182 * u, 0, -0.033 * u, side * 0.176 * u, shade, rail).name = 'kbk-running-lip'
    }
    for (const sign of [-1, 1]) {
      box(0.094 * u, 0.56 * u, 0.58 * u, sign * (len / 2 - 0.048 * u), 0.22 * u, 0, shade, rail).name = 'kbk-end-cap'
      box(0.18 * u, 0.31 * u, 0.40 * u, sign * (len / 2 - 0.20 * u), 0.16 * u, 0, rubber, rail).name = 'kbk-end-stop'
    }
    if (joints) {
      const sections = Math.ceil(len / 3.2)
      for (let i = 1; i < sections; i++) {
        const at = (i / sections - 0.5) * len
        const joint = group('kbk-rail-joint', rail, at)
        for (const side of [-1, 1]) {
          box(0.73 * u, 0.25 * u, 0.067 * u, 0, 0.28 * u, side * 0.293 * u, shade, joint)
          for (const dx of [-0.24, 0.24]) cylinder(0.048 * u, 0.089 * u, dx * u, 0.28 * u, side * 0.326 * u, bolt, 'z', joint)
        }
      }
    }
    return rail
  }

  function hanger(rail, x) {
    const joint = group('kbk-rail-hanger', rail, x, trackTop)
    box(0.50 * u, 0.08 * u, 0.70 * u, 0, hangHeight - 0.035 * u, 0, dark, joint)
    box(0.55 * u, 0.09 * u, 0.58 * u, 0, 0.04 * u, 0, shade, joint)
    cylinder(0.054 * u, hangHeight - 0.05 * u, 0, hangHeight / 2, 0, bolt, 'y', joint)
    for (const y of [0.14, 0.42]) cylinder(0.104 * u, 0.12 * u, 0, y * u, 0, steel, 'y', joint)
  }

  function rollers(parent, name, z, halfWheelbase = 0.26 * u) {
    const truck = group(name, parent, 0, 0, z)
    const r = 0.143 * u
    const wheels = []
    for (const x of [-halfWheelbase, halfWheelbase]) {
      for (const side of [-1, 1]) {
        const wheel = group(name === 'kbk-bridge-truck' ? 'travel-wheel' : 'trolley-wheel', truck, x, r, side * 0.149 * u)
        cylinder(r, 0.113 * u, 0, 0, 0, steel, 'z', wheel)
        cylinder(r * 0.48, 0.137 * u, 0, 0, 0, bolt, 'z', wheel)
        wheels.push({ wheel, radius: r })
      }
      box(0.103 * u, 0.25 * u, 0.101 * u, x, -0.025 * u, 0, dark, truck)
    }
    box(2 * halfWheelbase + 0.17 * u, 0.11 * u, 0.24 * u, 0, -0.16 * u, 0, dark, truck)
    cylinder(0.104 * u, 0.16 * u, 0, -0.24 * u, 0, bolt, 'y', truck)
    return wheels
  }

  const bridgeWheels = []
  let poseFeed = () => {}
  function addLift(parent, len, station = 0) {
    const parked = station > 0, limit = len / 2 - 0.62 * u
    const start = limit * (station === 1 ? -0.59 : station === 2 ? 0.1 : -0.34)
    const feedX = -len / 2 + 0.32 * u, feedZ = gap + 0.33 * u
    const cable = group('kbk-festoon', parent, feedX, tread + 0.065 * u, feedZ)
    const count = Math.min(10, Math.max(3, Math.round(len / 0.92)))
    const loops = Array.from({ length: count }, () => {
      const loop = tube([v(0, 0, 0), v(0.23, -0.57 * u, 0), v(0.5, -0.76 * u, 0), v(0.77, -0.57 * u, 0), v(1, 0, 0)], 0.023 * u, wire, cable)
      loop.name = 'kbk-cable-loop'
      return loop
    })
    const updateFeed = x => {
      const step = (x - feedX) / count
      for (const [i, loop] of loops.entries()) {
        loop.position.x = i * step
        loop.scale.set(step, Math.min(1.2, Math.max(0.32, step / (0.95 * u))), 1)
      }
    }
    updateFeed(start)
    if (!parked) {
      poseFeed = motion => updateFeed(start + (limit - start) * (motion.trolley ?? 0))
      label('随行供电电缆', -len * 0.39, tread - 0.13 * u, feedZ, parent)
    }
    makeLift(parent, { id: parked ? `station-${station}` : 'primary', start, end: limit, y: tread, unit: u, parked, showLabels: !parked,
      buildRunningGear(carriage) {
        const wheels = (double ? [-gap, gap] : [0]).flatMap(z => rollers(carriage, 'kbk-hoist-truck', z))
        box(0.50 * u, 0.11 * u, 2 * gap + 0.38 * u, 0, -0.28 * u, 0, dark, carriage).name = 'kbk-hoist-suspension'
        tube([v(0, 0.065 * u, feedZ), v(0, -0.31 * u, feedZ), v(0, -0.46 * u, 0.20 * u)], 0.024 * u, wire, carriage)
        const drop = Math.min(tread - 0.35 * u, Math.max(tread * 0.72, tread - 1.05))
        const pendant = group('kbk-control-pendant', carriage, 0.43 * u, -drop, 0.46 * u)
        tube([v(0, drop - 0.55 * u, -0.28 * u), v(0.12 * u, drop - 0.87 * u, -0.035 * u), v(0, 0.27 * u, 0), v(0, 0.12 * u, 0)], 0.025 * u, wire, pendant)
        box(0.211 * u, 0.52 * u, 0.14 * u, 0, -0.04 * u, 0, safety, pendant)
        for (const y of [-0.16, -0.03, 0.10]) cylinder(0.035 * u, 0.04 * u, 0, y * u, 0.079 * u, rubber, 'z', pendant)
        return wheels
      },
    })
  }

  function addHangers(rail, len) {
    const count = Math.max(2, Math.ceil(len / 2.25) + 1)
    for (let i = 0; i < count; i++) hanger(rail, (i / (count - 1) - 0.5) * (len - 0.63 * u))
  }
  if (mono) {
    const rail = track(railway, 'kbk-fixed-monorail', 0, tread, 0, runwayLength, false, true)
    addHangers(rail, runwayLength)
    lightPlaque(span * 0.17, 0.25 * u, 0.296 * u, span * 0.52, 0.33 * u, rail, true)
    label('KBK 封闭式单轨', -span * 0.27, 0.26 * u, 0.29 * u, rail)
    addLift(railway, runwayLength)
  } else {
    for (const x of lanes) {
      const rail = track(railway, 'kbk-fixed-runway', x, runway, runwayCenter, runwayLength, true, true)
      addHangers(rail, runwayLength)
    }
    function buildBridge(bridge, station) {
      for (const x of lanes) {
        const travelTruck = group('kbk-bridge-end-carriage', bridge, x, runway, 0)
        travelTruck.rotation.y = -Math.PI / 2
        const wheels = rollers(travelTruck, 'kbk-bridge-truck', 0, gap + 0.23 * u)
        if (!station) bridgeWheels.push(...wheels)
        const headY = -0.33 * u, bridgeTop = tread + trackTop, railTop = bridgeTop - runway
        box(2 * gap + 0.36 * u, headY - railTop + 0.04 * u, 0.41 * u, 0, (headY + railTop) / 2, 0, shade, travelTruck)
        for (const z of (double ? [-gap, gap] : [0])) box(0.51 * u, 0.12 * u, 0.44 * u, x, bridgeTop, z, bolt, bridge)
      }
      for (const z of (double ? [-gap, gap] : [0])) track(bridge, 'kbk-bridge-track', 0, tread, z, crossTrack)
      if (double) for (const x of [-span * 0.29, span * 0.29]) box(0.29 * u, 0.12 * u, 2 * gap + 0.44 * u, x, tread + trackTop + 0.025 * u, 0, shade, bridge)
      lightPlaque(span * 0.24, tread + 0.26 * u, gap + 0.297 * u, crossTrack * 0.57, 0.34 * u, bridge, !station)
      addLift(bridge, crossTrack, station)
    }
    buildBridge(frame, 0)
    for (const station of [1, 2]) buildBridge(group('kbk-parked-workstation', railway, 0, 0, -station * pitch), station)
    label(double ? 'KBK 双梁桥架' : 'KBK 单梁桥架', span * 0.13, tread + 0.22 * u, gap + 0.33 * u, frame)
    label('固定悬挂运行轨道', lanes.at(-1), runway + 0.13 * u, runwayCenter + runwayLength * 0.28, railway)
  }
  label('自立式支撑钢架', -gauge / 2, postTop - 0.22 * u, stations.at(-1), steelwork)
  label('柔性悬挂组件', lanes[0], runway + trackTop + hangHeight * 0.55, stations.at(-1) - 0.82 * u, steelwork)
  return { travel, poseTravel(motion) {
    for (const { wheel, radius } of bridgeWheels) wheel.rotation.z = -frame.position.z / radius
    poseFeed(motion)
  } }
}
