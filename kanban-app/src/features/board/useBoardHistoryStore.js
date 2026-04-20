import { create } from 'zustand'

export const useBoardHistoryStore = create((set, get) => ({
  past: [],
  future: [],

  record: (snapshot) => {
    const safeSnapshot = JSON.parse(JSON.stringify(snapshot))
    set((state) => ({
      past: [...state.past, safeSnapshot].slice(-25),
      future: []
    }))
  },

  clear: () => set({ past: [], future: [] }),

  discardLast: () => set((state) => ({
    past: state.past.slice(0, -1),
    future: state.future
  })),

  undo: async (currentSnapshot, applySnapshot) => {
    const { past, future } = get()
    if (past.length === 0) return false

    const previousSnapshot = past[past.length - 1]
    const safeCurrentSnapshot = JSON.parse(JSON.stringify(currentSnapshot))

    set({
      past: past.slice(0, -1),
      future: [safeCurrentSnapshot, ...future]
    })

    await applySnapshot(previousSnapshot)
    return true
  },

  redo: async (currentSnapshot, applySnapshot) => {
    const { past, future } = get()
    if (future.length === 0) return false

    const nextSnapshot = future[0]
    const safeCurrentSnapshot = JSON.parse(JSON.stringify(currentSnapshot))

    set({
      past: [...past, safeCurrentSnapshot].slice(-25),
      future: future.slice(1)
    })

    await applySnapshot(nextSnapshot)
    return true
  }
}))
