import { useNotificationStore } from './useNotificationStore'

const typeStyles = {
  info: { border: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)' },
  success: { border: '#34d399', bg: 'rgba(52, 211, 153, 0.12)' },
  warning: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  error: { border: '#f87171', bg: 'rgba(248, 113, 113, 0.12)' }
}

export default function NotificationToasts() {
  const items = useNotificationStore((state) => state.items)
  const dismiss = useNotificationStore((state) => state.dismiss)

  if (items.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      right: '1rem',
      bottom: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      zIndex: 80,
      maxWidth: '360px',
      width: 'calc(100vw - 2rem)'
    }}>
      {items.map((item) => {
        const palette = typeStyles[item.type] || typeStyles.info

        return (
          <div
            key={item.id}
            style={{
              background: 'var(--surface)',
              color: 'var(--text)',
              border: `1px solid ${palette.border}`,
              borderLeft: `4px solid ${palette.border}`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: '0.9rem 1rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.25rem' }}>{item.title}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.message}</p>
              </div>
              <button
                onClick={() => dismiss(item.id)}
                style={{
                  border: 'none',
                  background: palette.bg,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  width: '24px',
                  height: '24px',
                  borderRadius: '999px'
                }}
              >
                ×
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
