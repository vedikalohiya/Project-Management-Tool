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
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>Your Projects</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px 14px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '0.875rem', width: '200px'
            }}
          />
          <button onClick={() => setShowInput(!showInput)} style={{
            padding: '8px 16px', borderRadius: 'var(--radius-md)',
            background: 'var(--primary)', color: 'white',
            border: 'none', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: '600',
            boxShadow: '0 2px 8px rgba(99,102,241,0.3)'
          }}>
            + New Project
          </button>
        </div>
      </div>

      {/* Create form */}
      {showInput && (
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)', padding: '1.25rem',
          marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)'
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text)' }}>
            New Project
          </p>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px' }}>
            <input
              autoFocus type="text" placeholder="Project name..."
              value={newName} onChange={(e) => setNewName(e.target.value)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                color: 'var(--text)', fontSize: '0.875rem'
              }}
            />
            <button type="submit" disabled={creating} style={{
              padding: '8px 20px', borderRadius: 'var(--radius-md)',
              background: 'var(--primary)', color: 'white',
              border: 'none', cursor: 'pointer', fontWeight: '600'
            }}>
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowInput(false)} style={{
              padding: '8px 14px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              color: 'var(--text)', cursor: 'pointer'
            }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Projects grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading projects...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {search ? `No projects matching "${search}"` : 'No projects yet'}
          </p>
          {!search && (
            <button onClick={() => setShowInput(true)} style={{
              padding: '10px 20px', borderRadius: 'var(--radius-md)',
              background: 'var(--primary)', color: 'white',
              border: 'none', cursor: 'pointer', fontWeight: '600'
            }}>
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map((project, i) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              style={{
                background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)', cursor: 'pointer',
                overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              }}
            >
              {/* Color bar */}
              <div style={{ height: '4px', background: colors[i % colors.length] }} />

              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: colors[i % colors.length] + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', marginBottom: '0.75rem'
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
                      fontSize: '1.1rem', padding: '4px',
                      borderRadius: '6px', lineHeight: 1
                    }}
                  >×</button>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
                  {project.name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}