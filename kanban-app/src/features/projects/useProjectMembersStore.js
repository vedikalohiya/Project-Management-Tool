import { create } from 'zustand'
import { supabase } from '../../lib/supabase'

export const useProjectMembersStore = create((set, get) => ({
  members: [],
  loading: false,

  fetchMembers: async (projectId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('project_members')
      .select('*, user:users(*)')
      .eq('project_id', projectId)
    if (!error) set({ members: data || [] })
    set({ loading: false })
  },

  addMember: async (projectId, email, role = 'member') => {
    // First, get the user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (userError) throw new Error('User not found')
    
    const { data, error } = await supabase
      .from('project_members')
      .insert({ project_id: projectId, user_id: userData.id, role })
      .select()
      .single()
    
    if (error) throw error
    set((state) => ({ members: [...state.members, data] }))
    return data
  },

  removeMember: async (projectId, userId) => {
    await supabase
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', userId)
    
    set((state) => ({
      members: state.members.filter(m => m.user_id !== userId)
    }))
  },

  updateMemberRole: async (projectId, userId, role) => {
    const { data, error } = await supabase
      .from('project_members')
      .update({ role })
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    set((state) => ({
      members: state.members.map(m =>
        m.user_id === userId ? { ...m, role } : m
      )
    }))
  }
}))
