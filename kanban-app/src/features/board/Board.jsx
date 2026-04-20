import { useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { useBoardStore } from './useBoardStore'
import { supabase } from '../../lib/supabase'
import Column from './Column'
import TaskCard from './TaskCard'
import TaskDetail from '../tasks/TaskDetail'
import ListView from './ListView'
import CalendarView from './CalendarView'
import FilterBar from './FilterBar'
import TaskStatistics from './TaskStatistics'
import BulkActionsBar from './BulkActionsBar'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useBoardHistoryStore } from './useBoardHistoryStore'
import { useNotificationStore } from '../notifications/useNotificationStore'

export default function Board({ project }) {
  const {
    columns,
    tasks,
    loading,
    fetchBoard,
    addColumn,
    moveTask,
    getSnapshot,
    restoreSnapshot
  } = useBoardStore()

  const canUndo = useBoardHistoryStore((state) => state.past.length > 0)
  const canRedo = useBoardHistoryStore((state) => state.future.length > 0)
  const undo = useBoardHistoryStore((state) => state.undo)
  const redo = useBoardHistoryStore((state) => state.redo)
  const clearHistory = useBoardHistoryStore((state) => state.clear)
  const pushNotification = useNotificationStore((state) => state.push)

  const [activeTask, setActiveTask] = useState(null)
  const [activeColumnId, setActiveColumnId] = useState(null)
  const [viewType, setViewType] = useState('kanban')
  const [filteredTasks, setFilteredTasks] = useState({})
  const [showColInput, setShowColInput] = useState(false)
  const [newColTitle, setNewColTitle] = useState('')
  const [addingCol, setAddingCol] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState([])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    clearHistory()
  }, [project?.id, clearHistory])

  useEffect(() => {
    if (project?.id) fetchBoard(project.id)
  }, [project?.id, fetchBoard])

  useEffect(() => {
    setFilteredTasks(tasks)
  }, [tasks])

  useEffect(() => {
    if (!project?.id) return

    const describeTaskEvent = (payload) => {
      const taskTitle = payload.new?.title || payload.old?.title || 'Task'
      if (payload.eventType === 'INSERT') {
        return { title: 'Task created', message: `"${taskTitle}" was added.` , type: 'success' }
      }
      if (payload.eventType === 'UPDATE') {
        return { title: 'Task updated', message: `"${taskTitle}" was updated.`, type: 'info' }
      }
      return { title: 'Task deleted', message: `"${taskTitle}" was removed.`, type: 'warning' }
    }

    const describeColumnEvent = (payload) => {
      const columnTitle = payload.new?.title || payload.old?.title || 'Column'
      if (payload.eventType === 'INSERT') {
        return { title: 'Column created', message: `"${columnTitle}" was added.`, type: 'success' }
      }
      if (payload.eventType === 'UPDATE') {
        return { title: 'Column updated', message: `"${columnTitle}" was updated.`, type: 'info' }
      }
      return { title: 'Column deleted', message: `"${columnTitle}" was removed.`, type: 'warning' }
    }

    const channel = supabase
      .channel('board-' + project.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        fetchBoard(project.id)
        const notification = describeTaskEvent(payload)
        pushNotification(notification)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'columns' }, (payload) => {
        fetchBoard(project.id)
        const notification = describeColumnEvent(payload)
        pushNotification(notification)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [project?.id, fetchBoard])

  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      handler: () => {
        const searchInput = document.querySelector('input[placeholder*="Search tasks"]')
        searchInput?.focus()
        if (typeof searchInput?.select === 'function') searchInput.select()
      }
    },
    {
      key: 'n',
      ctrlKey: true,
      handler: () => {
        if (viewType === 'kanban') setShowColInput(true)
      }
    },
    {
      key: 'z',
      ctrlKey: true,
      shiftKey: false,
      handler: () => undo(getSnapshot(), restoreSnapshot)
    },
    {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      handler: () => redo(getSnapshot(), restoreSnapshot)
    },
    {
      key: 'y',
      ctrlKey: true,
      handler: () => redo(getSnapshot(), restoreSnapshot)
    },
    {
      key: 'Escape',
      handler: () => {
        setShowColInput(false)
      }
    }
  ])

  const handleTaskSelect = (task, isSelected) => {
    setSelectedTasks((current) => {
      if (isSelected) {
        if (current.some((selectedTask) => selectedTask.id === task.id)) return current
        return [...current, task]
      }
      return current.filter((selectedTask) => selectedTask.id !== task.id)
    })
  }

  const handleClearSelection = () => {
    setSelectedTasks([])
  }

  const handleDragStart = ({ active }) => {
    setActiveTask(active.data.current?.task)
    setActiveColumnId(active.data.current?.columnId)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    setActiveColumnId(null)

    if (!over) return

    const fromColId = active.data.current?.columnId
    const toColId = over.data.current?.columnId ?? over.id
    const { tasks: currentTasks } = useBoardStore.getState()
    const destTasks = currentTasks[toColId] || []
    const newIndex = destTasks.findIndex((task) => task.id === over.id)

    moveTask(active.id, fromColId, toColId, newIndex === -1 ? destTasks.length : newIndex)
  }

  const handleAddColumn = async (e) => {
    e.preventDefault()
    if (!project?.id || !newColTitle.trim()) return

    setAddingCol(true)
    try {
      await addColumn(project.id, newColTitle.trim())
      setNewColTitle('')
      setShowColInput(false)
    } finally {
      setAddingCol(false)
    }
  }

  const handleFilter = (filtered) => {
    const nextFiltered = {}
    columns.forEach((column) => {
      nextFiltered[column.id] = []
    })

    filtered.forEach((task) => {
      if (nextFiltered[task.column_id]) {
        nextFiltered[task.column_id].push(task)
      }
    })

    setFilteredTasks(nextFiltered)
    setSelectedTasks((current) => current.filter((task) => filtered.some((item) => item.id === task.id)))
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
      <svg className="animate-spin" width="40" height="40" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Loading spectacular board...
      </h2>
    </div>
  )

  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ padding: '0.4rem', marginBottom: '1rem' }}>
        <FilterBar tasks={tasks} columns={columns} onFilter={handleFilter} />
      </div>

      <div className="glass-panel" style={{
        padding: '0.75rem 1.5rem',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '1.5rem'
      }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>View:</span>
        {['kanban', 'list', 'calendar', 'stats'].map((view) => (
          <button
            key={view}
            onClick={() => setViewType(view)}
            style={{
              padding: '6px 16px',
              borderRadius: '24px',
              border: viewType === view ? 'none' : '1px solid var(--border)',
              background: viewType === view ? 'var(--gradient-main)' : 'transparent',
              color: viewType === view ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '700',
              boxShadow: viewType === view ? '0 4px 10px rgba(99,102,241,0.3)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {view === 'kanban' ? '📋 Kanban' : view === 'list' ? '📑 List' : view === 'calendar' ? '📅 Calendar' : '📊 Stats'}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => undo(getSnapshot(), restoreSnapshot)}
            disabled={!canUndo}
            className="btn-secondary"
            style={{
              padding: '6px 14px',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              opacity: canUndo ? 1 : 0.5,
              borderRadius: '24px',
              border: 'none', background: 'var(--surface)'
            }}
          >
            ↶ Undo
          </button>
          <button
            onClick={() => redo(getSnapshot(), restoreSnapshot)}
            disabled={!canRedo}
            className="btn-secondary"
            style={{
              padding: '6px 14px',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              opacity: canRedo ? 1 : 0.5,
              borderRadius: '24px',
              border: 'none', background: 'var(--surface)'
            }}
          >
            ↷ Redo
          </button>
        </div>
      </div>

      <div className="animate-scale-in">
        {viewType === 'kanban' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div style={{ 
              display: 'flex', gap: '1.5rem', overflowX: 'auto', 
              padding: '0.5rem 0.5rem 2rem 0.5rem', alignItems: 'flex-start',
              scrollBehavior: 'smooth'
            }}>
              {columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  tasks={filteredTasks[column.id] || []}
                  selectedTasks={selectedTasks}
                  onTaskSelect={handleTaskSelect}
                />
              ))}

              {showColInput ? (
                <form onSubmit={handleAddColumn} className="glass-panel animate-scale-in" style={{
                  width: '320px',
                  flexShrink: 0,
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <input
                    autoFocus
                    value={newColTitle}
                    onChange={(e) => setNewColTitle(e.target.value)}
                    placeholder="New column name..."
                    className="input-modern"
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="submit"
                      disabled={addingCol}
                      className="btn-primary"
                      style={{ flex: 1, padding: '0.6rem' }}
                    >
                      {addingCol ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowColInput(false)}
                      className="btn-secondary"
                      style={{ padding: '0.6rem 1rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowColInput(true)}
                  style={{
                    width: '320px',
                    flexShrink: 0,
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px dashed var(--border)',
                    background: 'var(--surface-2)',
                    backdropFilter: 'blur(8px)',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.color = 'var(--primary)'
                    e.currentTarget.style.background = 'rgba(99,102,241,0.05)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.background = 'var(--surface-2)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>+</span> Add new column
                </button>
              )}
            </div>

            <DragOverlay>
              {activeTask && <TaskCard task={activeTask} columnId={activeColumnId} isOverlay />}
            </DragOverlay>
          </DndContext>
        ) : viewType === 'list' ? (
          <ListView tasks={filteredTasks} columns={columns} />
        ) : viewType === 'stats' ? (
          <TaskStatistics tasks={filteredTasks} columns={columns} projectId={project?.id} />
        ) : (
          <CalendarView tasks={filteredTasks} columns={columns} />
        )}
      </div>

      <BulkActionsBar
        selectedTasks={selectedTasks}
        columns={columns}
        onClearSelection={handleClearSelection}
      />

      <TaskDetail />
    </div>
  )
}
