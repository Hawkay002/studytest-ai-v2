import type { ChoiceSection, Difficulty, GeneratedTest, Question, StudyFocus, QuestionType } from "@/types/test"
const FOCUS_LABEL: Record<StudyFocus, string> = { concepts: "core concepts and how they fit together", definitions: "precise definitions of key terms", dates: "important dates and chronological order", cause_effect: "cause-and-effect relationships", application: "real-world application and worked examples", critical_analysis: "critical analysis and evaluation of arguments", synthesis: "synthesis of information from multiple sources", mixed: "a balanced mix of all the above", };
const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: "easy (recall / direct recognition)", medium: "medium (some synthesis required)", hard: "extremely challenging (deep conceptual synthesis, creative application, and integration of multiple sub-topics; requires deep subject mastery)", mixed: "a mix of easy, medium, and hard", };

export interface PromptInputs {
  topic: string
  context: string
  totalMarks: number
  marksDistribution: Record<QuestionType, number>
  difficulty: Difficulty
  questionTypes: QuestionType[]
  focus: StudyFocus
  stream: string
  language: string
}

export function buildGenerationPrompt(inputs: PromptInputs): {
  system: string
  user: string
} {
  const {
    topic,
    context,
    totalMarks,
    marksDistribution,
    difficulty,
    focus,
    stream,
    language,
  } = inputs

  const system = [
    `You are StudyTest AI, an elite academic examiner specializing in ${stream}.`,
    `Your goal is to create a professional examination paper in ${language}.`,
    "Given study material (text and/or images), write a test that is accurate, fair, and pedagogically rigorous.",
    "You MUST respond with ONLY a JSON object. No prose, no markdown fences.",
    "Grading: Every question must have a specified 'marks' value that contributes to the total mark count.",
    "Complexity Distribution:",
    "- 60% Standard: Direct application of material.",
    "- 20% Twisted: Nuanced, tricky questions that test careful reading.",
    "- 20% Deep Knowledge: Conceptual questions that test absolute mastery and creative thinking, potentially using analogous concepts not explicitly in the text.",
  ].join(" ")

  const schema = [
    "{",
    '  "topic": string,',
    '  "sections": [',
    '    {',
    '      "id": string,',
    '      "name": string,',
    '      "description": string,',
    '      "requiredCount": number,',
    '      "questions": [',
    '        {',
    '          "id": number,',
    '          "type": "mcq" | "true_false" | "fill_blank" | "short_answer" | "long_answer",',
    '          "question": string,',
    '          "options": string[] | null,',
    '          "answer": string,',
    '          "explanation": string,',
    '          "marks": number,',
    '          "difficulty": "easy" | "medium" | "hard"',
    '        }',
    '      ],',
    '    }',
    '  ],',
    '}',
  ].join("\n")

  const user = [
    `Language: ${language}`,
    `Academic Stream: ${stream}`,
    `Study material:`,
    context.trim() ? `Context notes: ${context.trim()}` : "",
    topic.trim() ? `Topics: ${topic.trim()}` : "",
    "(Images of the source pages are attached separately, if any.)",
    "",
    `TEST REQUIREMENTS:`,
    `Total Marks: ${totalMarks}`,
    `Distribution: ${JSON.stringify(marksDistribution)}`,
    `Difficulty: ${DIFFICULTY_LABEL[difficulty]}.`,
    `Focus: ${FOCUS_LABEL[focus]}.`,
    "",
    "INSTRUCTIONS:",
    "1. Determine the number of questions per type to exactly hit the marks distribution.",
    "2. Group questions into logical sections (e.g., Section A: MCQ, Section B: Long Answers).",
    "3. For Long Answers, ensure the question requires deep synthesis.",
    "4. Include a 'requiredCount' for each section to implement 'Answer X of Y' patterns.",
    "",
    "Output schema:",
    schema,
    "",
    "Respond with the JSON object only.",
  ]
    .filter(Boolean)
    .join("\n")

  return { system, user }
}

export function parseTestResponse(
  raw: string,
  fallbackTopic: string,
  inputType: "image" | "text",
  config: any,
): GeneratedTest {
  const cleaned = stripFences(raw).trim()
  const jsonText = extractFirstJsonObject(cleaned) ?? cleaned

  let parsed: any
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error("The model response was not valid JSON.")
  }

  const obj = parsed as any
  const sections = coerceSections(obj.sections)
  if (sections.length === 0) {
    throw new Error("The model returned no usable sections.")
  }

  return {
    id: crypto.randomUUID(),
    topic:
      typeof obj.topic === "string" && obj.topic.trim()
        ? obj.topic.trim()
        : fallbackTopic,
    sections,
    config,
    createdAt: new Date().toISOString(),
    inputType,
  }
}

function stripFences(s: string): string {
  return s
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim()
}

function extractFirstJsonObject(s: string): string | null {
  const start = s.indexOf("{")
  if (start === -1) return null
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < s.length; i++) {
    const ch = s[i]
    if (inString) {
      if (escape) escape = false
      else if (ch === "\\") escape = true
      else if (ch === '"') inString = false
    } else if (ch === '"') inString = true
    else if (ch === "{") depth++
    else if (ch === "}") {
      depth--
      if (depth === 0) return s.slice(start, i + 1)
    }
  }
  return null
}

function coerceSections(raw: any): ChoiceSection[] {
  if (!Array.isArray(raw)) return []
  const out: ChoiceSection[] = []
  let sectionId = 1
  for (const s of raw) {
    if (!s || typeof s !== "object") continue
    const questions = coerceQuestions(s.questions)
    if (questions.length === 0) continue
    out.push({
      id: `sec_${sectionId++}`,
      name: String(s.name ?? "Section"),
      description: String(s.description ?? ""),
      requiredCount: Number(s.requiredCount) || questions.length,
      questions,
    })
  }
  return out
}

function coerceQuestions(raw: any): Question[] {
  if (!Array.isArray(raw)) return []
  const out: Question[] = []
  let id = 1
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const q = item as any
    const type = String(q.type ?? "")
    const marks = Number(q.marks) || 1
    const base = {
      id,
      question: String(q.question ?? "").trim(),
      explanation: String(q.explanation ?? "").trim(),
      marks,
      difficulty: normalizeDifficulty(q.difficulty),
    }
    if (!base.question) continue

    if (type === "mcq") {
      const options = Array.isArray(q.options)
        ? (q.options as unknown[]).map((o) => String(o))
        : []
      if (options.length < 2) continue
      out.push({
        ...base,
        type: "mcq",
        options: normalizeOptions(options),
        answer: normalizeLetter(q.answer),
      })
    } else if (type === "true_false") {
      const answer =
        String(q.answer).toLowerCase().startsWith("t") ? "True" : "False"
      out.push({ ...base, type: "true_false", answer })
    } else if (type === "fill_blank") {
      const question = base.question.includes("___")
        ? base.question
        : `${base.question} ___`
      out.push({
        ...base,
        type: "fill_blank",
        question,
        answer: String(q.answer ?? "").trim(),
      })
    } else if (type === "long_answer" || type === "short_answer") {
      out.push({
        ...base,
        type: type as "short_answer" | "long_answer",
        answer: String(q.answer ?? "").trim(),
      })
    }
    id++
  }
  return out
}

function normalizeDifficulty(v: any): any {
  const s = String(v ?? "").toLowerCase()
  if (s === "easy" || s === "medium" || s === "hard") return s
  return undefined
}

function normalizeLetter(v: any): any {
  const s = String(v ?? "").toUpperCase().charAt(0)
  return s === "A" || s === "B" || s === "C" || s === "D" ? s : "A"
}

function normalizeOptions(options: string[]): string[] {
  const letters = ["A", "B", "C", "D"]
  return options.slice(0, 4).map((opt, i) => {
    const trimmed = opt.replace(/^[A-D][\).:\s]+/i, "").trim()
    return `${letters[i]}. ${trimmed}`
  })
}

