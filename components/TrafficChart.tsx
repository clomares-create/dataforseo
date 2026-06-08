'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { DomainTrafficSeries } from '@/lib/types'

interface Props {
  series: DomainTrafficSeries[]
}

function formatTraffic(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toString()
}

// Merge all series into a flat array of { month, domain1: N, domain2: N, ... }
function mergeData(series: DomainTrafficSeries[]): Record<string, string | number>[] {
  if (series.length === 0) return []
  const monthMap: Map<string, Record<string, string | number>> = new Map()

  series.forEach(({ domain, data }) => {
    data.forEach(({ month, visits }) => {
      if (!monthMap.has(month)) monthMap.set(month, { month })
      monthMap.get(month)![domain] = visits
    })
  })

  return Array.from(monthMap.values())
}

// Custom legend that shows domain + current traffic value
function CustomLegend({ series }: { series: DomainTrafficSeries[] }) {
  return (
    <div className="flex flex-wrap gap-4 mt-2 mb-4">
      {series.map(s => (
        <div key={s.domain} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
          <span className="text-sm text-gray-700 font-medium">{s.domain}</span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: s.color + '22', color: s.color }}>
            {formatTraffic(s.currentTraffic)}/mo
          </span>
        </div>
      ))}
    </div>
  )
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  const sorted = [...payload].sort((a, b) => b.value - a.value)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[200px]">
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      {sorted.map(entry => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-gray-700 truncate max-w-[130px]">{entry.name}</span>
          </div>
          <span className="text-xs font-bold text-gray-900">{formatTraffic(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function TrafficChart({ series }: Props) {
  const data = mergeData(series)

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400 text-sm">
        No traffic data to display
      </div>
    )
  }

  return (
    <div>
      <CustomLegend series={series} />
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tickFormatter={formatTraffic}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          {series.map(s => (
            <Line
              key={s.domain}
              type="monotone"
              dataKey={s.domain}
              stroke={s.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
