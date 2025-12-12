function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function srgbToLinear(c: number) {
  c = clamp01(c)
  if (c <= 0.04045) return c / 12.92
  return Math.pow((c + 0.055) / 1.055, 2.4)
}

export function parseColor(input: string) {
  // Supports hex (#RRGGBB, #RGB) and rgba(...) and rgb(...)
  const s = input.trim()
  if (s.startsWith('#')) {
    let hex = s.slice(1)
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255
    return [r, g, b, 1]
  }

  const rgba = s.match(/rgba?\(([^)]+)\)/i)
  if (rgba) {
    const parts = rgba[1].split(',').map((p) => p.trim())
    const r = parseFloat(parts[0]) / 255
    const g = parseFloat(parts[1]) / 255
    const b = parseFloat(parts[2]) / 255
    const a = parts[3] ? parseFloat(parts[3]) : 1
    return [r, g, b, a]
  }

  // Fallback: treat as black
  return [0, 0, 0, 1]
}

function clamp01Num(v: number) {
  return Math.max(0, Math.min(1, v))
}

function mixColors(c1: number[], c2: number[], t: number) {
  return [
    clamp01Num(c1[0] * (1 - t) + c2[0] * t),
    clamp01Num(c1[1] * (1 - t) + c2[1] * t),
    clamp01Num(c1[2] * (1 - t) + c2[2] * t),
    clamp01Num((c1[3] ?? 1) * (1 - t) + (c2[3] ?? 1) * t)
  ]
}

function rgbaArrayToCss(arr: number[]) {
  const r = Math.round(arr[0] * 255)
  const g = Math.round(arr[1] * 255)
  const b = Math.round(arr[2] * 255)
  const a = typeof arr[3] === 'number' ? +arr[3].toFixed(3) : 1
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function findCompliantBackground(foreground: string, background: string, targetRatio = 4.5) {
  const fgArr = parseColor(foreground)
  const bgArr = parseColor(background)

  // Quick checks: try black or white foreground (not changing background)
  // but we implement background adjustments here.

  type Candidate = { color: string; ratio: number; delta: number }
  let best: Candidate | undefined

  // Try mixing towards white (t from 0 to 1)
  for (let i = 0; i <= 100; i++) {
    const t = i / 100
    const candidate = mixColors(bgArr, [1, 1, 1, 1], t)
    const css = rgbaArrayToCss(candidate)
    const ratio = contrastRatioForColors(foreground, css)
    if (ratio >= targetRatio) {
      const delta = t
      if (!best || delta < best.delta) best = { color: css, ratio, delta }
      break
    }
  }

  // Try mixing towards black
  for (let i = 0; i <= 100; i++) {
    const t = i / 100
    const candidate = mixColors(bgArr, [0, 0, 0, 1], t)
    const css = rgbaArrayToCss(candidate)
    const ratio = contrastRatioForColors(foreground, css)
    if (ratio >= targetRatio) {
      const delta = t
      if (!best || delta < best.delta) best = { color: css, ratio, delta }
      break
    }
  }

  // Fallback: if nothing meets target, return the original background
  return best ? best.color : background
}

export function relativeLuminance(colorStr: string) {
  const [r, g, b] = parseColor(colorStr)
  const R = srgbToLinear(r)
  const G = srgbToLinear(g)
  const B = srgbToLinear(b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

export function contrastRatioForColors(foreground: string, background: string) {
  const L1 = relativeLuminance(foreground)
  const L2 = relativeLuminance(background)
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  const ratio = (lighter + 0.05) / (darker + 0.05)
  return ratio
}
