import DomainForm from '@/components/DomainForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-dark-green text-white px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">SEO Competitor Dashboard</h1>
          <p className="text-green-300 text-xs">Powered by DataForSEO</p>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-dark-green mb-4 leading-tight">
            Analyze Your<br />
            <span className="text-green-700">SEO Competitors</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Enter competitor domains to compare organic traffic trends,
            common keywords, and position rankings side by side.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <DomainForm />
        </div>

        {/* Demo note */}
        <p className="text-center text-sm text-gray-400 mt-6">
          No API keys? The app runs on realistic mock data automatically.
        </p>
      </main>
    </div>
  )
}
