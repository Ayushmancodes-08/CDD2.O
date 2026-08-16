import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  metadataBase: new URL('https://cdd-pmec.vercel.app'),
  title: {
    default: "IDEA AND INNOVATION CELL (CDD×SIC) | CDD — Coding Design and Development PMEC",
    template: "%s | IDEA AND INNOVATION CELL (CDD×SIC)"
  },
  description: "Official portal of IDEA AND INNOVATION CELL (CDD×SIC) & CDD (Coding Design and Development) at Parala Maharaja Engineering College (PMEC Berhampur). Premier student innovation cell, coding club, hackathons, CodeKriti 2027, AI/ML, and web development.",
  keywords: [
    "IDEA AND INNOVATION CELL",
    "IDEA and Innovation Cell",
    "idea innovation cell",
    "IDEA Innovation Cell PMEC",
    "CDD×SIC",
    "CDD x SIC",
    "CDD-SIC",
    "CDD",
    "cdd",
    "CDD club",
    "CDD PMEC",
    "cdd pmec",
    "Coding Design and Development",
    "Coding Design & Development",
    "Coding Design and Development Club",
    "PMEC CDD",
    "PMEC IDEA Cell",
    "PMEC Innovation Cell",
    "PMEC coding club",
    "PMEC Berhampur tech club",
    "Parala Maharaja Engineering College innovation cell",
    "Parala Maharaja Engineering College coding club",
    "CodeKriti",
    "CodeKriti 2027",
    "CodeKriti hackathon",
    "PMEC hackathon",
    "cdd-pmec.vercel.app"
  ],
  authors: [{ name: "IDEA AND INNOVATION CELL (CDD×SIC)" }],
  creator: "IDEA AND INNOVATION CELL (CDD×SIC)",
  publisher: "Parala Maharaja Engineering College (PMEC)",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://cdd-pmec.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cdd-pmec.vercel.app',
    siteName: 'IDEA AND INNOVATION CELL (CDD×SIC)',
    title: "IDEA AND INNOVATION CELL (CDD×SIC) | PMEC's Premier Tech Society & Innovation Cell",
    description: "Official portal of IDEA AND INNOVATION CELL (CDD×SIC) & CDD (Coding Design and Development) at PMEC Berhampur.",
    images: [
      {
        url: '/Logo_dark.png',
        width: 1200,
        height: 630,
        alt: 'IDEA AND INNOVATION CELL (CDD×SIC) Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "IDEA AND INNOVATION CELL (CDD×SIC) | CDD PMEC",
    description: "Official portal of IDEA AND INNOVATION CELL (CDD×SIC) at PMEC Berhampur.",
    images: ['/Logo_dark.png'],
    creator: '@cddclubpmec',
  },
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'IDEA AND INNOVATION CELL (CDD×SIC)',
    alternateName: [
      'IDEA AND INNOVATION CELL',
      'IDEA and Innovation Cell',
      'idea innovation cell',
      'CDD×SIC',
      'CDD x SIC',
      'CDD',
      'cdd',
      'Coding Design and Development',
      'Coding Design & Development',
      'CDD Club PMEC'
    ],
    url: 'https://cdd-pmec.vercel.app',
    logo: 'https://cdd-pmec.vercel.app/Logo_dark.png',
    sameAs: [
      'https://www.instagram.com/cdd_club_pmec',
      'https://www.linkedin.com/company/coding-design-and-development/posts/?feedView=all',
      'https://github.com/CodingClubPMEC',
      'https://x.com/cddclubpmec'
    ],
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Parala Maharaja Engineering College (PMEC)',
      url: 'https://pmec.ac.in'
    },
    description: "IDEA AND INNOVATION CELL (CDD×SIC) and CDD (Coding Design and Development) is the official technical innovation society at Parala Maharaja Engineering College (PMEC Berhampur)."
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-white text-slate-900 selection:bg-brand-600 selection:text-white">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
