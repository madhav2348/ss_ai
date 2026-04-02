import { navigateTo, type DashboardSection } from '../../app/routes'
import {
  CloudIcon,
  SidebarToggleIcon,
  StorageIcon,
  TelegramIcon,
} from '../icons/NavigationIcons'

const sidebarItems = [
  { id: 'cloud', label: 'Cloud', icon: CloudIcon, href: '/dashboard/cloud' },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: TelegramIcon,
    href: '/dashboard/telegram',
  },
  {
    id: 'local-storage',
    label: 'Local Storage',
    icon: StorageIcon,
    href: '/dashboard/local-storage',
  },
] as const

type SidebarProps = {
  activeSection: DashboardSection
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({
  activeSection,
  isOpen,
  onToggle,
}: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={isOpen ? 'Collapse navigation' : 'Expand navigation'}
          title={isOpen ? 'Collapse navigation' : 'Expand navigation'}
        >
          <SidebarToggleIcon className="toggle-icon" isOpen={isOpen} />
        </button>

        <div className="sidebar-brand" aria-label="Application logo">
          <span className="sidebar-logo-mark">L</span>
          {isOpen ? <span className="sidebar-logo-text">Logo</span> : null}
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Dashboard navigation">
        {sidebarItems.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => navigateTo(item.href)}
              aria-label={item.label}
              title={item.label}
            >
              <Icon className="nav-icon" />
              {isOpen ? <span>{item.label}</span> : null}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export { sidebarItems }
