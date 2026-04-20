import { useState } from 'react'

export default function FilterBar({ tasks, columns, onFilter }) {
  const [searchText, setSearchText] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterAssignee, setFilterAssignee] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get unique assignees from tasks
  const assignees = [...new Set(
    Object.values(tasks).flat()
      .filter(t => t.assignee)
      .map(t => ({ id: t.assignee.id, email: t.assignee.email }))
  )]

  const applyFilters = () => {
    let filtered = Object.values(tasks).flat()

    // Search filter
    if (searchText) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchText.toLowerCase()))
      )
    }

    // Priority filter
    if (filterPriority) {
      filtered = filtered.filter(t => t.priority === filterPriority)
    }

    // Status filter (column)
    if (filterStatus) {
      filtered = filtered.filter(t => t.column_id === filterStatus)
    }

    // Assignee filter
    if (filterAssignee) {
      filtered = filtered.filter(t => t.assignee_id === filterAssignee)
    }

    onFilter(filtered)
  }

  // Apply filters when any filter changes
  const handleFilterChange = () => {
    setTimeout(() => applyFilters(), 0)
  }

  const handleReset = () => {
    setSearchText('')
    setFilterPriority('')
    setFilterStatus('')
    setFilterAssignee('')
    onFilter(Object.values(tasks).flat())
  }

  return (
    <div style={{
      padding: '1rem',
      background: 'var(--surface-2)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: '1rem'
    }}>
      {/* Search bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Search tasks by title or description..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value)
            handleFilterChange()
          }}
          style={{
            flex: 1, padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text)',
            fontSize: '0.875rem'
          }}
        />
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: showAdvanced ? 'var(--primary)' : 'var(--surface)',
            color: showAdvanced ? 'white' : 'var(--text)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.15s'
          }}
        >
          ⚙ Filters
        </button>
        {(searchText || filterPriority || filterStatus || filterAssignee) && (
          <button
            onClick={handleReset}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px', padding: '12px',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}>
          {/* Priority filter */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>PRIORITY</label>
            <select
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value)
                handleFilterChange()
              }}
              style={{
                width: '100%', padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)', color: 'var(--text)',
                fontSize: '0.875rem', cursor: 'pointer'
              }}
            >
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>STATUS</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                handleFilterChange()
              }}
              style={{
                width: '100%', padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--surface-2)', color: 'var(--text)',
                fontSize: '0.875rem', cursor: 'pointer'
              }}
            >
              <option value="">All statuses</option>
              {columns.map(col => (
                <option key={col.id} value={col.id}>{col.title}</option>
              ))}
            </select>
          </div>

          {/* Assignee filter */}
          {assignees.length > 0 && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>ASSIGNEE</label>
              <select
                value={filterAssignee}
                onChange={(e) => {
                  setFilterAssignee(e.target.value)
                  handleFilterChange()
                }}
                style={{
                  width: '100%', padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)', color: 'var(--text)',
                  fontSize: '0.875rem', cursor: 'pointer'
                }}
              >
                <option value="">All assignees</option>
                {assignees.map(assignee => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Results count */}
          <div style={{
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center'
          }}>
            📊 Filters applied
          </div>
        </div>
      )}
    </div>
  )
}
