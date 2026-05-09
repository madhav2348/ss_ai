import type { ThemeMode } from '../../app/App'
import type { DashboardSection } from '../../app/routes'
import type { UserSession } from '../../services/auth'
import { useState } from 'react'
import { AccountIcon, MoonIcon, SunIcon } from '../icons/NavigationIcons'
import { CloudPage } from '../../pages/dashboard/CloudPage'
import { LocalStoragePage } from '../../pages/dashboard/LocalStoragePage'
import { TelegramPage } from '../../pages/dashboard/TelegramPage'
import { Sidebar, sidebarItems } from './Sidebar'

type DashboardLayoutProps = {
  activeSection: DashboardSection
  onSignIn: () => Promise<void>
  onSignOut: () => void
  onToggleTheme: () => void
  session: UserSession | null
  theme: ThemeMode
}

export function DashboardLayout({
  activeSection,
  onSignIn,
  onSignOut,
  onToggleTheme,
  session,
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
                {theme === 'light' ? (
                  <MoonIcon className="theme-icon" />
                ) : (
                  <SunIcon className="theme-icon" />
                )}
                {/* {theme === 'light' ? 'Dark' : 'Light'} */}
              </button>

              <div className="account-menu-wrap">
                <button
                  type="button"
                  className="account-button"
                  onClick={() => setIsAccountMenuOpen((open) => !open)}
                  aria-expanded={isAccountMenuOpen}
                  aria-label="Open account menu"
                >
                  {session?.picture ? (
                    <img
                      src={session.picture}
                      alt=""
                      className="account-avatar"
                    />
                  ) : (
                    <AccountIcon className="account-icon" />
                  )}
                  <span>{session ? session.name : 'Account'}</span>
                </button>

                {isAccountMenuOpen ? (
                  <div className="account-menu">
                    {session ? (
                      <>
                        <div className="account-menu-profile">
                          <strong>{session.name}</strong>
                          <span>{session.email}</span>
                        </div>
                        <button
                          type="button"
                          className="account-menu-item"
                          onClick={() => {
                            onSignOut()
                            setIsAccountMenuOpen(false)
                          }}
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="account-menu-item"
                        onClick={async () => {
                          await onSignIn()
                          setIsAccountMenuOpen(false)
                        }}
                      >
                        Sign in with Google
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          {activeSection === 'cloud' ? (
            <CloudPage session={session} onSignIn={onSignIn} />
          ) : null}
          {activeSection === 'telegram' ? <TelegramPage /> : null}
          {activeSection === 'local-storage' ? <LocalStoragePage /> : null}
        </div>
      </section>
    </main>
  )
}
