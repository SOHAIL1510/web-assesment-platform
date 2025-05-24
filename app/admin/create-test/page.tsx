"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2 } from "lucide-react"

interface MCQQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
}

interface CodingQuestion {
  id: string
  question: string
  language: string
  expectedOutput: string
}

export default function CreateTest() {
  const router = useRouter()
  const [testName, setTestName] = useState("")
  const [testDescription, setTestDescription] = useState("")
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([])
  const [codingQuestions, setCodingQuestions] = useState<CodingQuestion[]>([])

  const addMCQQuestion = () => {
    setMcqQuestions([
      ...mcqQuestions,
      {
        id: uuidv4(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ])
  }

  const updateMCQQuestion = (id: string, field: string, value: string) => {
    setMcqQuestions(mcqQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const updateMCQOption = (questionId: string, optionIndex: number, value: string) => {
    setMcqQuestions(
      mcqQuestions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const updateMCQCorrectAnswer = (questionId: string, value: number) => {
    setMcqQuestions(mcqQuestions.map((q) => (q.id === questionId ? { ...q, correctAnswer: value } : q)))
  }

  const removeMCQQuestion = (id: string) => {
    setMcqQuestions(mcqQuestions.filter((q) => q.id !== id))
  }

  const addCodingQuestion = () => {
    setCodingQuestions([
      ...codingQuestions,
      {
        id: uuidv4(),
        question: "",
        language: "javascript",
        expectedOutput: "",
      },
    ])
  }

  const updateCodingQuestion = (id: string, field: string, value: string) => {
    setCodingQuestions(codingQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  const removeCodingQuestion = (id: string) => {
    setCodingQuestions(codingQuestions.filter((q) => q.id !== id))
  }

  const saveTest = () => {
    if (!testName) {
      alert("Please enter a test name")
      return
    }

    if (mcqQuestions.length === 0 && codingQuestions.length === 0) {
      alert("Please add at least one question")
      return
    }

    // Validate MCQ questions
    for (const q of mcqQuestions) {
      if (!q.question) {
        alert("Please fill in all MCQ questions")
        return
      }
      if (q.options.some((opt) => !opt)) {
        alert("Please fill in all options for MCQ questions")
        return
      }
    }

    // Validate coding questions
    for (const q of codingQuestions) {
      if (!q.question) {
        alert("Please fill in all coding questions")
        return
      }
    }

    const newTest = {
      id: uuidv4(),
      name: testName,
      description: testDescription,
      mcqQuestions,
      codingQuestions,
    }

    // Save to localStorage
    const existingTests = JSON.parse(localStorage.getItem("tests") || "[]")
    localStorage.setItem("tests", JSON.stringify([...existingTests, newTest]))

    alert("Test created successfully!")
    router.push("/admin")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
        <p className="text-muted-foreground">Create a new assessment with MCQ and coding questions</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
            <CardDescription>Enter the basic information about your test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-name">Test Name</Label>
              <Input
                id="test-name"
                placeholder="Enter test name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-description">Description</Label>
              <Textarea
                id="test-description"
                placeholder="Enter test description"
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="mcq">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mcq">Multiple Choice Questions</TabsTrigger>
            <TabsTrigger value="coding">Coding Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="mcq" className="space-y-4 mt-4">
            {mcqQuestions.map((question, qIndex) => (
              <Card key={question.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>Question {qIndex + 1}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeMCQQuestion(question.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Textarea
                      placeholder="Enter your question"
                      value={question.question}
                      onChange={(e) => updateMCQQuestion(question.id, "question", e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Options</Label>
                    {question.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => updateMCQOption(question.id, index, e.target.value)}
                        />
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id={`correct-${question.id}-${index}`}
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === index}
                            onChange={() => updateMCQCorrectAnswer(question.id, index)}
                            className="mr-2"
                          />
                          <Label htmlFor={`correct-${question.id}-${index}`}>Correct</Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={addMCQQuestion} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add MCQ Question
            </Button>
          </TabsContent>

          <TabsContent value="coding" className="space-y-4 mt-4">
            {codingQuestions.map((question, qIndex) => (
              <Card key={question.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle>Coding Question {qIndex + 1}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCodingQuestion(question.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Problem Statement</Label>
                    <Textarea
                      placeholder="Enter the problem statement"
                      value={question.question}
                      onChange={(e) => updateCodingQuestion(question.id, "question", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Programming Language</Label>
                    <Select
                      value={question.language}
                      onValueChange={(value) => updateCodingQuestion(question.id, "language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="csharp">C#</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Output</Label>
                    <Textarea
                      placeholder="Enter the expected output"
                      value={question.expectedOutput}
                      onChange={(e) => updateCodingQuestion(question.id, "expectedOutput", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={addCodingQuestion} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Coding Question
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Cancel
          </Button>
          <Button onClick={saveTest}>Save Test</Button>
        </div>
      </div>
    </div>
  )
}
