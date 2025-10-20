import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-kr',
})

export const metadata: Metadata = {
  title: 'Marketing AI Agent',
  description: 'AI-powered marketing strategy and calendar management tool',
  keywords: ['marketing', 'AI', 'strategy', 'calendar', 'automation'],
  authors: [{ name: 'Marketing AI Agent Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}

