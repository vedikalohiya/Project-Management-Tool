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
    <>
      <div className="bg-shapes">
        <div className="bg-shape-1"></div>
        <div className="bg-shape-2"></div>
      </div>
      <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, paddingBottom: '2rem' }}>
        <nav className="glass-panel" style={{
          margin: '1rem 2rem',
          padding: '0 1.5rem',
          height: '64px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky', top: '1rem', zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '12px',
              background: 'var(--gradient-main)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
            }}>
              <span style={{ color: 'white', fontSize: '18px', fontWeight: '800' }}>K</span>
            </div>
            <h1
              onClick={() => setSelectedProject(null)}
              style={{ fontSize: '1.2rem', fontWeight: '800', cursor: 'pointer', color: 'var(--text)' }}
            >
              Kanban
              {selectedProject && (
                <span style={{ color: 'var(--text-tertiary)', fontWeight: '500', marginLeft: '8px' }}>
                  / <span style={{ color: 'var(--primary)' }}>{selectedProject.name}</span>
                </span>
              )}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600',
              background: 'var(--surface-2)', padding: '6px 14px',
              borderRadius: '20px', border: '1px solid var(--border)',
              backdropFilter: 'blur(4px)'
            }}>
              {user?.email}
            </span>
            <button onClick={toggleTheme} className="btn-secondary" style={{
              width: '40px', height: '40px', padding: 0, borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <div style={{ 
              width: '40px', height: '40px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface-2)', borderRadius: '12px',
              border: '1px solid var(--border)', cursor: 'pointer',
              transition: 'all 0.3s'
            }} className="hover-lift">
              <NotificationBell onClick={() => {
                setShowNotifications((prev) => {
                  const next = !prev
                  if (next) markAllRead()
                  return next
                })
              }} />
            </div>
            <button onClick={signOut} className="btn-primary" style={{
              padding: '0 1.2rem', height: '40px'
            }}>
              Sign out
            </button>
          </div>
        </nav>

        <main className="animate-fade-in" style={{ padding: '0.5rem 2rem' }}>
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
      <style dangerouslySetInnerHTML={{__html: `
        .hover-lift:hover {
          transform: translateY(-2px);
          border-color: var(--primary) !important;
        }
      `}} />
    </>
  )
}