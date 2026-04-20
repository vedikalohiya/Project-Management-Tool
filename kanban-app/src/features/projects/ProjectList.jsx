import { useEffect, useState } from 'react'
import { useProjectStore } from './useProjectStore'
import { useAuthStore } from '../../store/useAuthStore'

export default function ProjectList({ onSelectProject }) {
  const { user } = useAuthStore()
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjectStore()
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (user) fetchProjects(user.id)
  }, [user])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createProject(newName.trim(), user.id)
      setNewName('')
      setShowInput(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const colors = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6']

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '2rem auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.02em' }}>Your Projects</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-modern"
              style={{ paddingLeft: '40px', width: '240px' }}
            />
          </div>
          <button onClick={() => setShowInput(!showInput)} className="btn-primary" style={{ padding: '0.9rem 1.25rem' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            New Project
          </button>
        </div>
      </div>

      {/* Create form */}
      {showInput && (
        <div className="glass-card animate-fade-in" style={{
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <p style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text)' }}>
            Start a new project
          </p>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              autoFocus type="text" placeholder="Project name..."
              value={newName} onChange={(e) => setNewName(e.target.value)}
              className="input-modern"
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? 'Creating...' : 'Create Project'}
            </button>
            <button type="button" onClick={() => setShowInput(false)} className="btn-secondary">
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Projects grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <svg className="animate-spin" width="36" height="36" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading projects...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{
          textAlign: 'center', padding: '5rem 2rem', borderStyle: 'dashed'
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>✨</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '500' }}>
            {search ? `No projects matching "${search}"` : 'Your workspace is empty'}
          </p>
          {!search && (
            <button onClick={() => setShowInput(true)} className="btn-primary">
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((project, i) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="glass-card"
              style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}
            >
              {/* Color gradient bar */}
              <div style={{ 
                height: '6px', 
                background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[(i + 1) % colors.length]})`
              }} />

              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: colors[i % colors.length] + '15',
                    color: colors[i % colors.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', marginBottom: '1rem',
                    boxShadow: `0 4px 10px ${colors[i % colors.length]}15`
                  }}>
                    📁
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Delete "${project.name}"?`)) deleteProject(project.id)
                    }}
                    style={{
                      background: 'none', border: 'none',
                      color: 'var(--text-tertiary)', cursor: 'pointer',
                      fontSize: '1.2rem', padding: '6px',
                      borderRadius: '8px', lineHeight: 1,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--danger-bg)'
                      e.currentTarget.style.color = 'var(--danger)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none'
                      e.currentTarget.style.color = 'var(--text-tertiary)'
                    }}
                  >×</button>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>
                  {project.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: '500' }}>
                  Created {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
}