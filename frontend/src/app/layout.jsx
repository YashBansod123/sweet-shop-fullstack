import './globals.css'

export const metadata = {
  title: 'Sweet Shop',
  description: 'Sweet Shop Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}