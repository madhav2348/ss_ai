import type { UserSession } from './auth'

export type DriveFolderCandidate = {
  id: string
  modifiedTime?: string
  name: string
  source: 'google-drive'
  webViewLink?: string
}

type GoogleDriveFile = {
  id: string
  modifiedTime?: string
  name: string
  webViewLink?: string
}

type GoogleDriveListResponse = {
  files?: GoogleDriveFile[]
}

const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files'

export async function findGoogleDriveScreenshotFolders(
  session: UserSession,
): Promise<DriveFolderCandidate[]> {
  if (session.accessToken === 'demo-google-drive-token') {
    return [
      {
        id: 'demo-drive-screenshots',
        modifiedTime: new Date().toISOString(),
        name: 'Screenshots',
        source: 'google-drive',
      },
      {
        id: 'demo-drive-captures',
        name: 'Screen captures',
        source: 'google-drive',
      },
    ]
  }

  const params = new URLSearchParams({
    fields: 'files(id,name,modifiedTime,webViewLink)',
    orderBy: 'modifiedTime desc',
    pageSize: '12',
    q: [
      "mimeType = 'application/vnd.google-apps.folder'",
      'trashed = false',
      "(name contains 'Screenshot' or name contains 'Screenshots' or name contains 'Screen capture' or name contains 'Captures')",
    ].join(' and '),
  })

  const response = await fetch(`${DRIVE_FILES_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Google Drive folder detection failed.')
  }

  const payload = (await response.json()) as GoogleDriveListResponse

  return (payload.files ?? []).map((file) => ({
    id: file.id,
    modifiedTime: file.modifiedTime,
    name: file.name,
    source: 'google-drive',
    webViewLink: file.webViewLink,
  }))
}
