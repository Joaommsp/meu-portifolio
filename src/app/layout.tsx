import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import {
  ThemeColorProvider,
  DEFAULT_ACCENT,
} from "@/contexts/ThemeColorContext"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider"
import { StructuredData } from "@/components/seo/StructuredData"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://joaomarcos.dev"
const SITE_NAME = "João Marcos"
const SITE_DESCRIPTION =
  "Portfolio pessoal de João Marcos — desenvolvedor frontend e designer UI/UX. Projetos, artigos e experimentos em React, Next.js e Tailwind."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Frontend Developer & UI/UX Designer`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: "https://github.com/Joaommsp" }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  keywords: [
    "João Marcos",
    "frontend developer",
    "UI/UX designer",
    "React",
    "Next.js",
    "Tailwind CSS",
    "TypeScript",
    "portfolio",
    "Paulo Afonso",
    "Bahia",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Frontend Developer & UI/UX Designer`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: "/favicon.ico" },
}

export const viewport: Viewport = {
  themeColor: "#0a0a14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      data-accent={DEFAULT_ACCENT}
      className={`${geistSans.variable} ${geistMono.variable} dark h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* JSON-LD WebSite + Person — só em produção pra evitar React 19 warn */}
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: SITE_URL,
                name: SITE_NAME,
                description: SITE_DESCRIPTION,
                inLanguage: "pt-BR",
                publisher: { "@id": `${SITE_URL}/#person` },
              },
              {
                "@type": "Person",
                "@id": `${SITE_URL}/#person`,
                name: SITE_NAME,
                alternateName: "joaomarcos10oficial",
                url: SITE_URL,
                jobTitle: "Frontend Developer & UI/UX Designer",
                description:
                  "Frontend dev em React/Next.js e UI/UX designer baseado em Paulo Afonso, Bahia.",
                sameAs: [
                  "https://github.com/Joaommsp",
                  "https://www.linkedin.com/in/joaomarcos10oficial/",
                  "https://instagram.com/joao.mmsp",
                  "https://figma.com/@joaomarcos19",
                  "https://behance.net/joaomarcos10oficial",
                ],
                knowsAbout: [
                  "TypeScript",
                  "React",
                  "Next.js",
                  "Tailwind CSS",
                  "UI/UX Design",
                  "Firebase",
                ],
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Paulo Afonso",
                  addressRegion: "BA",
                  addressCountry: "BR",
                },
              },
            ],
          }}
        />
        <ThemeColorProvider>
          <AuthProvider>
            <SmoothScrollProvider>
              <TooltipProvider delay={150}>
                {children}
                <Toaster closeButton />
              </TooltipProvider>
            </SmoothScrollProvider>
          </AuthProvider>
        </ThemeColorProvider>
      </body>
    </html>
  )
}
