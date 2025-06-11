import type React from "react"
import type { Metadata } from "next"
import { averiaLibre, workSans } from "@/styles/fonts"
import { FloatingHeader } from "@/components/floating-header"
import { Footer } from "@/components/footer"
import "./globals.css"

export const metadata: Metadata = {
  title: "DAVINCI Voting App",
  description: "Decentralized voting platform powered by DAVINCI protocol",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${workSans.variable} ${averiaLibre.variable}`}>
        <div className="min-h-screen bg-davinci-paper-base/30 flex flex-col">
          <FloatingHeader />
          <main className="flex-1 pt-32 pb-16">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
