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
    <div className="glass-panel" style={{
      width: '320px', flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      maxHeight: 'calc(100vh - 120px)',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(16px)',
      borderTop: '0', borderBottom: '0',
      boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
      overflow: 'visible'
    }}>
      {/* Column header */}
      <div style={{ padding: '1.2rem 1.2rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)' }}>
              {column.title}
            </h3>
            <span style={{
              fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px',
              background: 'var(--primary)', color: 'white',
              fontWeight: '700', boxShadow: '0 2px 5px rgba(99,102,241,0.3)'
            }}>
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => { if (confirm(`Delete "${column.title}"?`)) deleteColumn(column.id) }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-tertiary)', cursor: 'pointer',
              fontSize: '18px', padding: '4px 8px', borderRadius: '6px',
              transition: 'background 0.2s, color 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--danger-bg)'
              e.currentTarget.style.color = 'var(--danger)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = 'var(--text-tertiary)'
            }}
          >×</button>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              flex: 1, height: '6px', borderRadius: '3px',
              background: 'var(--surface-2)', overflow: 'hidden',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                background: 'var(--gradient-main)',
                width: `${progress}%`,
                transition: 'width 0.4s ease-out'
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{progress}%</span>
          </div>
        )}
      </div>

      {/* Tasks list */}
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          style={{
            flex: 1, overflowY: 'auto',
            padding: '1rem 0.5rem',
            display: 'flex', flexDirection: 'column', gap: '10px',
            minHeight: '80px',
            scrollBehavior: 'smooth'
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
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
        {showInput ? (
          <form onSubmit={handleAddTask} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              autoFocus value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="input-modern"
              style={{ fontSize: '0.9rem', padding: '0.8rem' }}
            />
            <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
              <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}
                className="input-modern"
                style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="input-modern"
                style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button type="submit" disabled={adding} className="btn-primary" style={{ flex: 1, padding: '0.6rem' }}>
                {adding ? 'Adding...' : 'Save Task'}
              </button>
              <button type="button" onClick={() => setShowInput(false)} className="btn-secondary" style={{ padding: '0.6rem 1rem' }}>
                ✕
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowInput(true)} 
            style={{
              width: '100%', padding: '0.9rem', borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--border)',
              background: 'transparent', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.color = 'var(--primary)'
              e.currentTarget.style.background = 'rgba(99,102,241,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-secondary)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            + Add New Task
          </button>
        )}
      </div>
    </div>
  )
}