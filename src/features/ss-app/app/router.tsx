import type { ThemeMode } from './App'
import { useEffect, useState } from 'react'
import type { UserSession } from '../services/auth'
import { DashboardPage } from '../pages/DashboardPage'
import { SplashPage } from '../pages/SplashPage'
import { getRoute, navigateTo, type Route } from './routes'

type AppRouterProps = {
  authError: string | null
  isSigningIn: boolean
  onSignIn: () => Promise<void>
  onSignOut: () => void
  onToggleTheme: () => void
  session: UserSession | null
  theme: ThemeMode
}

export function AppRouter({
  authError,
  isSigningIn,
  onSignIn,
  onSignOut,
  onToggleTheme,
  session,
  theme,
}: AppRouterProps) {
  const [route, setRoute] = useState<Route>({ path: '/' })

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(getRoute(window.location.pathname))
    }

    handleRouteChange()
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  if (route.path === '/dashboard') {
    return (
      <DashboardPage
        activeSection={route.section}
        session={session}
        theme={theme}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onToggleTheme={onToggleTheme}
      />
    )
  }

  return (
    <SplashPage
      authError={authError}
      isSigningIn={isSigningIn}
      onGetStarted={() => navigateTo('/dashboard/cloud')}
      onSignIn={async () => {
        await onSignIn()
        navigateTo('/dashboard/cloud')
      }}
      onToggleTheme={onToggleTheme}
      session={session}
      theme={theme}
    />
  )
}
