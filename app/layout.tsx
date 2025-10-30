import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'On-Call Schedule - Nöbet Çizelgesi',
  description: 'Adil yük dağılımı ile on-call schedule yönetimi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}

