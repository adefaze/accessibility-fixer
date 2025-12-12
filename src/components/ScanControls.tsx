import React, { ChangeEvent, useMemo, useState } from 'react'
import * as contrastScanner from '../scanners/contrastScanner'
import * as altTextScanner from '../scanners/altTextScanner'
import * as touchScanner from '../scanners/touchTargetScanner'
import * as batchFixer from '../fixers/batchFixer'
import { framer } from 'framer-plugin'
import ConfirmModal from './ConfirmModal'

export default function ScanControls({ onScanResults }: { onScanResults: (r: any[]) => void }) {
  const [scope, setScope] = useState<'selection' | 'page' | 'project'>('page')
  const [scanning, setScanning] = useState(false)
  const [batchInProgress, setBatchInProgress] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, applied: 0 })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingIssues, setPendingIssues] = useState<any[]>([])

  async function runScan(explicitScope?: typeof scope) {
    const targetScope = explicitScope ?? scope
    if (explicitScope && explicitScope !== scope) {
      setScope(explicitScope)
    }
    setScanning(true)
    framer.notify('Starting scan...', { variant: 'info' })
    try {
      const promises = [
        contrastScanner.scanContrast(targetScope),
        altTextScanner.scanAltText(targetScope),
        touchScanner.scanTouchTargets(targetScope)
      ]

      const resultsArr = await Promise.all(promises)
      const merged = resultsArr.flat()
      onScanResults(merged)
      framer.notify(`Scan complete — ${merged.length} issues found`, { variant: 'success' })
    } catch (err: any) {
      framer.notify(`Scan error: ${err?.message || err}`, { variant: 'error' })
    } finally {
      setScanning(false)
    }
  }

  async function runBatchFix() {
    // Prepare and show confirmation modal
    try {
      setBatchInProgress(false)
      setBatchProgress({ current: 0, total: 0, applied: 0 })

      const resultsArr = await Promise.all([
        contrastScanner.scanContrast(scope),
        altTextScanner.scanAltText(scope),
        touchScanner.scanTouchTargets(scope)
      ])
      const merged = resultsArr.flat()
      setPendingIssues(merged)
      setConfirmOpen(true)
    } catch (err: any) {
      framer.notify(`Batch prepare error: ${err?.message || err}`, { variant: 'error' })
    }
  }

  async function confirmAndRunBatch() {
    setConfirmOpen(false)
    if (!pendingIssues || pendingIssues.length === 0) {
      framer.notify('No issues to fix', { variant: 'info' })
      return
    }

    setBatchInProgress(true)
    setBatchProgress({ current: 0, total: pendingIssues.length, applied: 0 })
    try {
      await batchFixer.batchFix(pendingIssues, ({ index, total: t, applied }) => {
        setBatchProgress({ current: index, total: t, applied })
      })
    } catch (err: any) {
      framer.notify(`Batch fix error: ${err?.message || err}`, { variant: 'error' })
    } finally {
      setBatchInProgress(false)
      setPendingIssues([])
      setBatchProgress({ current: 0, total: 0, applied: 0 })
    }
  }

  async function undoLast() {
    try {
      const res = await batchFixer.undoLastBatch()
      framer.notify(`Undid ${res.undone} changes`, { variant: 'success' })
    } catch (err: any) {
      framer.notify(`Undo error: ${err?.message || err}`, { variant: 'error' })
    }
  }

  const progressPercent = useMemo(() => {
    if (!batchProgress.total) return 0
    return Math.round((batchProgress.current / batchProgress.total) * 100)
  }, [batchProgress])

  const scopeOptions: Array<{ value: typeof scope; label: string; hint: string }> = [
    { value: 'selection', label: 'Selection', hint: 'Focus on highlighted layers' },
    { value: 'page', label: 'Page', hint: 'Audit the current page' },
    { value: 'project', label: 'Project', hint: 'Scan every page' }
  ]

  return (
    <div>
      <div className="scope-switch">
        {scopeOptions.map(opt => (
          <button
            key={opt.value}
            className={`scope-option ${scope === opt.value ? 'is-active' : ''}`}
            onClick={() => setScope(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="muted" style={{ marginBottom: 12 }}>
        {scopeOptions.find(opt => opt.value === scope)?.hint}
      </p>

      <div className="button-row">
        <button className="btn btn-primary" onClick={() => runScan()} disabled={scanning}>
          {scanning ? 'Scanning…' : 'Run scan'}
        </button>
        <button className="btn btn-ghost" onClick={() => runScan('project')} disabled={scanning}>
          Full project scan
        </button>
      </div>

      <div className="batch-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <p className="muted" style={{ margin: 0 }}>
              Ready to apply safe fixes in bulk?
            </p>
            <small style={{ color: 'rgba(245,247,251,0.55)' }}>Auto-fixes create a history so you can undo anytime.</small>
          </div>
          <div className="button-row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={runBatchFix} disabled={batchInProgress}>
              {batchInProgress ? 'Batch fixing…' : 'Batch fix all'}
            </button>
            <button className="btn btn-ghost" onClick={undoLast} disabled={batchInProgress}>
              Undo last
            </button>
          </div>
        </div>

        {batchInProgress && (
          <div className="progress">
            <div className="muted" style={{ fontSize: 12 }}>
              Applying fixes ({batchProgress.applied} applied)
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Confirm batch fix"
        message={`This will attempt to auto-fix ${pendingIssues.length} issues. Continue?`}
        onConfirm={confirmAndRunBatch}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
