
import { useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000'

function LearningRoadmap({ userId, accessToken }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchRoadmap() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_URL}/users/${userId}/roadmap`,
          {
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        )

        const result = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(result.detail || 'Unable to load roadmap.')
        }

        setData(result)

      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchRoadmap()

    return () => controller.abort()
  }, [userId, accessToken, retry])

  if (loading) {
    return (
      <section className="section card">
        Loading your roadmap...
      </section>
    )
  }

  if (error) {
    return (
      <section className="section card">
        <h2>Roadmap unavailable</h2>
        <p>{error}</p>
        <button
          className="primary-btn"
          onClick={() => setRetry(v => v + 1)}
        >
          Retry
        </button>
      </section>
    )
  }

  if (!data) return null

  const steps = Array.isArray(data.roadmap) ? data.roadmap : []

  const progress = Math.min(
    100,
    Math.max(0, Number(data.progress) || 0)
  )

  return (
    <section id="roadmap" className="section">
      <div className="section-heading">
        <div>
          <p className="card-label">PERSONALIZED LEARNING</p>
          <h2>Your Learning Roadmap</h2>
        </div>

        <span className="roadmap-progress">
          {data.completed} of {data.total} completed
        </span>
      </div>

      <div
        className="progress-bar"
        style={{ marginBottom: 20 }}
      >
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {steps.length === 0 ? (
        <div className="card">
          No roadmap steps available.
        </div>
      ) : (
        <div className="roadmap">
          {steps.map(step => (
            <div
              className={`roadmap-item ${
                step.status === 'Completed'
                  ? 'completed'
                  : step.status === 'Current'
                    ? 'active'
                    : ''
              }`}
              key={step.id}
            >
              <div className="roadmap-number">
                {step.status === 'Completed' ? '✓' : step.id}
              </div>

              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>

                <small>
                  Proficiency: {step.proficiency}% /
                  Target: {step.target}%
                </small>
              </div>

              <span>{step.status}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default LearningRoadmap
