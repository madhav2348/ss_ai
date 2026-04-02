import type { ThemeMode } from './App'
import { useEffect, useState } from 'react'
import { DashboardPage } from '../pages/DashboardPage'
import { SplashPage } from '../pages/SplashPage'
import { getRoute, navigateTo, type Route } from './routes'

type AppRouterProps = {
  onToggleTheme: () => void
  theme: ThemeMode
}

export function AppRouter({ onToggleTheme, theme }: AppRouterProps) {
  const [route, setRoute] = useState<Route>(getRoute(window.location.pathname))

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(getRoute(window.location.pathname))
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  if (route.path === '/dashboard') {
    return (
      <DashboardPage
        activeSection={route.section}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    )
  }

  return (
    <SplashPage
      onGetStarted={() => navigateTo('/dashboard/cloud')}
      onToggleTheme={onToggleTheme}
      theme={theme}
    />
  )
}
