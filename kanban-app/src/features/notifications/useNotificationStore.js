import { create } from 'zustand'

const autoDismissMs = 4500

export const useNotificationStore = create((set, get) => ({
  items: [],
  unreadCount: 0,

  push: (notification) => {
    const id = notification.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const nextNotification = {
      id,
      title: notification.title || 'Update',
      message: notification.message || '',
      type: notification.type || 'info',
      createdAt: Date.now(),
      read: false
    }

    set((state) => ({
      items: [nextNotification, ...state.items].slice(0, 8),
      unreadCount: state.unreadCount + 1
    }))

    window.setTimeout(() => {
      get().dismiss(id)
    }, autoDismissMs)
  },

  dismiss: (id) => {
    set((state) => {
      const target = state.items.find((item) => item.id === id)
      return {
        items: state.items.filter((item) => item.id !== id),
        unreadCount: target && !target.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      }
    })
  },

  markAllRead: () => set((state) => ({
    items: state.items.map((item) => ({ ...item, read: true })),
    unreadCount: 0
  })),

  clear: () => set({ items: [], unreadCount: 0 })
}))
