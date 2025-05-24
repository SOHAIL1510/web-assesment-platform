import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <h1 className="text-2xl font-bold">Assessment Platform</h1>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
              Welcome to the Assessment Platform
            </h1>
            <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              Create and take coding and MCQ tests for technical assessments
            </p>
          </div>
          <div className="mx-auto flex flex-col gap-4 sm:flex-row">
            <Link href="/admin">
              <Button size="lg" className="w-full sm:w-auto">
                Admin Portal
              </Button>
            </Link>
            <Link href="/candidate">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Candidate Portal
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
