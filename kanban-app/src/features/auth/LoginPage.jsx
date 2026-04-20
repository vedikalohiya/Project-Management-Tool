import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'

export default function LoginPage({ initialIsSignUp = false, onBack }) {
  const { signIn, signUp } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
        setError('Check your email to confirm your account!')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
        <div className="glass-panel animate-fade-in" style={{
          padding: '3rem', width: '100%',
          maxWidth: '460px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text)' }}>
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h1>
            {onBack && (
              <button onClick={onBack} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                Back
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Email</label>
              <input
                type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="input-modern"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Password</label>
              <input
                type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="input-modern"
              />
            </div>
            
            {error && (
              <div style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: '8px', 
                background: error.includes('Check') ? 'rgba(34, 197, 94, 0.1)' : 'var(--danger-bg)',
                color: error.includes('Check') ? 'var(--success)' : 'var(--danger)',
                fontSize: '0.9rem',
                border: `1px solid ${error.includes('Check') ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {error}
              </div>
            )}
            
            <button type="submit" disabled={loading} className="btn-primary" style={{
              marginTop: '0.5rem',
              padding: '1rem',
              fontSize: '1.05rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}>
              {loading ? (
                <>
                  <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsSignUp(!isSignUp)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', marginLeft: '6px' }}>
              {isSignUp ? 'Sign in' : 'Sign up here'}
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </>
  )
}