import { useState } from 'react'
import { register, setAuthToken } from '../services/api'

export default function Register({ t, onRegister, onSwitchToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [errorCode, setErrorCode] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorCode(null)
    setLoading(true)
    try {
      const data = await register({ email, password, full_name: fullName || undefined })
      setAuthToken(data.access_token)
      localStorage.setItem('sakhi_token', data.access_token)
      localStorage.setItem('sakhi_user_email', email)
      onRegister({ email, token: data.access_token })
    } catch (err) {
      setErrorCode(err.status === 409 ? 'email_exists' : 'generic')
    } finally {
      setLoading(false)
    }
  }

  const errorMessage = errorCode === 'email_exists'
    ? (t?.authErrorEmailExists || 'An account with this email already exists.')
    : errorCode === 'generic'
      ? (t?.authErrorRegisterGeneric || 'Unable to create account. Please try again.')
      : null

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand-badge" aria-hidden="true">
          <span className="brand-mark">s</span>
        </div>
        <div className="auth-header">
          <h2>{t?.authRegisterTitle || 'Create your Sakhi account'}</h2>
          <p>{t?.authRegisterSubtitle || 'Join Sakhi to keep your health records private and secure.'}</p>
        </div>

        {errorMessage && (
          <div className="auth-error-alert" role="alert" aria-live="assertive">
            <span className="auth-error-icon" aria-hidden="true">⚠</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="register-name">
              <span>{t?.authFullName || 'Full name'}</span>
              <span className="label-optional">{t?.authOptional || '(optional)'}</span>
            </label>
            <input
              id="register-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t?.authFullNamePlaceholder || 'Your name'}
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label htmlFor="register-email">{t?.authEmail || 'Email'}</label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t?.authEmailPlaceholder || 'you@example.com'}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="register-password">{t?.authPassword || 'Password'}</label>
            <input
              id="register-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t?.authPasswordPlaceholder || '••••••••'}
              autoComplete="new-password"
              aria-describedby="password-hint"
            />
            <small id="password-hint" className="hint">
              {t?.authPasswordHint || 'At least 6 characters'}
            </small>
          </div>
          <button type="submit" className="button-primary auth-submit-btn" disabled={loading}>
            {loading ? (t?.authRegistering || 'Creating account…') : (t?.authRegisterBtn || 'Create account ↗')}
          </button>
        </form>
        <p className="auth-footer">
          {t?.authHaveAccount || 'Already have an account?'}{' '}
          <button type="button" className="auth-link-btn" onClick={onSwitchToLogin}>
            {t?.signIn || 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
