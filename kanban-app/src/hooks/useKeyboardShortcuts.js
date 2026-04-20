import { useEffect } from 'react'

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check each shortcut
      shortcuts.forEach(({ key, ctrlKey = false, shiftKey = false, altKey = false, handler }) => {
        const keyMatches = e.key.toLowerCase() === key.toLowerCase()
        const ctrlMatches = ctrlKey ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey
        const shiftMatches = shiftKey ? e.shiftKey : !e.shiftKey
        const altMatches = altKey ? e.altKey : !e.altKey

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          e.preventDefault()
          handler(e)
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
