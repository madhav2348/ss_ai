import { useState } from 'react'
import {
  DropboxIcon,
  GoogleDriveIcon,
  ICloudIcon,
  OneDriveIcon,
} from '../../components/icons/NavigationIcons'
import type { UserSession } from '../../services/auth'
import {
  findGoogleDriveScreenshotFolders,
  type DriveFolderCandidate,
} from '../../services/googleDrive'
import { JobStatusPanel } from '../../components/jobs/JobStatusPanel'

type CloudPageProps = {
  onSignIn: () => Promise<void>
  session: UserSession | null
}

export function CloudPage({ onSignIn, session }: CloudPageProps) {
  const [driveFolders, setDriveFolders] = useState<DriveFolderCandidate[]>([])
  const [driveStatus, setDriveStatus] = useState<string | null>(null)
  const [isDetectingDrive, setIsDetectingDrive] = useState(false)

  async function connectGoogleDrive() {
    setDriveStatus(null)
    setIsDetectingDrive(true)

    try {
      if (!session) {
        await onSignIn()
        setDriveStatus('Google is connected. Run detection again to scan Drive.')
        return
      }

      const folders = await findGoogleDriveScreenshotFolders(session)
      setDriveFolders(folders)
      setDriveStatus(
        folders.length > 0
          ? `Detected ${folders.length} likely screenshot folder${folders.length === 1 ? '' : 's'}.`
          : 'Google Drive is connected, but no obvious screenshot folder was found.',
      )
    } catch (error) {
      setDriveStatus(
        error instanceof Error ? error.message : 'Google Drive connection failed.',
      )
    } finally {
      setIsDetectingDrive(false)
    }
  }

  return (
    <div className="cloud-workspace">
      <section className="integration-panel primary-integration">
        <div className="integration-copy">
          <GoogleDriveIcon className="connect-icon" />
          <div>
            <p className="eyebrow">Google Drive</p>
            <h3>Connect Drive and look for screenshot folders.</h3>
            <p className="muted-copy">
              Uses Drive metadata access so ss.ai can locate folders before
              ingestion is added.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="primary-button compact-button"
          disabled={isDetectingDrive}
          onClick={connectGoogleDrive}
        >
          {isDetectingDrive
            ? 'Detecting...'
            : session
              ? 'Detect Drive folders'
              : 'Connect Google Drive'}
        </button>

        {driveStatus ? <p className="status-message">{driveStatus}</p> : null}

        {driveFolders.length > 0 ? (
          <div className="detected-list">
            {driveFolders.map((folder) => (
              <div className="detected-item" key={folder.id}>
                <div>
                  <strong>{folder.name}</strong>
                  <span>
                    {folder.modifiedTime
                      ? `Updated ${new Date(folder.modifiedTime).toLocaleDateString()}`
                      : 'Google Drive folder'}
                  </span>
                </div>
                {folder.webViewLink ? (
                  <a href={folder.webViewLink} target="_blank" rel="noreferrer">
                    Open
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="connect-grid secondary-connect-grid">
        <button type="button" className="connect-card" disabled>
          <DropboxIcon className="connect-icon" />
          <span className="connect-title">Dropbox</span>
          <span className="connect-note">Planned</span>
        </button>

        <button type="button" className="connect-card" disabled>
          <OneDriveIcon className="connect-icon" />
          <span className="connect-title">Microsoft OneDrive</span>
          <span className="connect-note">Planned</span>
        </button>

        <button type="button" className="connect-card" disabled>
          <ICloudIcon className="connect-icon" />
          <span className="connect-title">Apple iCloud</span>
          <span className="connect-note">Planned</span>
        </button>
      </div>

      <JobStatusPanel />
    </div>
  )
}