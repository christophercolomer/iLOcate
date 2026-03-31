import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'iLOcate - Explore Iloilo Now!',
  description: 'Discover the best places, food, events, and experiences in Iloilo City, Philippines. Your ultimate tourism discovery platform.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/Icon-Ilocate-Light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/Icon-Ilocate-Dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/Ilocate No BG.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/Icon-Ilocate-Dark-180x180.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0E8B8B',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
