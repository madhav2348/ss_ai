type IconProps = {
  className?: string
}

export function CloudIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M8 18h8.5a4.5 4.5 0 0 0 .42-8.98A5.5 5.5 0 0 0 6.3 7.5 4 4 0 0 0 8 18Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TelegramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="m20 4-3 15-5.2-4-2.8 2.3.4-5.3L17 6.5 7.4 11l-3.4-1.1L20 4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StorageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M5 7.5C5 6.1 8.1 5 12 5s7 1.1 7 2.5S15.9 10 12 10 5 8.9 5 7.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5M5 16.5C5 17.9 8.1 19 12 19s7-1.1 7-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5 7.5v9M19 7.5v9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SidebarToggleIcon({
  className,
  isOpen,
}: IconProps & { isOpen: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect
        x="3.5"
        y="4.5"
        width="17"
        height="15"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M9 5v14" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d={isOpen ? 'm15 9-3 3 3 3' : 'm12 9 3 3-3 3'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function AccountIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 19a7 7 0 0 1 14 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function GoogleDriveIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8 4h5l4 7h-5L8 4Z" fill="currentColor" />
      <path d="M7 6.5 3 13.5l2.5 4.5 4-7L7 6.5Z" fill="currentColor" opacity="0.82" />
      <path d="M10.5 13h8l-2.6 4.5h-8L10.5 13Z" fill="currentColor" opacity="0.64" />
    </svg>
  )
}

export function DropboxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="m7 5 5 3.3-3.8 3L3.4 8 7 5Zm10 0 3.6 3-4.8 3-3.8-3L17 5ZM8.2 12.4l3.8 3-5 3.2-3.4-2.8 4.6-3.4Zm7.6 0 4.6 3.4-3.4 2.8-5-3.2 3.8-3Zm-3.8 4.2 4.2 2.8L12 22l-4.2-2.6 4.2-2.8Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v2.3M12 19.2v2.3M21.5 12h-2.3M4.8 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M19 14.5A7.5 7.5 0 0 1 9.5 5a8.5 8.5 0 1 0 9.5 9.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
