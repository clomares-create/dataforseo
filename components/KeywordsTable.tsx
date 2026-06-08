'use client'

import { Keyword, DOMAIN_COLORS } from '@/lib/types'

interface Props {
  keywords: Keyword[]
  domains: string[]
}

function PositionBadge({ position }: { position: number | null }) {
  if (position === null) {
    return <span className="text-gray-300 text-xs">—</span>
  }

  let bg = 'bg-gray-100 text-gray-500'
  if (position <= 3) bg = 'bg-green-100 text-green-800 font-bold'
  else if (position <= 10) bg = 'bg-blue-50 text-blue-700 font-semibold'
  else if (position <= 20) bg = 'bg-yellow-50 text-yellow-700'

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs ${bg}`}>
      #{position}
    </span>
  )
}

function formatVolume(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return v.toString()
}

export default function KeywordsTable({ keywords, domains }: Props) {
  if (keywords.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">
        No common keywords found
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Keyword
            </th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              Vol.
            </th>
            {domains.map((d, i) => (
              <th
                key={d}
                className="text-center py-2 px-2 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                style={{ color: DOMAIN_COLORS[i % DOMAIN_COLORS.length] }}
                title={d}
              >
                {d.split('.')[0].slice(0, 8)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keywords.map((kw, i) => (
            <tr
              key={kw.keyword}
              className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
            >
              <td className="py-2 px-2 font-medium text-gray-800 max-w-[160px] truncate" title={kw.keyword}>
                {kw.keyword}
              </td>
              <td className="py-2 px-2 text-right text-gray-500 text-xs">
                {formatVolume(kw.searchVolume)}
              </td>
              {domains.map(d => (
                <td key={d} className="py-2 px-2 text-center">
                  <PositionBadge position={kw.positions[d] ?? null} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
