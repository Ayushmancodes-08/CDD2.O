import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: "IDEA AND INNOVATION CELL (CDD×SIC) | Where Code Meets Innovation — PMEC's Premier Tech Society",
  description: "The IDEA and Innovation Cell (CDD×SIC) is PMEC's premier technical society bridging theory and industry. Hackathons, workshops, projects, and more.",
  keywords: "IDEA AND INNOVATION CELL, CDD×SIC, CDD Club, PMEC, coding club, hackathon, web development, AI, machine learning, technical society",
  icons: {
    icon: [
      {
        url: "/Logo_dark.png",
        href: "/Logo_dark.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo_white.png",
        href: "/logo_white.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      {
        url: "/Logo_dark.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo_white.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
