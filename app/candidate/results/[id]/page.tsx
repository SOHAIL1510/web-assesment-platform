"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Clock, Award, FileText, Code, ListChecks, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

interface TestSubmission {
  testId: string
  testName: string
  responses: {
    mcqAnswers: Record<string, number>
    codingAnswers: Record<string, string>
  }
  score: number
  totalMCQs: number
  submittedAt: string
  timeSpent: number
}

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

export default function TestResults({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = useState<TestSubmission | null>(null)
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load submission data
    const submissions = JSON.parse(localStorage.getItem("submissions") || "[]")
    const foundSubmission = submissions.find((s: TestSubmission) => s.testId === params.id)

    // Load test data
    const tests = JSON.parse(localStorage.getItem("tests") || "[]")
    const foundTest = tests.find((t: Test) => t.id === params.id)

    if (foundSubmission) {
      setSubmission(foundSubmission)
    }

    if (foundTest) {
      setTest(foundTest)
    }

    setLoading(false)
  }, [params.id])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreGrade = (percentage: number) => {
    if (percentage >= 90) return "A+"
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B"
    if (percentage >= 60) return "C"
    if (percentage >= 50) return "D"
    return "F"
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: "bg-yellow-100 text-yellow-800 border-yellow-200",
      python: "bg-blue-100 text-blue-800 border-blue-200",
      java: "bg-orange-100 text-orange-800 border-orange-200",
      csharp: "bg-purple-100 text-purple-800 border-purple-200",
      cpp: "bg-green-100 text-green-800 border-green-200",
    }
    return colors[language] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!submission || !test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Results not found</h2>
        <p className="text-muted-foreground mb-6">The test results you're looking for don't exist.</p>
        <Button asChild>
          <Link href="/candidate">Back to Tests</Link>
        </Button>
      </div>
    )
  }

  const scorePercentage = Math.round((submission.score / submission.totalMCQs) * 100)
  const answeredMCQs = Object.values(submission.responses.mcqAnswers).filter((a) => a !== -1).length
  const answeredCoding = Object.values(submission.responses.codingAnswers).filter((a) => a.trim() !== "").length
  const totalAnswered = answeredMCQs + answeredCoding
  const totalQuestions = test.mcqQuestions.length + test.codingQuestions.length
  const completionPercentage = Math.round((totalAnswered / totalQuestions) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/candidate"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Tests
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
          <p className="text-muted-foreground">Your results for {test.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Submitted {new Date(submission.submittedAt).toLocaleString()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:col-span-3"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Test Summary
              </CardTitle>
              <CardDescription>Overview of your performance on this assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
                  <div className={`text-5xl font-bold ${getScoreColor(scorePercentage)}`}>{scorePercentage}%</div>
                  <div className="text-sm text-muted-foreground mt-1">MCQ Score</div>
                  <div className="mt-2">
                    <Badge
                      className={`${
                        scorePercentage >= 70
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : scorePercentage >= 40
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                      }`}
                    >
                      Grade: {getScoreGrade(scorePercentage)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>MCQ Score</span>
                      <span>
                        {submission.score}/{submission.totalMCQs}
                      </span>
                    </div>
                    <Progress
                      value={scorePercentage}
                      className="h-2"
                      indicatorClassName={
                        scorePercentage >= 70 ? "bg-green-500" : scorePercentage >= 40 ? "bg-yellow-500" : "bg-red-500"
                      }
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completion</span>
                      <span>
                        {totalAnswered}/{totalQuestions}
                      </span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">MCQs Answered</div>
                    <div className="text-2xl font-bold mt-1">
                      {answeredMCQs}/{test.mcqQuestions.length}
                    </div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground">Coding Answered</div>
                    <div className="text-2xl font-bold mt-1">
                      {answeredCoding}/{test.codingQuestions.length}
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg flex flex-col justify-center">
                  <div className="text-sm text-muted-foreground">Time Spent</div>
                  <div className="text-2xl font-bold mt-1">{formatTime(submission.timeSpent)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(submission.timeSpent / 60)} minutes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="md:col-span-3">
          <Tabs defaultValue="mcq">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="mcq" className="flex items-center gap-1">
                <ListChecks className="h-4 w-4" />
                MCQ Questions
              </TabsTrigger>
              <TabsTrigger value="coding" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                Coding Questions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mcq" className="space-y-6">
              {test.mcqQuestions.map((question, index) => {
                const userAnswer = submission.responses.mcqAnswers[question.id]
                const isCorrect = userAnswer === question.correctAnswer
                const isAnswered = userAnswer !== -1

                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div className="space-y-1">
                          <Badge variant="outline" className="mb-1">
                            Question {index + 1}
                          </Badge>
                          <CardTitle>{question.question}</CardTitle>
                        </div>
                        {isAnswered && (
                          <div>
                            {isCorrect ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" /> Correct
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1">
                                <XCircle className="h-4 w-4" /> Incorrect
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-4 rounded-md ${
                                userAnswer === optIndex
                                  ? isCorrect
                                    ? "bg-green-100 border border-green-300"
                                    : "bg-red-100 border border-red-300"
                                  : question.correctAnswer === optIndex
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>{option}</div>
                                {optIndex === question.correctAnswer && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Correct Answer
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </TabsContent>

            <TabsContent value="coding" className="space-y-6">
              {test.codingQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline">Coding Question {index + 1}</Badge>
                        <Badge variant="outline" className={getLanguageColor(question.language)}>
                          {question.language.toUpperCase()}
                        </Badge>
                      </div>
                      <CardTitle>Problem Statement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="rounded-md bg-muted p-4">
                          <p className="whitespace-pre-wrap">{question.question}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Your Solution</h3>
                        <div className="rounded-md bg-muted p-4 font-mono whitespace-pre-wrap overflow-x-auto">
                          {submission.responses.codingAnswers[question.id] || "(No answer provided)"}
                        </div>
                      </div>
                      {question.expectedOutput && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Expected Output</h3>
                          <div className="rounded-md bg-muted p-4">
                            <p className="font-mono whitespace-pre">{question.expectedOutput}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button asChild size="lg">
          <Link href="/candidate">
            <FileText className="mr-2 h-4 w-4" />
            Back to Tests
          </Link>
        </Button>
      </div>
    </div>
  )
}
