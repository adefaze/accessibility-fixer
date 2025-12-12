import { framer } from 'framer-plugin'

export type ScanScope = 'selection' | 'page' | 'project'

async function getSelectionNodes() {
  try {
    const selection = await framer.getSelection?.()
    return Array.isArray(selection) ? selection : []
  } catch (err) {
    console.warn('getSelection error', err)
    return []
  }
}

async function getParent(node: any) {
  if (!node?.getParent) return null
  try {
    return await node.getParent()
  } catch (err) {
    return null
  }
}

export async function filterNodesByScope(nodes: any[], scope: ScanScope) {
  if (!Array.isArray(nodes) || nodes.length === 0) return []
  if (scope === 'project') return nodes

  const selection = await getSelectionNodes()
  const selectionIds = new Set(selection.map((n: any) => n?.id).filter(Boolean))

  if (scope === 'selection') {
    if (!selectionIds.size) return []
    const filtered: any[] = []
    for (const node of nodes) {
      if (!node) continue
      if (selectionIds.has(node.id)) {
        filtered.push(node)
        continue
      }
      const parent = await getParent(node)
      if (parent && selectionIds.has(parent.id)) {
        filtered.push(node)
      }
    }
    return filtered
  }

  if (scope === 'page') {
    const pageIds = new Set(
      selection
        .map((n: any) => n?.pageId || n?.page?.id || n?.parent?.pageId)
        .filter(Boolean)
    )

    if (!pageIds.size) {
      try {
        const canvasRoot: any = await framer.getCanvasRoot?.()
        const fallbackId = canvasRoot?.pageId || canvasRoot?.id
        if (fallbackId) pageIds.add(fallbackId)
      } catch (err) {
        console.warn('getCanvasRoot error', err)
      }
    }

    if (!pageIds.size) {
      // No useful context, default to returning all nodes to avoid missing issues
      return nodes
    }

    const filtered: any[] = []
    for (const node of nodes) {
      if (!node) continue
      const nodePageId =
        node.pageId ||
        node.page?.id ||
        node.parent?.pageId ||
        node.parent?.page?.id ||
        null

      if (nodePageId && pageIds.has(nodePageId)) {
        filtered.push(node)
        continue
      }

      const parent = await getParent(node)
      const parentPageId = parent?.pageId || parent?.page?.id || null
      if (parentPageId && pageIds.has(parentPageId)) {
        filtered.push(node)
      }
    }

    return filtered
  }

  return nodes
}
