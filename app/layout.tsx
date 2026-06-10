import type { Metadata } from "next"
import type { ReactNode } from "react"

import "./globals.css"

export const metadata: Metadata = {
  title: "CompLens",
  description: "Compensation intelligence software for a 10,000-person global workforce.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
