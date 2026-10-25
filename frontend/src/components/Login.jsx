import { useState } from 'react'
import { login, setAuthToken } from '../services/api'

export default function Login({ t, onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorCode, setErrorCode] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorCode(null)
    setLoading(true)
    try {
      const data = await login({ email, password })
      setAuthToken(data.access_token)
      localStorage.setItem('sakhi_token', data.access_token)
      localStorage.setItem('sakhi_user_email', email)
      onLogin({ email, token: data.access_token })
    } catch (err) {
      setErrorCode(err.status === 401 ? 'invalid_credentials' : 'generic')
    } finally {
      setLoading(false)
    }
  }

  const errorMessage = errorCode === 'invalid_credentials'
    ? (t?.authErrorInvalidCredentials || 'Invalid email or password.')
    : errorCode === 'generic'
      ? (t?.authErrorGeneric || 'Unable to sign in. Please try again.')
      : null

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand-badge" aria-hidden="true">
          <span className="brand-mark">s</span>
        </div>
        <div className="auth-header">
          <h2>{t?.authSignInTitle || 'Sign in to Sakhi'}</h2>
          <p>{t?.authSignInSubtitle || 'Welcome back. Enter your email and password to access your health records.'}</p>
        </div>

        {errorMessage && (
          <div className="auth-error-alert" role="alert" aria-live="assertive">
            <span className="auth-error-icon" aria-hidden="true">⚠</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">{t?.authEmail || 'Email'}</label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t?.authEmailPlaceholder || 'you@example.com'}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">{t?.authPassword || 'Password'}</label>
            <input
              id="login-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t?.authPasswordPlaceholder || '••••••••'}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="button-primary auth-submit-btn" disabled={loading}>
            {loading ? (t?.authSigningIn || 'Signing in…') : (t?.authSignInBtn || 'Sign in ↗')}
          </button>
        </form>
        <p className="auth-footer">
          {t?.authNoAccount || "Don't have an account?"}{' '}
          <button type="button" className="auth-link-btn" onClick={onSwitchToRegister}>
            {t?.createAccount || 'Create account'}
          </button>
        </p>
      </div>
    </div>
  )
}
