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
    // Core brand terms
    "pmec",
    "PMEC",
    "cddpmec",
    "iicpmec",
    "iic pmec",
    "cdd pmec",
    "cdd_pmec",
    "iic_pmec",
    "pmec iic",
    "pmec cdd",
    "pmec idea",
    "idea pmec",
    "IDEA PMEC",
    "IDEA CELL PMEC",
    "idea cell pmec",
    "pmec idea cell",
    "pmec innovation cell",
    "innovation cell pmec",
    "idea innovation cell pmec",
    "idea and innovation cell pmec",
    "IDEA AND INNOVATION CELL PMEC",
    "IDEA AND INNOVATION CELL",
    "IDEA and Innovation Cell",
    "IDEA and Innovation Cell PMEC",
    "IIC PMEC",
    "iic pmec",
    "IIC",
    "iic",
    "PMEC IIC",
    "Institution Innovation Council PMEC",
    "Institution's Innovation Council PMEC",
    "IIC PMEC Berhampur",
    "CDD PMEC Berhampur",
    "IDEA PMEC Berhampur",

    // College and Location variations
    "pmec berhampur",
    "PMEC Berhampur",
    "PMEC Sitalapalli",
    "Parala Maharaja Engineering College",
    "Parala Maharaja Engineering College Berhampur",
    "Parala Maharaja Engineering College innovation cell",
    "Parala Maharaja Engineering College coding club",
    "Parala Maharaja Engineering College idea cell",
    "Parala Maharaja Engineering College IIC",
    "Parala Maharaja Engineering College CDD",
    "PMEC college clubs",
    "PMEC student clubs",
    "PMEC tech society",
    "PMEC engineering college",

    // Club / Tech society
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
    "CodeKriti",
    "CodeKriti 2027",
    "CodeKriti hackathon",
    "PMEC hackathon",
    "iicpmec.vercel.app"
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
  verification: {
    google: 'QsDjMLpQfxJwJFyJZ4v1UfgcucY3HqrwFUMO34OT_3g',
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
          'IDEA and Innovation Cell',
          'IDEA and Innovation Cell PMEC',
          'IDEA Cell PMEC',
          'idea cell pmec',
          'IDEA PMEC',
          'idea pmec',
          'PMEC IDEA Cell',
          'PMEC Innovation Cell',
          'Innovation Cell PMEC',
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
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is IDEA and Innovation Cell PMEC (IDEA Cell PMEC)?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'IDEA and Innovation Cell PMEC (also known as IDEA Cell PMEC / IIC PMEC) is the official innovation and student development incubator at Parala Maharaja Engineering College, Berhampur. It oversees student projects, hackathons, and technical advancement.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is IIC PMEC / CDD PMEC?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'IDEA and Innovation Cell (IIC PMEC) & CDD (Coding Design and Development) is the premier official student technical and innovation society at Parala Maharaja Engineering College (PMEC), Berhampur.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is PMEC CDD (Coding Design and Development)?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'CDD is the tech and development wing at PMEC Berhampur dedicated to web development, AI/ML, hackathons, open-source projects, and technical peer learning.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the flagship hackathon of IIC PMEC?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'CodeKriti is the annual flagship 24-hour hackathon organized by IDEA and Innovation Cell (IIC PMEC) at Parala Maharaja Engineering College.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Where is PMEC Campus located?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Parala Maharaja Engineering College (PMEC) is located at Sitalapalli, Berhampur, Ganjam, Odisha, 761003.'
            }
          }
        ]
      }
    ]
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect for external media origins */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://script.google.com" crossOrigin="anonymous" />
        
        {/* Critical image preloads */}
        <link rel="preload" as="image" href="/Logo_dark.png" fetchPriority="high" />
        <link rel="preload" as="image" href="/sourav_sir.png" fetchPriority="high" />
        <link rel="preload" as="image" href="/Dr.-Kalyan-Kumar-Jena.jpeg" fetchPriority="high" />
        <link rel="preload" as="image" href="/projects/quizmaster_ai.jpg" />
        <link rel="preload" as="image" href="/projects/college_erp.jpg" />

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
