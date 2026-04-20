export default function StartPage({ onLogin, onSignUp }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at top, rgba(99,102,241,0.18), transparent 36%), linear-gradient(180deg, var(--bg), var(--surface-2))'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        alignItems: 'stretch'
      }}>
        <section style={{
          padding: '2.25rem',
          borderRadius: '24px',
          background: 'linear-gradient(160deg, var(--surface), var(--surface-2))',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, var(--primary), #22c55e)',
            display: 'grid',
            placeItems: 'center',
            color: 'white',
            fontSize: '1.4rem',
            fontWeight: '700',
            marginBottom: '1.25rem'
          }}>K</div>

          <p style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            background: 'rgba(99,102,241,0.12)',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: '700',
            letterSpacing: '0.04em',
            marginBottom: '1rem'
          }}>
            PRODUCTIVITY BOARD
          </p>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 4rem)',
            lineHeight: 1.02,
            marginBottom: '1rem',
            color: 'var(--text)'
          }}>
            Plan work with a board that feels fast, focused, and clear.
          </h1>

          <p style={{
            fontSize: '1rem',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            maxWidth: '52ch',
            marginBottom: '1.5rem'
          }}>
            Organize projects, track progress, and collaborate from a clean start page that sends you straight into login, signup, and then your dashboard.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            <button onClick={onLogin} style={{
              padding: '0.9rem 1.2rem',
              border: 'none',
              borderRadius: '14px',
              background: 'var(--primary)',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 12px 24px rgba(99,102,241,0.25)'
            }}>
              Sign in
            </button>
            <button onClick={onSignUp} style={{
              padding: '0.9rem 1.2rem',
              borderRadius: '14px',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}>
              Create account
            </button>
          </div>
        </section>

        <aside style={{
          padding: '2rem',
          borderRadius: '24px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--text)' }}>What you get</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {[
                'Kanban, list, calendar, and stats views',
                'Bulk actions, undo/redo, and keyboard shortcuts',
                'Recurring tasks, attachments, and custom fields',
                'Realtime notifications and dark mode'
              ].map((item) => (
                <div key={item} style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '14px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{
            padding: '1rem 1.1rem',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(99,102,241,0.14))',
            border: '1px solid rgba(99,102,241,0.15)'
          }}>
            <p style={{ marginBottom: '0.35rem', color: 'var(--text)', fontWeight: '700' }}>Start in seconds</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Use the buttons above to choose login or signup, then you’ll land directly in the dashboard after authentication.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
