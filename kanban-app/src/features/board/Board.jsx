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

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>Loading board...</p>

  return (
    <>
      <FilterBar tasks={tasks} columns={columns} onFilter={handleFilter} />

      <div style={{
        padding: '0.75rem 1.5rem',
        background: 'var(--surface-2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', marginRight: '8px' }}>View:</span>
        {['kanban', 'list', 'calendar', 'stats'].map((view) => (
          <button
            key={view}
            onClick={() => setViewType(view)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: viewType === view ? '1px solid var(--primary)' : '1px solid var(--border)',
              background: viewType === view ? 'var(--primary)' : 'transparent',
              color: viewType === view ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.15s',
              textTransform: 'capitalize'
            }}
          >
            {view === 'kanban' ? '📋 Kanban' : view === 'list' ? '📑 List' : view === 'calendar' ? '📅 Calendar' : '📊 Stats'}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => undo(getSnapshot(), restoreSnapshot)}
            disabled={!canUndo}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              cursor: canUndo ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              opacity: canUndo ? 1 : 0.5
            }}
          >
            ↶ Undo
          </button>
          <button
            onClick={() => redo(getSnapshot(), restoreSnapshot)}
            disabled={!canRedo}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              opacity: canRedo ? 1 : 0.5
            }}
          >
            ↷ Redo
          </button>
        </div>
      </div>

      {viewType === 'kanban' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem', paddingBottom: '1rem', alignItems: 'flex-start' }}>
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
              <form onSubmit={handleAddColumn} style={{
                width: '280px',
                flexShrink: 0,
                background: 'var(--column-bg)',
                borderRadius: '12px',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <input
                  autoFocus
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  placeholder="Column title..."
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '0.875rem'
                  }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="submit"
                    disabled={addingCol}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {addingCol ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowColInput(false)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowColInput(true)}
                style={{
                  width: '280px',
                  flexShrink: 0,
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: '2px dashed var(--border)',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem'
                }}
              >
                + Add column
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

      <BulkActionsBar
        selectedTasks={selectedTasks}
        columns={columns}
        onClearSelection={handleClearSelection}
      />

      <TaskDetail />
    </>
  )
}
