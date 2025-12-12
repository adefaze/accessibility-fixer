import React from 'react'
import { framer } from 'framer-plugin'
import * as contrastFixer from '../fixers/contrastFixer'
import * as altFixer from '../fixers/altTextFixer'
import * as touchFixer from '../fixers/touchTargetFixer'

export default function IssueList({ issues }: { issues: any[] }) {
  if (!issues || issues.length === 0) {
    return <div className="empty-state">No issues yet. Run a scan to populate this queue.</div>
  }

  async function handleFix(issue: any) {
    try {
      if (!issue?.nodeId) throw new Error('Missing nodeId')

      if (issue.type === 'contrast') {
        await contrastFixer.fixContrast(issue.nodeId)
      } else if (issue.type === 'alt-text') {
        await altFixer.generateAltTextForNode(issue.nodeId)
      } else if (issue.type === 'touch-target') {
        await touchFixer.fixTouchTarget(issue.nodeId)
      } else {
        framer.notify('No auto-fix available for this issue type', { variant: 'info' })
        return
      }

      framer.notify('Fix applied. Consider re-running the scan.', { variant: 'success' })
    } catch (err: any) {
      framer.notify(`Fix failed: ${err?.message || err}`, { variant: 'error' })
    }
  }

  const severityClass = (severity?: string) => {
    if (severity === 'critical') return 'badge badge-critical'
    if (severity === 'warning') return 'badge badge-warning'
    return 'badge badge-info'
  }

  const readableType = (type?: string) => {
    if (!type) return 'Issue'
    return type.replace(/-/g, ' ')
  }

  return (
    <div className="issue-list">
      {issues.map((issue, i) => (
        <article key={`${issue.nodeId ?? i}-${i}`} className="issue-card">
          <div className="issue-header">
            <span className="issue-title">{issue.title || 'Unnamed issue'}</span>
            <span className={severityClass(issue.severity)}>{issue.severity || 'info'}</span>
          </div>
          <div className="issue-detail">{issue.detail || 'Review this node for accessibility improvements.'}</div>
          <div className="issue-meta">
            <span>{readableType(issue.type)}</span>
            {issue.nodeId && <span>Layer ID: {issue.nodeId}</span>}
          </div>
          <div className="issue-actions">
            <button
              className="btn btn-ghost"
              onClick={() => framer.navigateTo(issue.nodeId, { select: true, zoom: true })}
            >
              Jump to layer
            </button>
            <button className="btn btn-secondary" onClick={() => handleFix(issue)}>
              Apply fix
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
