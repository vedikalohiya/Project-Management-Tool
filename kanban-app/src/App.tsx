import { useAuthStore } from './store/useAuthStore'
import LoginPage from './features/auth/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StartPage from './features/auth/StartPage'
import { useState } from 'react'

function App() {
  const { user, loading } = useAuthStore()
  const [screen, setScreen] = useState<'start' | 'login'>('start')
  const [authMode, setAuthMode] = useState(false)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading...</p>
    </div>
  )

  if (user) return <DashboardPage />

  if (screen === 'start') {
    return (
      <StartPage
        onLogin={() => {
          setAuthMode(false)
          setScreen('login')
        }}
        onSignUp={() => {
          setAuthMode(true)
          setScreen('login')
        }}
      />
    )
  }

  return (
    <LoginPage
      initialIsSignUp={authMode}
      onBack={() => setScreen('start')}
    />
  )
}

export default App