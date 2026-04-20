import { useState } from 'react'
import { useTaskStore } from '../tasks/useTaskStore'

export default function CalendarView({ tasks, columns }) {
  const { openTask } = useTaskStore()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get all tasks with due dates, organized by date
  const allTasks = Object.values(tasks).flat().filter(t => t.due_date)
  
  const tasksByDate = {}
  allTasks.forEach(task => {
    const dateStr = task.due_date.split('T')[0] // YYYY-MM-DD
    if (!tasksByDate[dateStr]) tasksByDate[dateStr] = []
    tasksByDate[dateStr].push(task)
  })

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const getPriorityColor = (priority) => {
    const colors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
    return colors[priority || 'medium']
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []
  
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text)' }}>{monthName}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={prevMonth} style={{
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', cursor: 'pointer'
          }}>← Prev</button>
          <button onClick={() => setCurrentDate(new Date())} style={{
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', cursor: 'pointer'
          }}>Today</button>
          <button onClick={nextMonth} style={{
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)', background: 'var(--surface)',
            color: 'var(--text)', cursor: 'pointer'
          }}>Next →</button>
        </div>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{
            padding: '8px', textAlign: 'center', fontWeight: '600',
            color: 'var(--text-secondary)', fontSize: '0.875rem'
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} style={{ minHeight: '100px' }} />
          }

          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayTasks = tasksByDate[dateStr] || []
          const isToday = dateStr === todayStr

          return (
            <div
              key={day}
              style={{
                minHeight: '100px',
                borderRadius: 'var(--radius-md)',
                border: isToday ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: isToday ? 'var(--primary)' + '05' : 'var(--surface)',
                padding: '8px',
                overflowY: 'auto'
              }}
            >
              <div style={{
                fontWeight: '600',
                marginBottom: '6px',
                color: isToday ? 'var(--primary)' : 'var(--text)',
                fontSize: '0.95rem'
              }}>
                {day}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    onClick={() => openTask(task)}
                    style={{
                      fontSize: '11px',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      background: getPriorityColor(task.priority) + '20',
                      color: getPriorityColor(task.priority),
                      cursor: 'pointer',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      border: '1px solid ' + getPriorityColor(task.priority) + '40',
                      transition: 'all 0.15s'
                    }}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--text-secondary)',
                    fontWeight: '500'
                  }}>
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
