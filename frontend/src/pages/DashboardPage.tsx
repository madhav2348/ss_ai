import type { ThemeMode } from '../app/App'
import type { DashboardSection } from '../app/routes'
import { DashboardLayout } from '../components/layout/DashboardLayout'

type DashboardPageProps = {
  activeSection: DashboardSection
  onToggleTheme: () => void
  theme: ThemeMode
}

export function DashboardPage({
  activeSection,
  onToggleTheme,
  theme,
}: DashboardPageProps) {
  return (
    <DashboardLayout
      activeSection={activeSection}
      theme={theme}
      onToggleTheme={onToggleTheme}
    />
  )
}
