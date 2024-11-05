import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '下载系统',
  description: '文件下载系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}