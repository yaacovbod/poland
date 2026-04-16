import type { Metadata } from "next"
import { Rubik, Rubik_Dirt, Amatic_SC } from "next/font/google"
import "./globals.css"

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
})

const rubikDirt = Rubik_Dirt({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-rubik-dirt",
})

const amaticSC = Amatic_SC({
  subsets: ["hebrew", "latin"],
  weight: "700",
  variable: "--font-amatic",
})

export const metadata: Metadata = {
  title: "מסע לפולין",
  description: "פורטל מידע לתלמידים והורים - מסע לפולין",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl" className={`${rubik.variable} ${rubikDirt.variable} ${amaticSC.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
