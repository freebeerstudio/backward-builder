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
  "selected_response",
  "short_answer",
]);

export const unitStatusEnum = pgEnum("unit_status", [
  "stage1",
  "stage2",
  "stage3",
  "ready",
  "live",
  "complete",
]);

export const assessmentStatusEnum = pgEnum("assessment_status", [
  "draft",
  "live",
  "closed",
]);

export const submissionTypeEnum = pgEnum("submission_type", [
  "check",
  "performance_task",
]);

export const cognitiveLevelEnum = pgEnum("cognitive_level", [
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
]);

// --- Tables ---

/**
 * Teachers — identified by session cookie, with classroom context.
 * Simple email auth with a demo bypass for judges.
 */
export const teachers = pgTable("teachers", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  displayName: varchar("display_name", { length: 100 }),
  gradeLevel: varchar("grade_level", { length: 20 }),
  subject: varchar("subject", { length: 100 }),
  state: varchar("state", { length: 50 }),
  standardsFramework: varchar("standards_framework", { length: 100 }),
  isDemo: boolean("is_demo").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Units — the top-level entity in UbD. Everything hangs off a unit.
 * A unit has one enduring understanding and flows through 5 stages
 * (3 design stages + Stage 4 Go Live + Stage 5 Results).
 */
export const units = pgTable("units", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id),
  title: varchar("title", { length: 255 }).notNull(),
  enduringUnderstanding: text("enduring_understanding").notNull(),
  essentialQuestions: jsonb("essential_questions"), // string[]
  standardCodes: jsonb("standard_codes"), // string[]
  standardDescriptions: jsonb("standard_descriptions"), // string[]
  standardUrls: jsonb("standard_urls"), // string[] — links to authoritative source for each standard
  standardSetTitles: jsonb("standard_set_titles"), // string[] — CSP set title per standard
  standardSetSubjects: jsonb("standard_set_subjects"), // string[] — CSP subject per standard
  standardSetLevels: jsonb("standard_set_levels"), // string[][] — CSP education levels per standard
  cognitiveLevel: cognitiveLevelEnum("cognitive_level"),
  cognitiveLevelExplanation: text("cognitive_level_explanation"),
  status: unitStatusEnum("status").default("stage1").notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Performance Tasks — summative, transfer-level assessments.
 * Each includes a GRASPS scenario and a multi-criterion rubric.
 */
export const performanceTasks = pgTable("performance_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  scenario: text("scenario").notNull(),
  rubric: jsonb("rubric").notNull(), // RubricCriterion[]
  standardCodes: jsonb("standard_codes"),
  cognitiveLevel: cognitiveLevelEnum("cognitive_level"),
  estimatedTimeMinutes: integer("estimated_time_minutes"),
  shareCode: varchar("share_code", { length: 8 }).unique(),
  status: assessmentStatusEnum("status").default("draft").notNull(),
  isSelected: boolean("is_selected").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Checks for Understanding — formative assessments embedded in the unit.
 * UbD terminology: never call these "quizzes."
 */
export const checksForUnderstanding = pgTable("checks_for_understanding", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  placementNote: text("placement_note"),
  shareCode: varchar("share_code", { length: 8 }).unique(),
  status: assessmentStatusEnum("status").default("draft").notNull(),
  totalPoints: integer("total_points").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Questions within a Check for Understanding.
 * Supports selected-response (MC) and short-answer types.
 */
export const checkQuestions = pgTable("check_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  checkId: uuid("check_id")
    .notNull()
    .references(() => checksForUnderstanding.id, { onDelete: "cascade" }),
  type: questionTypeEnum("type").notNull(),
  orderIndex: integer("order_index").notNull(),
  questionText: text("question_text").notNull(),
  points: integer("points").notNull().default(1),
  options: jsonb("options"), // MCOption[] for selected_response
  correctAnswer: text("correct_answer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Learning Activities — sequenced instructional activities for Stage 3.
 * Each activity builds toward a specific rubric criterion.
 */
export const learningActivities = pgTable("learning_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  sequenceOrder: integer("sequence_order").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  durationMinutes: integer("duration_minutes"),
  materials: text("materials"),
  buildsToward: text("builds_toward"),
  associatedCheckId: uuid("associated_check_id").references(
    () => checksForUnderstanding.id
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Student submissions — polymorphic, works for both checks and performance tasks.
 */
export const studentSubmissions = pgTable("student_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .notNull()
    .references(() => units.id),
  assessmentType: submissionTypeEnum("assessment_type").notNull(),
  assessmentId: uuid("assessment_id").notNull(),
  studentName: varchar("student_name", { length: 100 }).notNull(),
  classPeriod: varchar("class_period", { length: 20 }).notNull(),
  totalScore: integer("total_score"),
  maxScore: integer("max_score"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

/**
 * Individual answers within a submission.
 * MC auto-graded immediately; short answer stored for review.
 */
/**
 * Unit shares — allows teachers to share units with other teachers via a link.
 * The recipient sees the unit in their "Shared with Me" tab.
 */
export const unitShares = pgTable("unit_shares", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .references(() => teachers.id), // the recipient — null until someone accepts
  shareCode: varchar("share_code", { length: 8 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studentAnswers = pgTable("student_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => studentSubmissions.id, { onDelete: "cascade" }),
  questionId: uuid("question_id"), // nullable — performance task criterion scores don't have a question
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct"),
  score: integer("score"),
  feedback: text("feedback"),
  criterionName: varchar("criterion_name", { length: 255 }), // for performance task criterion scores
  aiReasoning: text("ai_reasoning"), // AI's explanation for the score
  teacherScore: integer("teacher_score"), // teacher override score (null = not yet reviewed)
  teacherNotes: text("teacher_notes"), // optional teacher notes on the criterion
});
