import { framer } from 'framer-plugin'
import { contrastRatioForColors, findCompliantBackground } from '../utils/colorContrast'
import { captureAttributes } from './serializers'

export async function fixContrast(nodeId: string) {
  const node = await framer.getNode?.(nodeId)
  if (!node) throw new Error('Node not found')

  const supportsBg = node.supportsBackgroundColor && node.supportsBackgroundColor()
  const supportsText = node.supportsText && node.supportsText()

  if (!supportsBg || !supportsText) {
    throw new Error('Node does not support background and text')
  }

  const fg = node.font?.color || node.color || 'rgba(0,0,0,1)'
  const parent = await node.getParent()
  const bg = node.backgroundColor || parent?.backgroundColor || 'rgba(255,255,255,1)'

  const ratio = contrastRatioForColors(fg, bg)
  if (ratio >= 4.5) return { updated: false }

  // Compute a compliant background color by mixing towards white or black.
  const newBg = findCompliantBackground(fg, bg, 4.5)

  const previous = captureAttributes(node, ['backgroundColor', 'backgroundGradient', 'fills', 'backgroundImage'])
  await framer.setAttributes?.(nodeId, { backgroundColor: newBg })
  framer.notify('Contrast fix applied', { variant: 'success' })
  return { nodeId, changed: true, previous, applied: { backgroundColor: newBg } }
}
