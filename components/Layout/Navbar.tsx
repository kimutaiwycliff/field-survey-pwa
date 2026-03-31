'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/map',        label: 'Map',      icon: '🗺️' },
  { href: '/survey',    label: 'Survey',   icon: '📋' },
  { href: '/my-surveys', label: 'Mine',    icon: '📌' },
  { href: '/dashboard', label: 'Team',     icon: '👥' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 min-h-[56px] flex-1 transition-colors ${
                active ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-0.5 py-2 px-3 min-h-[56px] flex-1 text-slate-400 hover:text-red-400 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  )
}
