import { useNotificationStore } from './useNotificationStore'

export default function NotificationDrawer({ onClose }) {
  const items = useNotificationStore((state) => state.items)
  const markAllRead = useNotificationStore((state) => state.markAllRead)
  const dismiss = useNotificationStore((state) => state.dismiss)

  return (
    <div style={{
      position: 'fixed',
      right: '1rem',
      top: '72px',
      width: '320px',
      maxWidth: 'calc(100vw - 2rem)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 70,
      overflow: 'hidden'
    }}>
      <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '0.9rem' }}>Notifications</strong>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
      </div>
      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
        {items.length === 0 ? (
          <p style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No notifications yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} style={{ padding: '0.9rem 1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>{item.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.message}</p>
                </div>
                <button onClick={() => dismiss(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}>×</button>
              </div>
            </div>
          ))
        )}
      </div>
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={markAllRead} style={{ border: 'none', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem' }}>Mark all read</button>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}>Close</button>
      </div>
    </div>
  )
}
