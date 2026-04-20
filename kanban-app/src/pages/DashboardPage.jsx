import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../features/store/useThemeStore'
import ProjectList from '../features/projects/ProjectList'
import BoardPage from './BoardPage'
import NotificationBell from '../features/notifications/NotificationBell'
import NotificationDrawer from '../features/notifications/NotificationDrawer'
import NotificationToasts from '../features/notifications/NotificationToasts'
import { useNotificationStore } from '../features/notifications/useNotificationStore'

export default function DashboardPage() {
  const { user, signOut } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const markAllRead = useNotificationStore((state) => state.markAllRead)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)

  // Keyboard shortcut: Escape to go back to projects
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && selectedProject) setSelectedProject(null)
      if (e.key === 'Escape') setShowNotifications(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedProject])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <nav style={{
        background: 'var(--surface)',
        padding: '0 2rem',
        height: '56px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky', top: 0, zIndex: 30
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'var(--primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '14px' }}>K</span>
          </div>
          <h1
            onClick={() => setSelectedProject(null)}
            style={{ fontSize: '1rem', fontWeight: '600', cursor: 'pointer', color: 'var(--text)' }}
          >
            Kanban {selectedProject && <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>/ {selectedProject.name}</span>}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.8rem', color: 'var(--text-secondary)',
            background: 'var(--surface-2)', padding: '4px 10px',
            borderRadius: '20px', border: '1px solid var(--border)'
          }}>
            {user?.email}
          </span>
          <button onClick={toggleTheme} style={{
            width: '36px', height: '36px', borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            cursor: 'pointer', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <NotificationBell onClick={() => {
            setShowNotifications((prev) => {
              const next = !prev
              if (next) markAllRead()
              return next
            })
          }} />
          <button onClick={signOut} style={{
            padding: '0 14px', height: '36px', borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500'
          }}>
            Sign out
          </button>
        </div>
      </nav>

      <main style={{ padding: '1.5rem 2rem' }}>
        {selectedProject
          ? <BoardPage project={selectedProject} onBack={() => setSelectedProject(null)} />
          : <ProjectList onSelectProject={setSelectedProject} />
        }
      </main>

      {showNotifications && (
        <NotificationDrawer onClose={() => setShowNotifications(false)} />
      )}

      <NotificationToasts />
    </div>
  )
}