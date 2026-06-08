'use client'

import { useState } from 'react'
import { DomainRankings, DOMAIN_COLORS } from '@/lib/types'

interface Props {
  rankings: DomainRankings[]
}

function PositionBadge({ position }: { position: number }) {
  let bg = 'bg-gray-100 text-gray-600'
  if (position <= 3) bg = 'bg-green-100 text-green-800 font-bold'
  else if (position <= 10) bg = 'bg-blue-50 text-blue-700 font-semibold'
  else if (position <= 20) bg = 'bg-yellow-50 text-yellow-700'

  return (
    <span className={`inline-block w-8 text-center px-1 py-0.5 rounded text-xs ${bg}`}>
      #{position}
    </span>
  )
}

function formatVolume(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
  return v.toString()
}

export default function RankingsTable({ rankings }: Props) {
  const [selectedDomain, setSelectedDomain] = useState<string>(rankings[0]?.domain ?? '')

  const currentRanking = rankings.find(r => r.domain === selectedDomain)
  const colorIdx = rankings.findIndex(r => r.domain === selectedDomain)
  const color = DOMAIN_COLORS[colorIdx % DOMAIN_COLORS.length]

  if (rankings.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">
        No ranking data available
      </div>
    )
  }

  return (
    <div>
      {/* Domain selector tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {rankings.map((r, i) => {
          const c = DOMAIN_COLORS[i % DOMAIN_COLORS.length]
          const isActive = r.domain === selectedDomain
          return (
            <button
              key={r.domain}
              onClick={() => setSelectedDomain(r.domain)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                isActive ? 'text-white shadow-sm' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
              }`}
              style={isActive ? { backgroundColor: c } : {}}
            >
              {r.domain}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Keyword
              </th>
              <th className="text-center py-2 px-2 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                Pos.
              </th>
              <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Vol.
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRanking?.keywords.map((kw, i) => (
              <tr
                key={kw.keyword}
                className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}
              >
                <td className="py-2 px-2 font-medium text-gray-800 max-w-[180px]">
                  <span className="block truncate" title={kw.keyword}>{kw.keyword}</span>
                  {kw.url && (
                    <span className="text-xs text-gray-400 truncate block" title={kw.url}>
                      {kw.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </span>
                  )}
                </td>
                <td className="py-2 px-2 text-center">
                  <PositionBadge position={kw.position} />
                </td>
                <td className="py-2 px-2 text-right text-gray-500 text-xs">
                  {formatVolume(kw.searchVolume)}
                </td>
              </tr>
            ))}
            {(!currentRanking || currentRanking.keywords.length === 0) && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-400 text-sm">
                  No keywords found for this domain
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
