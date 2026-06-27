export type QuestionType =
  | "mcq"
  | "true_false"
  | "fill_blank"
  | "short_answer"
  | "long_answer"

export type Difficulty = "easy" | "medium" | "hard" | "mixed"

export type StudyFocus =
  | "concepts"
  | "definitions"
  | "dates"
  | "cause_effect"
  | "application"
  | "critical_analysis"
  | "synthesis"
  | "mixed"

export type InputMode = "image" | "text"

export type AppStep = "input" | "config" | "generating" | "done"

export interface MCQQuestion {
  id: number
  type: "mcq"
  question: string
  options: string[]
  answer: "A" | "B" | "C" | "D"
  explanation: string
  marks: number
  difficulty?: Exclude<Difficulty, "mixed">
}

export interface TrueFalseQuestion {
  id: number
  type: "true_false"
  question: string
  answer: "True" | "False"
  explanation: string
  marks: number
  difficulty?: Exclude<Difficulty, "mixed">
}

export interface FillBlankQuestion {
  id: number
  type: "fill_blank"
  question: string
  answer: string
  explanation: string
  marks: number
  difficulty?: Exclude<Difficulty, "mixed">
}

export interface ShortAnswerQuestion {
  id: number
  type: "short_answer"
  question: string
  answer: string
  explanation: string
  marks: number
  difficulty?: Exclude<Difficulty, "mixed">
}

export interface LongAnswerQuestion {
  id: number
  type: "long_answer"
  question: string
  answer: string
  explanation: string
  marks: number
  difficulty?: Exclude<Difficulty, "mixed">
}

export type Question =
  | MCQQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | ShortAnswerQuestion
  | LongAnswerQuestion

export interface ChoiceSection {
  id: string
  name: string
  description: string
  requiredCount: number
  questions: Question[]
}

export interface TestConfig {
  totalMarks: number
  difficulty: Difficulty
  questionTypes: QuestionType[]
  marksDistribution: Record<QuestionType, number>
  focus: StudyFocus
  timerEnabled: boolean
  timerMinutes: number
  stream: string
  language: string
  choiceMode: boolean
}

export interface GeneratedTest {
  id: string
  topic: string
  sections: ChoiceSection[]
  config: TestConfig
  createdAt: string
  inputType: InputMode
}

export interface UserAnswer {
  questionId: number
  answer: string
  score: number
  maxMarks: number
  feedback: string
}

export interface TestResult {
  testId: string
  answers: UserAnswer[]
  score: number
  total: number
  timeTakenSeconds?: number
  completedAt: string
}

export interface HistoryEntry {
  test: GeneratedTest
  result: TestResult
}
