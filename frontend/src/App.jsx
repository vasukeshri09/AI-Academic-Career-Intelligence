
import { useEffect, useState } from 'react'
import './App.css'

import Login from './Login'
import Onboarding from './Onboarding'
import StudentProfile from './StudentProfile'
import CareerInsights from './CareerInsights'
import CareerReadiness from './CareerReadiness'
import LearningRoadmap from './LearningRoadmap'
import Assistant from './Assistant'

const API_URL = 'http://127.0.0.1:8000'
const STORAGE_KEY = 'career_student'

function getSavedStudent() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!saved) return null

    const student = JSON.parse(saved)

    if (
      !student ||
      !Number.isInteger(Number(student.id)) ||
      Number(student.id) <= 0 ||
      !student.access_token
    ) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return {
      ...student,
      id: Number(student.id)
    }
  } catch (error) {
    console.error('Session restoration failed:', error)
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function App() {
  const [student, setStudent] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [showRegister, setShowRegister] = useState(false)

  // Validate the saved token when the application starts.
  useEffect(() => {
    let active = true

    async function restoreSession() {
      const savedStudent = getSavedStudent()

      if (!savedStudent) {
        if (active) setCheckingSession(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${savedStudent.access_token}`
          }
        })

        if (!response.ok) {
          throw new Error('Session expired. Please log in again.')
        }

        const user = await response.json()

        if (!active) return

        const session = {
          ...user,
          access_token: savedStudent.access_token,
          token_type: savedStudent.token_type || 'bearer'
        }

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(session)
        )

        setStudent(session)

      } catch (error) {
        console.error('Session validation failed:', error)

        localStorage.removeItem(STORAGE_KEY)

        if (active) setStudent(null)

      } finally {
        if (active) setCheckingSession(false)
      }
    }

    restoreSession()

    return () => {
      active = false
    }
  }, [])

  // Shared callback for registration and login.
  function handleAuthentication(authData) {
    const user = authData?.user || authData

    if (
      !user?.id ||
      !authData?.access_token
    ) {
      console.error('Invalid authentication response:', authData)
      alert('Authentication failed. Please try again.')
      return
    }

    const session = {
      ...user,
      id: Number(user.id),
      access_token: authData.access_token,
      token_type: authData.token_type || 'bearer'
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(session)
      )

      setStudent(session)
      setShowRegister(false)

    } catch (error) {
      console.error('Unable to save session:', error)
      alert('Unable to save your session.')
    }
  }

  // Logout.
  function logoutStudent() {
    if (!window.confirm('Are you sure you want to log out?')) {
      return
    }

    localStorage.removeItem(STORAGE_KEY)
    setStudent(null)
    setShowRegister(false)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Session loading screen.
  if (checkingSession) {
    return (
      <div className="auth-loading">
        <h2>Career Intelligence</h2>
        <p>Restoring your session...</p>
      </div>
    )
  }

  // Authentication screens.
  if (!student) {
    if (showRegister) {
      return (
        <Onboarding
          onComplete={handleAuthentication}
          onShowLogin={() => setShowRegister(false)}
        />
      )
    }

    return (
      <Login
        onComplete={handleAuthentication}
        onShowRegister={() => setShowRegister(true)}
      />
    )
  }

  const userId = student.id
  const accessToken = student.access_token

  return (
    <div className="app">

      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">AI</span>
          <span>Career Intelligence</span>
        </div>

        <div className="nav-links">
          <a href="#dashboard">Dashboard</a>
          <a href="#careers">Career Insights</a>
          <a href="#roadmap">Learning Roadmap</a>
          <a href="#assistant">AI Assistant</a>
        </div>

        <div className="profile">
          <div className="avatar">
            {student.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>

          <span>{student.name}</span>

          <button
            type="button"
            className="logout-btn"
            onClick={logoutStudent}
          >
            Logout
          </button>
        </div>
      </nav>

      <main id="dashboard" className="container">

        <section className="welcome">
          <div>
            <p className="eyebrow">
              PERSONALIZED INTELLIGENCE
            </p>

            <h1>Welcome, {student.name} 👋</h1>

            <p className="subtitle">
              Your personalized academic and career journey starts here.
            </p>
          </div>

          <button
            className="primary-btn"
            type="button"
            onClick={() =>
              document.getElementById('careers')?.scrollIntoView({
                behavior: 'smooth'
              })
            }
          >
            View Career Insights →
          </button>
        </section>

        <section className="top-grid">
          <StudentProfile
            userId={userId}
            accessToken={accessToken}
          />

          <CareerReadiness
            userId={userId}
            accessToken={accessToken}
          />
        </section>

        <CareerInsights
          userId={userId}
          accessToken={accessToken}
        />

        <LearningRoadmap
          userId={userId}
          accessToken={accessToken}
        />

        <Assistant
          userId={userId}
          accessToken={accessToken}
        />

      </main>

      <footer>
        <p>AI Academic & Career Intelligence Platform</p>
        <span>Personalized • Data Driven • AI Powered</span>
      </footer>

    </div>
  )
}

export default App
