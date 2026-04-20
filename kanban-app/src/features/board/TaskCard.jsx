import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTaskStore } from '../tasks/useTaskStore'

const priorityConfig = {
  low: { color: '#22c55e', bg: '#f0fdf4', label: 'Low' },
  medium: { color: '#f59e0b', bg: '#fffbeb', label: 'Medium' },
  high: { color: '#ef4444', bg: '#fef2f2', label: 'High' }
}

export default function TaskCard({ task, columnId, isOverlay, isSelected = false, onSelect }) {
  const { openTask } = useTaskStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task, columnId }
  })

  const handleSelectClick = (e) => {
    e.stopPropagation()
    onSelect?.({ ...task, column_id: columnId }, !isSelected)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const p = task.priority ? priorityConfig[task.priority] : null
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()
  const assigneeInitials = task.assignee?.email?.substring(0, 2).toUpperCase() || '?'
  const isCompleted = Boolean(task.completed)

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          border: '1px solid var(--border)',
          borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
          backgroundColor: isSelected ? 'var(--primary)' + '08' : 'var(--surface)',
          opacity: isCompleted ? 0.78 : 1,
          cursor: isOverlay ? 'grabbing' : 'grab',
          boxShadow: isOverlay ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
          transition: 'box-shadow 0.15s'
        }}
        onMouseEnter={e => !isOverlay && (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
        onMouseLeave={e => !isOverlay && (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectClick}
            style={{ cursor: 'pointer', width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }}
            onClick={e => e.stopPropagation()}
          />
          <p
          onClick={(e) => { e.stopPropagation(); openTask({ ...task, column_id: columnId }) }}
          style={{
            fontSize: '0.875rem', fontWeight: '500',
            color: 'var(--text)', marginBottom: 0,
            lineHeight: '1.4', cursor: 'pointer'
          }}
        >
          {isCompleted ? '✓ ' : ''}{task.title}
        </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {p && (
            <span style={{
              fontSize: '11px', padding: '2px 7px', borderRadius: '20px',
              background: p.bg, color: p.color, fontWeight: '500'
            }}>
              {p.label}
            </span>
          )}
          {task.due_date && (
            <span style={{
              fontSize: '11px', padding: '2px 7px', borderRadius: '20px',
              background: isOverdue ? '#fef2f2' : 'var(--surface-2)',
              color: isOverdue ? '#ef4444' : 'var(--text-secondary)',
              fontWeight: '500'
            }}>
              📅 {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
          {task.label && (
            <span style={{
              fontSize: '11px', padding: '2px 7px', borderRadius: '20px',
              background: 'var(--primary)', color: 'white', fontWeight: '500'
            }}>
              {task.label}
            </span>
          )}
          {task.assignee && (
            <span style={{
              fontSize: '11px', padding: '2px 7px', borderRadius: '50%',
              background: '#6366f1', color: 'white', fontWeight: '600',
              width: '24px', height: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              title: task.assignee.email
            }}>
              {assigneeInitials}
            </span>
          )}
          {isCompleted && (
            <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '20px', background: '#dcfce7', color: '#166534', fontWeight: '600' }}>
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  )
}