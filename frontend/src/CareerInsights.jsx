
import { useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000'

function CareerInsights({ userId, accessToken }) {
  const [recommendations, setRecommendations] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadCareerData() {
      try {
        setLoading(true)
        setError('')

        const headers = {
          Authorization: `Bearer ${accessToken}`
        }

        const [careerResponse, skillResponse] = await Promise.all([
          fetch(`${API_URL}/users/${userId}/recommendations`, {
            headers,
            signal: controller.signal
          }),
          fetch(`${API_URL}/users/${userId}/skills`, {
            headers,
            signal: controller.signal
          })
        ])

        const careerData = await careerResponse.json().catch(() => ({}))
        const skillData = await skillResponse.json().catch(() => ({}))

        if (!careerResponse.ok || !skillResponse.ok) {
          throw new Error(
            careerData.detail ||
            skillData.detail ||
            'Unable to retrieve career information.'
          )
        }

        setRecommendations(
          Array.isArray(careerData.recommendations)
            ? careerData.recommendations
            : []
        )

        setSkills(Array.isArray(skillData) ? skillData : [])

      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadCareerData()

    return () => controller.abort()
  }, [userId, accessToken, retry])

  if (loading) {
    return (
      <div className="section card">
        Loading career recommendations and skills...
      </div>
    )
  }

  if (error) {
    return (
      <div className="section card">
        <h2>Career information unavailable</h2>
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

  const topCareer = recommendations[0]

  function getSkillStatus(value) {
    if (value >= 75) return 'Strong'
    if (value >= 60) return 'Good'
    if (value >= 40) return 'Needs Work'
    return 'Beginner'
  }

  function getSkillClass(value) {
    if (value >= 75) return 'skill-good'
    if (value >= 60) return 'skill-warning'
    return 'skill-danger'
  }

  return (
    <>
      <section id="careers" className="section">
        <div className="section-heading">
          <div>
            <p className="card-label">CAREER RECOMMENDATIONS</p>
            <h2>Recommended Career Paths</h2>
          </div>

          <span className="ai-badge">Algorithm Powered</span>
        </div>

        {recommendations.length === 0 ? (
          <div className="card">
            No recommendations available. Add your skills to generate them.
          </div>
        ) : (
          <div className="career-grid">
            {recommendations.slice(0, 3).map((career, index) => {
              const gaps = Array.isArray(career.skill_gaps)
                ? career.skill_gaps
                : []

              return (
                <div
                  className={`career-card ${index === 0 ? 'featured' : ''}`}
                  key={career.career_id}
                >
                  <div className="career-icon">
                    {['🤖', '📊', '💻'][index] || '🚀'}
                  </div>

                  <h3>{career.career_title}</h3>
                  <p>{career.description}</p>

                  <div className="match">
                    <strong>
                      {(Number(career.match_score) || 0).toFixed(2)}%
                    </strong>
                    <span>Skill Match</span>
                  </div>

                  <div className="career-gaps">
                    <strong>Skills to improve:</strong>
                    <p>
                      {gaps.length ? gaps.join(', ') : 'No major skill gaps.'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section id="skills" className="section">
        <div className="section-heading">
          <div>
            <p className="card-label">SKILL ANALYSIS</p>
            <h2>Your Skill Profile</h2>
          </div>

          <span className="ai-badge">Database Connected</span>
        </div>

        {skills.length === 0 ? (
          <div className="card">
            No skills added yet.
          </div>
        ) : (
          <div className="skills-grid">
            {skills.map(skill => {
              const proficiency = Math.min(
                100,
                Math.max(0, Number(skill.proficiency) || 0)
              )

              return (
                <div className="skill-card" key={skill.id}>
                  <div className="skill-top">
                    <span>{skill.skill_name}</span>
                    <span className={getSkillClass(proficiency)}>
                      {getSkillStatus(proficiency)}
                    </span>
                  </div>

                  <div className="skill-bar">
                    <div
                      className="skill-fill"
                      style={{ width: `${proficiency}%` }}
                    />
                  </div>

                  <small>{proficiency}% proficiency</small>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {topCareer && (
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="card-label">PERSONALIZED ANALYSIS</p>
              <h2>Skill Gaps for {topCareer.career_title}</h2>
            </div>
          </div>

          <div className="card">
            {(topCareer.skill_analysis || []).map(item => {
              const proficiency = Math.min(
                100,
                Math.max(0, Number(item.student_proficiency) || 0)
              )

              return (
                <div key={item.skill} style={{ marginBottom: 20 }}>
                  <div className="skill-top">
                    <span>{item.skill}</span>
                    <span className={
                      item.needs_improvement ? 'skill-warning' : 'skill-good'
                    }>
                      {proficiency}% / 100%
                    </span>
                  </div>

                  <div className="skill-bar">
                    <div
                      className="skill-fill"
                      style={{ width: `${proficiency}%` }}
                    />
                  </div>

                  {item.needs_improvement && (
                    <small>
                      Improvement needed — target proficiency: 60%
                    </small>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}

export default CareerInsights
