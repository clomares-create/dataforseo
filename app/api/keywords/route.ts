import { NextRequest, NextResponse } from 'next/server'
import { fetchRankedKeywords } from '@/lib/dataforseo'
import { generateMockKeywords } from '@/lib/mockData'
import { KeywordsRequest } from '@/lib/types'
import { initDB, getDataForSEOCredentials } from '@/lib/turso'

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

    const result = await fetchRankedKeywords(domains, locationCode, creds)
    return NextResponse.json({ success: true, ...result, isMock: false })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
