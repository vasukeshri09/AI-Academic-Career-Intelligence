
import { useState } from 'react'
import './Login.css'

const API_URL = 'http://127.0.0.1:8000'

function Login({ onComplete, onShowRegister }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function updateCredentials(event) {
    const { name, value } = event.target

    setCredentials(previous => ({
      ...previous,
      [name]: value
    }))
  }

  async function handleLogin(event) {
    event.preventDefault()

    if (loading) return

    if (typeof onComplete !== 'function') {
      setError('Login configuration error. Please refresh the page.')
      return
    }

    setError('')

    if (!credentials.email.trim() || !credentials.password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.detail || 'Invalid email or password.'
        )
      }

      if (!data.access_token || !data.user?.id) {
        throw new Error('Invalid authentication response.')
      }

      onComplete(data)

    } catch (err) {
      setError(err.message || 'Unable to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-container">

        <div className="login-brand">
          <div className="login-logo">AI</div>
          <span>Career Intelligence</span>
        </div>

        <div className="login-heading">
          <p className="card-label">WELCOME BACK</p>
          <h1>Continue Your Journey</h1>
          <p>
            Log in to access your academic profile,
            career recommendations and learning roadmap.
          </p>
        </div>

        <form className="login-card" onSubmit={handleLogin}>

          <div className="login-card-heading">
            <h2>Student Login</h2>
            <p>Enter your registered account details.</p>
          </div>

          <div className="login-field">
            <label htmlFor="login-email">Email Address</label>

            <input
              id="login-email"
              type="email"
              name="email"
              value={credentials.email}
              onChange={updateCredentials}
              placeholder="student@example.com"
              autoComplete="username"
              maxLength={150}
              required
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>

            <div className="login-password-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={updateCredentials}
                placeholder="Enter your password"
                autoComplete="current-password"
                maxLength={128}
                required
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(value => !value)}
                disabled={loading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login to Dashboard →'}
          </button>

          <div className="login-register">
            <span>Don't have an account?</span>

            <button
              type="button"
              onClick={onShowRegister}
              disabled={loading}
            >
              Create an account
            </button>
          </div>

        </form>

        <p className="login-footer">
          AI Academic & Career Intelligence Platform
        </p>

      </div>
    </main>
  )
}

export default Login
