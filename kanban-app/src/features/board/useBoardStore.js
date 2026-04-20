import { create } from 'zustand'
import { supabase } from '../../lib/supabase'
import { useTaskStore } from '../tasks/useTaskStore'
import { useBoardHistoryStore } from './useBoardHistoryStore'
import { useTaskExtrasStore } from '../tasks/useTaskExtrasStore'

const cloneColumns = (columns) => columns.map(column => ({ ...column }))

const cloneTasks = (tasks) => Object.fromEntries(
  Object.entries(tasks).map(([columnId, columnTasks]) => [
    columnId,
    columnTasks.map(task => ({ ...task }))
  ])
)

const flattenTasks = (tasks) => Object.values(tasks).flat()

const syncSnapshotToDatabase = async (previousSnapshot, nextSnapshot) => {
  if (!supabase) return

  const previousColumns = previousSnapshot.columns || []
  const nextColumns = nextSnapshot.columns || []
  const previousTasks = flattenTasks(previousSnapshot.tasks || {})
  const nextTasks = flattenTasks(nextSnapshot.tasks || {})

  const nextColumnIds = new Set(nextColumns.map(column => column.id))
  const nextTaskIds = new Set(nextTasks.map(task => task.id))

  const removedTasks = previousTasks.filter(task => !nextTaskIds.has(task.id))
  const removedColumns = previousColumns.filter(column => !nextColumnIds.has(column.id))

  for (const task of removedTasks) {
    await supabase.from('tasks').delete().eq('id', task.id)
  }

  for (const column of removedColumns) {
    await supabase.from('columns').delete().eq('id', column.id)
  }

  if (nextColumns.length > 0) {
    await supabase.from('columns').upsert(
      nextColumns.map(column => ({
        id: column.id,
        project_id: column.project_id,
        title: column.title,
        position: column.position
      })),
      { onConflict: 'id' }
    )
  }

  if (nextTasks.length > 0) {
    await supabase.from('tasks').upsert(
      nextTasks.map(task => ({
        id: task.id,
        column_id: task.column_id,
        title: task.title,
        position: task.position,
        priority: task.priority || 'medium',
        due_date: task.due_date || null,
        description: task.description || null,
        label: task.label || null,
        assignee_id: task.assignee_id || null,
        completed: task.completed ?? false
      })),
      { onConflict: 'id' }
    )
  }
}

export const useBoardStore = create((set, get) => ({
  columns: [],
  tasks: {},
  loading: false,

  getSnapshot: () => ({
    columns: cloneColumns(get().columns),
    tasks: cloneTasks(get().tasks)
  }),

  restoreSnapshot: async (snapshot) => {
    const currentSnapshot = get().getSnapshot()
    set({
      columns: cloneColumns(snapshot.columns || []),
      tasks: cloneTasks(snapshot.tasks || {})
    })

    const restoredTaskMap = new Map(flattenTasks(snapshot.tasks || {}).map(task => [task.id, task]))
    const selectedTask = useTaskStore.getState().selectedTask
    if (selectedTask) {
      const restoredTask = restoredTaskMap.get(selectedTask.id)
      if (restoredTask) {
        useTaskStore.setState({ selectedTask: restoredTask })
      } else {
        useTaskStore.getState().closeTask()
      }
    }

    await syncSnapshotToDatabase(currentSnapshot, snapshot)
  },

  fetchBoard: async (projectId) => {
    set({ loading: true })
    const { data: columns } = await supabase
      .from('columns')
      .select('*')
      .eq('project_id', projectId)
      .order('position')

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*, assignee:users(*)')
      .in('column_id', (columns || []).map(c => c.id))
      .order('position')

    const tasksByColumn = {}
    ;(columns || []).forEach(col => {
      tasksByColumn[col.id] = (tasks || []).filter(t => t.column_id === col.id).map(t => ({
        ...t,
        project_id: projectId
      }))
    })

    set({ columns: columns || [], tasks: tasksByColumn, loading: false })
  },

  addColumn: async (projectId, title) => {
    const previousSnapshot = get().getSnapshot()
    useBoardHistoryStore.getState().record(previousSnapshot)
    try {
      const { columns } = get()
      const position = columns.length
      const { data, error } = await supabase
        .from('columns')
        .insert({ project_id: projectId, title, position })
        .select().single()
      if (error) throw error
      set((state) => ({
        columns: [...state.columns, data],
        tasks: { ...state.tasks, [data.id]: [] }
      }))
    } catch (error) {
      useBoardHistoryStore.getState().discardLast()
      throw error
    }
  },

  addTask: async (columnId, title, options = {}) => {
    const previousSnapshot = get().getSnapshot()
    useBoardHistoryStore.getState().record(previousSnapshot)
    try {
      const { tasks } = get()
      const columnTasks = tasks[columnId] || []
      const position = columnTasks.length
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          column_id: columnId,
          title,
          position,
          priority: options.priority || 'medium',
          due_date: options.due_date || null,
          description: options.description || null,
          label: options.label || null,
          assignee_id: options.assignee_id || null,
          completed: options.completed ?? false
        })
        .select().single()
      if (error) throw error
      set((state) => ({
        tasks: {
          ...state.tasks,
          [columnId]: [...(state.tasks[columnId] || []), data]
        }
      }))
      return data
    } catch (error) {
      useBoardHistoryStore.getState().discardLast()
      throw error
    }
  },

  moveTask: async (taskId, fromColId, toColId, newIndex) => {
    const previousSnapshot = get().getSnapshot()
    useBoardHistoryStore.getState().record(previousSnapshot)
    try {
      const { tasks } = get()
      const task = (tasks[fromColId] || []).find(t => t.id === taskId)
      if (!task) return

      const newTasks = { ...tasks }
      newTasks[fromColId] = (newTasks[fromColId] || []).filter(t => t.id !== taskId)
      const destTasks = [...(newTasks[toColId] || [])]
      destTasks.splice(newIndex, 0, { ...task, column_id: toColId })
      newTasks[toColId] = destTasks

      set({ tasks: newTasks })
      const { error } = await supabase.from('tasks').update({ column_id: toColId, position: newIndex }).eq('id', taskId)
      if (error) throw error
    } catch (error) {
      set({
        columns: cloneColumns(previousSnapshot.columns),
        tasks: cloneTasks(previousSnapshot.tasks)
      })
      useBoardHistoryStore.getState().discardLast()
      throw error
    }
  },

  deleteTask: async (taskId, columnId) => {
    const previousSnapshot = get().getSnapshot()
    useBoardHistoryStore.getState().record(previousSnapshot)
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) throw error
      const task = (previousSnapshot.tasks[columnId] || []).find((item) => item.id === taskId)
      if (task?.project_id) {
        useTaskExtrasStore.getState().removeTask(task.project_id, taskId)
      }
      set((state) => ({
        tasks: {
          ...state.tasks,
          [columnId]: state.tasks[columnId].filter(t => t.id !== taskId)
        }
      }))
    } catch (error) {
      set({
        columns: cloneColumns(previousSnapshot.columns),
        tasks: cloneTasks(previousSnapshot.tasks)
      })
      useBoardHistoryStore.getState().discardLast()
      throw error
    }
  },

  deleteColumn: async (columnId) => {
    const previousSnapshot = get().getSnapshot()
    useBoardHistoryStore.getState().record(previousSnapshot)
    try {
      const { error } = await supabase.from('columns').delete().eq('id', columnId)
      if (error) throw error
      const removedTasks = previousSnapshot.tasks[columnId] || []
      const projectId = previousSnapshot.columns.find((column) => column.id === columnId)?.project_id
      if (projectId) {
        removedTasks.forEach((task) => {
          useTaskExtrasStore.getState().removeTask(projectId, task.id)
        })
      }
      set((state) => {
        const newTasks = { ...state.tasks }
        delete newTasks[columnId]
        return {
          columns: state.columns.filter(c => c.id !== columnId),
          tasks: newTasks
        }
      })
    } catch (error) {
      set({
        columns: cloneColumns(previousSnapshot.columns),
        tasks: cloneTasks(previousSnapshot.tasks)
      })
      useBoardHistoryStore.getState().discardLast()
      throw error
    }
  }
}))