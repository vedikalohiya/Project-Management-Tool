import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTaskStore } from '../tasks/useTaskStore'

const priorityConfig = {
  low: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', label: 'Low' },
  medium: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'Medium' },
  high: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'High' }
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  }

  const p = task.priority ? priorityConfig[task.priority] : null
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()
  const assigneeInitials = task.assignee?.email?.substring(0, 2).toUpperCase() || '?'
  const isCompleted = Boolean(task.completed)

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        className={isOverlay ? "glass-panel" : "glass-card"}
        style={{
          padding: '1rem',
          border: '1px solid',
          borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--surface)',
          opacity: isCompleted ? 0.75 : 1,
          cursor: isOverlay ? 'grabbing' : 'grab',
          boxShadow: isOverlay ? '0 15px 35px rgba(0,0,0,0.2)' : 'var(--shadow-sm)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOverlay ? 'scale(1.05) rotate(2deg)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectClick}
            style={{ 
              cursor: 'pointer', width: '18px', height: '18px', marginTop: '2px', flexShrink: 0,
              accentColor: 'var(--primary)'
            }}
            onClick={e => e.stopPropagation()}
          />
          <p
            onClick={(e) => { e.stopPropagation(); openTask({ ...task, column_id: columnId }) }}
            style={{
              fontSize: '0.95rem', fontWeight: '600',
              color: 'var(--text)', marginBottom: 0,
              lineHeight: '1.4', cursor: 'pointer', flex: 1,
              textDecoration: isCompleted ? 'line-through' : 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
          >
            {isCompleted ? '✅ ' : ''}{task.title}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: 'auto' }}>
          {p && (
            <span style={{
              fontSize: '0.7rem', padding: '3px 8px', borderRadius: '12px',
              background: p.bg, color: p.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {p.label}
            </span>
          )}
          {task.due_date && (
            <span style={{
              fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px',
              background: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface-2)',
              color: isOverdue ? '#ef4444' : 'var(--text-secondary)',
              fontWeight: '600', border: '1px solid var(--border)'
            }}>
              ⏳ {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
            </span>
          )}
          {task.label && (
            <span style={{
              fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), #a855f7)', color: 'white', fontWeight: '600',
              boxShadow: '0 2px 5px rgba(99,102,241,0.3)'
            }}>
              {task.label}
            </span>
          )}
          <div style={{ flex: 1 }}></div>
          {task.assignee && (
            <div style={{
              fontSize: '0.75rem', borderRadius: '50%',
              background: 'var(--gradient-main)', color: 'white', fontWeight: '700',
              width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
              title: task.assignee.email
            }}>
              {assigneeInitials}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}