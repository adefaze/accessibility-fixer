import { framer } from 'framer-plugin'
import { contrastRatioForColors } from '../utils/colorContrast'
import { filterNodesByScope, ScanScope } from '../utils/scope'

export async function scanContrast(scope: ScanScope) {
  // Simple implementation: get all TextNode frames on the page and compute contrast
  const nodes = (await framer.getNodesWithType('TextNode')) || []
  const scopedNodes = await filterNodesByScope(nodes, scope)
  const results: any[] = []

  for (const node of scopedNodes) {
    try {
      const supportsText = node.supportsText && node.supportsText()
      if (!supportsText) continue

      const fontColor = node.font?.color || node.color || 'rgba(0,0,0,1)'
      // Try to get backgroundColor, falling back to parent backgrounds
      let bg = node.backgroundColor || null
      if (!bg) {
        const parent = await node.getParent()
        bg = parent?.backgroundColor || 'rgba(255,255,255,1)'
      }

      const ratio = contrastRatioForColors(fontColor, bg)
      if (ratio < 4.5) {
        results.push({
          title: 'Low contrast',
          type: 'contrast',
          detail: `Contrast ${ratio.toFixed(2)}:1 — expected ≥ 4.5:1`,
          nodeId: node.id,
          severity: 'critical'
        })
      }
    } catch (err) {
      // continue on errors for robustness
      console.warn('contrast scan error', err)
    }
  }

  return results
}
