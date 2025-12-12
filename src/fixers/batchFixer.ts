import { framer } from 'framer-plugin'
import * as contrastFixer from './contrastFixer'
import * as altFixer from './altTextFixer'
import * as touchFixer from './touchTargetFixer'
import { restoreAttributes } from './serializers'

const HISTORY_KEY = 'fixHistory'

export async function batchFix(
  issues: any[],
  onProgress?: (p: { index: number; total: number; applied: number }) => void
) {
  if (!issues || issues.length === 0) {
    framer.notify('No issues to fix', { variant: 'info' })
    return { applied: 0 }
  }

  const changes: any[] = []
  let applied = 0
  const total = issues.length

  for (let i = 0; i < total; i++) {
    const issue = issues[i]
    try {
      if (!issue.nodeId) continue

      let res: any = null
      if (issue.type === 'contrast') {
        res = await contrastFixer.fixContrast(issue.nodeId)
        if (res?.changed) {
          changes.push(res)
          applied++
        }
      } else if (issue.type === 'alt-text') {
        res = await altFixer.generateAltTextForNode(issue.nodeId)
        if (res) {
          // res contains nodeId, key, previousValue, newValue
          changes.push({ nodeId: res.nodeId, key: res.key, previousValue: res.previousValue, applied: { pluginData: res.newValue } })
          applied++
        }
      } else if (issue.type === 'touch-target') {
        res = await touchFixer.fixTouchTarget(issue.nodeId)
        if (res?.changed) {
          changes.push(res)
          applied++
        }
      }
    } catch (err) {
      console.warn('batch fix error for issue', issue, err)
    }

    if (onProgress) onProgress({ index: i + 1, total, applied })
  }

  // Persist last batch for undo
  try {
    // Read existing history
    const raw = await framer.getPluginData?.(HISTORY_KEY)
    let history = []
    try {
      history = raw ? JSON.parse(raw) : []
    } catch (e) {
      history = []
    }

    const entry = { id: Date.now(), timestamp: new Date().toISOString(), changes }
    history.push(entry)
    // Cap history length
    if (history.length > 50) history = history.slice(history.length - 50)
    await framer.setPluginData?.(HISTORY_KEY, JSON.stringify(history))
  } catch (e) {
    console.warn('failed to persist last batch', e)
  }

  framer.notify(`Batch fix complete — ${applied} changes applied`, { variant: 'success' })
  return { applied }
}

export async function undoLastBatch() {
  const raw = await framer.getPluginData?.(HISTORY_KEY)
  if (!raw) {
    framer.notify('No history to undo', { variant: 'info' })
    return { undone: 0 }
  }

  let history: any[] = []
  try {
    history = JSON.parse(raw)
  } catch (e) {
    framer.notify('Failed to parse history', { variant: 'error' })
    return { undone: 0 }
  }

  if (!history || history.length === 0) {
    framer.notify('No history to undo', { variant: 'info' })
    return { undone: 0 }
  }

  const entry = history.pop()
  const changes = entry?.changes || []

  let undone = 0
  for (const c of changes) {
    try {
      if (!c.nodeId) continue

      // Restore plugin data if present
      if (c.key) {
        await framer.setPluginData?.(c.key, c.previousValue ?? '')
        undone++
        continue
      }

      // Restore attributes object if present
      if (c.previous) {
        // use serializer restore to handle complex fills/gradients
        await restoreAttributes(framer, c.nodeId, c.previous)
        undone++
        continue
      }

      // Generic applied.pluginData case
      if (c.applied && c.applied.pluginData) {
        const key = `alt-${c.nodeId}`
        await framer.setPluginData?.(key, c.previousValue ?? '')
        undone++
        continue
      }
    } catch (err) {
      console.warn('undo error', err)
    }
  }

  // Persist updated history
  try {
    await framer.setPluginData?.(HISTORY_KEY, JSON.stringify(history))
  } catch (e) {
    console.warn('failed to persist history after undo', e)
  }

  framer.notify(`Undo complete — ${undone} changes reverted`, { variant: 'success' })
  return { undone }
}
