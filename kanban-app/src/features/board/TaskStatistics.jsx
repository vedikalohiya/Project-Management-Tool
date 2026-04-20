import { useMemo } from 'react'
import BurndownChart from './BurndownChart'
import { useTaskExtrasStore } from '../tasks/useTaskExtrasStore'

export default function TaskStatistics({ tasks, columns, projectId }) {
  const getTaskMeta = useTaskExtrasStore((state) => state.getTaskMeta)

  const stats = useMemo(() => {
    const allTasks = Object.values(tasks).flat()
    
    if (allTasks.length === 0) {
      return {
        total: 0,
        byPriority: { high: 0, medium: 0, low: 0 },
        byStatus: {},
        overdue: 0,
        dueSoon: 0,
        completed: 0,
        averageCompletionDays: 0
      }
    }

    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const completedTasks = allTasks.filter((task) => task.completed)
    const completedDurations = completedTasks
      .map((task) => {
        const meta = projectId ? getTaskMeta(projectId, task.id) : null
        const completedAt = meta?.completedAt ? new Date(meta.completedAt) : null
        const createdAt = task.created_at ? new Date(task.created_at) : null
        if (!completedAt || !createdAt || Number.isNaN(completedAt.getTime()) || Number.isNaN(createdAt.getTime())) return null
        return (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      })
      .filter((value) => value !== null)

    return {
      total: allTasks.length,
      byPriority: {
        high: allTasks.filter(t => t.priority === 'high').length,
        medium: allTasks.filter(t => t.priority === 'medium').length,
        low: allTasks.filter(t => t.priority === 'low').length
      },
      byStatus: columns.reduce((acc, col) => {
        acc[col.title] = (tasks[col.id] || []).length
        return acc
      }, {}),
      overdue: allTasks.filter(t => t.due_date && new Date(t.due_date) < now).length,
      dueSoon: allTasks.filter(t => 
        t.due_date && 
        new Date(t.due_date) >= now && 
        new Date(t.due_date) <= oneWeekFromNow
      ).length,
      completed: completedTasks.length,
      averageCompletionDays: completedDurations.length
        ? completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length
        : 0
    }
  }, [getTaskMeta, projectId, tasks, columns])

  const StatCard = ({ title, value, color = 'var(--primary)', subtitle }) => (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1rem',
      flex: 1,
      minWidth: '160px'
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: '700', color }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text)' }}>
        📊 Task Overview
      </h2>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard title="Total Tasks" value={stats.total} />
        <StatCard title="Completed" value={stats.completed} color="#22c55e" subtitle={stats.total ? `${Math.round((stats.completed / stats.total) * 100)}% done` : '0% done'} />
        <StatCard title="High Priority" value={stats.byPriority.high} color="#ef4444" />
        <StatCard title="Medium Priority" value={stats.byPriority.medium} color="#f59e0b" />
        <StatCard title="Low Priority" value={stats.byPriority.low} color="#22c55e" />
        <StatCard title="Overdue" value={stats.overdue} color="#ef4444" subtitle="tasks need attention" />
        <StatCard title="Due Soon" value={stats.dueSoon} color="#f59e0b" subtitle="next 7 days" />
        <StatCard title="Avg Completion" value={stats.averageCompletionDays ? stats.averageCompletionDays.toFixed(1) : '0.0'} color="var(--primary)" subtitle="days per task" />
      </div>

      {/* Status breakdown */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text)' }}>
          Tasks by Status
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {Object.entries(stats.byStatus).map(([status, count]) => {
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
            return (
              <div key={status} style={{
                padding: '1rem',
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
                  {status}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>
                  {count}
                </div>
                <div style={{
                  height: '4px',
                  background: 'var(--border)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '6px'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'var(--primary)',
                    width: `${percentage}%`,
                    transition: 'width 0.3s'
                  }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {percentage}% of total
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Priority distribution chart */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text)' }}>
          Priority Distribution
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', height: '40px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {stats.byPriority.high > 0 && (
            <div style={{
              flex: stats.byPriority.high,
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '700',
              title: `High: ${stats.byPriority.high}`
            }}>
              {stats.total > 10 && `${stats.byPriority.high}`}
            </div>
          )}
          {stats.byPriority.medium > 0 && (
            <div style={{
              flex: stats.byPriority.medium,
              background: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '700',
              title: `Medium: ${stats.byPriority.medium}`
            }}>
              {stats.total > 10 && `${stats.byPriority.medium}`}
            </div>
          )}
          {stats.byPriority.low > 0 && (
            <div style={{
              flex: stats.byPriority.low,
              background: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '700',
              title: `Low: ${stats.byPriority.low}`
            }}>
              {stats.total > 10 && `${stats.byPriority.low}`}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#ef4444' }} />
            <span>High: {stats.byPriority.high}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#f59e0b' }} />
            <span>Medium: {stats.byPriority.medium}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#22c55e' }} />
            <span>Low: {stats.byPriority.low}</span>
          </div>
        </div>
      </div>

      <BurndownChart tasks={tasks} projectId={projectId} />
    </div>
  )
}
