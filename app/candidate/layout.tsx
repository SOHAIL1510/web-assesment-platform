import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/candidate" className="text-2xl font-bold">
            Candidate Portal
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/candidate">
              <Button variant="ghost">Available Tests</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Home</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-6">{children}</main>
    </div>
  )
}
