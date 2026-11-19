
import { useCallback, useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000'

function StudentProfile({ userId, accessToken }) {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  const fetchStudent = useCallback(async (signal) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_URL}/users/${userId}`,
        {
          signal,
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to load profile.')
      }

      setStudent(data)

    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [userId, accessToken])

  useEffect(() => {
    const controller = new AbortController()
    fetchStudent(controller.signal)
    return () => controller.abort()
  }, [fetchStudent, retry])

  if (loading) {
    return <div className="card profile-card">Loading profile...</div>
  }

  if (error) {
    return (
      <div className="card profile-card">
        <h2>Profile unavailable</h2>
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

  if (!student) return null

  const initials = (student.name || 'Student')
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="card profile-card">
      <div className="card-header">
        <div>
          <p className="card-label">STUDENT PROFILE</p>
          <h2>Your Academic Profile</h2>
        </div>

        <div className="large-avatar">{initials}</div>
      </div>

      <div className="profile-info">
        <div>
          <span>Name</span>
          <strong>{student.name}</strong>
        </div>

        <div>
          <span>Email</span>
          <strong>{student.email}</strong>
        </div>

        <div>
          <span>Degree</span>
          <strong>{student.degree || 'Not provided'}</strong>
        </div>

        <div>
          <span>Branch</span>
          <strong>{student.branch || 'Not provided'}</strong>
        </div>

        <div>
          <span>Current Semester</span>
          <strong>
            {student.semester
              ? `Semester ${student.semester}`
              : 'Not provided'}
          </strong>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile
