import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  metadataBase: new URL('https://iicpmec.vercel.app'),
  title: {
    default: "IDEA AND INNOVATION CELL PMEC | IIC PMEC — CDD (Coding Design and Development)",
    template: "%s | IDEA AND INNOVATION CELL PMEC (CDD×SIC)"
  },
  description: "Official portal of IDEA AND INNOVATION CELL PMEC (IIC PMEC / CDD×SIC) & CDD (Coding Design and Development) at Parala Maharaja Engineering College, Berhampur. Student innovation cell, hackathons, CodeKriti 2027, AI/ML, and web development.",
  applicationName: "IDEA AND INNOVATION CELL PMEC",
  referrer: "origin-when-cross-origin",
  keywords: [
    "IDEA AND INNOVATION CELL PMEC",
    "IDEA AND INNOVATION CELL",
    "IDEA and Innovation Cell",
    "idea innovation cell pmec",
    "IIC PMEC",
    "iic pmec",
    "IIC",
    "iic",
    "PMEC IIC",
    "Institution Innovation Council PMEC",
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
    "iicpmec.vercel.app",
    "cdd-pmec.vercel.app"
  ],
  authors: [{ name: "IDEA AND INNOVATION CELL PMEC (IIC PMEC / CDD×SIC)" }],
  creator: "IDEA AND INNOVATION CELL PMEC (CDD×SIC)",
  publisher: "Parala Maharaja Engineering College (PMEC)",
  category: "Technology & Education",
  classification: "Student Innovation and Engineering Society",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
    canonical: 'https://iicpmec.vercel.app',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://iicpmec.vercel.app',
    siteName: 'IDEA AND INNOVATION CELL PMEC (IIC PMEC / CDD×SIC)',
    title: "IDEA AND INNOVATION CELL PMEC | IIC PMEC — Official Tech & Innovation Society",
    description: "Official website of IDEA AND INNOVATION CELL PMEC (IIC PMEC) & CDD (Coding Design and Development) at PMEC Berhampur. Bridging theory and practice through cutting-edge technology.",
    images: [
      {
        url: '/Logo_dark.png',
        width: 1200,
        height: 630,
        alt: 'IDEA AND INNOVATION CELL PMEC Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "IDEA AND INNOVATION CELL PMEC | IIC PMEC (CDD×SIC)",
    description: "Official portal of IDEA AND INNOVATION CELL PMEC (IIC PMEC) & CDD at PMEC Berhampur.",
    images: ['/Logo_dark.png'],
    creator: '@cddclubpmec',
    site: '@cddclubpmec',
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
  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': 'https://iicpmec.vercel.app/#organization',
        name: 'IDEA AND INNOVATION CELL PMEC (IIC PMEC / CDD×SIC)',
        alternateName: [
          'IDEA AND INNOVATION CELL PMEC',
          'IDEA AND INNOVATION CELL',
          'IIC PMEC',
          'iic pmec',
          'IIC',
          'iic',
          'Institution Innovation Council PMEC',
          'PMEC IIC',
          'CDD×SIC',
          'CDD x SIC',
          'CDD',
          'cdd',
          'Coding Design and Development',
          'Coding Design & Development',
          'CDD Club PMEC'
        ],
        url: 'https://iicpmec.vercel.app',
        logo: {
          '@type': 'ImageObject',
          url: 'https://iicpmec.vercel.app/Logo_dark.png',
          caption: 'IDEA AND INNOVATION CELL PMEC'
        },
        image: 'https://iicpmec.vercel.app/Logo_dark.png',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Room 113, Academic Main Building, PMEC Campus',
          addressLocality: 'Berhampur',
          addressRegion: 'Odisha',
          postalCode: '761003',
          addressCountry: 'IN'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 19.357674,
          longitude: 84.871461
        },
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
        description: "IDEA AND INNOVATION CELL PMEC (IIC PMEC / CDD×SIC) and CDD (Coding Design and Development) is the premier technical innovation society at Parala Maharaja Engineering College (PMEC Berhampur)."
      },
      {
        '@type': 'WebSite',
        '@id': 'https://iicpmec.vercel.app/#website',
        url: 'https://iicpmec.vercel.app',
        name: 'IDEA AND INNOVATION CELL PMEC',
        publisher: {
          '@id': 'https://iicpmec.vercel.app/#organization'
        },
        inLanguage: 'en-US'
      },
      {
        '@type': 'Event',
        '@id': 'https://iicpmec.vercel.app/#codekriti2027',
        name: 'CodeKriti 2027 Hackathon',
        description: 'Annual flagship 24-hour hackathon bringing together creative student developers, designers, and innovators.',
        startDate: '2027-03-15T09:00:00+05:30',
        endDate: '2027-03-16T09:00:00+05:30',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: 'Parala Maharaja Engineering College',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'PMEC Campus, Sitalapalli',
            addressLocality: 'Berhampur',
            addressRegion: 'Odisha',
            postalCode: '761003',
            addressCountry: 'IN'
          }
        },
        organizer: {
          '@id': 'https://iicpmec.vercel.app/#organization'
        }
      }
    ]
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />
      </head>
      <body className="antialiased bg-white text-slate-900 selection:bg-brand-600 selection:text-white">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
