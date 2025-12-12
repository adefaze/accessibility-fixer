import React, { useMemo, useState } from 'react'
import ScanControls from './components/ScanControls'
import IssueList from './components/IssueList'
import './styles.css'

export default function App() {
  const [issues, setIssues] = useState<any[]>([])

  const stats = useMemo(() => {
    const total = issues.length
    const critical = issues.filter(issue => issue.severity === 'critical').length
    const warnings = issues.filter(issue => issue.severity === 'warning').length
    return { total, critical, warnings }
  }, [issues])

  return (
    <div className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Accessibility Toolkit</p>
        <h1>Audit &amp; Fix issues with confidence</h1>
        <p>
          Run automated WCAG 2.1 scans, triage results, and apply one-click fixes — all without leaving the canvas.
        </p>

        <div className="metric-grid">
          <div className="metric-card">
            <div className="metric-value">{stats.total}</div>
            <div className="metric-label">Open issues</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.critical}</div>
            <div className="metric-label">Critical</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.warnings}</div>
            <div className="metric-label">Warnings</div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Scan &amp; remediate</h2>
          <p className="muted">Choose a scope, scan for issues, then batch-fix safe suggestions.</p>
        </div>
        <ScanControls onScanResults={(res: any[]) => setIssues(res)} />
      </section>

      <section className="card scroll-fade">
        <div className="card-header">
          <h2>Issue queue</h2>
          <p className="muted">
            Review, zoom to the source layer, and run targeted fixes. Re-scan to keep your audit current.
          </p>
        </div>
        <IssueList issues={issues} />
      </section>
    </div>
  )
}
