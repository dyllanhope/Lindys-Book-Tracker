import type { Metadata } from 'next'
import { Newsreader, Mulish } from 'next/font/google'
import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
})

const mulish = Mulish({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mulish',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Lindy's Book Tracker",
  description: 'Personal book tracking app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${mulish.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ background: 'var(--cream)', color: 'var(--ink)', fontFamily: 'var(--font-mulish), sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
