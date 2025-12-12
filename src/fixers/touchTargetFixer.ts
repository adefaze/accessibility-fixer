import { framer } from 'framer-plugin'

export async function fixTouchTarget(nodeId: string) {
  const node = await framer.getNode?.(nodeId)
  if (!node) throw new Error('Node not found')

  let rect = null
  try {
    rect = await (framer as any).getRect?.(nodeId)
  } catch (e) {
    rect = null
  }

  const width = rect?.width ?? node.width
  const height = rect?.height ?? node.height

  const newWidth = Math.max(width || 0, 44)
  const newHeight = Math.max(height || 0, 44)

  if (newWidth !== width || newHeight !== height) {
    const previous = {
      // capture layout attributes
      width: node.width ?? null,
      height: node.height ?? null,
      padding: node.padding ?? null
    }
    await framer.setAttributes?.(nodeId, { width: newWidth, height: newHeight })
    framer.notify('Touch target adjusted', { variant: 'success' })
    return { nodeId, changed: true, previous, applied: { width: newWidth, height: newHeight } }
  }

  return { nodeId, changed: false }
}
