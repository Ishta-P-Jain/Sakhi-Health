import { useState } from 'react'
import { login, setAuthToken } from '../../services/api'

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login({ email, password })
      setAuthToken(data.access_token)
      localStorage.setItem('sakhi_token', data.access_token)
      localStorage.setItem('sakhi_user_email', email)
      onLogin({ email, token: data.access_token })
    } catch (err) {
      setError(err.status === 401 ? 'Invalid email or password.' : 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Sign in to Sakhi</h2>
          <p>Welcome back. Enter your email and password to access your health records.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account?{' '}
          <button type="button" className="link" onClick={onSwitchToRegister}>
            Create account
          </button>
        </p>
      </div>
    </div>
  )
}
