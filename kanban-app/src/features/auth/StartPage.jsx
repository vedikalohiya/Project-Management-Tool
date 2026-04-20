export default function StartPage({ onLogin, onSignUp }) {
  return (
    <>
      <div className="bg-shapes">
        <div className="bg-shape-1"></div>
        <div className="bg-shape-2"></div>
      </div>
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="animate-fade-in" style={{
          width: '100%',
          maxWidth: '1100px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'stretch'
        }}>
          <section className="glass-panel" style={{ padding: '3rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--gradient-main)',
              display: 'grid',
              placeItems: 'center',
              color: 'white',
              fontSize: '1.8rem',
              fontWeight: '800',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 25px rgba(99,102,241,0.4)',
              animation: 'pulse-glow 3s infinite'
            }}>K</div>

            <p style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: '700',
              letterSpacing: '0.05em',
              marginBottom: '1.5rem'
            }}>
              ✨ PRODUCTIVITY REIMAGINED
            </p>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: '800',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              background: 'var(--gradient-main)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'var(--text)'
            }}>
              Plan workflow with unmatched speed.
            </h1>

            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
              maxWidth: '52ch',
              marginBottom: '2rem'
            }}>
              Organize projects, track progress, and collaborate seamlessly. Experience a beautifully designed board that sends you straight into the zone.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <button onClick={onLogin} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Sign in
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
              <button onClick={onSignUp} className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Create account
              </button>
            </div>
          </section>

          <aside style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}>
            <div className="glass-card" style={{ padding: '2.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text)' }}>
                Premium Features
              </h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {[
                  { icon: '🚀', text: 'Kanban, list, and intelligent stats views' },
                  { icon: '⚡', text: 'Bulk actions and powerful keyboard shortcuts' },
                  { icon: '🎨', text: 'Stunning glassmorphism & dynamic dark mode' },
                  { icon: '🔔', text: 'Realtime sync and smart notifications' }
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontWeight: 500,
                    transition: 'transform 0.2s ease'
                  }} className="hover-lift">
                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{
              padding: '1.5rem 2rem',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))',
              border: '1px solid rgba(99,102,241,0.15)'
            }}>
              <p style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: '800', fontSize: '1.1rem' }}>Start in seconds</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Join the seamless experience. Use the buttons to login or signup and dive immediately into your beautiful dashboard.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
