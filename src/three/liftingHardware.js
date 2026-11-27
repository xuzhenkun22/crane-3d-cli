// Dimensions here are proportions for the preview, not manufacturing sizes.
export function buildCarriage(api, parent, u, { top, gap, fixed, winch }) {
  const { group, box, cylinder, steel, bolt, dark, shade, tealDark, rubber } = api
  const wheels = []
  if (fixed) {
    const bracket = group('fixed-hoist-bracket', parent)
    box(1.26 * u, 0.12 * u, 0.69 * u, 0, 0.02 * u, 0, steel, bracket)
    for (const x of [-0.46, 0.46]) for (const z of [-0.25, 0.25]) cylinder(0.05 * u, 0.17 * u, x * u, 0.02 * u, z * u, bolt, 'y', bracket)
    return wheels
  }
  const gauge = top ? Math.max(gap / u, 0.32) : 0.237
  const radius = top ? 0.16 : 0.129
  const wheelbase = top ? 0.68 : 0.47
  const frameY = top ? 0.31 : -0.13
  if (top) {
    for (const side of [-1, 1]) {
      box(1.88 * u, 0.19 * u, 0.36 * u, 0, frameY * u, side * gauge * u, shade, parent)
      box(1.94 * u, 0.046 * u, 0.39 * u, 0, (frameY + 0.11) * u, side * gauge * u, steel, parent)
      box(1.03 * u, 0.070 * u, 0.38 * u, -0.31 * u, (frameY + 0.095) * u, side * gauge * 0.66 * u, steel, parent)
    }
    // Crossmembers leave the centre of the trolley open for the reeving.
    for (const x of [-0.67, 0.67]) box(0.29 * u, 0.16 * u, (2 * gauge + 0.14) * u, x * u, (frameY + 0.04) * u, 0, shade, parent)
    const z = (gauge + 0.20) * u
    for (const x of [-0.91, 0.91]) box(0.038 * u, 0.25 * u, 0.039 * u, x * u, (frameY + 0.22) * u, z, bolt, parent)
    box(1.82 * u, 0.037 * u, 0.038 * u, 0, (frameY + 0.344) * u, z, bolt, parent)
  } else {
    for (const side of [-1, 1]) box(1.31 * u, 0.14 * u, 0.095 * u, 0, -0.075 * u, side * 0.378 * u, shade, parent)
    for (const x of [-0.44, 0.44]) box(0.17 * u, 0.12 * u, 0.83 * u, x * u, -0.16 * u, 0, steel, parent)
  }
  for (const side of [-1, 1]) for (const x of [-wheelbase, wheelbase]) {
    const cy = top ? radius : radius - 0.006
    const z = side * gauge, width = top ? 0.196 : 0.133
    const bearing = group('trolley-bearing', parent, x * u, cy * u, (z + side * (top ? 0.116 : 0.148)) * u)
    box(0.29 * u, (top ? 0.26 : 0.29) * u, 0.084 * u, 0, -0.037 * u, 0, dark, bearing)
    for (const i of [-1, 1]) cylinder(0.022 * u, 0.098 * u, i * 0.102 * u, -0.026 * u, 0, bolt, 'z', bearing)
    const wheel = group('trolley-wheel', parent, x * u, cy * u, z * u)
    cylinder(radius * u, width * u, 0, 0, 0, steel, 'z', wheel)
    cylinder((radius + 0.027) * u, 0.034 * u, 0, 0, side * (top ? -0.66 : 0.55) * width * u, dark, 'z', wheel)
    cylinder(radius * 0.46 * u, (width + 0.068) * u, 0, 0, 0, bolt, 'z', wheel)
    box(0.13 * u, 0.024 * u, 0.017 * u, 0, 0, side * (width + 0.08) * 0.5 * u, dark, wheel)
    wheels.push({ wheel, radius: radius * u })
  }
  box(0.26 * u, 0.23 * u, 0.15 * u, -wheelbase * u, frameY * u, -(gauge + 0.19) * u, dark, parent)
  cylinder((winch ? 0.14 : 0.105) * u, 0.28 * u, -wheelbase * u, frameY * u, -(gauge + 0.37) * u, tealDark, 'z', parent)
  for (const x of [-1, 1]) cylinder(0.075 * u, 0.12 * u, x * (wheelbase + 0.21) * u, 0.11 * u, (top ? gauge : 0.35) * u, rubber, 'x', parent)
  return wheels
}

export function buildHoistHardware(api, parent, profile, u, y, { top, aux, branded }) {
  const { group, box, cylinder, tube, v, plaque, paint, edge, shade, steel, bolt, dark, teal, tealDark, rubber, wire, safety } = api
  const winch = profile.winch
  const body = group(winch ? 'winch-machinery' : profile.chain ? 'chain-hoist-body' : 'rope-hoist-body', parent, 0, y)
  const casing = branded ? paint : teal
  const casingEdge = branded ? edge : tealDark
  const drums = []
  const B = (w, h, l, x, y, z, m, p = body) => box(w * u, h * u, l * u, x * u, y * u, z * u, m, p)
  const C = (r, l, x, y, z, m, axis = 'x', p = body) => cylinder(r * u, l * u, x * u, y * u, z * u, m, axis, p)
  function motor(x, yy, z, r, length) {
    const m = group('hoist-motor', body, x * u, yy * u, z * u)
    C(r, length, 0, 0, 0, tealDark, 'x', m)
    for (let i = 0; i < 8; i++) {
      const fin = B(length * 0.78, 0.029, 0.037, 0, 0, 0, teal, m)
      const angle = i * Math.PI / 4
      fin.position.y = r * u * Math.cos(angle)
      fin.position.z = r * u * Math.sin(angle)
      fin.rotation.x = angle
    }
    C(r * 1.06, 0.078, length * 0.51, 0, 0, dark, 'x', m)
    C(r * 0.72, 0.024, length * 0.56, 0, 0, steel, 'x', m)
    for (let i = -1; i <= 1; i++) B(0.024, 0.016, r, length * 0.58, i * 0.045, 0, rubber, m)
    B(length * 0.46, 0.10, r * 0.87, 0, r + 0.042, 0, dark, m)
  }
  function gearbox(x, yy, z, r) {
    const p = group('lifting-gearbox', body, x * u, yy * u, z * u)
    B(0.23, r * 1.46, r * 1.68, 0, -r * 0.12, 0, casingEdge, p)
    C(r, 0.17, 0.015, 0, 0, casing, 'x', p)
    C(r * 0.73, 0.075, 0.132, 0, 0, steel, 'x', p)
    for (let i = 0; i < 4; i++) C(0.026, 0.032, 0.129, Math.cos(i * Math.PI / 2) * r * 0.83, Math.sin(i * Math.PI / 2) * r * 0.83, bolt, 'x', p)
  }
  function drum(x, yy, z, r, length) {
    const p = group('rope-drum', body, x * u, yy * u, z * u)
    C(r, length, 0, 0, 0, steel, 'x', p)
    // Spool grooves and a witness mark make the revolving drum legible.
    for (let i = -5; i <= 5; i++) C(r + 0.008, length * 0.024, i * length * 0.082, 0, 0, wire, 'x', p)
    for (const side of [-1, 1]) C(r * 1.19, 0.068, side * (length * 0.50 + 0.025), 0, 0, dark, 'x', p)
    B(0.036, 0.028, r * 0.64, -length * 0.5 - 0.059, 0, r * 0.45, safety, p)
    drums.push({ node: p, radius: r * u })
  }
  if (winch) {
    const r = top ? 0.304 : 0.267
    const z = 0.02
    drum(-0.16, 0, z, r, top ? 0.88 : 0.73)
    gearbox(0.42, 0, z, 0.28)
    C(0.17, 0.16, 0.61, 0, z, steel).name = 'lifting-brake'
    B(0.22, 0.23, 0.12, 0.61, 0.03, 0.15, safety)
    motor(0.88, 0, z, 0.19, 0.43)
    for (const x of [-0.69, top ? 0.56 : 0.40]) {
      B(0.19, 0.36, 0.47, x, top ? -0.20 : 0.21, z, shade)
      B(0.24, 0.061, 0.52, x, top ? -0.40 : 0.39, z, steel)
    }
    B(0.37, 0.35, 0.24, 0.40, 0.01, -0.50, dark)
    B(0.17, 0.11, 0.020, 0.40, 0.06, -0.626, safety)
    if (aux) drum(0.46, 0.07, 0.59, 0.18, 0.38)
  } else if (profile.kind === 'kbk' && profile.chain) {
    motor(0.22, 0.014, -0.18, 0.252, 0.55)
    // Rounded blue cover faces the operator; the black chain bag hangs beside it.
    for (const [r, depth, z, material] of [[0.32, 0.41, 0.03, casingEdge], [0.288, 0.20, 0.275, casing]]) {
      B(r * 2, 0.23, depth - 0.002, 0, 0, z, material)
      for (const yy of [-0.115, 0.115]) C(r, depth, 0, yy, z, material, 'z')
    }
    B(0.20, 0.103, 0.012, 0, 0.15, 0.381, bolt)
    B(0.31, 0.38, 0.32, -0.31, -0.37, -0.045, rubber).rotation.z = -0.12
    B(0.32, 0.07, 0.33, -0.33, -0.19, -0.045, dark)
  } else if (profile.chain) {
    B(0.62, 0.43, 0.46, -0.06, 0, 0, casing)
    gearbox(0.26, 0, 0, 0.226)
    motor(0.55, 0, 0, 0.184, 0.30)
    B(0.30, 0.11, 0.35, -0.31, -0.21, -0.08, steel)
    B(0.30, 0.34, 0.30, -0.35, -0.36, -0.08, rubber).rotation.z = -0.10
  } else {
    const r = profile.heavy ? 0.36 : profile.compact ? 0.265 : 0.30
    const drumZ = profile.compact ? -0.045 : 0
    drum(-0.15, -0.04, drumZ, r * 0.80, 0.78)
    if (profile.cover === 'DVR' || (profile.compact && profile.cover !== 'SH')) {
      B(1.08, 0.20, 0.62, -0.14, 0.15, drumZ, casing)
      for (const z of [-0.32, 0.32]) B(0.93, 0.25, 0.047, -0.14, 0.055, z + drumZ, casing)
      B(0.51, 0.069, 0.27, -0.17, 0.28, drumZ, dark)
    } else {
      // A raised canopy leaves the winding and rope guide visible below it.
      B(0.91, 0.10, r * 1.99, -0.16, r * 0.68, drumZ, casing)
      for (const x of [-0.60, 0.30]) C(r * 1.08, 0.125, x, -0.022, drumZ, casingEdge)
      for (const z of [-1, 1]) B(0.88, 0.09, 0.067, -0.16, 0.10, drumZ + z * r * 0.89, casing)
    }
    gearbox(-0.64, -0.037, drumZ, profile.planetary ? 0.34 : 0.29)
    C(0.193, 0.145, 0.36, -0.034, drumZ, steel)
    motor(0.64, -0.034, drumZ, 0.21, 0.44)
    if (profile.motorCount === 2) motor(0.42, -0.034, -0.39, 0.132, 0.32)
    B(0.34, 0.17, 0.17, 0.27, 0.10, 0.28, dark)
    tube([v(0.38 * u, 0.17 * u, 0.31 * u), v(0.55 * u, 0.27 * u, 0.22 * u), v(0.67 * u, 0.24 * u, 0.04 * u)], 0.019 * u, rubber, body)
  }
  if (!winch) for (const x of [-0.42, 0.25]) B(0.17, 0.25, 0.24, x, top ? -0.19 : 0.22, 0, casingEdge)
  if (!winch && !profile.chain) {
    const guideY = -0.30
    B(0.10, 0.066, 0.29, -0.025, guideY, 0, steel).name = 'rope-guide'
    for (const z of [-0.12, 0.12]) B(0.42, 0.043, 0.042, -0.014, guideY, z, steel)
  }
  if (branded) plaque(-0.10 * u, 0.066 * u, 0.345 * u, 1.00 * u, 0.20 * u, body)
  return drums
}
