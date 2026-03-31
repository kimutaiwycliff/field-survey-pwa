import { Navbar } from '@/components/Layout/Navbar'
import { OfflineBanner } from '@/components/Layout/OfflineBanner'
import { SurveyForm } from '@/components/Survey/SurveyForm'

export default function SurveyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      <OfflineBanner />
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center gap-2 shrink-0 sticky top-0 z-10">
        <span className="text-xl">📋</span>
        <h1 className="text-white font-semibold">New Observation</h1>
      </header>
      <main className="flex-1 px-4 pt-4 overflow-y-auto">
        <SurveyForm />
      </main>
      <Navbar />
    </div>
  )
}
