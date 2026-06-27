// Thin fetch/SDK wrapper for the Gemini API.
// Uses @google/generative-ai with the user's own key (BYO-key). All requests
// go browser -> Google directly; no third-party server sees the key.

import { GoogleGenerativeAI, Part } from "@google/generative-ai"

import {
  GeneratedTest,
  Question,
  TestConfig,
  TestResult,
  UserAnswer,
} from "@/types/test"
import {
  buildGenerationPrompt,
  parseTestResponse,
} from "@/lib/prompts"
import type { InlineImagePart } from "@/lib/imageUtils"

const TEXT_MODEL = "gemini-1.5-flash"
const VISION_MODEL = "gemini-1.5-flash"

export async function validateApiKey(key: string): Promise<boolean> {
  if (!key.trim()) return false
  try {
    const genAI = new GoogleGenerativeAI(key.trim())
    const model = genAI.getGenerativeModel({ model: TEXT_MODEL })
    const res = await model.generateContent("ping")
    return !!res.response.text
  } catch {
    return false
  }
}

export interface GenerateOptions {
  apiKey: string
  topic: string
  context: string
  inputType: "image" | "text"
  images?: InlineImagePart[]
  config: TestConfig
}

export async function generateTest(opts: GenerateOptions): Promise<GeneratedTest> {
  const { apiKey, topic, context, inputType, images, config } = opts
  if (!apiKey.trim()) throw new Error("Missing API key.")

  const { system, user } = buildGenerationPrompt({
    topic,
    context,
    totalMarks: config.totalMarks,
    marksDistribution: config.marksDistribution,
    difficulty: config.difficulty,
    questionTypes: config.questionTypes,
    focus: config.focus,
    stream: config.stream,
    language: config.language,
  })

  const genAI = new GoogleGenerativeAI(apiKey.trim())
  const model = genAI.getGenerativeModel({
    model: inputType === "image" && images?.length ? VISION_MODEL : TEXT_MODEL,
    systemInstruction: system,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  })

  const parts: Part[] = [{ text: user }]
  if (inputType === "image" && images?.length) {
    parts.push(...images)
  }

  let raw: string
  try {
    const res = await model.generateContent({ contents: [{ parts, role: "user" }] })
    raw = res.response.text()
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error from Gemini."
    if (/api key|permission|denied/i.test(msg)) {
      throw new Error("Your API key was rejected. Check it at aistudio.google.com.")
    }
    if (/quota|rate|429/i.test(msg)) {
      throw new Error("Rate limit or quota hit. Wait a moment and try again.")
    }
    throw new Error(`Generation failed: ${msg}`)
  }

  return parseTestResponse(raw, topic || "Untitled test", inputType, config)
}

/**
 * Semantic Grading: Uses LLM to judge if a student's answer (text or image)
 * captures the core principle of the model answer.
 */
export async function gradeSemantic(
  apiKey: string,
  question: Question,
  userAnswer: string | InlineImagePart[],
  language: string,
): Promise<{ score: number; feedback: string }> {
  const genAI = new GoogleGenerativeAI(apiKey.trim())
  const model = genAI.getGenerativeModel({ model: VISION_MODEL })

  const prompt = `
    You are an expert academic grader. Grade the following answer based on its conceptual understanding and the "gist" of the topic.
    
    Model Answer: ${question.answer}
    User Answer: ${typeof userAnswer === "string" ? userAnswer : "[Image Uploaded]"}
    Language: ${language}
    Max Marks: ${question.marks}
    
    Criteria:
    1. Does the user understand the core principle?
    2. Is the explanation logically sound?
    3. If it's a "twisted" or "deep knowledge" question, does the user show creative synthesis?
    
    Return ONLY a JSON object:
    { "score": number, "feedback": "concise explanation in ${language} of why this score was given" }
  `

  const parts: Part[] = [{ text: prompt }]
  if (Array.isArray(userAnswer)) {
    parts.push(...userAnswer)
  }

  try {
    const res = await model.generateContent({ contents: [{ parts, role: "user" }] })
    const text = res.response.text()
    const cleaned = text.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleaned)
    return {
      score: Number(parsed.score) || 0,
      feedback: String(parsed.feedback || "No feedback provided."),
    }
  } catch (err) {
    console.error("Semantic grading failed:", err)
    return { score: 0, feedback: "Grading failed. Please try again." }
  }
}

export function gradeTest(
  test: GeneratedTest,
  answers: Record<number, { text: string; images: string[] }>,
  timeTakenSeconds?: number,
): TestResult {
  // This is now a fallback or for quick local preview. 
  // Real grading now uses gradeSemantic.
  const allAnswers: UserAnswer[] = []
  let totalScore = 0
  let totalPossibleMarks = 0

  test.sections.forEach(section => {
    section.questions.forEach(q => {
      const given = (answers[q.id]?.text ?? "").trim()
      const isCorrect = isCorrectLocal(q, given)
      const score = isCorrect ? q.marks : 0
      
      allAnswers.push({
        questionId: q.id,
        answer: given,
        score,
        maxMarks: q.marks,
        feedback: isCorrect ? "Correct!" : "Incorrect. See explanation."
      })
    })
    
    // Implement Best-X logic
    const sorted = [...section.questions]
      .map(q => ({ q, given: answers[q.id]?.text || "" }))
      .filter(item => item.given.trim().length > 0)
      .sort((a, b) => (isCorrectLocal(b.q, b.given) ? 1 : 0) - (isCorrectLocal(a.q, a.given) ? 1 : 0))
      .slice(0, section.requiredCount)
    
    sorted.forEach(item => {
      if (isCorrectLocal(item.q, item.given)) totalScore += item.q.marks
    })
    
    // Max marks for this section is the sum of the top X highest mark questions
    const maxSectionMarks = [...section.questions]
      .map(q => q.marks)
      .sort((a, b) => b - a)
      .slice(0, section.requiredCount)
      .reduce((sum, m) => sum + m, 0)
    
    totalPossibleMarks += maxSectionMarks
  })

  return {
    testId: test.id,
    answers: allAnswers,
    score: totalScore,
    total: totalPossibleMarks,
    timeTakenSeconds,
    completedAt: new Date().toISOString(),
  }
}

function isCorrectLocal(q: Question, given: string): boolean {
  if (!given) return false
  const norm = (s: string) => s.trim().toLowerCase().replace(/[.。,，!?！？\s]+$/, "")
  switch (q.type) {
    case "mcq":
    case "true_false":
      return norm(given) === norm(q.answer)
    case "fill_blank":
    case "short_answer":
    case "long_answer":
      return norm(given) === norm(q.answer) || norm(given).includes(norm(q.answer)) || norm(q.answer).includes(norm(given))
    default:
      return false
  }
}

