export type UserSession = {
  accessToken: string
  email: string
  expiresAt: number
  name: string
  picture?: string
  provider: 'google'
}

type GoogleUserInfo = {
  email?: string
  name?: string
  picture?: string
}

const SESSION_STORAGE_KEY = 'ss-google-session'
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
]

export function getStoredSession(): UserSession | null {
  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    const session = JSON.parse(rawSession) as UserSession

    if (session.provider !== 'google' || session.expiresAt <= Date.now()) {
      clearStoredSession()
      return null
    }

    return session
  } catch {
    clearStoredSession()
    return null
  }
}

export function storeSession(session: UserSession) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}

export async function signInWithGoogle(): Promise<UserSession> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  if (!clientId) {
    const demoSession: UserSession = {
      accessToken: 'demo-google-drive-token',
      email: 'demo@ss.ai',
      expiresAt: Date.now() + 60 * 60 * 1000,
      name: 'Demo Google User',
      provider: 'google',
    }

    storeSession(demoSession)
    return demoSession
  }

  const redirectUri = `${window.location.origin}/auth/google/callback`
  const authUrl = new URL(GOOGLE_AUTH_URL)
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'token')
  authUrl.searchParams.set('scope', GOOGLE_SCOPES.join(' '))
  authUrl.searchParams.set('include_granted_scopes', 'true')
  authUrl.searchParams.set('prompt', 'consent')

  const tokenResult = await openGoogleAuthPopup(authUrl.toString(), redirectUri)
  const userInfo = await fetchGoogleUser(tokenResult.accessToken)
  const session: UserSession = {
    accessToken: tokenResult.accessToken,
    email: userInfo.email ?? 'unknown@google',
    expiresAt: Date.now() + tokenResult.expiresIn * 1000,
    name: userInfo.name ?? 'Google user',
    picture: userInfo.picture,
    provider: 'google',
  }

  storeSession(session)
  return session
}

async function fetchGoogleUser(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Google profile request failed.')
  }

  return response.json() as Promise<GoogleUserInfo>
}

function openGoogleAuthPopup(
  authUrl: string,
  redirectUri: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  return new Promise((resolve, reject) => {
    const width = 520
    const height = 680
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    const popup = window.open(
      authUrl,
      'ss-google-login',
      `width=${width},height=${height},left=${left},top=${top}`,
    )

    if (!popup) {
      reject(new Error('Google sign-in popup was blocked.'))
      return
    }

    const startedAt = Date.now()
    const intervalId = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(intervalId)
        reject(new Error('Google sign-in was cancelled.'))
        return
      }

      if (Date.now() - startedAt > 2 * 60 * 1000) {
        window.clearInterval(intervalId)
        popup.close()
        reject(new Error('Google sign-in timed out.'))
        return
      }

      try {
        if (!popup.location.href.startsWith(redirectUri)) {
          return
        }

        const hashParams = new URLSearchParams(popup.location.hash.slice(1))
        const accessToken = hashParams.get('access_token')
        const expiresIn = Number(hashParams.get('expires_in') ?? '3600')

        if (!accessToken) {
          return
        }

        window.clearInterval(intervalId)
        popup.close()
        resolve({ accessToken, expiresIn })
      } catch {
        // The popup is cross-origin until Google redirects back to this app.
      }
    }, 250)
  })
}
