import { framer } from 'framer-plugin'
import { filterNodesByScope, ScanScope } from '../utils/scope'

export async function scanTouchTargets(scope: ScanScope) {
  // Simple approach: scan FrameNode elements and check dimensions
  const nodes = (await framer.getNodesWithType('FrameNode')) || []
  const scopedNodes = await filterNodesByScope(nodes, scope)
  const results: any[] = []

  for (const node of scopedNodes) {
    try {
      // Skip non-interactive candidates heuristically (e.g., purely decorative)
      const isInteractive = node.onClick || node.interactive || node.role === 'button'
      if (!isInteractive) continue

      // Prefer framer.getRect if available
      let rect: any = null
      try {
        rect = await framer.getRect?.(node.id)
      } catch (e) {
        rect = null
      }

      const width = rect?.width ?? node.width
      const height = rect?.height ?? node.height

      if (!width || !height) continue

      if (width < 44 || height < 44) {
        results.push({
          title: 'Small touch target',
          type: 'touch-target',
          detail: `Element is ${Math.round(width)}×${Math.round(height)}px — recommended ≥ 44×44px`,
          nodeId: node.id,
          severity: 'warning'
        })
      }
    } catch (err) {
      console.warn('touch target scan error', err)
    }
  }

  return results
}
