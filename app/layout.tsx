import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: "Happy Mother's Day Inay 💐",
  description: "A heartfelt Mother's Day message for the most special person",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Inay 💐',
  },
}

export const viewport: Viewport = {
  themeColor: '#c8526b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Pinyon+Script&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#1a0a14' }}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js');`,
          }}
        />
      </body>
    </html>
  )
}
