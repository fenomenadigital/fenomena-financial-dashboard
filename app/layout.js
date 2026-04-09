import './globals.css'

export const metadata = {
  title: 'Fenomena Digital · Financial Dashboard',
  description: 'Internal financial dashboard — Fenomena Digital',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
