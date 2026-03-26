// Shared types for Backward Builder — UbD Curriculum Design Tool

// --- Enums ---

export type QuestionType = "selected_response" | "short_answer";
export type UnitStatus = "stage1" | "stage2" | "stage3" | "ready" | "live" | "complete";
export type AssessmentStatus = "draft" | "live" | "closed";
export type SubmissionType = "check" | "performance_task";
export type CognitiveLevel = "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";

// --- Rubric Types ---

export interface RubricLevel {
  score: number;
  label: string; // "Exemplary" | "Proficient" | "Developing" | "Beginning"
  description: string;
}

export interface RubricCriterion {
  criterionName: string;
  weight: number; // points for this criterion
  levels: RubricLevel[];
}

// --- MC Option ---

export interface MCOption {
  text: string;
  isCorrect: boolean;
}

// --- Performance Task Scoring Types ---

export interface CriterionScore {
  criterionName: string;
  score: number;      // 1-4
  maxScore: number;   // 4
  label: string;      // "Exemplary" | "Proficient" | "Developing" | "Beginning"
  reasoning: string;  // 2-3 sentences explaining the score
}

// --- AI Response Types ---

/** Response from analyzeUnderstanding() */
export interface UnderstandingAnalysis {
  title: string;
  essentialQuestions: string[];
  standardCodes: string[];
  standardDescriptions: string[];
  standardUrls: string[];
  cognitiveLevel: CognitiveLevel;
  cognitiveLevelExplanation: string;
  reflectionForTeacher: string;
}

/** Response from generatePerformanceTasks() */
export interface GeneratedPerformanceTask {
  title: string;
  description: string;
  scenario: string;
  estimatedTimeMinutes: number;
  cognitiveLevel: string;
  rubric: RubricCriterion[];
}

/** A single question in a Check for Understanding */
export interface GeneratedCheckQuestion {
  type: QuestionType;
  questionText: string;
  points: number;
  options?: MCOption[];
  correctAnswer: string;
}

/** Response from generateChecksForUnderstanding() */
export interface GeneratedCheck {
  title: string;
  placementNote: string;
  questions: GeneratedCheckQuestion[];
}

/** Response from generateLearningPlan() */
export interface GeneratedActivity {
  sequenceOrder: number;
  title: string;
  description: string;
  durationMinutes: number;
  materials: string;
  buildsToward: string;
  associatedCheckTitle: string | null;
}

// --- DB Record Types ---

export interface Teacher {
  id: string;
  sessionId: string;
  email: string | null;
  displayName: string | null;
  gradeLevel: string | null;
  subject: string | null;
  state: string | null;
  standardsFramework: string | null;
  isDemo: boolean;
}

export interface Unit {
  id: string;
  teacherId: string;
  title: string;
  enduringUnderstanding: string;
  essentialQuestions: string[] | null;
  standardCodes: string[] | null;
  standardDescriptions: string[] | null;
  cognitiveLevel: CognitiveLevel | null;
  cognitiveLevelExplanation: string | null;
  status: UnitStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceTask {
  id: string;
  unitId: string;
  title: string;
  description: string;
  scenario: string;
  rubric: RubricCriterion[];
  standardCodes: string[] | null;
  cognitiveLevel: CognitiveLevel | null;
  estimatedTimeMinutes: number | null;
  shareCode: string | null;
  status: AssessmentStatus;
  isSelected: boolean;
}

export interface CheckForUnderstanding {
  id: string;
  unitId: string;
  title: string;
  placementNote: string | null;
  shareCode: string | null;
  status: AssessmentStatus;
  totalPoints: number;
}

export interface CheckQuestion {
  id: string;
  checkId: string;
  type: QuestionType;
  orderIndex: number;
  questionText: string;
  points: number;
  options: MCOption[] | null;
  correctAnswer: string | null;
}

export interface LearningActivity {
  id: string;
  unitId: string;
  sequenceOrder: number;
  title: string;
  description: string;
  durationMinutes: number | null;
  materials: string | null;
  buildsToward: string | null;
  associatedCheckId: string | null;
}

// --- Public Types (for student-facing views) ---

export interface PublicCheckQuestion {
  id: string;
  type: QuestionType;
  orderIndex: number;
  questionText: string;
  points: number;
  options?: { text: string }[]; // stripped of isCorrect
}

// --- AI Plan Adjustment Types ---

export interface AdjustedActivity {
  title: string;
  description: string;
  durationMinutes: number;
  buildsToward: string;
  isNew: boolean;
  reason: string;
}

export interface PlanAdjustmentResponse {
  suggestions: string;
  adjustedActivities: AdjustedActivity[];
}

// --- Classroom Setup ---

export interface ClassroomContext {
  gradeLevel: string;
  subject: string;
  state: string;
}
