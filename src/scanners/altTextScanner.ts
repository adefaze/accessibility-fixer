import { framer } from 'framer-plugin'
import { filterNodesByScope, ScanScope } from '../utils/scope'

export async function scanAltText(scope: ScanScope) {
  // Find nodes that have backgroundImage attribute
  const nodes = (await framer.getNodesWithAttribute?.('backgroundImage')) || []
  const scopedNodes = await filterNodesByScope(nodes, scope)
  const results: any[] = []

  for (const node of scopedNodes) {
    try {
      const bg = node.backgroundImage
      if (!bg) continue

      // Check stored plugin alt text
      const key = `alt-${node.id}`
      const stored = await framer.getPluginData?.(key)
      const hasAlt = stored && stored.trim().length > 0

      if (!hasAlt) {
        results.push({
          title: 'Missing alt text',
          type: 'alt-text',
          detail: 'Image missing alt description',
          nodeId: node.id,
          severity: 'warning'
        })
      }
    } catch (err) {
      console.warn('altText scan error', err)
    }
  }

  return results
}
