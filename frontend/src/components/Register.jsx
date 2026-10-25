import { useState } from 'react'
import { register, setAuthToken } from '../services/api'

export default function Register({ onRegister, onSwitchToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await register({ email, password, full_name: fullName || undefined })
      setAuthToken(data.access_token)
      localStorage.setItem('sakhi_token', data.access_token)
      localStorage.setItem('sakhi_user_email', email)
      onRegister({ email, token: data.access_token })
    } catch (err) {
      if (err.status === 409) {
        setError('An account with this email already exists.')
      } else {
        setError('Unable to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create your Sakhi account</h2>
          <p>Join Sakhi to keep your health records private and secure.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label>Full name (optional)</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
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
              autoComplete="new-password"
            />
            <small className="hint">At least 6 characters</small>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="button-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account?{' '}
          <button type="button" className="link" onClick={onSwitchToLogin}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
