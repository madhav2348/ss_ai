import { useState } from 'react'

export function TelegramPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  async function testConnection() {
    setLoading(true)
    setMessage(null)
    setIsError(false)

    setTimeout(() => {
      const success = Math.random() > 0.5

      setLoading(false)

      if (success) {
        setMessage('Telegram connection successful.')
      } else {
        setIsError(true)
        setMessage('Telegram connection failed.')
      }
    }, 2000)
  }

  return (
    <div className="coming-soon-panel">
      <h3>Telegram Integration</h3>

      <button
        type="button"
        className="primary-button compact-button"
        onClick={testConnection}
        disabled={loading}
      >
        {loading ? 'Connecting...' : 'Test Telegram'}
      </button>

      {message && (
        <p className={`status-message ${isError ? 'error' : 'success'}`}>
          {message}
        </p>
      )}
    </div>
  )
}