import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useBoardStore } from './useBoardStore'
import TaskCard from './TaskCard'

export default function Column({ column, tasks, selectedTasks = [], onTaskSelect }) {
  const { addTask, deleteColumn } = useBoardStore()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [adding, setAdding] = useState(false)

  const { setNodeRef } = useDroppable({ id: column.id })

  const completedTasks = tasks.filter(t => t.completed === true).length
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    setAdding(true)
    try {
      await addTask(column.id, newTaskTitle.trim(), {
        priority: newTaskPriority,
        due_date: newTaskDueDate || null
      })
      setNewTaskTitle('')
      setNewTaskPriority('medium')
      setNewTaskDueDate('')
      setShowInput(false)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div style={{
      width: '300px', flexShrink: 0,
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      maxHeight: 'calc(100vh - 140px)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Column header */}
      <div style={{ padding: '0.875rem 1rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text)' }}>
              {column.title}
            </h3>
            <span style={{
              fontSize: '11px', padding: '2px 7px', borderRadius: '20px',
              background: 'var(--border)', color: 'var(--text-secondary)',
              fontWeight: '600'
            }}>
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => { if (confirm(`Delete "${column.title}"?`)) deleteColumn(column.id) }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-tertiary)', cursor: 'pointer',
              fontSize: '16px', padding: '2px 6px', borderRadius: '4px'
            }}
          >×</button>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              flex: 1, height: '4px', borderRadius: '2px',
              background: 'var(--border)', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                background: 'var(--primary)',
                width: `${progress}%`,
                transition: 'width 0.3s'
              }} />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{progress}%</span>
          </div>
        )}
      </div>

      {/* Tasks list */}
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          style={{
            flex: 1, overflowY: 'auto',
            padding: '0.75rem',
            display: 'flex', flexDirection: 'column', gap: '6px',
            minHeight: '60px'
          }}
        >
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
              isSelected={selectedTasks.some(t => t.id === task.id)}
              onSelect={onTaskSelect}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add task */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
        {showInput ? (
          <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input
              autoFocus value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              style={{
                padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '0.875rem'
              }}
            />
            <div style={{ display: 'flex', gap: '4px', fontSize: '12px' }}>
              <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)', color: 'var(--text)',
                  fontSize: '0.8rem', cursor: 'pointer'
                }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)', color: 'var(--text)',
                  fontSize: '0.8rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button type="submit" disabled={adding} style={{
                flex: 1, padding: '6px', borderRadius: 'var(--radius-sm)',
                background: 'var(--primary)', color: 'white',
                border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500'
              }}>
                {adding ? 'Adding...' : 'Add task'}
              </button>
              <button type="button" onClick={() => setShowInput(false)} style={{
                padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)', cursor: 'pointer', fontSize: '0.875rem'
              }}>✕</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowInput(true)} style={{
            width: '100%', padding: '7px', borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border)',
            background: 'transparent', cursor: 'pointer',
            fontSize: '0.875rem', color: 'var(--text-tertiary)',
            transition: 'all 0.15s'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.color = 'var(--primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-tertiary)'
            }}
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  )
}