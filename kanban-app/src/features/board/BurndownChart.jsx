import { useMemo } from 'react'
import { useTaskExtrasStore } from '../tasks/useTaskExtrasStore'

const chartHeight = 220
const chartPadding = 28

const formatDay = (date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

const toDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const buildPoints = (values, width) => {
  if (values.length === 0) return ''
  if (values.length === 1) {
    const y = chartHeight - chartPadding - values[0].value
    return `${chartPadding},${y} ${width - chartPadding},${y}`
  }

  const minValue = Math.min(...values.map((entry) => entry.value))
  const maxValue = Math.max(...values.map((entry) => entry.value))
  const valueRange = Math.max(1, maxValue - minValue)
  const step = (width - chartPadding * 2) / (values.length - 1)

  return values.map((entry, index) => {
    const x = chartPadding + step * index
    const y = chartHeight - chartPadding - ((entry.value - minValue) / valueRange) * (chartHeight - chartPadding * 2)
    return `${x},${y}`
  }).join(' ')
}

export default function BurndownChart({ tasks, projectId }) {
  const getTaskMeta = useTaskExtrasStore((state) => state.getTaskMeta)

  const chartData = useMemo(() => {
    const allTasks = Object.values(tasks).flat()
    const createdDates = allTasks
      .map((task) => toDate(task.created_at) || new Date())
      .sort((a, b) => a - b)

    if (allTasks.length === 0) {
      return {
        empty: true,
        labels: [],
        ideal: [],
        actual: [],
        total: 0,
        completed: 0,
        averageCompletionDays: 0
      }
    }

    const latestDate = new Date()
    const earliestDate = createdDates[0] || new Date()
    const startDate = new Date(Math.min(earliestDate.getTime(), latestDate.getTime() - (13 * 24 * 60 * 60 * 1000)))
    startDate.setHours(0, 0, 0, 0)
    latestDate.setHours(0, 0, 0, 0)

    const labels = []
    const ideal = []
    const actual = []
    const completedDurations = []

    const completedAtByTaskId = new Map()
    allTasks.forEach((task) => {
      const meta = projectId ? getTaskMeta(projectId, task.id) : null
      const completedAt = meta?.completedAt || (task.completed ? (task.updated_at || task.created_at) : null)
      if (completedAt) {
        completedAtByTaskId.set(task.id, toDate(completedAt) || new Date())
      }
      if (meta?.completedAt && task.created_at) {
        const createdAt = toDate(task.created_at)
        const completedDate = toDate(meta.completedAt)
        if (createdAt && completedDate) {
          completedDurations.push((completedDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
        }
      }
    })

    const days = []
    const current = new Date(startDate)
    while (current <= latestDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    const total = allTasks.length
    days.forEach((day, index) => {
      labels.push(formatDay(day))
      const idealRemaining = total - ((total / Math.max(1, days.length - 1)) * index)
      ideal.push({ label: formatDay(day), value: Math.max(0, idealRemaining) })

      const actualRemaining = allTasks.filter((task) => {
        const createdAt = toDate(task.created_at) || startDate
        const completedAt = completedAtByTaskId.get(task.id)
        return createdAt <= day && (!completedAt || completedAt > day)
      }).length
      actual.push({ label: formatDay(day), value: actualRemaining })
    })

    return {
      empty: false,
      labels,
      ideal,
      actual,
      total,
      completed: allTasks.filter((task) => completedAtByTaskId.has(task.id)).length,
      averageCompletionDays: completedDurations.length
        ? completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length
        : 0
    }
  }, [getTaskMeta, projectId, tasks])

  if (chartData.empty) {
    return (
      <div style={{
        marginTop: '1.5rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text)' }}>
          Burndown Chart
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Create and complete a few tasks to see sprint progress over time.</p>
      </div>
    )
  }

  const width = 860
  const idealPoints = buildPoints(chartData.ideal, width)
  const actualPoints = buildPoints(chartData.actual, width)
  const maxRemaining = Math.max(...chartData.actual.map((entry) => entry.value), ...chartData.ideal.map((entry) => entry.value))
  const minRemaining = Math.min(...chartData.actual.map((entry) => entry.value), ...chartData.ideal.map((entry) => entry.value))
  const gridValues = Array.from({ length: 5 }, (_, index) => {
    if (maxRemaining === minRemaining) return maxRemaining
    return Math.round(maxRemaining - ((maxRemaining - minRemaining) / 4) * index)
  })

  return (
    <div style={{
      marginTop: '1.5rem',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)' }}>Burndown Chart</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Ideal vs actual remaining tasks for the current sprint window.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>Total tasks: <strong style={{ color: 'var(--text)' }}>{chartData.total}</strong></span>
          <span>Completed: <strong style={{ color: 'var(--text)' }}>{chartData.completed}</strong></span>
          <span>Avg completion: <strong style={{ color: 'var(--text)' }}>{chartData.averageCompletionDays ? `${chartData.averageCompletionDays.toFixed(1)} days` : 'n/a'}</strong></span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${chartHeight}`} width="100%" height={chartHeight} role="img" aria-label="Burndown chart">
        {gridValues.map((value, index) => {
          const y = chartPadding + ((chartHeight - chartPadding * 2) / Math.max(1, gridValues.length - 1)) * index
          return (
            <g key={value + index}>
              <line x1={chartPadding} y1={y} x2={width - chartPadding} y2={y} stroke="var(--border)" strokeDasharray="4 4" />
              <text x="4" y={y + 4} fontSize="10" fill="var(--text-tertiary)">{value}</text>
            </g>
          )
        })}
        <polyline points={idealPoints} fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="8 6" />
        <polyline points={actualPoints} fill="none" stroke="var(--primary)" strokeWidth="3" />
        {chartData.actual.map((entry, index) => {
          const step = (width - chartPadding * 2) / Math.max(1, chartData.actual.length - 1)
          const x = chartPadding + step * index
          const y = chartHeight - chartPadding - ((entry.value - minRemaining) / Math.max(1, maxRemaining - minRemaining)) * (chartHeight - chartPadding * 2)
          return <circle key={entry.label + index} cx={x} cy={y} r="3" fill="var(--primary)" />
        })}
      </svg>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem', fontSize: '0.85rem' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: 'var(--primary)', display: 'inline-block' }} /> Actual remaining</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '3px', background: '#94a3b8', display: 'inline-block' }} /> Ideal remaining</span>
      </div>
    </div>
  )
}
