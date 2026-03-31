'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from './ThemeProvider'

const NAV = [
  { href: '/map',         label: 'Map',     icon: MapIcon },
  { href: '/survey',      label: 'Survey',  icon: SurveyIcon },
  { href: '/my-surveys',  label: 'Mine',    icon: PinIcon },
  { href: '/dashboard',   label: 'Team',    icon: TeamIcon },
]

function MapIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <path d="M3 5l5-2 4 2 5-2v12l-5 2-4-2-5 2V5z" strokeLinejoin="round"/>
      <path d="M8 3v12M12 5v12" />
    </svg>
  )
}
function SurveyIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <rect x="4" y="2" width="12" height="16" rx="2"/>
      <path d="M7 7h6M7 10h6M7 13h4" strokeLinecap="round"/>
    </svg>
  )
}
function PinIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <path d="M10 2a5 5 0 0 1 5 5c0 4-5 11-5 11S5 11 5 7a5 5 0 0 1 5-5z"/>
      <circle cx="10" cy="7" r="2" fill={active ? 'currentColor' : 'none'}/>
    </svg>
  )
}
function TeamIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2 : 1.5}>
      <circle cx="7" cy="7" r="3"/>
      <circle cx="13" cy="7" r="3"/>
      <path d="M1 17c0-3 2.5-5 6-5M19 17c0-3-2.5-5-6-5M7 12c1 0 3 .5 3 1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const { theme, toggle } = useTheme()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
      style={{ background: 'var(--bg-raised)', borderTop: '1px solid var(--border-mid)' }}
    >
      <div className="flex items-stretch h-14">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors"
              style={{
                color:        active ? 'var(--accent)' : 'var(--text-muted)',
                borderTop:    active ? '2px solid var(--accent)' : '2px solid transparent',
                background:   active ? 'var(--accent-dim)' : 'transparent',
              }}
            >
              <Icon active={active} />
              <span className="label-caps" style={{ color: 'inherit', fontSize: '0.6rem' }}>{label}</span>
            </Link>
          )
        })}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors"
          style={{ color: 'var(--text-muted)', borderTop: '2px solid transparent' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="10" cy="10" r="4"/>
              <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
              <path d="M17.5 12A7.5 7.5 0 0 1 8 2.5a7.5 7.5 0 1 0 9.5 9.5z" strokeLinejoin="round"/>
            </svg>
          )}
          <span className="label-caps" style={{ color: 'inherit', fontSize: '0.6rem' }}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors"
          style={{ color: 'var(--text-muted)', borderTop: '2px solid transparent' }}
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5}>
            <path d="M13 3h4v14h-4M9 14l4-4-4-4M13 10H5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="label-caps" style={{ color: 'inherit', fontSize: '0.6rem' }}>Out</span>
        </button>
      </div>
    </nav>
  )
}
