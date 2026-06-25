import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pixel Frontier — Browser RPG',
  description: 'Turn-based pixel RPG with gacha weapon system. Explore maps, defeat monsters, collect legendary weapons!',
  openGraph: {
    title: 'Pixel Frontier',
    description: 'Browser RPG with gacha system',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen justify-center items-center overflow-hidden bg-slate-950">
        {/* Arcade chassis wrapper — forces centered mobile‐first scaling on desktop */}
        <div className="w-screen h-screen bg-slate-950 flex justify-center items-center overflow-hidden position-relative">
          {/* Game chassis container — scales to mobile‐size on desktop */}
          <div className="w-full max-w-md h-full md:h-[92vh] md:rounded-2xl md:border md:border-slate-800 md:shadow-[0_0_60px_rgba(0,0,0,0.85)] relative flex flex-col overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">{children}</div>
        </div>
      </body>
    </html>
  )
}
