export const dashboardSections = ['cloud', 'telegram', 'local-storage'] as const

export type DashboardSection = (typeof dashboardSections)[number]

export type Route =
  | { path: '/' }
  | { path: '/dashboard'; section: DashboardSection }

export function isDashboardSection(value: string): value is DashboardSection {
  return dashboardSections.includes(value as DashboardSection)
}

export function getRoute(pathname: string): Route {
  if (pathname === '/dashboard') {
    return { path: '/dashboard', section: 'cloud' }
  }

  if (pathname.startsWith('/dashboard/')) {
    const section = pathname.replace('/dashboard/', '')

    if (isDashboardSection(section)) {
      return { path: '/dashboard', section }
    }
  }

  return { path: '/' }
}

export function navigateTo(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
