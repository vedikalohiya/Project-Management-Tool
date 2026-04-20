import { create } from 'zustand'
import { supabase } from '../../lib/supabase'

export const useTaskStore = create((set) => ({
  selectedTask: null,
  isOpen: false,

  openTask: (task) => set({ selectedTask: task, isOpen: true }),
  closeTask: () => set({ selectedTask: null, isOpen: false }),

  updateTask: async (taskId, updates) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()
    if (error) throw error
    set({ selectedTask: data })
    return data
  }
}))