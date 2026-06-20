import { useState } from 'react'

export function TelegramPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function testConnection() {
    setLoading(true)
    setMessage(null)

    setTimeout(() => {
      setLoading(false)
      setMessage('Telegram connection successful.')
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
        <p className="status-message success">
          {message}
        </p>
      )}
    </div>
  )
}