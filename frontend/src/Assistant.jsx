
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const API_URL = 'http://127.0.0.1:8000'

const MAX_HISTORY = 6
const MAX_HISTORY_MESSAGE_LENGTH = 1800
const MAX_QUESTION_LENGTH = 2000

const suggestions = [
  'Which career is best for me?',
  'Which skills should I improve?',
  'Suggest some projects for me.',
  'How can I prepare for internships?'
]

// Initial welcome message.
function createInitialMessage() {
  return {
    role: 'ai',
    text: 'Hello! I am your AI Career Assistant. I can help you explore careers, improve your skills and plan your learning journey.',
    time: new Date().toISOString(),
    isWelcome: true
  }
}

function Assistant({ userId, accessToken }) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    createInitialMessage()
  ])
  const [error, setError] = useState('')

  const requestLock = useRef(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Automatically scroll to the latest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    })
  }, [messages, loading])

  // Convert FastAPI errors into readable messages.
  function getErrorMessage(data, status) {
    const detail = data?.detail

    if (Array.isArray(detail)) {
      return detail
        .map(item => {
          const field = item.loc?.slice(1).join('.')

          return field
            ? `${field}: ${item.msg}`
            : item.msg
        })
        .join('; ')
    }

    if (typeof detail === 'string') {
      return detail
    }

    return `Assistant request failed (HTTP ${status}).`
  }

  // Prepare conversation history.
  function prepareConversationHistory() {
    return messages
      .filter(message =>
        !message.isWelcome &&
        !message.failed &&
        (message.role === 'user' || message.role === 'ai') &&
        typeof message.text === 'string' &&
        message.text.trim().length > 0
      )
      .slice(-MAX_HISTORY)
      .map(message => ({
        role: message.role === 'ai'
          ? 'assistant'
          : 'user',
        content: message.text.slice(
          0,
          MAX_HISTORY_MESSAGE_LENGTH
        )
      }))
  }

  // Send a question to the local Qwen AI assistant.
  async function sendMessage(value = question) {
    const text = String(value ?? '').trim()

    if (!text || requestLock.current) {
      return
    }

    if (text.length > MAX_QUESTION_LENGTH) {
      setError('Your question must be under 2000 characters.')
      return
    }

    // Validate authentication.
    if (!userId || !accessToken) {
      setError(
        'Your login session is invalid. Please log in again.'
      )
      return
    }

    requestLock.current = true

    setQuestion('')
    setLoading(true)
    setError('')

    const conversationHistory = prepareConversationHistory()

    // Display the user's question immediately.
    setMessages(previous => [
      ...previous,
      {
        role: 'user',
        text,
        time: new Date().toISOString()
      }
    ])

    try {
      const response = await fetch(
        `${API_URL}/users/${userId}/assistant`,
        {
          method: 'POST',

          // IMPORTANT: JWT authentication.
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },

          body: JSON.stringify({
            question: text,
            conversation_history: conversationHistory
          })
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            'Your session has expired. Please log in again.'
          )
        }

        if (response.status === 403) {
          throw new Error(
            'You are not authorized to access this assistant.'
          )
        }

        throw new Error(
          getErrorMessage(data, response.status)
        )
      }

      if (
        typeof data.answer !== 'string' ||
        !data.answer.trim()
      ) {
        throw new Error(
          'The AI returned an empty response.'
        )
      }

      // Display the AI response.
      setMessages(previous => [
        ...previous,
        {
          role: 'ai',
          text: data.answer,
          time: new Date().toISOString(),
          model: data.model || 'qwen3.5:4b'
        }
      ])

    } catch (err) {
      console.error('Career Assistant Error:', err)

      const errorMessage =
        err instanceof TypeError
          ? 'Cannot connect to the backend. Check that FastAPI and Ollama are running.'
          : err.message ||
            'Something went wrong. Please try again.'

      setError(errorMessage)

      // Mark failed questions so they are excluded
      // from future conversation history.
      setMessages(previous =>
        previous.map((message, index) => {
          if (
            index === previous.length - 1 &&
            message.role === 'user' &&
            message.text === text
          ) {
            return {
              ...message,
              failed: true
            }
          }

          return message
        })
      )

      setMessages(previous => [
        ...previous,
        {
          role: 'error',
          text: errorMessage,
          time: new Date().toISOString()
        }
      ])

    } finally {
      requestLock.current = false
      setLoading(false)

      inputRef.current?.focus()
    }
  }

  // Clear the conversation.
  function clearChat() {
    if (requestLock.current) {
      return
    }

    setMessages([createInitialMessage()])
    setError('')
    setQuestion('')

    inputRef.current?.focus()
  }

  // Format message timestamps.
  function formatTime(time) {
    const date = new Date(time)

    if (Number.isNaN(date.getTime())) {
      return ''
    }

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Authentication validation.
  if (!userId || !accessToken) {
    return (
      <section
        id="assistant"
        className="section assistant-section"
      >
        <div className="card">
          <p className="card-label">AI POWERED GUIDANCE</p>
          <h2>Career Assistant unavailable</h2>
          <p>
            Please log in again to access your personalized
            AI Career Assistant.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="assistant"
      className="section assistant-section"
    >

      {/* SECTION HEADING */}

      <div className="section-heading">
        <div>
          <p className="card-label">
            AI POWERED GUIDANCE
          </p>

          <h2>Your Career Assistant</h2>
        </div>

        <span className="ai-badge">
          <span className="online-dot"></span>
          {loading ? 'Thinking...' : 'Local AI Online'}
        </span>
      </div>

      <div className="card assistant-chat">

        {/* CHAT HEADER */}

        <div className="chat-header">

          <div className="chat-avatar">
            AI
          </div>

          <div className="chat-header-info">
            <strong>
              Career Intelligence Assistant
            </strong>

            <small>
              Powered by Qwen 3.5 4B · Ollama
            </small>
          </div>

          <button
            className="clear-chat"
            onClick={clearChat}
            disabled={loading}
            type="button"
          >
            Clear chat
          </button>

        </div>

        {/* CHAT MESSAGES */}

        <div className="chat-messages">

          {messages.map((message, index) => (

            <div
              key={`${message.time}-${index}`}
              className={`chat-row ${message.role}`}
            >

              {message.role !== 'user' && (
                <div className="message-avatar">
                  {message.role === 'error' ? '!' : 'AI'}
                </div>
              )}

              <div className="chat-message-content">

                <div className="chat-bubble">

                  {/* MESSAGE HEADING */}

                  <div className="message-heading">

                    <strong>
                      {message.role === 'user'
                        ? 'You'
                        : message.role === 'error'
                          ? 'Connection Error'
                          : 'AI Assistant'}
                    </strong>

                    {message.role === 'ai' && (
                      <span className="ai-message-tag">
                        AI
                      </span>
                    )}

                  </div>

                  {/* MESSAGE CONTENT */}

                  <div className="message-text">

                    {message.role === 'ai' ? (

                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                      >
                        {message.text}
                      </ReactMarkdown>

                    ) : (

                      <p>{message.text}</p>

                    )}

                  </div>

                  {/* TIMESTAMP */}

                  <span className="message-time">
                    {formatTime(message.time)}
                  </span>

                </div>

              </div>

            </div>

          ))}

          {/* LOADING INDICATOR */}

          {loading && (

            <div className="chat-row ai">

              <div className="message-avatar">
                AI
              </div>

              <div className="chat-bubble typing-bubble">

                <strong>Qwen is thinking</strong>

                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>

            </div>

          )}

          <div ref={messagesEndRef} />

        </div>

        {/* SUGGESTED QUESTIONS */}

        <div className="suggestion-area">

          <p>Suggested questions</p>

          <div className="chat-suggestions">

            {suggestions.map(item => (

              <button
                key={item}
                type="button"
                disabled={loading}
                onClick={() => sendMessage(item)}
              >
                {item}
              </button>

            ))}

          </div>

        </div>

        {/* CHAT INPUT */}

        <form
          className="chat-input"
          onSubmit={event => {
            event.preventDefault()
            sendMessage()
          }}
        >

          <input
            ref={inputRef}
            value={question}
            onChange={event => setQuestion(event.target.value)}
            placeholder="Ask anything about your career..."
            disabled={loading}
            maxLength={MAX_QUESTION_LENGTH}
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={loading || !question.trim()}
          >
            {loading ? 'Thinking...' : 'Send ↑'}
          </button>

        </form>

        {/* ERROR MESSAGE */}

        {error && (

          <p
            className="chat-error"
            role="alert"
          >
            {error}
          </p>

        )}

        {/* FOOTER */}

        <p className="chat-footer">
          AI-powered guidance based on your academic profile and skills.
          Responses are generated locally using Ollama.
        </p>

      </div>

    </section>
  )
}

export default Assistant
