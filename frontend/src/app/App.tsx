import { useEffect, useState } from 'react'
import '../styles/app.css'
import { AppRouter } from './router'

export type ThemeMode = 'light' | 'dark'

function getInitialTheme(): ThemeMode {
  const savedTheme = window.localStorage.getItem('ss-theme')

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('ss-theme', theme)
  }, [theme])

  return (
    <AppRouter
      theme={theme}
      onToggleTheme={() =>
        setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
      }
    />
  )
}

export default App
