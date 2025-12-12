// Attribute serializers to capture complex attribute types for undo/restore
export function captureAttributes(node: any, keys: string[] = []) {
  const data: any = {}
  try {
    for (const k of keys) {
      // Attempt to read property safely
      const v = node[k]
      // Deep clone common structures
      data[k] = v === undefined ? undefined : JSON.parse(JSON.stringify(v))
    }
  } catch (e) {
    // Fallback: on any serialization failure, capture a shallow set
    for (const k of keys) {
      data[k] = node[k]
    }
  }

  // Also capture minimal component/instance metadata if present
  try {
    if (node.componentId) data.componentId = node.componentId
    if (node.instanceId) data.instanceId = node.instanceId
  } catch (e) {}

  return data
}

export async function restoreAttributes(framer: any, nodeId: string, previous: any) {
  if (!previous) return
  try {
    // Use setAttributes to restore the previous attribute object
    await framer.setAttributes?.(nodeId, previous)
  } catch (e) {
    console.warn('restoreAttributes failed', e)
  }
}
