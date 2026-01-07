import './globals.css'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata = {
  title: 'Bolão 2026',
  description: 'Bolão do Brasileirão',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={poppins.className}>
      <body style={{ backgroundColor: '#f6feff' }}>
        {children}
      </body>
    </html>
  )
}
