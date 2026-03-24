// Shared types for Backward Builder
// These mirror the database schema but are used throughout the app

export type QuestionType = "multiple_choice" | "document_based" | "constructed_response";
export type AssessmentStatus = "draft" | "published" | "archived";

/** Teacher input from the conversational flow */
export interface AssessmentInput {
  topic: string;
  gradeLevel: string;
  unitLength: string;
  objectives: string;
  topicsCovered: string;
  sourcesUsed: string;
}

/** A single MC option */
export interface MCOption {
  text: string;
  isCorrect: boolean;
}

/** Rubric scoring criteria */
export interface RubricLevel {
  score: number;
  description: string;
}

/** Claude API response for a generated question */
export interface GeneratedQuestion {
  type: QuestionType;
  questionText: string;
  points: number;
  // MC fields
  options?: MCOption[];
  // DBQ fields
  sourceDocument?: string;
  sourceAttribution?: string;
  scaffoldingQuestions?: string[];
  // Constructed response / DBQ rubric
  rubric?: RubricLevel[];
  sampleAnswer?: string;
}

/** Full Claude API response for assessment generation */
export interface GeneratedAssessment {
  title: string;
  description: string;
  questions: GeneratedQuestion[];
}

/** Question as stored in DB (includes id and order) */
export interface Question extends GeneratedQuestion {
  id: string;
  assessmentId: string;
  orderIndex: number;
}

/** Assessment record */
export interface Assessment {
  id: string;
  teacherId: string;
  title: string;
  description: string | null;
  gradeLevel: string | null;
  topic: string | null;
  objectives: string | null;
  topicsCovered: string | null;
  sourcesUsed: string | null;
  shareCode: string | null;
  status: AssessmentStatus;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Student submission */
export interface StudentSubmission {
  id: string;
  assessmentId: string;
  studentName: string;
  classPeriod: string;
  totalScore: number | null;
  maxScore: number | null;
  completedAt: Date;
}

/** Individual student answer */
export interface StudentAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean | null;
  score: number | null;
  feedback: string | null;
}

/** Public question for student quiz view (no correct answers) */
export interface PublicQuestion {
  id: string;
  type: QuestionType;
  orderIndex: number;
  questionText: string;
  points: number;
  options?: { text: string }[]; // MC options without isCorrect
  sourceDocument?: string;
  sourceAttribution?: string;
  scaffoldingQuestions?: string[];
}

/** Results dashboard data */
export interface AssessmentResults {
  assessment: {
    id: string;
    title: string;
    totalPoints: number;
    questionCount: number;
  };
  submissions: Array<{
    id: string;
    studentName: string;
    classPeriod: string;
    totalScore: number | null;
    maxScore: number | null;
    completedAt: Date;
    answers: Array<{
      questionId: string;
      questionText: string;
      questionType: QuestionType;
      answer: string;
      isCorrect: boolean | null;
      score: number | null;
      feedback: string | null;
      maxPoints: number;
    }>;
  }>;
  analytics: {
    averageScore: number;
    highScore: number;
    lowScore: number;
    submissionCount: number;
    questionBreakdown: Array<{
      questionId: string;
      questionText: string;
      questionType: QuestionType;
      averageScore: number;
      percentCorrect: number;
      maxPoints: number;
    }>;
  };
}

/** Chat message in the conversation flow */
export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  /** For assistant messages that include a form input */
  inputType?: "text" | "textarea" | "select";
  inputOptions?: string[];
  inputPlaceholder?: string;
  /** The field this message collects data for */
  field?: keyof AssessmentInput;
}
