import { useState } from 'react'
import {
  detectScreenshotDirectory,
  getStoredScreenshotDirectory,
  supportsDirectoryDetection,
  type ScreenshotDirectoryDetection,
} from '../../services/screenshotDirectory'
import { JobStatusPanel } from '../../components/jobs/JobStatusPanel'

export function LocalStoragePage() {
  const [detection, setDetection] = useState<ScreenshotDirectoryDetection | null>(
    getStoredScreenshotDirectory,
  )
  const [status, setStatus] = useState<string | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)

  async function runDetection() {
    setStatus(null)
    setIsDetecting(true)

    try {
      const nextDetection = await detectScreenshotDirectory()
      setDetection(nextDetection)
      setStatus(`Detected ${nextDetection.directoryName}.`)
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Screenshot directory detection failed.',
      )
    } finally {
      setIsDetecting(false)
    }
  }

  return (
    <div className="local-detection-panel">
      <div>
        <p className="eyebrow">Local screenshots</p>
        <h3>Detect the screenshot directory.</h3>
        <p className="muted-copy">
          Select the folder where screenshots land. ss.ai checks the folder name
          and image filenames, then keeps the detection result for the next
          local-ingestion feature.
        </p>
      </div>

      <button
        type="button"
        className="primary-button compact-button"
        disabled={isDetecting || !supportsDirectoryDetection()}
        onClick={runDetection}
      >
        {isDetecting ? 'Detecting...' : 'Detect directory'}
      </button>

      {!supportsDirectoryDetection() ? (
        <p className="status-message error">
          Directory detection is available in Chromium browsers.
        </p>
      ) : null}

     {status ? (
  <p
    className={`status-message ${
      status.toLowerCase().includes('failed') ||
      status.toLowerCase().includes('error')
        ? 'error'
        : 'success'
    }`}
  >
    {status}
  </p>
) : null}

      {detection ? (
        <div className="detected-list">
          <div className="detected-item">
            <div>
              <strong>{detection.directoryName}</strong>
              <span>
                {detection.confidence} confidence, {detection.imageCount}{' '}
                screenshot-like image
                {detection.imageCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          {detection.matchedFileNames.map((fileName) => (
            <div className="detected-item subtle" key={fileName}>
              <span>{fileName}</span>
            </div>
          ))}
        </div>
      ) : null}

      <JobStatusPanel />
    </div>
  )
}