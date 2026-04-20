import { create } from 'zustand'
import { supabase } from '../../lib/supabase'

export const useProjectStore = create((set) => ({
  projects: [],
  loading: false,

  fetchProjects: async (userId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })
    if (!error) set({ projects: data })
    set({ loading: false })
  },

  createProject: async (name, userId) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, owner_id: userId })
      .select()
      .single()
    if (error) throw error
    set((state) => ({ projects: [data, ...state.projects] }))
    return data
  },

  deleteProject: async (id) => {
    await supabase.from('projects').delete().eq('id', id)
    set((state) => ({ projects: state.projects.filter(p => p.id !== id) }))
  }
}))