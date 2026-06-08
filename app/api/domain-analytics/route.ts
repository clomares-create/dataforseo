import { NextRequest, NextResponse } from 'next/server'
import { hasCredentials, fetchDomainTraffic } from '@/lib/dataforseo'
import { generateMockTrafficData } from '@/lib/mockData'
import { AnalyticsRequest } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body: AnalyticsRequest = await req.json()
    const { domains, locationCode, dateFrom, dateTo } = body

    if (!domains || domains.length === 0) {
      return NextResponse.json({ success: false, error: 'No domains provided' }, { status: 400 })
    }

    if (!hasCredentials()) {
      // Return mock data
      const data = generateMockTrafficData(domains)
      return NextResponse.json({ success: true, data, isMock: true })
    }

    const data = await fetchDomainTraffic(domains, locationCode, dateFrom, dateTo)
    return NextResponse.json({ success: true, data, isMock: false })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
