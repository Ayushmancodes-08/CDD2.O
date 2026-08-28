import './globals.css'
import { Toaster } from 'sonner'
import SecurityProtection from '@/components/cdd/SecurityProtection'
import { FACULTY, TEAM_MEMBERS, PROJECTS, EVENTS } from '@/lib/cdd-constants'

export const metadata = {
  metadataBase: new URL('https://iicpmec.vercel.app'),
  title: {
    default: "Idea and Innovation Cell PMEC | IIC PMEC / IICPMEC (CDD×SIC)",
    template: "%s | IIC PMEC / IICPMEC (CDD×SIC)"
  },
  description: "Official portal of Idea and Innovation Cell (IIC PMEC / IICPMEC) & CDD at PMEC Berhampur. Student innovation cell, hackathons, AI/ML, and web development.",
  applicationName: "Idea and Innovation Cell PMEC (IICPMEC)",
  appleWebApp: {
    title: "IICPMEC",
    statusBarStyle: "default",
    capable: true,
  },
  other: {
    "site_name": "Idea and Innovation Cell PMEC (IICPMEC)",
  },
  referrer: "origin-when-cross-origin",
  keywords: [
    // Core brand terms
    "iicpmec",
    "IICPMEC",
    "iic pmec",
    "IIC PMEC",
    "iicpmec berhampur",
    "IICPMEC Berhampur",
    "iicpmec vercel",
    "iicpmec portal",
    "iicpmec website",
    "pmec",
    "PMEC",
    "cddpmec",
    "CDDPMEC",
    "cdd pmec",
    "cdd_pmec",
    "iic_pmec",
    "pmec iic",
    "pmec cdd",
    "pmec idea",
    "idea pmec",
    "Idea PMEC",
    "Idea Cell PMEC",
    "idea cell pmec",
    "pmec idea cell",
    "pmec innovation cell",
    "innovation cell pmec",
    "idea innovation cell pmec",
    "idea and innovation cell pmec",
    "Idea and Innovation Cell PMEC",
    "Idea and Innovation Cell",
    "IIC",
    "iic",
    "PMEC IIC",
    "Institution Innovation Council PMEC",
    "Institution's Innovation Council PMEC",
    "IIC PMEC Berhampur",
    "CDD PMEC Berhampur",
    "Idea PMEC Berhampur",

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
    "PMEC Idea Cell",
    "PMEC Innovation Cell",
    "PMEC coding club",
    "PMEC Berhampur tech club",
    "CodeKriti",
    "CodeKriti 2027",
    "CodeKriti hackathon",
    "PMEC hackathon",
    "iicpmec.vercel.app"
  ],
  authors: [{ name: "Idea and Innovation Cell PMEC (IIC PMEC / IICPMEC / CDD×SIC)" }],
  creator: "Idea and Innovation Cell PMEC (CDD×SIC)",
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
    yandex: '0791c3349d00c2a0',
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
    siteName: 'Idea and Innovation Cell PMEC (IICPMEC)',
    title: "Idea and Innovation Cell PMEC | IIC PMEC / IICPMEC (CDD×SIC)",
    description: "Official portal of Idea and Innovation Cell (IIC PMEC / IICPMEC) & CDD at PMEC Berhampur. Student innovation cell, hackathons, AI/ML, and web development.",
    images: [
      {
        url: '/Logo_dark.png',
        width: 1200,
        height: 630,
        alt: 'Idea and Innovation Cell PMEC (IICPMEC) Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Idea and Innovation Cell PMEC | IIC PMEC / IICPMEC (CDD×SIC)",
    description: "Official portal of Idea and Innovation Cell (IIC PMEC / IICPMEC) & CDD at PMEC Berhampur.",
    images: ['/Logo_dark.png'],
    creator: '@cddclubpmec',
    site: '@cddclubpmec',
  },
  icons: {
    icon: [
      { url: '/favicon-light-32x32.png?v=3', media: '(prefers-color-scheme: light)', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-light-16x16.png?v=3', media: '(prefers-color-scheme: light)', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-dark-32x32.png?v=3', media: '(prefers-color-scheme: dark)', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-dark-16x16.png?v=3', media: '(prefers-color-scheme: dark)', type: 'image/png', sizes: '16x16' },
      { url: '/favicon.ico?v=3', sizes: 'any' },
      { url: '/icon.png?v=3', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico?v=3',
    apple: [
      { url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest?v=3',
}

export default function RootLayout({ children }) {
  // Generate individual Person Schema nodes for all Faculty and Team Members
  const personNodes = [
    ...FACULTY.map((f) => ({
      '@type': 'Person',
      '@id': `https://iicpmec.vercel.app/#person-${f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: f.name,
      jobTitle: `${f.role} (Faculty Advisor)`,
      description: `${f.name} is the ${f.role} at Idea and Innovation Cell PMEC (IIC PMEC / CDD×SIC) and ${f.specialty} at Parala Maharaja Engineering College, Berhampur.`,
      worksFor: {
        '@id': 'https://iicpmec.vercel.app/#organization',
      },
      affiliation: {
        '@type': 'CollegeOrUniversity',
        name: 'Parala Maharaja Engineering College (PMEC)',
        url: 'https://pmec.ac.in',
      },
      image: f.image ? (f.image.startsWith('http') ? f.image : `https://iicpmec.vercel.app${f.image}`) : undefined,
    })),
    ...TEAM_MEMBERS.map((m) => ({
      '@type': 'Person',
      '@id': `https://iicpmec.vercel.app/#person-${m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: m.name,
      jobTitle: `${m.role} - Idea and Innovation Cell PMEC`,
      description: m.description
        ? `${m.name} is the ${m.role} at Idea and Innovation Cell PMEC (IIC PMEC / CDD×SIC), Parala Maharaja Engineering College. ${m.description}`
        : `${m.name} is the ${m.role} of Idea and Innovation Cell (IIC PMEC / CDD×SIC) at Parala Maharaja Engineering College, Berhampur.`,
      worksFor: {
        '@id': 'https://iicpmec.vercel.app/#organization',
      },
      affiliation: {
        '@type': 'EducationalOrganization',
        name: 'Idea and Innovation Cell PMEC (IIC PMEC / CDD×SIC)',
        url: 'https://iicpmec.vercel.app',
      },
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'Parala Maharaja Engineering College (PMEC)',
        url: 'https://pmec.ac.in',
      },
      email: m.email ? m.email : undefined,
      sameAs: [m.linkedin, m.instagram, m.github].filter(Boolean),
      image: m.image ? (m.image.startsWith('http') ? m.image : `https://iicpmec.vercel.app${m.image}`) : undefined,
    })),
  ];

  // Generate SoftwareApplication nodes for all Projects
  const projectNodes = PROJECTS.map((p) => ({
    '@type': 'SoftwareApplication',
    '@id': `https://iicpmec.vercel.app/#project-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: p.name,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    description: p.description,
    url: p.link || (p.versions && p.versions[0]?.link) || 'https://iicpmec.vercel.app/#projects',
    image: p.image ? (p.image.startsWith('http') ? p.image : `https://iicpmec.vercel.app${p.image}`) : undefined,
    creator: {
      '@id': 'https://iicpmec.vercel.app/#organization',
    },
  }));

  // Generate Event nodes for upcoming events
  const eventNodes = EVENTS.map((e) => ({
    '@type': 'Event',
    '@id': `https://iicpmec.vercel.app/#event-${e.id}`,
    name: `${e.title} - IIC PMEC`,
    description: e.description,
    startDate: e.date.includes('2027') ? '2027-03-15T09:00:00+05:30' : undefined,
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
        addressCountry: 'IN',
      },
    },
    organizer: {
      '@id': 'https://iicpmec.vercel.app/#organization',
    },
  }));

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': 'https://iicpmec.vercel.app/#organization',
        name: 'Idea and Innovation Cell PMEC (IIC PMEC / IICPMEC / CDD×SIC)',
        alternateName: [
          'iicpmec',
          'IICPMEC',
          'iicpmec.vercel.app',
          'IIC PMEC',
          'iic pmec',
          'Idea and Innovation Cell PMEC',
          'Idea and Innovation Cell',
          'Idea Cell PMEC',
          'idea cell pmec',
          'Idea PMEC',
          'idea pmec',
          'PMEC Idea Cell',
          'PMEC Innovation Cell',
          'Innovation Cell PMEC',
          'IIC',
          'iic',
          'Institution Innovation Council PMEC',
          'PMEC IIC',
          'cddpmec',
          'CDDPMEC',
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
          caption: 'Idea and Innovation Cell PMEC (IICPMEC)'
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
          'https://www.instagram.com/ideainnovationcell.pmec',
          'https://www.linkedin.com/in/idea-and-innovation-cell-pmec-838392431',
          'https://github.com/Idea-Innovation-Cell'
        ],
        parentOrganization: {
          '@type': 'CollegeOrUniversity',
          name: 'Parala Maharaja Engineering College (PMEC)',
          url: 'https://pmec.ac.in'
        },
        member: personNodes.map((p) => ({ '@id': p['@id'] })),
        description: "Idea and Innovation Cell PMEC (IIC PMEC / IICPMEC / CDD×SIC) and CDD (Coding Design and Development) is the premier technical innovation society at Parala Maharaja Engineering College (PMEC Berhampur)."
      },
      {
        '@type': 'WebSite',
        '@id': 'https://iicpmec.vercel.app/#website',
        url: 'https://iicpmec.vercel.app',
        name: 'Idea and Innovation Cell PMEC (IICPMEC)',
        alternateName: [
          'iicpmec',
          'IICPMEC',
          'iicpmec.vercel.app',
          'IIC PMEC',
          'iic pmec',
          'Idea and Innovation Cell',
          'CDD PMEC',
          'cddpmec',
          'Idea Cell PMEC'
        ],
        publisher: {
          '@id': 'https://iicpmec.vercel.app/#organization'
        },
        inLanguage: 'en-US'
      },
      ...personNodes,
      ...projectNodes,
      ...eventNodes,
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Who is Om Prakash Sahoo?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Om Prakash Sahoo is the Secretary of Idea and Innovation Cell PMEC (IIC PMEC / CDD×SIC) at Parala Maharaja Engineering College (PMEC), Berhampur. He spearheads executive operations, club administration, and organizational strategy.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Who is the Secretary of Idea and Innovation Cell (IIC PMEC)?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Om Prakash Sahoo is the Secretary of Idea and Innovation Cell PMEC (IIC PMEC / CDD×SIC) at Parala Maharaja Engineering College, Berhampur.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Who is Ayushman Patra?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Ayushman Patra is the Head Coordinator (Boys) at Idea and Innovation Cell PMEC (IIC PMEC / CDD×SIC), coordinating technical development teams, web/app projects, and developer workflows.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Who is Subhechha Tiwari?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Subhechha Tiwari is the Head Coordinator (Girls) at Idea and Innovation Cell PMEC (IIC PMEC / CDD×SIC), facilitating student tech initiatives, workshops, and team coordination.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Who is Prince Priyaranjan Behera?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Prince Priyaranjan Behera is the Content & Social Media Head at Idea and Innovation Cell PMEC (IIC PMEC / CDD×SIC), leading branding and digital media strategy.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Who is Prateek Mohanty?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Prateek Mohanty is the Management Head at Idea and Innovation Cell PMEC (IIC PMEC / CDD×SIC), overseeing event management and operations.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Who is Amlan Satapathy?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Amlan Satapathy is the PR & Outreach Head at Idea and Innovation Cell PMEC (IIC PMEC / CDD×SIC), managing public relations and institutional outreach.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Who is Saurav Pratap Singh?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Saurav Pratap Singh is the Founder of Coding Design and Development (CDD) / Idea and Innovation Cell at PMEC Berhampur, established in 2021.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Who is Omkar Padhy?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Omkar Padhy is the President of Coding Design and Development (CDD) / Idea and Innovation Cell PMEC.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Who are the Faculty In-charges of IIC PMEC?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Dr. Sourav Kumar Bhoi and Dr. Kalyan Kumar Jena are the Faculty In-charges of Idea and Innovation Cell PMEC. Both are Assistant Professors in the Department of Computer Science and Engineering at Parala Maharaja Engineering College.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is IICPMEC (Idea and Innovation Cell PMEC)?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'IICPMEC (also known as Idea and Innovation Cell PMEC / IIC PMEC / Idea Cell PMEC) is the official innovation and student development incubator at Parala Maharaja Engineering College, Berhampur. It oversees student projects, hackathons, and technical advancement.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the official website of IIC PMEC (IICPMEC)?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'The official website of Idea and Innovation Cell PMEC is https://iicpmec.vercel.app (iicpmec).'
            }
          },
          {
            '@type': 'Question',
            'name': 'What software projects has IIC PMEC built?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'IIC PMEC student developers have built and deployed projects including Quizmaster AI (AI quiz engine), College ERP / CampusConnect (academic management portal), LearnOverse (AI study companion), and Skillplot (collaborative peer learning platform).'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the flagship hackathon of IIC PMEC / IICPMEC?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'CodeKriti is the annual flagship 24-hour hackathon organized by Idea and Innovation Cell (IIC PMEC / IICPMEC) at Parala Maharaja Engineering College.'
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
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

        {/* Adaptive Dark & Light Mode Favicons for Browser Tabs */}
        <link rel="icon" media="(prefers-color-scheme: light)" href="/favicon-light-32x32.png?v=3" type="image/png" sizes="32x32" />
        <link rel="icon" media="(prefers-color-scheme: light)" href="/favicon-light-16x16.png?v=3" type="image/png" sizes="16x16" />
        <link rel="icon" media="(prefers-color-scheme: dark)" href="/favicon-dark-32x32.png?v=3" type="image/png" sizes="32x32" />
        <link rel="icon" media="(prefers-color-scheme: dark)" href="/favicon-dark-16x16.png?v=3" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon.ico?v=3" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
        <link rel="manifest" href="/site.webmanifest?v=3" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />
      </head>
      <body className="antialiased bg-white text-slate-900 selection:bg-brand-600 selection:text-white" suppressHydrationWarning>
        <SecurityProtection />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
