"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, Search, Code, ListChecks, ArrowRight, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

interface Test {
  id: string
  name: string
  description: string
  mcqQuestions: any[]
  codingQuestions: any[]
}

interface TestSubmission {
  testId: string
  testName: string
  score: number
  totalMCQs: number
  submittedAt: string
}

export default function CandidateDashboard() {
  const [tests, setTests] = useState<Test[]>([])
  const [submissions, setSubmissions] = useState<TestSubmission[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load tests from localStorage
    const storedTests = localStorage.getItem("tests")
    if (storedTests) {
      setTests(JSON.parse(storedTests))
    }

    // Load submissions
    const storedSubmissions = localStorage.getItem("submissions")
    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions))
    }

    setLoading(false)
  }, [])

  const filteredTests = tests.filter(
    (test) =>
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getTestStatus = (testId: string) => {
    const submission = submissions.find((s) => s.testId === testId)
    if (submission) {
      const scorePercentage = Math.round((submission.score / submission.totalMCQs) * 100)
      return {
        completed: true,
        score: scorePercentage,
        submittedAt: submission.submittedAt,
      }
    }
    return { completed: false }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Available Tests</h1>
          <p className="text-muted-foreground">Select a test to begin your assessment</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tests..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredTests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-2 text-xl font-semibold">No tests available</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "No tests match your search criteria."
              : "There are currently no tests available for you to take."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test, index) => {
            const status = getTestStatus(test.id)

            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{test.name}</CardTitle>
                      {status.completed && (
                        <Badge
                          className={`${
                            status.score >= 70
                              ? "bg-green-100 text-green-800"
                              : status.score >= 40
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {status.score}%
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center text-sm">
                        <ListChecks className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{test.mcqQuestions.length} MCQ Questions</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Code className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{test.codingQuestions.length} Coding Questions</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>60 Minutes</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    {status.completed ? (
                      <Link href={`/candidate/results/${test.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          View Results
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/candidate/take-test/${test.id}`} className="w-full">
                        <Button className="w-full group">
                          Start Test
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
