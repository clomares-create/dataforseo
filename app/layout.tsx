import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SEO Competitor Dashboard',
  description: 'Visualize organic traffic and keyword rankings across competitor domains',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
