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
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at top, rgba(99,102,241,0.16), transparent 28%), var(--bg)'
    }}>
      <div style={{
        background: 'var(--surface)', padding: '2rem',
        borderRadius: '20px', width: '100%',
        maxWidth: '440px', boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--text)' }}>
            {isSignUp ? 'Create account' : 'Sign in'}
          </h1>
          {onBack && (
            <button onClick={onBack} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Back
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: '1rem' }}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required
            style={{ padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: '1rem' }}
          />
          {error && (
            <p style={{ color: error.includes('Check') ? 'var(--success)' : 'var(--danger)', fontSize: '0.875rem' }}>
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} style={{
            padding: '0.9rem', borderRadius: '12px',
            background: 'var(--primary)', color: 'white',
            border: 'none', fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginLeft: '4px' }}>
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}