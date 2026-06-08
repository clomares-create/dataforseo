import { DomainTrafficSeries, Keyword, DomainRankings, DOMAIN_COLORS } from './types'

const BASE_URL = 'https://api.dataforseo.com'

function getAuthHeader(): string {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  if (!login || !password) throw new Error('DataForSEO credentials not configured')
  return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64')
}

export function hasCredentials(): boolean {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD
  return !!(
    login && password &&
    login !== 'your_login_here' &&
    password !== 'your_password_here' &&
    login.trim() !== '' &&
    password.trim() !== ''
  )
}

async function callApi(endpoint: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
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
  dateTo: string
): Promise<DomainTrafficSeries[]> {
  // domain_analytics/overview/live returns monthly organic traffic data
  const tasks = domains.map(domain => ({
    target: domain,
    location_code: locationCode,
    date_from: dateFrom,
    date_to: dateTo,
  }))

  const result = await callApi('/v3/domain_analytics/overview/live', tasks) as {
    tasks: Array<{
      result: Array<{
        target: string
        metrics?: {
          organic?: {
            pos_1?: number
            pos_2_3?: number
            pos_4_10?: number
            etv?: number
          }
        }
        metrics_history?: Array<{
          date: string
          metrics: {
            organic?: { etv?: number }
          }
        }>
      }>
    }>
  }

  return domains.map((domain, idx) => {
    const taskResult = result.tasks?.[idx]?.result?.[0]
    const history = taskResult?.metrics_history ?? []

    const data = history.map((h) => ({
      month: h.date.slice(0, 7), // "YYYY-MM"
      visits: Math.round(h.metrics?.organic?.etv ?? 0),
    }))

    const currentTraffic = taskResult?.metrics?.organic?.etv
      ? Math.round(taskResult.metrics.organic.etv)
      : (data[data.length - 1]?.visits ?? 0)

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
  locationCode: number
): Promise<{ commonKeywords: Keyword[]; rankings: DomainRankings[] }> {
  // Fetch ranked keywords for each domain
  const tasks = domains.map(domain => ({
    target: domain,
    location_code: locationCode,
    language_code: 'fr',
    limit: 100,
  }))

  const result = await callApi('/v3/dataforseo_labs/google/ranked_keywords/live', tasks) as {
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
