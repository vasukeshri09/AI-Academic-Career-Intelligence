
import { useEffect, useState } from 'react'
import './Onboarding.css'

const API_URL = 'http://127.0.0.1:8000'

function getErrorMessage(data, fallback) {
  if (typeof data.detail === 'string') return data.detail

  if (Array.isArray(data.detail)) {
    return data.detail.map(item => item.msg).join(', ')
  }

  return fallback
}

async function readResponse(response) {
  return response.json().catch(() => ({}))
}

function Onboarding({ onComplete, onShowLogin }) {
  const [step, setStep] = useState(1)

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    degree: 'B.Tech',
    branch: '',
    semester: 1
  })

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [registeredUser, setRegisteredUser] = useState(null)
  const [authToken, setAuthToken] = useState('')

  const [skills, setSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState({})

  const [loading, setLoading] = useState(false)
  const [loadingSkills, setLoadingSkills] = useState(true)
  const [error, setError] = useState('')

  // Load skills available in the database.
  useEffect(() => {
    const controller = new AbortController()

    async function fetchSkills() {
      try {
        const response = await fetch(`${API_URL}/skills/`, {
          signal: controller.signal
        })

        const data = await readResponse(response)

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data, 'Unable to load available skills.')
          )
        }

        setSkills(Array.isArray(data) ? data : [])

      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSkills(false)
        }
      }
    }

    fetchSkills()

    return () => controller.abort()
  }, [])

  function updateProfile(event) {
    const { name, value } = event.target

    setProfile(previous => ({
      ...previous,
      [name]: name === 'semester' ? Number(value) : value
    }))
  }

  // Register a new student and receive an authentication token.
  async function registerStudent(event) {
    event.preventDefault()
    setError('')

    if (registeredUser && authToken) {
      setStep(2)
      return
    }

    if (
      !profile.name.trim() ||
      !profile.email.trim() ||
      !profile.branch.trim()
    ) {
      setError('Please complete all required fields.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...profile,
          name: profile.name.trim(),
          email: profile.email.trim().toLowerCase(),
          password
        })
      })

      const data = await readResponse(response)

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, 'Student registration failed.')
        )
      }

      if (!data.access_token || !data.user?.id) {
        throw new Error('Registration response is incomplete.')
      }

      setRegisteredUser(data.user)
      setAuthToken(data.access_token)
      setStep(2)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Select or deselect a skill.
  function toggleSkill(skill) {
    setSelectedSkills(previous => {
      const updated = { ...previous }

      if (updated[skill.id] !== undefined) {
        delete updated[skill.id]
      } else {
        updated[skill.id] = {
          id: skill.id,
          name: skill.name,
          proficiency: 50
        }
      }

      return updated
    })
  }

  // Set proficiency between 0 and 100.
  function updateProficiency(skillId, value) {
    setSelectedSkills(previous => ({
      ...previous,
      [skillId]: {
        ...previous[skillId],
        proficiency: Number(value)
      }
    }))
  }

  // Save skills and retrieve personalized recommendations.
  async function finishOnboarding() {
    if (loading) return

    const chosenSkills = Object.values(selectedSkills)

    if (!registeredUser || !authToken) {
      setError('Registration session missing. Please register again.')
      return
    }

    if (chosenSkills.length === 0) {
      setError('Please select at least one skill.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const userId = registeredUser.id

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }

      // Save selected skills.
      const saveResults = []

      for (const skill of chosenSkills) {
        const response = await fetch(
          `${API_URL}/users/${userId}/skills`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              skill_name: skill.name,
              proficiency: skill.proficiency
            })
          }
        )

        const data = await readResponse(response)

        if (!response.ok) {
          throw new Error(
            getErrorMessage(data, `Unable to save ${skill.name}.`)
          )
        }

        saveResults.push(data)
      }

      // Retrieve career recommendations.
      const recommendationResponse = await fetch(
        `${API_URL}/users/${userId}/recommendations`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      )

      const recommendationData =
        await readResponse(recommendationResponse)

      if (!recommendationResponse.ok) {
        throw new Error(
          getErrorMessage(
            recommendationData,
            'Unable to retrieve career recommendations.'
          )
        )
      }

      // Pass the complete authenticated session to App.jsx.
      onComplete({
        ...registeredUser,
        id: Number(registeredUser.id),
        access_token: authToken,
        token_type: 'bearer',
        skills: saveResults,
        recommendations:
          recommendationData.recommendations || []
      })

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const progress = step === 1 ? 33 : 66

  return (
    <main className="onboarding-page">
      <div className="onboarding-container">

        <div className="onboarding-brand">
          <div className="onboarding-logo">AI</div>
          <span>Career Intelligence</span>
        </div>

        <div className="onboarding-heading">
          <p className="card-label">
            YOUR PERSONALIZED CAREER JOURNEY
          </p>

          <h1>
            {step === 1
              ? 'Welcome! Let’s get to know you.'
              : 'Let’s understand your skills.'}
          </h1>

          <p>
            {step === 1
              ? 'Create your account and enter your academic details.'
              : 'Select your skills and rate your current proficiency.'}
          </p>
        </div>

        <div className="onboarding-progress">
          <div className="progress-track">
            <div
              className="progress-current"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="progress-labels">
            <span className="active">1. Profile</span>
            <span className={step >= 2 ? 'active' : ''}>
              2. Skills
            </span>
            <span>3. Recommendations</span>
          </div>
        </div>

        {/* STEP 1: REGISTRATION */}

        {step === 1 && (
          <form
            className="onboarding-card"
            onSubmit={registerStudent}
          >
            <div className="onboarding-card-heading">
              <h2>Create Your Account</h2>
              <p>Enter your academic and login information.</p>
            </div>

            <div className="onboarding-form-grid">

              <div className="onboarding-field">
                <label>Full Name</label>
                <input
                  name="name"
                  value={profile.name}
                  onChange={updateProfile}
                  placeholder="Enter your full name"
                  maxLength={100}
                  autoComplete="name"
                  required
                  disabled={!!registeredUser}
                />
              </div>

              <div className="onboarding-field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={updateProfile}
                  placeholder="student@example.com"
                  maxLength={150}
                  autoComplete="email"
                  required
                  disabled={!!registeredUser}
                />
              </div>

              <div className="onboarding-field">
                <label>Degree</label>
                <select
                  name="degree"
                  value={profile.degree}
                  onChange={updateProfile}
                  disabled={!!registeredUser}
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="B.E.">B.E.</option>
                  <option value="B.Sc.">B.Sc.</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="onboarding-field">
                <label>Branch / Specialization</label>
                <input
                  name="branch"
                  value={profile.branch}
                  onChange={updateProfile}
                  placeholder="Computer Science and Engineering"
                  maxLength={100}
                  required
                  disabled={!!registeredUser}
                />
              </div>

              <div className="onboarding-field">
                <label>Current Semester</label>
                <select
                  name="semester"
                  value={profile.semester}
                  onChange={updateProfile}
                  disabled={!!registeredUser}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(number => (
                    <option key={number} value={number}>
                      Semester {number}
                    </option>
                  ))}
                </select>
              </div>

              <div className="onboarding-field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                  disabled={!!registeredUser}
                />
              </div>

              <div className="onboarding-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={event =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm your password"
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                  disabled={!!registeredUser}
                />
              </div>

            </div>

            {error && (
              <p className="onboarding-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="onboarding-primary"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Creating account...'
                : 'Continue to Skill Assessment →'}
            </button>

            <p className="onboarding-login">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onShowLogin}
                disabled={loading || !onShowLogin}
              >
                Login here
              </button>
            </p>
          </form>
        )}

        {/* STEP 2: SKILL ASSESSMENT */}

        {step === 2 && (
          <div className="onboarding-card">

            <div className="onboarding-card-heading">
              <h2>Assess Your Skills</h2>
              <p>
                Select your skills and set your proficiency
                from 0 to 100.
              </p>
            </div>

            {loadingSkills ? (
              <div className="onboarding-empty">
                Loading available skills...
              </div>
            ) : skills.length === 0 ? (
              <div className="onboarding-empty">
                No skills are currently available in the database.
              </div>
            ) : (
              <div className="onboarding-skill-list">
                {skills.map(skill => {
                  const selected =
                    selectedSkills[skill.id] !== undefined

                  const proficiency =
                    selectedSkills[skill.id]?.proficiency ?? 50

                  return (
                    <div
                      className={`onboarding-skill ${
                        selected ? 'selected' : ''
                      }`}
                      key={skill.id}
                    >
                      <label className="skill-select-label">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSkill(skill)}
                        />

                        <span className="skill-select-name">
                          <strong>{skill.name}</strong>
                          <small>
                            {skill.category || 'Technical Skill'}
                          </small>
                        </span>
                      </label>

                      {selected && (
                        <div className="skill-assessment">
                          <div className="skill-assessment-heading">
                            <span>Proficiency level</span>
                            <strong>{proficiency}%</strong>
                          </div>

                          <input
                            className="proficiency-slider"
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={proficiency}
                            onChange={event =>
                              updateProficiency(
                                skill.id,
                                event.target.value
                              )
                            }
                          />

                          <div className="slider-labels">
                            <span>Beginner</span>
                            <span>Intermediate</span>
                            <span>Advanced</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="selected-skills-count">
              {Object.keys(selectedSkills).length} skills selected
            </div>

            {error && (
              <p className="onboarding-error" role="alert">
                {error}
              </p>
            )}

            <div className="onboarding-actions">
              <button
                className="onboarding-secondary"
                type="button"
                onClick={() => {
                  setError('')
                  setStep(1)
                }}
                disabled={loading}
              >
                ← Back
              </button>

              <button
                className="onboarding-primary"
                type="button"
                onClick={finishOnboarding}
                disabled={
                  loading ||
                  loadingSkills ||
                  skills.length === 0 ||
                  Object.keys(selectedSkills).length === 0
                }
              >
                {loading
                  ? 'Generating recommendations...'
                  : 'Discover My Careers →'}
              </button>
            </div>
          </div>
        )}

        <p className="onboarding-footer">
          AI Academic & Career Intelligence Platform
        </p>

      </div>
    </main>
  )
}

export default Onboarding
