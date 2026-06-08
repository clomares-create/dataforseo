export interface Domain {
  url: string
  color: string
}

export interface TrafficDataPoint {
  month: string
  [domain: string]: number | string
}

export interface DomainTrafficSeries {
  domain: string
  color: string
  data: { month: string; visits: number }[]
  currentTraffic: number
}

export interface Keyword {
  keyword: string
  searchVolume: number
  positions: { [domain: string]: number | null }
}

export interface RankedKeyword {
  keyword: string
  position: number
  searchVolume: number
  url: string
}

export interface DomainRankings {
  domain: string
  keywords: RankedKeyword[]
}

export interface AnalyticsRequest {
  domains: string[]
  locationCode: number
  dateFrom: string
  dateTo: string
}

export interface KeywordsRequest {
  domains: string[]
  locationCode: number
}

export interface AnalyticsResponse {
  success: boolean
  data: DomainTrafficSeries[]
  error?: string
  isMock?: boolean
}

export interface KeywordsResponse {
  success: boolean
  commonKeywords: Keyword[]
  rankings: DomainRankings[]
  error?: string
  isMock?: boolean
}

export const DOMAIN_COLORS = [
  '#4E9A6F',
  '#E07B3B',
  '#5B8DD9',
  '#C24D7A',
  '#8B5CF6',
  '#F59E0B',
  '#10B981',
  '#EF4444',
]

export const LOCATION_CODES: { label: string; value: number }[] = [
  { label: 'France', value: 2250 },
  { label: 'United States', value: 2840 },
  { label: 'United Kingdom', value: 2826 },
  { label: 'Germany', value: 2276 },
  { label: 'Spain', value: 2724 },
  { label: 'Italy', value: 2380 },
  { label: 'Belgium', value: 2056 },
  { label: 'Switzerland', value: 2756 },
  { label: 'Canada', value: 2124 },
  { label: 'Australia', value: 2036 },
]
