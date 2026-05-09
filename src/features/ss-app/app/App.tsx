'use client'

import { useEffect, useState } from 'react'
import '../styles/app.css'
import { AppRouter } from './router'
import {
  clearStoredSession,
  getStoredSession,
  signInWithGoogle,
  type UserSession,
} from '../services/auth'

export type ThemeMode = 'light' | 'dark'

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = window.localStorage.getItem('ss-theme')

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function App() {
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [session, setSession] = useState<UserSession | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    setTheme(getInitialTheme())
    setSession(getStoredSession())
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('ss-theme', theme)
  }, [theme])

  return (
    <AppRouter
      authError={authError}
      isSigningIn={isSigningIn}
      session={session}
      theme={theme}
      onSignIn={async () => {
        setAuthError(null)
        setIsSigningIn(true)

        try {
          const nextSession = await signInWithGoogle()
          setSession(nextSession)
        } catch (error) {
          setAuthError(
            error instanceof Error ? error.message : 'Google sign-in failed.',
          )
        } finally {
          setIsSigningIn(false)
        }
      }}
      onSignOut={() => {
        clearStoredSession()
        setSession(null)
      }}
      onToggleTheme={() =>
        setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
      }
    />
  )
}

export default App
