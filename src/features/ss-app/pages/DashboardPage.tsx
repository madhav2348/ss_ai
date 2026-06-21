import type { ThemeMode } from '../app/App'
import type { DashboardSection } from '../app/routes'
import type { UserSession } from '../services/auth'
import { DashboardLayout } from '../components/layout/DashboardLayout'

type DashboardPageProps = {
  activeSection: DashboardSection
  onSignIn: () => Promise<void>
  onSignOut: () => void
  onToggleTheme: () => void
  session: UserSession | null
  theme: ThemeMode
}

export function DashboardPage({
  activeSection,
  onSignIn,
  onSignOut,
  onToggleTheme,
  session,
  theme,
}: DashboardPageProps) {
  return (
    <DashboardLayout
      activeSection={activeSection}
      session={session}
      theme={theme}
      onSignIn={onSignIn}
      onSignOut={onSignOut}
      onToggleTheme={onToggleTheme}
    />
  )
}
