import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pixel Saga — Browser RPG',
  description: 'Turn-based pixel RPG with gacha weapon system. Explore maps, defeat monsters, collect legendary weapons!',
  openGraph: {
    title: 'Pixel Saga',
    description: 'Browser RPG with gacha system',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white overflow-hidden">{children}</body>
    </html>
  )
}
