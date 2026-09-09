import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Portfolio CMS",
  description: "Content Management System for portfolio",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
