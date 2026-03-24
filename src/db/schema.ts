import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// --- Enums ---

export const questionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "document_based",
  "constructed_response",
]);

export const assessmentStatusEnum = pgEnum("assessment_status", [
  "draft",
  "published",
  "archived",
]);

// --- Tables ---

/**
 * Teachers are identified by a cookie-based session ID.
 * No login required — this keeps the UX frictionless for the contest.
 */
export const teachers = pgTable("teachers", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Core assessment record — stores the teacher's input and metadata.
 * The conversationHistory field preserves the full chat flow for context.
 */
export const assessments = pgTable("assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  gradeLevel: varchar("grade_level", { length: 20 }),
  topic: varchar("topic", { length: 255 }),
  unitLength: varchar("unit_length", { length: 50 }),
  objectives: text("objectives"),
  topicsCovered: text("topics_covered"),
  sourcesUsed: text("sources_used"),
  shareCode: varchar("share_code", { length: 8 }).unique(),
  status: assessmentStatusEnum("status").default("draft").notNull(),
  totalPoints: integer("total_points").default(0),
  conversationHistory: jsonb("conversation_history"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Individual questions within an assessment.
 * Supports three types: multiple choice, document-based, and constructed response.
 * The options/rubric fields use JSONB for flexible storage of type-specific data.
 */
export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentId: uuid("assessment_id")
    .notNull()
    .references(() => assessments.id, { onDelete: "cascade" }),
  type: questionTypeEnum("type").notNull(),
  orderIndex: integer("order_index").notNull(),
  questionText: text("question_text").notNull(),
  points: integer("points").notNull().default(1),
  // Multiple choice fields
  options: jsonb("options"), // MCOption[] — [{text, isCorrect}]
  // Document-based question fields
  sourceDocument: text("source_document"),
  sourceAttribution: varchar("source_attribution", { length: 255 }),
  scaffoldingQuestions: jsonb("scaffolding_questions"), // string[]
  // Constructed response / DBQ rubric
  rubric: jsonb("rubric"), // RubricLevel[] — [{score, description}]
  sampleAnswer: text("sample_answer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * A student's submission to an assessment.
 * Students are identified by name and class period (no auth).
 */
export const studentSubmissions = pgTable("student_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assessmentId: uuid("assessment_id")
    .notNull()
    .references(() => assessments.id),
  studentName: varchar("student_name", { length: 100 }).notNull(),
  classPeriod: varchar("class_period", { length: 20 }).notNull(),
  totalScore: integer("total_score"),
  maxScore: integer("max_score"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

/**
 * Individual answers within a student submission.
 * MC answers are auto-graded immediately; CR/DBQ answers
 * are graded by Claude and include AI-generated feedback.
 */
export const studentAnswers = pgTable("student_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => studentSubmissions.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id),
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct"),
  score: integer("score"),
  feedback: text("feedback"),
});
