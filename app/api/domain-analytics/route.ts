import { NextRequest, NextResponse } from 'next/server'
import { fetchDomainTraffic } from '@/lib/dataforseo'
import { generateMockTrafficData } from '@/lib/mockData'
import { AnalyticsRequest, DomainTrafficSeries } from '@/lib/types'
import { initDB, getDataForSEOCredentials, getCached, setCached, makeCacheKey } from '@/lib/turso'

export async function POST(req: NextRequest) {
  try {
    const body: AnalyticsRequest = await req.json()
    const { domains, locationCode, dateFrom, dateTo } = body

    if (!domains || domains.length === 0) {
      return NextResponse.json({ success: false, error: 'No domains provided' }, { status: 400 })
    }

    await initDB()
    const creds = await getDataForSEOCredentials()

    if (!creds) {
      const data = generateMockTrafficData(domains)
      return NextResponse.json({ success: true, data, isMock: true })
    }

    // Fetch each domain individually, using cache when available
    const data = await Promise.all(
      domains.map(async (domain) => {
        const cacheKey = makeCacheKey('traffic', { domain, locationCode, dateFrom, dateTo })
        const cached = await getCached<DomainTrafficSeries>(cacheKey)
        if (cached) return { ...cached, fromCache: true }

        const [result] = await fetchDomainTraffic([domain], locationCode, dateFrom, dateTo, creds)
        await setCached(cacheKey, result)
        return result
      })
    )

    return NextResponse.json({ success: true, data, isMock: false })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
