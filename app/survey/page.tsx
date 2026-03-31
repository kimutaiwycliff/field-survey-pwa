import { Navbar } from '@/components/Layout/Navbar'
import { OfflineBanner } from '@/components/Layout/OfflineBanner'
import { SurveyForm } from '@/components/Survey/SurveyForm'

export default function SurveyPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <OfflineBanner />

      <header
        className="flex items-center gap-3 px-4 py-3 shrink-0 sticky top-0 z-10"
        style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-7 h-7 rounded flex items-center justify-center shrink-0"
          style={{ background: 'var(--accent)', color: '#000' }}
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={2}>
            <rect x="2" y="1" width="10" height="14" rx="1.5"/>
            <path d="M5 5h4M5 8h4M5 11h2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="font-display font-bold text-base uppercase tracking-wider leading-none"
              style={{ color: 'var(--text-primary)' }}>New Observation</h1>
          <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Field data entry</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-5">
        <SurveyForm />
      </main>

      <Navbar />
    </div>
  )
}
