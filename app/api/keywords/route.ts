import { NextRequest, NextResponse } from 'next/server'
import { hasCredentials, fetchRankedKeywords } from '@/lib/dataforseo'
import { generateMockKeywords } from '@/lib/mockData'
import { KeywordsRequest } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body: KeywordsRequest = await req.json()
    const { domains, locationCode } = body

    if (!domains || domains.length === 0) {
      return NextResponse.json({ success: false, error: 'No domains provided' }, { status: 400 })
    }

    if (!hasCredentials()) {
      const result = generateMockKeywords(domains)
      return NextResponse.json({ success: true, ...result, isMock: true })
    }

    const result = await fetchRankedKeywords(domains, locationCode)
    return NextResponse.json({ success: true, ...result, isMock: false })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
