import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nazmul Hasan Mamun — Full Stack Developer',
  description:
    'Full stack developer building thoughtful digital products with Next.js, Laravel, Express, and MongoDB.',
  metadataBase: new URL('https://nhmnazmul.vercel.app'),
  openGraph: {
    title: 'Nazmul Hasan Mamun — Full Stack Developer',
    description: 'From a clear idea to a product ready for the real world.',
    url: 'https://nhmnazmul.vercel.app',
    siteName: 'Nazmul Hasan Mamun',
    type: 'website',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
