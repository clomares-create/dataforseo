import { DomainTrafficSeries, Keyword, DomainRankings, DOMAIN_COLORS } from './types'

const MONTHS = [
  'Jun 2024', 'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024',
  'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025',
]

// Baseline monthly traffic values per domain
const DOMAIN_BASELINES: Record<string, number> = {
  'maisoncatrosgerand.fr': 5000,
  'labonnegraine.com': 92000,
  'kokopelli-semences.fr': 229000,
  'graines-baumaux.fr': 82000,
  'fermedesaintemarthe.com': 165000,
}

// Seasonal multipliers (seeds/plants = spring peak)
const SEASONAL_MULTIPLIERS = [0.6, 0.55, 0.5, 0.85, 1.1, 1.2, 0.9, 0.65, 0.7, 1.0, 1.3, 1.25]

function generateTrafficData(domain: string, baseline: number): { month: string; visits: number }[] {
  return MONTHS.map((month, i) => {
    const seasonal = SEASONAL_MULTIPLIERS[i]
    const noise = 0.9 + Math.random() * 0.2
    return {
      month,
      visits: Math.round(baseline * seasonal * noise),
    }
  })
}

export function generateMockTrafficData(domains: string[]): DomainTrafficSeries[] {
  return domains.map((domain, idx) => {
    const baseline = DOMAIN_BASELINES[domain] ?? Math.round(10000 + Math.random() * 50000)
    const data = generateTrafficData(domain, baseline)
    return {
      domain,
      color: DOMAIN_COLORS[idx % DOMAIN_COLORS.length],
      data,
      currentTraffic: data[data.length - 1].visits,
    }
  })
}

const COMMON_KEYWORDS_POOL: Keyword[] = [
  { keyword: 'graines potager bio', searchVolume: 8100, positions: {} },
  { keyword: 'semences anciennes', searchVolume: 5400, positions: {} },
  { keyword: 'graines tomates anciennes', searchVolume: 4400, positions: {} },
  { keyword: 'acheter graines bio', searchVolume: 3600, positions: {} },
  { keyword: 'semences reproductibles', searchVolume: 2900, positions: {} },
  { keyword: 'graines potageres', searchVolume: 14800, positions: {} },
  { keyword: 'semences maraicheres', searchVolume: 2400, positions: {} },
  { keyword: 'graines courgettes', searchVolume: 6600, positions: {} },
  { keyword: 'graines tomates cerises', searchVolume: 5400, positions: {} },
  { keyword: 'graines haricots verts', searchVolume: 4400, positions: {} },
  { keyword: 'catalogue graines', searchVolume: 3200, positions: {} },
  { keyword: 'semences paysannes', searchVolume: 1900, positions: {} },
  { keyword: 'graines fleurs sauvages', searchVolume: 7200, positions: {} },
  { keyword: 'potager naturel', searchVolume: 9900, positions: {} },
  { keyword: 'varietes anciennes legumes', searchVolume: 2600, positions: {} },
]

export function generateMockKeywords(domains: string[]): {
  commonKeywords: Keyword[]
  rankings: DomainRankings[]
} {
  const keywords: Keyword[] = COMMON_KEYWORDS_POOL.map(kw => {
    const positions: Record<string, number | null> = {}
    domains.forEach(domain => {
      // randomly assign some positions, nulls for "not ranked"
      const ranked = Math.random() > 0.3
      positions[domain] = ranked ? Math.floor(1 + Math.random() * 30) : null
    })
    return { ...kw, positions }
  })

  // Filter to keywords where at least 2 domains rank
  const common = keywords.filter(kw => {
    const ranked = Object.values(kw.positions).filter(p => p !== null).length
    return ranked >= 2
  })

  const rankings: DomainRankings[] = domains.map(domain => ({
    domain,
    keywords: keywords
      .filter(kw => kw.positions[domain] !== null)
      .map(kw => ({
        keyword: kw.keyword,
        position: kw.positions[domain] as number,
        searchVolume: kw.searchVolume,
        url: `https://${domain}/`,
      }))
      .sort((a, b) => a.position - b.position)
      .slice(0, 10),
  }))

  return { commonKeywords: common.slice(0, 15), rankings }
}
