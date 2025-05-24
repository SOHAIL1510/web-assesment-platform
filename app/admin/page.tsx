"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Code, ListChecks, Pencil, Trash2, FileText } from "lucide-react"
import { motion } from "framer-motion"

interface Test {
  id: string
  name: string
  description: string
  mcqQuestions: {
    id: string
    question: string
    options: string[]
    correctAnswer: number
  }[]
  codingQuestions: {
    id: string
    question: string
    language: string
    expectedOutput: string
  }[]
}

export default function AdminDashboard() {
  const [tests, setTests] = useState<Test[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load tests from localStorage
    const storedTests = localStorage.getItem("tests")
    if (storedTests) {
      setTests(JSON.parse(storedTests))
    }
    setLoading(false)
  }, [])

  const filteredTests = tests.filter(
    (test) =>
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteTest = (id: string) => {
    if (confirm("Are you sure you want to delete this test?")) {
      const updatedTests = tests.filter((test) => test.id !== id)
      setTests(updatedTests)
      localStorage.setItem("tests", JSON.stringify(updatedTests))
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Test Dashboard</h1>
          <p className="text-muted-foreground">Manage your assessment tests</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tests..."
              className="pl-8 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/admin/create-test">
            <Button className="w-full md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Test
            </Button>
          </Link>
        </div>
      </div>

      {filteredTests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-2 text-xl font-semibold">
            {searchQuery ? "No tests match your search" : "No tests created yet"}
          </h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Try a different search term or clear the search."
              : "Get started by creating your first test."}
          </p>
          {!searchQuery && (
            <Link href="/admin/create-test">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Test
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle>{test.name}</CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <ListChecks className="h-3 w-3" />
                      {test.mcqQuestions.length} MCQs
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Code className="h-3 w-3" />
                      {test.codingQuestions.length} Coding
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between">
                  <Button variant="outline" size="sm" className="flex-1 mr-2">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteTest(test.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
