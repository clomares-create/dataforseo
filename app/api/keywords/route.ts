import { NextRequest, NextResponse } from 'next/server'
import { fetchRankedKeywords } from '@/lib/dataforseo'
import { generateMockKeywords } from '@/lib/mockData'
import { KeywordsRequest, Keyword, DomainRankings } from '@/lib/types'
import { initDB, getDataForSEOCredentials, getCached, setCached, makeCacheKey } from '@/lib/turso'

export async function POST(req: NextRequest) {
  try {
    const body: KeywordsRequest = await req.json()
    const { domains, locationCode } = body

    if (!domains || domains.length === 0) {
      return NextResponse.json({ success: false, error: 'No domains provided' }, { status: 400 })
    }

    await initDB()
    const creds = await getDataForSEOCredentials()

    if (!creds) {
      const result = generateMockKeywords(domains)
      return NextResponse.json({ success: true, ...result, isMock: true })
    }

    const cacheKey = makeCacheKey('keywords', { domains: [...domains].sort(), locationCode })
    const cached = await getCached<{ commonKeywords: Keyword[]; rankings: DomainRankings[] }>(cacheKey)
    if (cached) {
      return NextResponse.json({ success: true, ...cached, isMock: false, fromCache: true })
    }

    const result = await fetchRankedKeywords(domains, locationCode, creds)
    await setCached(cacheKey, result)
    return NextResponse.json({ success: true, ...result, isMock: false })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
