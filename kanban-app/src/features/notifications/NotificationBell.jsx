import { useNotificationStore } from './useNotificationStore'

export default function NotificationBell({ onClick }) {
  const unreadCount = useNotificationStore((state) => state.unreadCount)

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        background: 'var(--surface-2)',
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      aria-label="Notifications"
    >
      🔔
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          minWidth: '18px',
          height: '18px',
          borderRadius: '999px',
          background: 'var(--danger, #ef4444)',
          color: 'white',
          fontSize: '10px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px'
        }}>
          {unreadCount}
        </span>
      )}
    </button>
  )
}
