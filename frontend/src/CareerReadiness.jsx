
import { useCallback, useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000'

function CareerReadiness({ userId, accessToken }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  const fetchReadiness = useCallback(async (signal) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_URL}/users/${userId}/readiness`,
        {
          signal,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.detail || 'Unable to load readiness.')
      }

      setData(result)

    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [userId, accessToken])

  useEffect(() => {
    const controller = new AbortController()
    fetchReadiness(controller.signal)
    return () => controller.abort()
  }, [fetchReadiness, retry])

  if (loading) {
    return <div className="card readiness-card">Loading readiness...</div>
  }

  if (error) {
    return (
      <div className="card readiness-card">
        <p className="card-label">CAREER READINESS</p>
        <h2>Readiness unavailable</h2>
        <p>{error}</p>
        <button
          className="primary-btn"
          onClick={() => setRetry(v => v + 1)}
        >
          Retry
        </button>
      </div>
    )
  }

  const score = Math.min(
    100,
    Math.max(0, Number(data?.readiness_score) || 0)
  )

  const skillsToImprove = Array.isArray(data?.skills_to_improve)
    ? data.skills_to_improve
    : []

  return (
    <div className="card readiness-card">
      <p className="card-label">CAREER READINESS</p>
      <h2>Overall Readiness</h2>

      <div className="score-container">
        <div className="score">
          <strong>{score.toFixed(0)}</strong>
          <span>%</span>
        </div>

        <div>
          <p className="score-status">
            {data?.status || 'Not assessed'}
          </p>

          <p className="score-description">
            {data?.target_career
              ? `Your readiness for ${data.target_career}, based on your skills.`
              : 'Add skills to calculate your career readiness.'}
          </p>
        </div>
      </div>

      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="progress-fill"
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="profile-info">
        <div>
          <span>Skills assessed</span>
          <strong>{data?.skills_assessed ?? 0}</strong>
        </div>

        <div>
          <span>Skills meeting target</span>
          <strong>{data?.skills_ready ?? 0}</strong>
        </div>

        <div>
          <span>Skills to improve</span>
          <strong>{skillsToImprove.length}</strong>
        </div>
      </div>

      {skillsToImprove.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <p className="card-label">AREAS TO IMPROVE</p>
          <p className="score-description">
            {skillsToImprove.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}

export default CareerReadiness
