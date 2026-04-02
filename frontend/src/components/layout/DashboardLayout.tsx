import type { ThemeMode } from '../../app/App'
import type { DashboardSection } from '../../app/routes'
import { useState } from 'react'
import { AccountIcon } from '../icons/NavigationIcons'
import { CloudPage } from '../../pages/dashboard/CloudPage'
import { LocalStoragePage } from '../../pages/dashboard/LocalStoragePage'
import { TelegramPage } from '../../pages/dashboard/TelegramPage'
import { Sidebar, sidebarItems } from './Sidebar'

type DashboardLayoutProps = {
  activeSection: DashboardSection
  onToggleTheme: () => void
  theme: ThemeMode
}

export function DashboardLayout({
  activeSection,
  onToggleTheme,
  theme,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)

  const activeLabel =
    sidebarItems.find((item) => item.id === activeSection)?.label ?? 'Cloud'

  return (
    <main className="app-shell dashboard-shell">
      <Sidebar
        activeSection={activeSection}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((open) => !open)}
      />

      <section className="dashboard-content">
        <div className="content-card">
          <header className="dashboard-header">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h2>{activeLabel}</h2>
            </div>

            <div className="dashboard-actions">
              <button
                type="button"
                className="theme-toggle dashboard-theme-toggle"
                onClick={onToggleTheme}
              >
                {theme === 'light' ? 'Dark' : 'Light'}
              </button>

              <div className="account-menu-wrap">
                <button
                  type="button"
                  className="account-button"
                  onClick={() => setIsAccountMenuOpen((open) => !open)}
                  aria-expanded={isAccountMenuOpen}
                  aria-label="Open account menu"
                >
                  <AccountIcon className="account-icon" />
                  <span>Account</span>
                </button>

                {isAccountMenuOpen ? (
                  <div className="account-menu">
                    <button type="button" className="account-menu-item">
                      Profile
                    </button>
                    <button type="button" className="account-menu-item">
                      Manage
                    </button>
                    <button type="button" className="account-menu-item">
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          {activeSection === 'cloud' ? <CloudPage /> : null}
          {activeSection === 'telegram' ? <TelegramPage /> : null}
          {activeSection === 'local-storage' ? <LocalStoragePage /> : null}
        </div>
      </section>
    </main>
  )
}
