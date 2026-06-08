'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LOCATION_CODES, DOMAIN_COLORS } from '@/lib/types'

const DEFAULT_DOMAINS = [
  'maisoncatrosgerand.fr',
  'labonnegraine.com',
  'kokopelli-semences.fr',
  'graines-baumaux.fr',
  'fermedesaintemarthe.com',
]

export default function DomainForm() {
  const router = useRouter()
  const [domains, setDomains] = useState<string[]>(DEFAULT_DOMAINS)
  const [newDomain, setNewDomain] = useState('')
  const [locationCode, setLocationCode] = useState(2250)
  const [dateFrom, setDateFrom] = useState('2024-06-01')
  const [dateTo, setDateTo] = useState('2025-05-31')

  const addDomain = () => {
    const trimmed = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')
    if (trimmed && !domains.includes(trimmed)) {
      setDomains([...domains, trimmed])
    }
    setNewDomain('')
  }

  const removeDomain = (domain: string) => {
    setDomains(domains.filter(d => d !== domain))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (domains.length === 0) return
    const params = new URLSearchParams({
      domains: domains.join(','),
      locationCode: locationCode.toString(),
      dateFrom,
      dateTo,
    })
    router.push(`/dashboard?${params.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addDomain()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Domain Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Competitor Domains
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. example.com"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
          />
          <button
            type="button"
            onClick={addDomain}
            className="px-4 py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors"
          >
            Add
          </button>
        </div>

        {/* Domain Tags */}
        <div className="flex flex-wrap gap-2">
          {domains.map((domain, idx) => (
            <div
              key={domain}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: DOMAIN_COLORS[idx % DOMAIN_COLORS.length] }}
            >
              <span>{domain}</span>
              <button
                type="button"
                onClick={() => removeDomain(domain)}
                className="ml-1 hover:opacity-75 transition-opacity text-white/80 hover:text-white"
              >
                ×
              </button>
            </div>
          ))}
          {domains.length === 0 && (
            <p className="text-sm text-gray-400 italic">No domains added yet</p>
          )}
        </div>
      </div>

      {/* Country & Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
          <select
            value={locationCode}
            onChange={e => setLocationCode(Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
          >
            {LOCATION_CODES.map(loc => (
              <option key={loc.value} value={loc.value}>{loc.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={domains.length === 0}
        className="w-full py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm tracking-wide"
      >
        Analyze Competitors →
      </button>
    </form>
  )
}
