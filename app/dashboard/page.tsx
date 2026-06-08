'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TrafficChart from '@/components/TrafficChart'
import KeywordsTable from '@/components/KeywordsTable'
import RankingsTable from '@/components/RankingsTable'
import { AnalyticsResponse, KeywordsResponse } from '@/lib/types'

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const domainsParam = searchParams.get('domains') ?? ''
  const locationCode = Number(searchParams.get('locationCode') ?? 2250)
  const dateFrom = searchParams.get('dateFrom') ?? ''
  const dateTo = searchParams.get('dateTo') ?? ''

  const domains = domainsParam ? domainsParam.split(',').filter(Boolean) : []

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [keywords, setKeywords] = useState<KeywordsResponse | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)
  const [loadingKeywords, setLoadingKeywords] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (domains.length === 0) {
      router.push('/')
      return
    }

    // Fetch traffic data
    fetch('/api/domain-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains, locationCode, dateFrom, dateTo }),
    })
      .then(r => r.json())
      .then((data: AnalyticsResponse) => {
        setAnalytics(data)
        setLoadingAnalytics(false)
      })
      .catch(err => {
        setError(err.message)
        setLoadingAnalytics(false)
      })

    // Fetch keywords data
    fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domains, locationCode }),
    })
      .then(r => r.json())
      .then((data: KeywordsResponse) => {
        setKeywords(data)
        setLoadingKeywords(false)
      })
      .catch(err => {
        setError(err.message)
        setLoadingKeywords(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainsParam, locationCode, dateFrom, dateTo])

  if (domains.length === 0) return null

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-dark-green text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">SEO Competitor Dashboard</h1>
            <p className="text-green-300 text-xs">
              {domains.length} domain{domains.length !== 1 ? 's' : ''} · {dateFrom} → {dateTo}
              {analytics?.isMock && <span className="ml-2 bg-yellow-600/60 text-yellow-100 px-1.5 py-0.5 rounded text-xs">Demo data</span>}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-green-300 hover:text-white transition-colors flex items-center gap-1"
        >
          ← Edit domains
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            Error: {error}
          </div>
        )}

        {/* Traffic Chart */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-mid-green px-6 py-4">
            <h2 className="text-white font-semibold text-lg">Organic Traffic Over Time</h2>
            <p className="text-green-300 text-sm">Monthly estimated organic visits</p>
          </div>
          <div className="p-6">
            {loadingAnalytics ? (
              <div className="h-80 flex items-center justify-center">
                <LoadingSpinner label="Loading traffic data..." />
              </div>
            ) : analytics?.data ? (
              <TrafficChart series={analytics.data} />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">No data available</div>
            )}
          </div>
        </section>

        {/* Tables side by side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Common Keywords */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-mid-green px-6 py-4">
              <h2 className="text-white font-semibold text-lg">Common Keywords</h2>
              <p className="text-green-300 text-sm">Keywords where multiple domains rank</p>
            </div>
            <div className="p-4">
              {loadingKeywords ? (
                <div className="h-64 flex items-center justify-center">
                  <LoadingSpinner label="Loading keywords..." />
                </div>
              ) : keywords?.commonKeywords ? (
                <KeywordsTable keywords={keywords.commonKeywords} domains={domains} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
              )}
            </div>
          </section>

          {/* Rankings Table */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-mid-green px-6 py-4">
              <h2 className="text-white font-semibold text-lg">Top Keyword Rankings</h2>
              <p className="text-green-300 text-sm">Position rankings per domain</p>
            </div>
            <div className="p-4">
              {loadingKeywords ? (
                <div className="h-64 flex items-center justify-center">
                  <LoadingSpinner label="Loading rankings..." />
                </div>
              ) : keywords?.rankings ? (
                <RankingsTable rankings={keywords.rankings} />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-gray-400">
      <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
