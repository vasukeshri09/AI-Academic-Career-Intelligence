import './App.css'

function App() {
  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">AI</span>
          <span>Career Intelligence</span>
        </div>

        <div className="nav-links">
          <a href="#dashboard">Dashboard</a>
          <a href="#careers">Career Insights</a>
          <a href="#roadmap">Learning Roadmap</a>
        </div>

        <div className="profile">
          <div className="avatar">VS</div>
          <span>Student</span>
        </div>
      </nav>


      {/* Main Dashboard */}
      <main id="dashboard" className="container">

        {/* Welcome */}
        <section className="welcome">
          <div>
            <p className="eyebrow">PERSONALIZED INTELLIGENCE</p>
            <h1>Welcome back, Student 👋</h1>
            <p className="subtitle">
              Your personalized academic and career journey starts here.
            </p>
          </div>

          <button className="primary-btn">
            View Career Insights →
          </button>
        </section>


        {/* Profile + Readiness */}
        <section className="top-grid">

          <div className="card profile-card">
            <div className="card-header">
              <div>
                <p className="card-label">STUDENT PROFILE</p>
                <h2>Your Academic Profile</h2>
              </div>

              <div className="large-avatar">VS</div>
            </div>

            <div className="profile-info">
              <div>
                <span>Name</span>
                <strong>Student</strong>
              </div>

              <div>
                <span>Degree</span>
                <strong>B.Tech</strong>
              </div>

              <div>
                <span>Branch</span>
                <strong>Computer Science & Engineering</strong>
              </div>

              <div>
                <span>Current Semester</span>
                <strong>Semester 5</strong>
              </div>
            </div>
          </div>


          <div className="card readiness-card">
            <p className="card-label">CAREER READINESS</p>
            <h2>Overall Readiness</h2>

            <div className="score-container">
              <div className="score">
                <strong>72</strong>
                <span>%</span>
              </div>

              <div>
                <p className="score-status">Good Progress</p>
                <p className="score-description">
                  You are on the right track. Keep improving your technical
                  and practical skills.
                </p>
              </div>
            </div>

            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>

        </section>


        {/* Career Recommendations */}
        <section id="careers" className="section">

          <div className="section-heading">
            <div>
              <p className="card-label">AI RECOMMENDATIONS</p>
              <h2>Recommended Career Paths</h2>
            </div>

            <span className="ai-badge">AI Powered</span>
          </div>


          <div className="career-grid">

            <div className="career-card featured">
              <div className="career-icon">🤖</div>

              <div>
                <h3>AI / ML Engineer</h3>
                <p>
                  Build intelligent systems using machine learning,
                  deep learning and AI technologies.
                </p>
              </div>

              <div className="match">
                <strong>91%</strong>
                <span>Match</span>
              </div>

              <button>Explore Career →</button>
            </div>


            <div className="career-card">
              <div className="career-icon">📊</div>

              <div>
                <h3>Data Scientist</h3>
                <p>
                  Analyze data and develop predictive models to
                  solve real-world problems.
                </p>
              </div>

              <div className="match">
                <strong>84%</strong>
                <span>Match</span>
              </div>

              <button>Explore Career →</button>
            </div>


            <div className="career-card">
              <div className="career-icon">💻</div>

              <div>
                <h3>Software Engineer</h3>
                <p>
                  Design, develop and maintain scalable software
                  applications.
                </p>
              </div>

              <div className="match">
                <strong>79%</strong>
                <span>Match</span>
              </div>

              <button>Explore Career →</button>
            </div>

          </div>

        </section>


        {/* Skills */}
        <section className="section">

          <div className="section-heading">
            <div>
              <p className="card-label">SKILL ANALYSIS</p>
              <h2>Your Skill Gap</h2>
            </div>

            <button className="text-btn">
              View All Skills →
            </button>
          </div>


          <div className="skills-grid">

            <div className="skill-card">
              <div className="skill-top">
                <span>Python</span>
                <span className="skill-good">Strong</span>
              </div>

              <div className="skill-bar">
                <div className="skill-fill python"></div>
              </div>

              <small>85% proficiency</small>
            </div>


            <div className="skill-card">
              <div className="skill-top">
                <span>Machine Learning</span>
                <span className="skill-good">Good</span>
              </div>

              <div className="skill-bar">
                <div className="skill-fill ml"></div>
              </div>

              <small>72% proficiency</small>
            </div>


            <div className="skill-card">
              <div className="skill-top">
                <span>SQL</span>
                <span className="skill-warning">Needs Work</span>
              </div>

              <div className="skill-bar">
                <div className="skill-fill sql"></div>
              </div>

              <small>55% proficiency</small>
            </div>


            <div className="skill-card">
              <div className="skill-top">
                <span>Deep Learning</span>
                <span className="skill-danger">Beginner</span>
              </div>

              <div className="skill-bar">
                <div className="skill-fill dl"></div>
              </div>

              <small>35% proficiency</small>
            </div>

          </div>

        </section>


        {/* Learning Roadmap */}
        <section id="roadmap" className="section">

          <div className="section-heading">
            <div>
              <p className="card-label">PERSONALIZED LEARNING</p>
              <h2>Your Learning Roadmap</h2>
            </div>

            <span className="roadmap-progress">
              2 of 5 completed
            </span>
          </div>


          <div className="roadmap">

            <div className="roadmap-item completed">
              <div className="roadmap-number">✓</div>

              <div>
                <h3>Python & Programming Fundamentals</h3>
                <p>Strengthen your programming foundation.</p>
              </div>

              <span>Completed</span>
            </div>


            <div className="roadmap-item completed">
              <div className="roadmap-number">✓</div>

              <div>
                <h3>Machine Learning Fundamentals</h3>
                <p>Learn supervised and unsupervised learning.</p>
              </div>

              <span>Completed</span>
            </div>


            <div className="roadmap-item active">
              <div className="roadmap-number">3</div>

              <div>
                <h3>Deep Learning</h3>
                <p>Neural networks, CNNs, RNNs and transformers.</p>
              </div>

              <span>Current</span>
            </div>


            <div className="roadmap-item">
              <div className="roadmap-number">4</div>

              <div>
                <h3>Build AI Projects</h3>
                <p>Apply your knowledge through real-world projects.</p>
              </div>

              <span>Upcoming</span>
            </div>


            <div className="roadmap-item">
              <div className="roadmap-number">5</div>

              <div>
                <h3>Industry Readiness</h3>
                <p>Prepare for internships and technical interviews.</p>
              </div>

              <span>Upcoming</span>
            </div>

          </div>

        </section>


        {/* AI Assistant */}
        <section className="assistant">

          <div className="assistant-icon">✦</div>

          <div>
            <p className="card-label">AI CAREER ASSISTANT</p>
            <h2>Need guidance?</h2>
            <p>
              Ask our AI assistant about careers, skills, projects,
              internships or learning resources.
            </p>
          </div>

          <button className="primary-btn">
            Ask AI Assistant →
          </button>

        </section>

      </main>


      {/* Footer */}
      <footer>
        <p>
          AI Academic & Career Intelligence Platform
        </p>

        <span>
          Personalized • Data Driven • AI Powered
        </span>
      </footer>

    </div>
  )
}

export default App
