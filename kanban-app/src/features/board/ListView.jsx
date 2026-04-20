import { useState } from 'react'
import { useTaskStore } from '../tasks/useTaskStore'

export default function ListView({ tasks, columns }) {
  const { openTask } = useTaskStore()
  const [sortBy, setSortBy] = useState('priority') // priority, dueDate, assignee
  const [filterPriority, setFilterPriority] = useState('')

  const priorityColors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
  const priorityOrder = { high: 0, medium: 1, low: 2 }

  // Flatten and sort tasks
  let allTasks = Object.values(tasks).flat()

  if (filterPriority) {
    allTasks = allTasks.filter(t => t.priority === filterPriority)
  }

  if (sortBy === 'priority') {
    allTasks.sort((a, b) => priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'])
  } else if (sortBy === 'dueDate') {
    allTasks.sort((a, b) => {
      const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity
      const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity
      return aDate - bDate
    })
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', marginRight: '6px' }}>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{
            padding: '6px 10px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', cursor: 'pointer'
          }}>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', fontWeight: '600', marginRight: '6px' }}>Filter:</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{
            padding: '6px 10px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', cursor: 'pointer'
          }}>
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div style={{
        overflowX: 'auto',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)' }}>Title</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', width: '100px' }}>Priority</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', width: '120px' }}>Due Date</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', width: '100px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--text)', width: '120px' }}>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {allTasks.map((task, idx) => {
              const column = columns.find(c => c.id === task.column_id)
              const isOverdue = task.due_date && new Date(task.due_date) < new Date()
              const assigneeInitials = task.assignee?.email?.substring(0, 2).toUpperCase() || '—'
              
              return (
                <tr
                  key={task.id}
                  onClick={() => openTask(task)}
                  style={{
                    borderBottom: idx < allTasks.length - 1 ? '1px solid var(--border)' : 'none',
                    background: 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                >
                  <td style={{ padding: '12px', fontWeight: '500', color: 'var(--text)' }}>
                    {task.title}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontSize: '11px', padding: '4px 8px', borderRadius: '20px',
                      background: priorityColors[task.priority || 'medium'] + '20',
                      color: priorityColors[task.priority || 'medium'],
                      fontWeight: '600', textTransform: 'capitalize'
                    }}>
                      {task.priority || 'medium'}
                    </span>
                  </td>
                  <td style={{
                    padding: '12px',
                    color: isOverdue ? '#ef4444' : 'var(--text-secondary)',
                    fontWeight: isOverdue ? '600' : 'normal'
                  }}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary)' + '20', color: 'var(--primary)',
                      fontWeight: '600', textTransform: 'capitalize'
                    }}>
                      {column?.title || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {task.assignee ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '28px', height: '28px',
                        borderRadius: '50%', background: '#6366f1',
                        color: 'white', fontWeight: '600', fontSize: '11px',
                        title: task.assignee.email
                      }}>
                        {assigneeInitials}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {allTasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
          <p>No tasks found</p>
        </div>
      )}
    </div>
  )
}
