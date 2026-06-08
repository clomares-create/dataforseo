import { DomainTrafficSeries, Keyword, DomainRankings, DOMAIN_COLORS } from './types'

const BASE_URL = 'https://api.dataforseo.com'

export interface Credentials { login: string; password: string }

function getAuthHeader(creds: Credentials): string {
  return 'Basic ' + Buffer.from(`${creds.login}:${creds.password}`).toString('base64')
}

async function callApi(endpoint: string, body: unknown, creds: Credentials): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(creds),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`DataForSEO API error ${res.status}: ${text}`)
  }
  return res.json()
}

export async function fetchDomainTraffic(
  domains: string[],
  locationCode: number,
  dateFrom: string,
  dateTo: string,
  creds: Credentials
): Promise<DomainTrafficSeries[]> {
  // domain_analytics/overview/live returns monthly organic traffic data
  const tasks = domains.map(domain => ({
    target: domain,
    location_code: locationCode,
    language_code: 'fr',
    date_from: dateFrom,
    date_to: dateTo,
  }))

  const result = await callApi('/v3/dataforseo_labs/google/historical_rank_overview/live', tasks, creds) as {
    tasks: Array<{
      result: Array<{
        items?: Array<{
          date: string
          metrics: {
            organic?: { etv?: number }
          }
        }>
      }>
    }>
  }

  return domains.map((domain, idx) => {
    const items = result.tasks?.[idx]?.result?.[0]?.items ?? []

    const data = items.map((item) => ({
      month: (item.date ?? '').slice(0, 7), // "YYYY-MM"
      visits: Math.round(item.metrics?.organic?.etv ?? 0),
    })).filter(d => d.month).sort((a, b) => a.month.localeCompare(b.month))

    const currentTraffic = data[data.length - 1]?.visits ?? 0

    return {
      domain,
      color: DOMAIN_COLORS[idx % DOMAIN_COLORS.length],
      data,
      currentTraffic,
    }
  })
}

export async function fetchRankedKeywords(
  domains: string[],
  locationCode: number,
  creds: Credentials
): Promise<{ commonKeywords: Keyword[]; rankings: DomainRankings[] }> {
  // Fetch ranked keywords for each domain
  const tasks = domains.map(domain => ({
    target: domain,
    location_code: locationCode,
    language_code: 'fr',
    limit: 500,
  }))

  const result = await callApi('/v3/dataforseo_labs/google/ranked_keywords/live', tasks, creds) as {
    tasks: Array<{
      result: Array<{
        items?: Array<{
          keyword_data: { keyword: string; keyword_info?: { search_volume?: number } }
          ranked_serp_element: { serp_item: { rank_absolute?: number; url?: string } }
        }>
      }>
    }>
  }

  // Build per-domain rankings
  const rankings: DomainRankings[] = domains.map((domain, idx) => {
    const items = result.tasks?.[idx]?.result?.[0]?.items ?? []
    const keywords = items.map(item => ({
      keyword: item.keyword_data.keyword,
      position: item.ranked_serp_element.serp_item.rank_absolute ?? 100,
      searchVolume: item.keyword_data.keyword_info?.search_volume ?? 0,
      url: item.ranked_serp_element.serp_item.url ?? '',
    }))
      .sort((a, b) => a.position - b.position)
      .slice(0, 20)
    return { domain, keywords }
  })

  // Find common keywords (appear in >= 2 domains)
  const keywordMap: Record<string, Keyword> = {}
  rankings.forEach(({ domain, keywords }) => {
    keywords.forEach(kw => {
      if (!keywordMap[kw.keyword]) {
        keywordMap[kw.keyword] = {
          keyword: kw.keyword,
          searchVolume: kw.searchVolume,
          positions: {},
        }
      }
      keywordMap[kw.keyword].positions[domain] = kw.position
    })
  })

  const commonKeywords = Object.values(keywordMap)
    .filter(kw => Object.keys(kw.positions).length >= 2)
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 20)

  return { commonKeywords, rankings }
}
