import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vibe Validator - Cultural Space Intelligence',
  description: 'Upload any image and discover its cultural vibe with AI-powered recommendations for music, activities, and experiences.',
  keywords: ['AI', 'cultural intelligence', 'vibe analysis', 'recommendations', 'Qloo'],
  authors: [{ name: 'Vibe Validator Team' }],
  openGraph: {
    title: 'Vibe Validator - Cultural Space Intelligence',
    description: 'Discover the cultural essence of any space with AI',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}