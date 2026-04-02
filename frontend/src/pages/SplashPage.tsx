import type { ThemeMode } from '../app/App'
import { MoonIcon, SunIcon } from '../components/icons/NavigationIcons'

type SplashPageProps = {
  onGetStarted: () => void
  onToggleTheme: () => void
  theme: ThemeMode
}

export function SplashPage({
  onGetStarted,
  onToggleTheme,
  theme,
}: SplashPageProps) {
  return (
    <main className="app-shell splash-shell">
      <button
        type="button"
        className="theme-toggle floating-theme-toggle"
        onClick={onToggleTheme}
      >
        {theme === 'light' ? (
          <MoonIcon className="theme-icon" />
        ) : (
          <SunIcon className="theme-icon" />
        )}
        {/* {theme === 'light' ? 'Dark' : 'Light'} */}
      </button>

      <section className="splash-card">
        <p className="eyebrow">ss.ai workspace</p>
        <h1>Start with a clean workspace.</h1>
        <button type="button" className="primary-button" onClick={onGetStarted}>
          Get Started
        </button>
      </section>
    </main>
  )
}
