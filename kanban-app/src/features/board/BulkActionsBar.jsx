import { useState } from 'react'
import { useBoardStore } from './useBoardStore'

export default function BulkActionsBar({ selectedTasks, columns, onClearSelection }) {
  const { moveTask } = useBoardStore()
  const [isMoving, setIsMoving] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState('')

  if (selectedTasks.length === 0) return null

  const handleMoveToColumn = async () => {
    if (!selectedColumn) return
    setIsMoving(true)
    try {
      // Move all selected tasks to the new column
      for (const task of selectedTasks) {
        await moveTask(task.id, task.column_id, selectedColumn, 0)
      }
      onClearSelection()
      setSelectedColumn('')
    } finally {
      setIsMoving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete ${selectedTasks.length} task(s)? This action cannot be undone.`)) return
    setIsMoving(true)
    try {
      const { deleteTask } = useBoardStore.getState()
      for (const task of selectedTasks) {
        await deleteTask(task.id, task.column_id)
      }
      onClearSelection()
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--primary)',
      color: 'white',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 20,
      animation: 'slideUp 0.2s ease-out'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>
          ✓ {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'} selected
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          <option value="">Move to...</option>
          {columns.map(col => (
            <option key={col.id} value={col.id}>
              {col.title}
            </option>
          ))}
        </select>

        <button
          onClick={handleMoveToColumn}
          disabled={!selectedColumn || isMoving}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            cursor: isMoving || !selectedColumn ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.15s',
            opacity: !selectedColumn || isMoving ? 0.5 : 1
          }}
          onMouseEnter={e => !isMoving && selectedColumn && (e.target.style.background = 'rgba(255,255,255,0.3)')}
          onMouseLeave={e => (e.target.style.background = 'rgba(255,255,255,0.2)')}
        >
          {isMoving ? 'Moving...' : 'Move'}
        </button>

        <button
          onClick={handleDelete}
          disabled={isMoving}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(239,68,68,0.2)',
            color: '#fca5a5',
            cursor: isMoving ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => !isMoving && (e.target.style.background = 'rgba(239,68,68,0.3)')}
          onMouseLeave={e => (e.target.style.background = 'rgba(239,68,68,0.2)')}
        >
          {isMoving ? 'Deleting...' : '🗑 Delete'}
        </button>

        <button
          onClick={onClearSelection}
          disabled={isMoving}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: 'white',
            cursor: isMoving ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
