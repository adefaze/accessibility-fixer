import React from 'react'

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel
}: {
  open: boolean
  title?: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={onCancel} />
      <div className="modal-panel">
        {title && <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>}
        <div className="muted" style={{ marginBottom: 12, color: '#f5f7fb' }}>
          {message}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
