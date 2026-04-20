import { create } from 'zustand'

export const useThemeStore = create((set) => {
  // Initialize theme from localStorage
  const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') || 'light' : 'light'
  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('data-theme', savedTheme)
  }

  return {
    theme: savedTheme,

    toggleTheme: () => {
      set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light'
        localStorage.setItem('theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
        return { theme: newTheme }
      })
    },

    setTheme: (theme) => {
      localStorage.setItem('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
      set({ theme })
    }
  }
})
