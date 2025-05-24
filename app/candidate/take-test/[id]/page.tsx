"use client"

import Link from "next/link"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Send, Code, ListChecks, Timer } from "lucide-react"
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

interface TestResponse {
  mcqAnswers: Record<string, number>
  codingAnswers: Record<string, string>
}

export default function TakeTest({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<TestResponse>({
    mcqAnswers: {},
    codingAnswers: {},
  })
  const [currentSection, setCurrentSection] = useState<"mcq" | "coding">("mcq")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(3600) // 60 minutes in seconds
  const [progress, setProgress] = useState(0)
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0)
  const [currentCodingIndex, setCurrentCodingIndex] = useState(0)
  const [mcqScore, setMcqScore] = useState(0)
  const [timeWarning, setTimeWarning] = useState(false)

  useEffect(() => {
    // Load test data
    const storedTests = JSON.parse(localStorage.getItem("tests") || "[]")
    const foundTest = storedTests.find((t: Test) => t.id === params.id)

    if (foundTest) {
      setTest(foundTest)

      // Initialize responses
      const initialMcqAnswers: Record<string, number> = {}
      foundTest.mcqQuestions.forEach((q) => {
        initialMcqAnswers[q.id] = -1 // -1 means unanswered
      })

      const initialCodingAnswers: Record<string, string> = {}
      foundTest.codingQuestions.forEach((q) => {
        initialCodingAnswers[q.id] = ""
      })

      setResponses({
        mcqAnswers: initialMcqAnswers,
        codingAnswers: initialCodingAnswers,
      })
    }

    setLoading(false)
  }, [params.id])

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }

        // Set warning when less than 5 minutes remain
        if (prev === 300) {
          setTimeWarning(true)
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Calculate progress
  useEffect(() => {
    if (!test) return

    const totalQuestions = test.mcqQuestions.length + test.codingQuestions.length
    let answeredQuestions = 0

    // Count answered MCQs
    Object.values(responses.mcqAnswers).forEach((answer) => {
      if (answer !== -1) answeredQuestions++
    })

    // Count answered coding questions
    Object.values(responses.codingAnswers).forEach((answer) => {
      if (answer.trim() !== "") answeredQuestions++
    })

    const progressPercentage = (answeredQuestions / totalQuestions) * 100
    setProgress(progressPercentage)
  }, [responses, test])

  // Calculate MCQ score in real-time
  useEffect(() => {
    if (!test) return

    let score = 0
    test.mcqQuestions.forEach((q) => {
      if (responses.mcqAnswers[q.id] === q.correctAnswer) {
        score++
      }
    })

    setMcqScore(score)
  }, [responses.mcqAnswers, test])

  const handleMCQChange = (questionId: string, optionIndex: number) => {
    setResponses((prev) => ({
      ...prev,
      mcqAnswers: {
        ...prev.mcqAnswers,
        [questionId]: optionIndex,
      },
    }))
  }

  const handleCodingChange = (questionId: string, answer: string) => {
    setResponses((prev) => ({
      ...prev,
      codingAnswers: {
        ...prev.codingAnswers,
        [questionId]: answer,
      },
    }))
  }

  const handleSubmit = () => {
    if (!test) return

    // Calculate score for MCQs
    let score = 0
    const totalMCQs = test.mcqQuestions.length

    test.mcqQuestions.forEach((q) => {
      if (responses.mcqAnswers[q.id] === q.correctAnswer) {
        score++
      }
    })

    // Save responses to localStorage
    const testSubmission = {
      testId: test.id,
      testName: test.name,
      responses,
      score,
      totalMCQs,
      submittedAt: new Date().toISOString(),
      timeSpent: 3600 - timeRemaining, // in seconds
    }

    const submissions = JSON.parse(localStorage.getItem("submissions") || "[]")
    localStorage.setItem("submissions", JSON.stringify([...submissions, testSubmission]))

    // Navigate to results page
    router.push(`/candidate/results/${test.id}`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const navigateMcq = (direction: "next" | "prev") => {
    if (!test) return

    if (direction === "next" && currentMcqIndex < test.mcqQuestions.length - 1) {
      setCurrentMcqIndex(currentMcqIndex + 1)
    } else if (direction === "prev" && currentMcqIndex > 0) {
      setCurrentMcqIndex(currentMcqIndex - 1)
    }
  }

  const navigateCoding = (direction: "next" | "prev") => {
    if (!test) return

    if (direction === "next" && currentCodingIndex < test.codingQuestions.length - 1) {
      setCurrentCodingIndex(currentCodingIndex + 1)
    } else if (direction === "prev" && currentCodingIndex > 0) {
      setCurrentCodingIndex(currentCodingIndex - 1)
    }
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

  if (!test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Test not found</h2>
        <p className="text-muted-foreground mb-6">The test you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/candidate">Back to Tests</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 rounded-lg shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{test.name}</h1>
          <p className="text-muted-foreground">{test.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <motion.div
            className={`flex items-center px-4 py-2 rounded-full ${timeWarning ? "bg-red-100 text-red-800" : "bg-muted"}`}
            animate={timeWarning ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: timeWarning ? Number.POSITIVE_INFINITY : 0, duration: 2 }}
          >
            <Timer className="mr-2 h-5 w-5" />
            <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
          </motion.div>
          <Button onClick={() => setShowConfirmDialog(true)} className="gap-2">
            <Send className="h-4 w-4" />
            Submit Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ListChecks className="mr-2 h-5 w-5" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>MCQ Score (Preview)</span>
                  <span>
                    {mcqScore}/{test.mcqQuestions.length}
                  </span>
                </div>
                <Progress
                  value={(mcqScore / test.mcqQuestions.length) * 100}
                  className="h-2 bg-muted"
                  indicatorClassName="bg-green-500"
                />
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">Question Navigation</h3>
                <div className="grid grid-cols-5 gap-1">
                  {test.mcqQuestions.map((_, index) => (
                    <Button
                      key={`mcq-${index}`}
                      variant="outline"
                      size="icon"
                      className={`h-8 w-8 ${
                        currentSection === "mcq" && currentMcqIndex === index
                          ? "border-primary bg-primary/10"
                          : responses.mcqAnswers[test.mcqQuestions[index].id] !== -1
                            ? "bg-green-100 border-green-300"
                            : ""
                      }`}
                      onClick={() => {
                        setCurrentSection("mcq")
                        setCurrentMcqIndex(index)
                      }}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>

                {test.codingQuestions.length > 0 && (
                  <div className="grid grid-cols-5 gap-1 mt-2">
                    {test.codingQuestions.map((_, index) => (
                      <Button
                        key={`coding-${index}`}
                        variant="outline"
                        size="icon"
                        className={`h-8 w-8 ${
                          currentSection === "coding" && currentCodingIndex === index
                            ? "border-primary bg-primary/10"
                            : responses.codingAnswers[test.codingQuestions[index].id]?.trim() !== ""
                              ? "bg-blue-100 border-blue-300"
                              : ""
                        }`}
                        onClick={() => {
                          setCurrentSection("coding")
                          setCurrentCodingIndex(index)
                        }}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Tabs
            defaultValue="mcq"
            value={currentSection}
            onValueChange={(value) => setCurrentSection(value as "mcq" | "coding")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mcq" className="flex items-center gap-1">
                <ListChecks className="h-4 w-4" />
                MCQ ({test.mcqQuestions.length})
              </TabsTrigger>
              <TabsTrigger value="coding" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                Coding ({test.codingQuestions.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="md:col-span-3">
          {currentSection === "mcq" && test.mcqQuestions.length > 0 && (
            <motion.div
              key={`mcq-${currentMcqIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      Question {currentMcqIndex + 1} of {test.mcqQuestions.length}
                    </Badge>
                    <CardTitle>{test.mcqQuestions[currentMcqIndex].question}</CardTitle>
                  </div>
                  {responses.mcqAnswers[test.mcqQuestions[currentMcqIndex].id] !== -1 && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={
                      responses.mcqAnswers[test.mcqQuestions[currentMcqIndex].id] === -1
                        ? undefined
                        : responses.mcqAnswers[test.mcqQuestions[currentMcqIndex].id].toString()
                    }
                    onValueChange={(value) =>
                      handleMCQChange(test.mcqQuestions[currentMcqIndex].id, Number.parseInt(value))
                    }
                    className="space-y-3"
                  >
                    {test.mcqQuestions[currentMcqIndex].options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <RadioGroupItem
                          value={optIndex.toString()}
                          id={`q${test.mcqQuestions[currentMcqIndex].id}-opt${optIndex}`}
                        />
                        <Label
                          htmlFor={`q${test.mcqQuestions[currentMcqIndex].id}-opt${optIndex}`}
                          className="flex-grow cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
                <div className="flex justify-between p-4 pt-0">
                  <Button
                    variant="outline"
                    onClick={() => navigateMcq("prev")}
                    disabled={currentMcqIndex === 0}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button
                    onClick={() => navigateMcq("next")}
                    disabled={currentMcqIndex === test.mcqQuestions.length - 1}
                    className="gap-1"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {currentSection === "coding" && test.codingQuestions.length > 0 && (
            <motion.div
              key={`coding-${currentCodingIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline">
                      Question {currentCodingIndex + 1} of {test.codingQuestions.length}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getLanguageColor(test.codingQuestions[currentCodingIndex].language)}
                    >
                      {test.codingQuestions[currentCodingIndex].language.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle>Coding Challenge</CardTitle>
                  <CardDescription>Implement a solution to the problem below</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Problem Statement</Label>
                    <div className="rounded-md bg-muted p-4">
                      <p className="whitespace-pre-wrap">{test.codingQuestions[currentCodingIndex].question}</p>
                    </div>
                  </div>
                  {test.codingQuestions[currentCodingIndex].expectedOutput && (
                    <div className="space-y-2">
                      <Label>Expected Output</Label>
                      <div className="rounded-md bg-muted p-4">
                        <p className="font-mono whitespace-pre">
                          {test.codingQuestions[currentCodingIndex].expectedOutput}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor={`code-${test.codingQuestions[currentCodingIndex].id}`}>Your Solution</Label>
                    <Textarea
                      id={`code-${test.codingQuestions[currentCodingIndex].id}`}
                      placeholder={`Write your ${test.codingQuestions[currentCodingIndex].language} code here...`}
                      className="font-mono h-64 resize-none"
                      value={responses.codingAnswers[test.codingQuestions[currentCodingIndex].id]}
                      onChange={(e) => handleCodingChange(test.codingQuestions[currentCodingIndex].id, e.target.value)}
                    />
                  </div>
                </CardContent>
                <div className="flex justify-between p-4 pt-0">
                  <Button
                    variant="outline"
                    onClick={() => navigateCoding("prev")}
                    disabled={currentCodingIndex === 0}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button
                    onClick={() => navigateCoding("next")}
                    disabled={currentCodingIndex === test.codingQuestions.length - 1}
                    className="gap-1"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit your test?</AlertDialogTitle>
            <AlertDialogDescription>
              You've completed {Math.round(progress)}% of the test.
              {progress < 100 && " Are you sure you want to submit without completing all questions?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Test Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted p-2 rounded">
                  <span className="text-muted-foreground">MCQ Questions:</span>{" "}
                  <span className="font-medium">{test.mcqQuestions.length}</span>
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="text-muted-foreground">Coding Questions:</span>{" "}
                  <span className="font-medium">{test.codingQuestions.length}</span>
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="text-muted-foreground">MCQs Answered:</span>{" "}
                  <span className="font-medium">
                    {Object.values(responses.mcqAnswers).filter((a) => a !== -1).length}
                  </span>
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="text-muted-foreground">Coding Answered:</span>{" "}
                  <span className="font-medium">
                    {Object.values(responses.codingAnswers).filter((a) => a.trim() !== "").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Testing</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit Test</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
